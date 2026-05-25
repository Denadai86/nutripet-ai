import * as admin from "firebase-admin";

// Evita inicializar o Admin várias vezes durante o desenvolvimento no Next.js
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // O replace garante que as quebras de linha da chave funcionem perfeitamente
      privateKey: (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
    }),
  });
}

export const adminDb = admin.firestore();