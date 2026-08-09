// ─────────────────────────────────────────────────────────────
// THIS IS THE ONLY FILE YOU NEED TO TOUCH.
//
// To make the app sync between everyone's phones for real, you need a
// free Firebase project (Google's free backend — no credit card, takes
// about 3 minutes). Full steps are in DEPLOY.md. Once you have your
// project, Firebase gives you a config object that looks like the one
// below — paste your real values in here, replacing the placeholders.
//
// Until you do this, the app still works perfectly on a single phone,
// it just won't sync to the others.
// ─────────────────────────────────────────────────────────────

window.FIREBASE_CONFIG = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Give your trip a short shared code. Everyone who opens the app with
// the SAME code sees the SAME data. Change this to anything you like
// (e.g. your group chat name) before sharing the link with the others.
window.TRIP_CODE = "nyc-oct-2026";
