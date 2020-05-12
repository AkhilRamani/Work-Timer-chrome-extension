// <!-- The core Firebase JS SDK is always required and must be listed first -->
// <script src="https://www.gstatic.com/firebasejs/7.14.3/firebase-app.js"></script>

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
{/* <script src="https://www.gstatic.com/firebasejs/7.14.3/firebase-analytics.js"></script> */}


var firebaseConfig = {
    apiKey: "AIzaSyAharixP7viQM-177X3tN8_8NtB8nv1Ags",
    authDomain: "pro-worker.firebaseapp.com",
    databaseURL: "https://pro-worker.firebaseio.com",
    projectId: "pro-worker",
    storageBucket: "pro-worker.appspot.com",
    messagingSenderId: "1010240089470",
    appId: "1:1010240089470:web:28180c141306f10464172f",
    measurementId: "G-6Y06ESQ4PR"
};
const app = firebase.initializeApp(firebaseConfig);
// firebase.analytics();

const appDb = app.database().ref()