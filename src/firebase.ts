import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCI7tP5AjqSNbFP8D7NQuh-in4hXlpmcsE",
  authDomain: "BMS-78547.firebaseapp.com",
  projectId: "BMS-78547",
  storageBucket: "BMS-78547.firebasestorage.app",
  messagingSenderId: "733035565867",
  appId: "1:733035565867:web:d902fa902b3b181a5b6b6e",
  measurementId: "G-3P7K9WX8Y8"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const analytics = null;
