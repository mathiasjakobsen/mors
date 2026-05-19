export interface SocialLink {
  platform: string;
  url: string;
  icon: string;
}

export const socialLinks: SocialLink[] = [
  {
    platform: 'Instagram',
    url: 'https://www.instagram.com/_mors.coffee',
    icon: 'instagram',
  },
  {
    platform: 'Facebook',
    url: 'https://www.facebook.com/morscoffee.dk',
    icon: 'facebook',
  },
];
