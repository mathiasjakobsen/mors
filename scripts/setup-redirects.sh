#!/usr/bin/env bash
set -euo pipefail

# ─────────────────────────────────────────────────────────
# Mors domain redirect setup
# Creates a Hetzner VPS running nginx that 301-redirects
# all secondary domains to https://mors.coffee
# ─────────────────────────────────────────────────────────

PRIMARY="mors.coffee"
SERVER_NAME="mors-redirect"
SERVER_TYPE="cpx11"
IMAGE="ubuntu-24.04"
LOCATION="fsn1"
EMAIL="mathias@notrocketscience.dk"

REDIRECT_DOMAINS=(
  hosmors.dk
  hosmors.com
  cafemors.dk
  cafemors.com
  morscafe.dk
  morscafe.com
  morskaffe.dk
  morskaffebar.dk
)

# Build full server_names list (bare + www)
ALL_NAMES=()
for d in "${REDIRECT_DOMAINS[@]}"; do
  ALL_NAMES+=("$d" "www.$d")
done

log() { printf "\033[1;34m→\033[0m %s\n" "$1"; }
ok()  { printf "\033[1;32m✓\033[0m %s\n" "$1"; }
err() { printf "\033[1;31m✗\033[0m %s\n" "$1" >&2; }

# ─── Preflight ────────────────────────────────────────────

command -v hcloud >/dev/null || { err "hcloud CLI not found"; exit 1; }
hcloud server list >/dev/null 2>&1 || { err "hcloud not authenticated — run 'hcloud context create'"; exit 1; }

# ─── 1. SSH key ───────────────────────────────────────────

log "Checking SSH keys..."
SSH_KEY_NAME="mors-deploy"

if hcloud ssh-key describe "$SSH_KEY_NAME" >/dev/null 2>&1; then
  ok "SSH key '$SSH_KEY_NAME' already exists"
else
  # Find a local public key
  PUB_KEY=""
  for f in ~/.ssh/id_ed25519.pub ~/.ssh/id_rsa.pub; do
    if [[ -f "$f" ]]; then
      PUB_KEY="$f"
      break
    fi
  done
  if [[ -z "$PUB_KEY" ]]; then
    err "No SSH public key found in ~/.ssh/. Generate one with: ssh-keygen -t ed25519"
    exit 1
  fi
  log "Uploading $PUB_KEY to Hetzner Cloud..."
  hcloud ssh-key create --name "$SSH_KEY_NAME" --public-key-from-file "$PUB_KEY"
  ok "SSH key uploaded"
fi

# ─── 2. Create VPS ───────────────────────────────────────

log "Checking for existing server '$SERVER_NAME'..."
if hcloud server describe "$SERVER_NAME" >/dev/null 2>&1; then
  ok "Server '$SERVER_NAME' already exists"
  VPS_IP=$(hcloud server ip "$SERVER_NAME")
else
  log "Creating server '$SERVER_NAME' ($SERVER_TYPE, $IMAGE, $LOCATION)..."
  hcloud server create \
    --name "$SERVER_NAME" \
    --type "$SERVER_TYPE" \
    --image "$IMAGE" \
    --location "$LOCATION" \
    --ssh-key "$SSH_KEY_NAME"
  VPS_IP=$(hcloud server ip "$SERVER_NAME")
  ok "Server created at $VPS_IP"

  log "Waiting for SSH to become available..."
  for i in $(seq 1 30); do
    if ssh -o ConnectTimeout=2 -o StrictHostKeyChecking=no -o BatchMode=yes "root@$VPS_IP" true 2>/dev/null; then
      break
    fi
    sleep 5
  done
fi

ok "VPS IP: $VPS_IP"

# ─── 3. Update DNS ───────────────────────────────────────

log "Updating DNS records for redirect domains..."
for domain in "${REDIRECT_DOMAINS[@]}"; do
  for name in "@" "www"; do
    # Delete existing A record if any, ignore errors
    hcloud zone rrset delete "$domain" "$name" A 2>/dev/null || true
    # Create new A record
    hcloud zone rrset create --name "$name" --type A --record "$VPS_IP" "$domain"
  done
  ok "DNS: $domain → $VPS_IP (@ + www)"
done

# ─── 4. Wait for DNS ─────────────────────────────────────

log "Waiting 30s for DNS propagation..."
sleep 30

