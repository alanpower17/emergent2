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

// CREATE COUPON
export const createCoupon = async (data) => {
  return await addDoc(collection(db, "Coupons"), {
    ...data,
    rideOwnerId: null,
    validationType: "simple",
    createdAt: Date.now(),
  });
};

// GET COUPONS BY PARK
export const getCouponsByPark = async (parkId) => {
  const q = query(collection(db, "Coupons"), where("parkId", "==", parkId));
  const snap = await getDocs(q);
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

// DELETE SINGLE COUPON
export const deleteCoupon = async (id) => {
  return await deleteDoc(doc(db, "Coupons", id));
};

// DELETE ALL COUPONS FOR A PARK
export const deleteAllCoupons = async (parkId) => {
  const list = await getCouponsByPark(parkId);
  for (const c of list) {
    await deleteDoc(doc(db, "Coupons", c.id));
  }
};

// UPDATE COUPON
export const updateCoupon = async (couponId, data) => {
  return await updateDoc(doc(db, "Coupons", couponId), data);
};

// RECORD COUPON USE
export const recordCouponUse = async (userId, couponId, parkId) => {
  return await addDoc(collection(db, "couponUses"), {
    userId,
    couponId,
    parkId,
    usedAt: Date.now(),
    cooldown: 24, // 24-hour cooldown
  });
};

// GET USER'S COUPON USES
export const getUserCouponUses = async (userId) => {
  const q = query(collection(db, "couponUses"), where("userId", "==", userId));
  const snap = await getDocs(q);
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

// SYNC COUPONS FROM GOOGLE SHEET DATA
export const syncCouponsFromSheet = async (parkId, sheetData) => {
  const existing = await getCouponsByPark(parkId);
  const getKey = (c) => `${c.nomeAttrazione}_${c.numeroGiostra}`;
  
  const mapExisting = {};
  existing.forEach((c) => {
    mapExisting[getKey(c)] = c;
  });

  let created = 0;
  let updated = 0;
  let removed = 0;

  // Process new data
  for (const row of sheetData) {
    const key = getKey(row);
    if (mapExisting[key]) {
      // UPDATE existing
      await updateCoupon(mapExisting[key].id, {
        valoreSconto: row.valoreSconto,
        image: row.image,
        nomeTitolare: row.nomeTitolare,
      });
      updated++;
      delete mapExisting[key];
    } else {
      // CREATE NEW
      await createCoupon({
        ...row,
        parkId,
      });
      created++;
    }
  }

  // DELETE removed
  for (const key in mapExisting) {
    await deleteCoupon(mapExisting[key].id);
    removed++;
  }

  return { created, updated, removed };
};
