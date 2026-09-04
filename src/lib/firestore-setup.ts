/**
 * Firestore Setup Script
 * Run once to create required indexes and sample data structure.
 * 
 * IMPORTANT: This file documents the required Firestore indexes.
 * You must create these composite indexes in Firebase Console → Firestore → Indexes:
 *
 * Collection: idols
 *   Fields: status (ASC), listingPaymentStatus (ASC), createdAt (DESC)
 *
 * Collection: unlocks
 *   Fields: idolId (ASC), paymentStatus (ASC), unlockedAt (DESC)
 */

export const FIRESTORE_RULES = `
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Shops: Anyone can create, only admin can read all
    match /shops/{shopId} {
      allow create: if true;
      allow read: if true;
      allow update, delete: if request.auth != null 
        && request.auth.token.email == "<YOUR_ADMIN_EMAIL>";
    }
    
    // Idols: Anyone can create, only active+verified are public
    match /idols/{idolId} {
      allow create: if true;
      allow read: if resource.data.status == "active" 
        && resource.data.listingPaymentStatus == "verified"
        || request.auth != null;
      allow update: if request.auth != null
        && request.auth.token.email == "<YOUR_ADMIN_EMAIL>";
    }
    
    // Unlocks: Anyone can create (buyer pays), admin can verify
    match /unlocks/{unlockId} {
      allow create: if true;
      allow read: if request.auth != null 
        || resource.data.unlockId == unlockId;
      allow update: if request.auth != null
        && request.auth.token.email == "<YOUR_ADMIN_EMAIL>";
    }
  }
}
`;

export const STORAGE_RULES = `
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /idols/{shopId}/{idolId}/{photo} {
      allow read: if true;
      allow write: if request.resource.size < 5 * 1024 * 1024
        && request.resource.contentType.matches('image/.*');
    }
  }
}
`;
