import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCF6EmMKxlrHQqOEZMhp5gKAeeMXVCG0iU",
  authDomain: "churchware-web-2026.firebaseapp.com",
  databaseURL: "https://churchware-web-2026-default-rtdb.firebaseio.com",
  projectId: "churchware-web-2026",
  storageBucket: "churchware-web-2026.firebasestorage.app",
  messagingSenderId: "560447039088",
  appId: "1:560447039088:web:71fcde24f605a2e58e3827"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);

async function test() {
  try {
    console.log("Attempting sign in...");
    const userCredential = await signInWithEmailAndPassword(auth, "admin@churchware.app", "admin12345!@");
    console.log("Sign in successful! UID:", userCredential.user.uid);
    
    console.log("Attempting to read user profile from Firestore...");
    const docRef = doc(firestore, 'users', userCredential.user.uid);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      console.log("Profile data:", docSnap.data());
    } else {
      console.log("No such document in Firestore!");
    }
  } catch (error) {
    console.error("Test failed:", error);
  }
}

test();
