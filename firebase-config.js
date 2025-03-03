// firebase-config.js
import firebase from 'firebase/app';
import 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyCx_My90Rnsg_Xhke5cpxzJX6GDG_ciuYs",
  authDomain: "alpha-2f7fc.firebaseapp.com",
  databaseURL: "https://alpha-2f7fc-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "alpha-2f7fc",
  storageBucket: "alpha-2f7fc.firebasestorage.app",
  messagingSenderId: "393680878748",
  appId: "1:393680878748:web:798fdff813956785a14159",
  measurementId: "G-3S6Q4G1E49"
};

firebase.initializeApp(firebaseConfig);

export default firebase;
