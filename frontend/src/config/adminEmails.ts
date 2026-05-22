/**
 * Centralized admin email configuration.
 *
 * PRIMARY ADMIN — must never be removed:
 *   yadavaanchal205@gmail.com
 *
 * To add more admins at runtime, use the AdminManagement page.
 * This file holds the hardcoded fallback list that is always active.
 *
 * Emails are compared case-insensitively.
 */

export const PRIMARY_ADMIN_EMAIL = 'yadavaanchal205@gmail.com';

// Base whitelist — always includes the primary admin.
// Additional admins are stored in localStorage under 'extra_admin_emails'
// and merged at runtime by getAdminEmails().
const BASE_ADMIN_EMAILS: string[] = [
  PRIMARY_ADMIN_EMAIL,
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
export const isAdminEmail = (email: string | null | undefined): boolean => {
  if (!email) return false;
  return getAdminEmails().includes(email.toLowerCase());
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
    if (!extras.includes(normalized) && !BASE_ADMIN_EMAILS.map(e => e.toLowerCase()).includes(normalized)) {
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
