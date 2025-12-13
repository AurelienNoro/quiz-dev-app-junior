// 1) Colle ici le firebaseConfig donné par la console Firebase
const firebaseConfig = {
  apiKey: "XXX",
  authDomain: "XXX",
  projectId: "XXX",
  storageBucket: "XXX",
  messagingSenderId: "XXX",
  appId: "XXX"
};

firebase.initializeApp(firebaseConfig);

// Firestore
const db = firebase.firestore();

// Expose globalement pour quiz.js & leaderboard.js
window.db = db;
window.fb = firebase;

// Fonction utilitaire: enregistrer un score dans Firestore
window.saveScoreRemote = async function(scoreObj) {
  return db.collection('scores').add({
    ...scoreObj,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });
};