# Quick check on first domain
RESOLVED=$(dig +short "${REDIRECT_DOMAINS[0]}" A @1.1.1.1 | head -1)
if [[ "$RESOLVED" == "$VPS_IP" ]]; then
  ok "DNS verified: ${REDIRECT_DOMAINS[0]} → $VPS_IP"
else
  log "DNS not yet propagated (got '$RESOLVED', expected '$VPS_IP'). Certbot may need retries."
fi

# ─── 5. Configure VPS ────────────────────────────────────

log "Configuring VPS via SSH..."

# Build space-separated server names for nginx
NGINX_NAMES="${ALL_NAMES[*]}"
# Build comma-separated domain args for certbot
CERTBOT_DOMAINS=""
for n in "${ALL_NAMES[@]}"; do
  CERTBOT_DOMAINS+=" -d $n"
done

ssh -o StrictHostKeyChecking=no "root@$VPS_IP" bash -s "$NGINX_NAMES" "$EMAIL" "$CERTBOT_DOMAINS" "$PRIMARY" <<'REMOTE_SCRIPT'
set -euo pipefail

NGINX_NAMES="$1"
EMAIL="$2"
CERTBOT_DOMAINS="$3"
PRIMARY="$4"

export DEBIAN_FRONTEND=noninteractive

echo "→ Installing packages..."
apt-get update -qq
apt-get install -y -qq nginx certbot python3-certbot-nginx > /dev/null 2>&1

echo "→ Writing initial nginx config..."
cat > /etc/nginx/sites-available/redirects <<EOF
server {
    listen 80;
    server_name $NGINX_NAMES;

    location / {
        return 200 "ok";
        add_header Content-Type text/plain;
    }
}
EOF

ln -sf /etc/nginx/sites-available/redirects /etc/nginx/sites-enabled/redirects
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx

echo "→ Obtaining SSL certificates..."
MAX_RETRIES=5
for i in $(seq 1 $MAX_RETRIES); do
  if certbot --nginx --non-interactive --agree-tos --email "$EMAIL" \
    --redirect $CERTBOT_DOMAINS 2>&1; then
    echo "✓ Certificates obtained"
    break
  else
    if [ "$i" -eq "$MAX_RETRIES" ]; then
      echo "✗ Certbot failed after $MAX_RETRIES attempts"
      exit 1
    fi
    echo "→ Certbot attempt $i failed, waiting 60s for DNS propagation..."
    sleep 60
  fi
done

echo "→ Writing final redirect config..."
# Find the certificate paths certbot created
# Certbot creates certs per-domain; use the first one and let nginx SNI handle it
CERT_PATH=$(find /etc/letsencrypt/live -name fullchain.pem -path "*/live/*/fullchain.pem" | head -1)
KEY_PATH=$(find /etc/letsencrypt/live -name privkey.pem -path "*/live/*/privkey.pem" | head -1)

cat > /etc/nginx/sites-available/redirects <<EOF
server {
    listen 80;
    server_name $NGINX_NAMES;
    return 301 https://\$host\$request_uri;
}

server {
    listen 443 ssl;
    server_name $NGINX_NAMES;

    ssl_certificate $CERT_PATH;
    ssl_certificate_key $KEY_PATH;
    ssl_protocols TLSv1.2 TLSv1.3;

    return 301 https://$PRIMARY\$request_uri;
}
EOF

nginx -t
systemctl reload nginx

echo "→ Enabling certbot auto-renewal..."
systemctl enable --now certbot.timer

echo "✓ Configuration complete"
REMOTE_SCRIPT

ok "VPS configured"

# ─── 6. Verify ───────────────────────────────────────────

log "Verifying redirects..."
sleep 5

PASS=0
FAIL=0
for domain in "${REDIRECT_DOMAINS[@]}"; do
  LOCATION=$(curl -sI --max-time 10 "http://$domain" 2>/dev/null | grep -i "^location:" | tr -d '\r' | awk '{print $2}')
  if [[ "$LOCATION" == *"$domain"* ]] || [[ "$LOCATION" == *"$PRIMARY"* ]]; then
    ok "$domain → redirecting"
    ((PASS++))
  else
    err "$domain → no redirect (got: $LOCATION)"
    ((FAIL++))
  fi
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
ok "Server: $SERVER_NAME ($VPS_IP)"
ok "Passed: $PASS / $((PASS + FAIL))"
[[ $FAIL -gt 0 ]] && err "Failed: $FAIL (DNS may still be propagating — retry in a few minutes)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
