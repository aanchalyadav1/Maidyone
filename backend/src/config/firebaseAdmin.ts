import * as admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

const missingFirebaseConfig = !projectId || !clientEmail || !privateKey;
const isProduction = process.env.NODE_ENV === 'production';

if (missingFirebaseConfig) {
  const msg =
    'Firebase Admin requires FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY (use \\n in env for multiline keys).';
  if (isProduction) {
    console.error(msg);
    process.exit(1);
  }
  console.warn(`${msg} Auth will fail until configured.`);
} else if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });
}

export default admin;
