// إعدادات Firebase (دي مفاتيح عامة مش سرية — الحماية الحقيقية في database.rules.json)
// ⚠️ لاحظت إن مفتاح apiKey كان مكتوب بشكلين مختلفين في صفحات الموقع القديم (HBvSSz / HBVSSz).
//    انسخه من Firebase Console ← Project settings ← Your apps ← SDK setup and configuration وتأكد منه هنا.
export const firebaseConfig = {
  apiKey: 'AIzaSyAq8CVFxYPWAa9HBvSSz6NrEcek_UVf2QM',
  authDomain: 'gmv-media.firebaseapp.com',
  databaseURL: 'https://gmv-media-default-rtdb.firebaseio.com',
  projectId: 'gmv-media',
  storageBucket: 'gmv-media.firebasestorage.app',
  messagingSenderId: '316734655967',
  appId: '1:316734655967:web:3ca0582c8b6c9db835086a'
};
export const FIREBASE_SDK = 'https://www.gstatic.com/firebasejs/10.14.1';
