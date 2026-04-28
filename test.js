import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCF6EmMKxlrHQqOEZMhp5gKAeeMXVCG0iU",
  authDomain: "churchware-web-2026.firebaseapp.com",
  projectId: "churchware-web-2026",
  storageBucket: "churchware-web-2026.firebasestorage.app",
  messagingSenderId: "471284930598",
  appId: "1:471284930598:web:801e75ebe3a8f57c1c6ee7"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

async function testAuth() {
  const email = "admin@churchware.app";
  const pwd = "admin12345!@";
  try {
    console.log("Attempting sign in...");
    await signInWithEmailAndPassword(auth, email, pwd);
    console.log("Sign in successful!");
  } catch (err) {
    console.log("Sign in failed:", err.code);
    try {
      console.log("Attempting create...");
      await createUserWithEmailAndPassword(auth, email, pwd);
      console.log("Create successful!");
    } catch (createErr) {
      console.log("Create failed:", createErr.code);
    }
  }
}
testAuth().then(() => process.exit(0));
