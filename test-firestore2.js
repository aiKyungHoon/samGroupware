import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

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
    const userCredential = await signInWithEmailAndPassword(auth, "admin@churchware.app", "admin12345!@");
    console.log("Signed in. UID:", userCredential.user.uid);
    
    const docRef = doc(firestore, 'users', userCredential.user.uid);
    console.log("Setting doc...");
    await setDoc(docRef, { name: "Test Admin", role: "admin", status: "approved" });
    console.log("Doc set successfully.");
    
    const docSnap = await getDoc(docRef);
    console.log("Doc read successfully. Data:", docSnap.data());
  } catch (error) {
    console.error("Firestore test failed:", error);
  } finally {
    process.exit(0);
  }
}
test();
