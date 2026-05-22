/**
 * Admin email whitelist.
 * Only Firebase-authenticated users whose email appears here
 * are allowed to access the admin panel.
 *
 * Add additional admin emails as needed.
 * Emails are compared case-insensitively.
 */
export const ADMIN_EMAILS: string[] = [
  'yadavaanchal2005@gmail.com',
];

/**
 * Returns true if the given email is in the admin whitelist.
 */
export const isAdminEmail = (email: string | null | undefined): boolean => {
  if (!email) return false;
  return ADMIN_EMAILS.map(e => e.toLowerCase()).includes(email.toLowerCase());
};
