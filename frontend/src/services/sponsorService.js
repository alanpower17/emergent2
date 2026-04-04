import { db } from "./firebase";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
  updateDoc,
} from "firebase/firestore";

// CREATE SPONSOR
export const createSponsor = async (data) => {
  return await addDoc(collection(db, "sponsorImages"), {
    ...data,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });
};

// GET ALL SPONSORS
export const getSponsors = async () => {
  const snap = await getDocs(collection(db, "sponsorImages"));
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

// DELETE SPONSOR
export const deleteSponsor = async (id) => {
  return await deleteDoc(doc(db, "sponsorImages", id));
};

// UPDATE SPONSOR
export const updateSponsor = async (sponsorId, data) => {
  return await updateDoc(doc(db, "sponsorImages", sponsorId), {
    ...data,
    updatedAt: Date.now(),
  });
};

// TRACK EVENT (view or click)
export const trackEvent = async (sponsorId, type) => {
  await addDoc(collection(db, "sponsorStats"), {
    sponsorId,
    type, // "view" or "click"
    timestamp: Date.now(),
  });
};

// GET SPONSOR FOR TARGET (coupon, park, or global)
export const getSponsorForTarget = async (couponId, parkId) => {
  const ref = collection(db, "sponsorImages");

  // 1. Try specific coupon sponsor
  if (couponId) {
    let q = query(ref, where("couponId", "==", couponId));
    let snap = await getDocs(q);
    if (!snap.empty) return { id: snap.docs[0].id, ...snap.docs[0].data() };
  }

  // 2. Try park sponsor
  if (parkId) {
    let q = query(ref, where("parkId", "==", parkId), where("couponId", "==", ""));
    let snap = await getDocs(q);
    if (!snap.empty) return { id: snap.docs[0].id, ...snap.docs[0].data() };
  }

  // 3. Fallback to global sponsor
  let q = query(ref, where("couponId", "==", ""), where("parkId", "==", ""));
  let snap = await getDocs(q);
  if (!snap.empty) return { id: snap.docs[0].id, ...snap.docs[0].data() };

  return null;
};

// GET SPONSOR STATS
export const getSponsorStats = async () => {
  const snap = await getDocs(collection(db, "sponsorStats"));
  const statsMap = {};

  snap.docs.forEach((doc) => {
    const data = doc.data();
    const id = data.sponsorId;
    if (!statsMap[id]) {
      statsMap[id] = { views: 0, clicks: 0 };
    }
    if (data.type === "view") statsMap[id].views++;
    if (data.type === "click") statsMap[id].clicks++;
  });

  return Object.entries(statsMap).map(([sponsorId, val]) => ({
    sponsorId,
    views: val.views,
    clicks: val.clicks,
    ctr: val.views > 0 ? ((val.clicks / val.views) * 100).toFixed(2) : 0,
  }));
};
