// A decorative QR code for pass illustrations, not a working one. A real pass
// carries a live card number and a scannable code, so this is correct QR
// furniture (three finder eyes, timing rows) over a deterministic fill, seeded
// so it renders identically on every build.
export const QR_SIZE = 21;

export function qrPattern(): { x: number; y: number }[] {
  let seed = 0x9e37;
  const rand = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) >>> 16) & 1;

  const isFinder = (x: number, y: number) => {
    const inBox = (ox: number, oy: number) =>
      x >= ox && x < ox + 7 && y >= oy && y < oy + 7;
    return inBox(0, 0) || inBox(QR_SIZE - 7, 0) || inBox(0, QR_SIZE - 7);
  };
  const finderOn = (x: number, y: number) => {
    const ox = x >= QR_SIZE - 7 ? x - (QR_SIZE - 7) : x;
    const oy = y >= QR_SIZE - 7 ? y - (QR_SIZE - 7) : y;
    const ring = Math.max(Math.abs(ox - 3), Math.abs(oy - 3));
    return ring === 3 || ring <= 1;
  };

  const modules: { x: number; y: number }[] = [];
  for (let y = 0; y < QR_SIZE; y++) {
    for (let x = 0; x < QR_SIZE; x++) {
      if (isFinder(x, y)) {
        if (finderOn(x, y)) modules.push({ x, y });
      } else if (x === 6 || y === 6) {
        if ((x + y) % 2 === 0) modules.push({ x, y });
      } else if (rand()) {
        modules.push({ x, y });
      }
    }
  }
  return modules;
}
