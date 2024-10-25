// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyB9C_CxqvOyflU8jhGOJOvIZ5MT0KE2FY4",
    authDomain: "task-manager-124ef.firebaseapp.com",
    projectId: "task-manager-124ef",
    storageBucket: "task-manager-124ef.appspot.com",
    messagingSenderId: "825569928703",
    appId: "1:825569928703:web:e84df1d32e689decfa73ca",
};

// Inicializando o Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
