const firebaseConfig = {
  apiKey: "AIzaSyB7dE-2rkwDhknlB15WeedwWXAK-bJASBU",
  authDomain: "bddquiz.firebaseapp.com",
  projectId: "bddquiz",
  storageBucket: "bddquiz.appspot.com",
  messagingSenderId: "1057343381838",
  appId: "1:1057343381838:web:d951f12e9d2957c3f73e1f",
  measurementId: "G-ZC0PXB7BN5"
};

// Init Firebase
firebase.initializeApp(firebaseConfig);

// Firestore
const db = firebase.firestore();

// Expose globalement
window.db = db;
window.firebaseLoaded = true;

// Utilitaires
window.saveScoreRemote = async function(scoreObj) {
  return db.collection('scores').add({
    ...scoreObj,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });
};

window.getAppVersion = async function () {
  const snap = await db.collection('meta').doc('app').get();
  return snap.exists ? snap.data() : null;
};


