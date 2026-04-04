import { db } from "./firebase";
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
} from "firebase/firestore";

// CREATE PARK
export const createPark = async (data) => {
  return await addDoc(collection(db, "LunaParks"), {
    ...data,
    status: "pending",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });
};

// GET ALL PARKS
export const getAllParks = async () => {
  const snap = await getDocs(collection(db, "LunaParks"));
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

// GET APPROVED PARKS (for public view)
export const getApprovedParks = async () => {
  const q = query(collection(db, "LunaParks"), where("status", "==", "approved"));
  const snap = await getDocs(q);
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

// GET PARK BY ID
export const getParkById = async (parkId) => {
  const snap = await getDoc(doc(db, "LunaParks", parkId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

// GET PARKS FOR ORGANIZER
export const getMyParks = async (uid) => {
  const q = query(collection(db, "LunaParks"), where("organizerIds", "array-contains", uid));
  const snap = await getDocs(q);
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

// UPDATE PARK
export const updatePark = async (parkId, data) => {
  return await updateDoc(doc(db, "LunaParks", parkId), {
    ...data,
    updatedAt: Date.now(),
  });
};

// DELETE PARK
export const deletePark = async (parkId) => {
  return await deleteDoc(doc(db, "LunaParks", parkId));
};

// APPROVE PARK (admin)
export const approvePark = async (parkId) => {
  return await updateDoc(doc(db, "LunaParks", parkId), {
    status: "approved",
    updatedAt: Date.now(),
  });
};

// REJECT PARK (admin)
export const rejectPark = async (parkId) => {
  return await updateDoc(doc(db, "LunaParks", parkId), {
    status: "rejected",
    updatedAt: Date.now(),
  });
};
