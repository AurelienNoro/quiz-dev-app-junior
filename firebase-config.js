const firebaseConfig = {
  apiKey: "TON_API_KEY",
  authDomain: "TON_PROJECT_ID.firebaseapp.com",
  projectId: "TON_PROJECT_ID",
  storageBucket: "TON_PROJECT_ID.appspot.com",
  messagingSenderId: "XXXX",
  appId: "XXXX"
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
