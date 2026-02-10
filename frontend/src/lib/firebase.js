import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAINmWUhoOfMOgwTRmdGOUbda7T75i1PvA",
  authDomain: "podpivo-bf172.firebaseapp.com",
  projectId: "podpivo-bf172",
  storageBucket: "podpivo-bf172.firebasestorage.app",
  messagingSenderId: "1064608035422",
  appId: "1:1064608035422:web:e61fccb7471eaa5149bacf"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
