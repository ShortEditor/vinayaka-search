/**
 * Seed sample verified idol listings so the marketplace has content.
 *
 * Creates 3 shops and 6 active+verified idols (isSample: true) with the
 * local placeholder photo. Skips if any idol docs already exist.
 *
 * Run:  node scripts/seed-sample-idols.mjs
 * Delete from the Admin dashboard or Firestore console when done.
 */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, addDoc, serverTimestamp } from "firebase/firestore";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Parse .env.local manually (no dotenv dependency needed)
const env = {};
for (const line of readFileSync(join(__dirname, "..", ".env.local"), "utf8").split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.+)\s*$/);
  if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}

const app = initializeApp({
  apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.NEXT_PUBLIC_FIREBASE_APP_ID,
});
const db = getFirestore(app);

const shops = [
  {
    shopName: "Sri Ganesh Clay Arts",
    address: "12-4-18, Pot Market, Secunderabad, Hyderabad 500003",
    contactNumber: "+91 98480 11223",
    idols: [
      { style: "Traditional", heightFt: 2, price: 2500 },
      { style: "Traditional", heightFt: 3, price: 4800 },
    ],
  },
  {
    shopName: "Matti Kalakarulu",
    address: "5-9-32, Falaknuma Road, Old City, Hyderabad 500065",
    contactNumber: "+91 97010 44556",
    idols: [
      { style: "Modern", heightFt: 1.5, price: 1200 },
      { style: "Eco-Friendly", heightFt: 2.5, price: 3200 },
    ],
  },
  {
    shopName: "Vinayaka Vigraha Works",
    address: "8-2-120, Road No. 5, Banjara Hills, Hyderabad 500034",
    contactNumber: "+91 99590 77889",
    idols: [
      { style: "Traditional", heightFt: 4, price: 7500 },
      { style: "Modern", heightFt: 1, price: 850 },
    ],
  },
];

const existing = await getDocs(collection(db, "idols"));
if (!existing.empty) {
  console.log(`Found ${existing.size} existing idol docs — skipping seed.`);
  process.exit(0);
}

for (const shop of shops) {
  const shopRef = await addDoc(collection(db, "shops"), {
    ...shop,
    createdAt: serverTimestamp(),
    isSample: true,
  });
  console.log(`Created shop: ${shop.shopName} (${shopRef.id})`);

  for (const idol of shop.idols) {
    const idolRef = await addDoc(collection(db, "idols"), {
      shopId: shopRef.id,
      shopName: shop.shopName,
      photos: ["/placeholder-idol.jpg"],
      price: idol.price,
      heightFt: idol.heightFt,
      style: idol.style,
      listingPaymentStatus: "verified",
      listingPaymentUTR: "SAMPLE-NO-PAY",
      status: "active",
      isSample: true,
      createdAt: serverTimestamp(),
    });
    console.log(`  Created idol: ${idol.style} ${idol.heightFt}ft ₹${idol.price} (${idolRef.id})`);
  }
}

console.log("Seed complete.");
