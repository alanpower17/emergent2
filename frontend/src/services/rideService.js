import { db } from "./firebase";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  query,
  where,
} from "firebase/firestore";

// CREATE CLAIM REQUEST
export const createRideClaim = async (data) => {
  return await addDoc(collection(db, "rideClaims"), {
    ...data,
    status: "pending",
    createdAt: Date.now(),
  });
};

// GET CLAIMS BY PARK
export const getClaimsByPark = async (parkId) => {
  const q = query(collection(db, "rideClaims"), where("parkId", "==", parkId));
  const snap = await getDocs(q);
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

// GET CLAIMS BY RIDE OWNER
export const getClaimsByRideOwner = async (uid) => {
  const q = query(collection(db, "rideClaims"), where("requestedBy", "==", uid));
  const snap = await getDocs(q);
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

// APPROVE CLAIM
export const approveClaim = async (claim, organizerId) => {
  // Assign ride owner to the coupon
  await updateDoc(doc(db, "Coupons", claim.couponId), {
    rideOwnerId: claim.requestedBy,
  });
  // Update claim status
  await updateDoc(doc(db, "rideClaims", claim.id), {
    status: "approved",
    approvedBy: organizerId,
    approvedAt: Date.now(),
  });
};

// REJECT CLAIM
export const rejectClaim = async (claimId) => {
  return await updateDoc(doc(db, "rideClaims", claimId), {
    status: "rejected",
    rejectedAt: Date.now(),
  });
};

// GET COUPONS ASSIGNED TO RIDE OWNER
export const getMyRideCoupons = async (uid) => {
  const q = query(collection(db, "Coupons"), where("rideOwnerId", "==", uid));
  const snap = await getDocs(q);
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

// GET COUPON USAGE STATS
export const getCouponUsageStats = async (couponId) => {
  const q = query(collection(db, "couponUsage"), where("couponId", "==", couponId));
  const snap = await getDocs(q);
  return snap.size;
};

// RECORD COUPON VALIDATION (QR scan)
export const recordCouponValidation = async (couponId, userId) => {
  return await addDoc(collection(db, "couponUsage"), {
    couponId,
    userId,
    validatedAt: Date.now(),
  });
};
