/**
 * Re-exports from adminEmails.ts for backward compatibility.
 * All new code should import from adminEmails.ts directly.
 */
export { isAdminEmail, getAdminEmails, PRIMARY_ADMIN_EMAIL } from './adminEmails';

// Legacy named export — kept for any older imports
export const ADMIN_EMAILS: string[] = ['yadavaanchal2005@gmail.com'];
