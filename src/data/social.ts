export interface SocialLink {
  platform: string;
  url: string;
  icon: string;
}

export const socialLinks: SocialLink[] = [
  {
    platform: 'Instagram',
    url: 'https://www.instagram.com/hosmors.dk/',
    icon: 'instagram',
  },
  {
    platform: 'Facebook',
    url: 'https://www.facebook.com/hosmors.dk',
    icon: 'facebook',
  },
  {
    platform: 'TripAdvisor',
    url: '#',
    icon: 'tripadvisor',
  },
  {
    platform: 'Trustpilot',
    url: '#',
    icon: 'trustpilot',
  },
  {
    platform: 'Google Maps',
    url: '#',
    icon: 'google-maps',
  },
];
