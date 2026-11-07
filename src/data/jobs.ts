import { config } from '../config';

/**
 * mailto: link for an application. The subject lets job@ be filtered and
 * sorted without opening every mail.
 */
export function applicationMailto(subject: string): string {
  return `mailto:${config.jobEmail}?subject=${encodeURIComponent(subject)}`;
}
