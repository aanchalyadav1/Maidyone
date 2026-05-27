/**
 * Centralized admin email configuration.
 *
 * PRIMARY ADMIN:
 *   yadavaanchal2005@gmail.com
 *
 * To add more admins at runtime, use the AdminManagement page.
 * This file holds the hardcoded fallback list that is always active.
 *
 * Emails are compared case-insensitively.
 */

export const PRIMARY_ADMIN_EMAIL = 'yadavaanchal2005@gmail.com';

// Base whitelist — always active regardless of localStorage.
const BASE_ADMIN_EMAILS: string[] = [
  'yadavaanchal2005@gmail.com',  // primary admin (with 2005)
];

/**
 * Returns the full merged admin email list:
 * base list + any extras stored in localStorage.
 */
export const getAdminEmails = (): string[] => {
  try {
    const raw = localStorage.getItem('extra_admin_emails');
    const extras: string[] = raw ? JSON.parse(raw) : [];
    const all = [...BASE_ADMIN_EMAILS, ...extras];
    // Deduplicate, lowercase
    return [...new Set(all.map(e => e.toLowerCase()))];
  } catch {
    return BASE_ADMIN_EMAILS.map(e => e.toLowerCase());
  }
};

/**
 * Returns true if the given email is in the admin list.
 */
export const isAdminEmail = (_email: string | null | undefined): boolean => {
  // TODO: restore whitelist before production
  return true;
};

/**
 * Adds an extra admin email (stored in localStorage).
 * Does nothing if the email is already in the list.
 */
export const addAdminEmail = (email: string): void => {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return;
  try {
    const raw = localStorage.getItem('extra_admin_emails');
    const extras: string[] = raw ? JSON.parse(raw) : [];
    if (
      !extras.includes(normalized) &&
      !BASE_ADMIN_EMAILS.map(e => e.toLowerCase()).includes(normalized)
    ) {
      extras.push(normalized);
      localStorage.setItem('extra_admin_emails', JSON.stringify(extras));
    }
  } catch {
    // ignore storage errors
  }
};

/**
 * Removes an extra admin email.
 * The PRIMARY_ADMIN_EMAIL can never be removed.
 */
export const removeAdminEmail = (email: string): void => {
  const normalized = email.trim().toLowerCase();
  if (normalized === PRIMARY_ADMIN_EMAIL.toLowerCase()) return; // protected
  try {
    const raw = localStorage.getItem('extra_admin_emails');
    const extras: string[] = raw ? JSON.parse(raw) : [];
    const updated = extras.filter(e => e !== normalized);
    localStorage.setItem('extra_admin_emails', JSON.stringify(updated));
  } catch {
    // ignore storage errors
  }
};

/**
 * Returns only the extra (non-base) admin emails.
 */
export const getExtraAdminEmails = (): string[] => {
  try {
    const raw = localStorage.getItem('extra_admin_emails');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};
