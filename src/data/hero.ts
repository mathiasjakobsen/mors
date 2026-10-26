import type { ImageMetadata } from 'astro';
import facade from '../assets/mors-facade.jpg';
import bindingsvaerk from '../assets/mors-bindingsvaerk.jpg';

export interface HeroOverlay {
  /** Colour laid over the photo, and how strongly (0–1). */
  tint: string;
  tintOpacity: number;
  /** Blur of the photo itself, in px. */
  blur: number;
  /** Film grain strength (0–1). */
  grain: number;
}

export interface HeroBackground {
  image: ImageMetadata;
  /** Portrait crop for phones; falls back to `image`. */
  mobile?: ImageMetadata;
  /** CSS object-position for the crop. */
  position?: string;
  overlay: HeroOverlay;
}

// The photo behind the front page hero. Phones get the portrait shot of the
// same house.
export const heroBackground: HeroBackground = {
  image: facade,
  mobile: bindingsvaerk,
  position: 'center 70%',
  overlay: { tint: '#1a120c', tintOpacity: 0.35, blur: 1, grain: 0 },
};
