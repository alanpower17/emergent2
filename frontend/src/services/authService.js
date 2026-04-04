import { auth, db } from "./firebase";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut as firebaseSignOut 
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

export const registerUser = async (name, email, password, role = "user") => {
  const res = await createUserWithEmailAndPassword(auth, email, password);
  await setDoc(doc(db, "users", res.user.uid), {
    uid: res.user.uid,
    name,
    email,
    role,
    favorites: [],
    createdAt: Date.now(),
  });
  return res.user;
};

export const loginUser = async (email, password) => {
  const res = await signInWithEmailAndPassword(auth, email, password);
  const userDoc = await getDoc(doc(db, "users", res.user.uid));
  return userDoc.data();
};

export const signOut = async () => {
  await firebaseSignOut(auth);
};

export const getUserData = async (uid) => {
  const userDoc = await getDoc(doc(db, "users", uid));
  return userDoc.exists() ? userDoc.data() : null;
};
