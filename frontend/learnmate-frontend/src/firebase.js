
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {
    apiKey: "AIzaSyDIiPz8rGF9xUBB6OnNtXFcPgTyBkO20PY",
    authDomain: "learnmate-f4fe0.firebaseapp.com",
    projectId: "learnmate-f4fe0",
    storageBucket: "learnmate-f4fe0.firebasestorage.app",
    messagingSenderId: "813303070078",
    appId: "1:813303070078:web:c7bc1b0799d9db2814472f",
    measurementId: "G-B79YXL35GN"
};


const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);


export const db = getFirestore(app);
