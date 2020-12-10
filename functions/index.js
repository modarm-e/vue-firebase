const functions = require('firebase-functions');
var admin = require("firebase-admin");
var serviceAccount = require("./key.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: functions.config().admin.db.url // "https://flutter-e4766.firebaseio.com"
});

const db = admin.database() // firebase의 Realtime Database사용
const fdb = admin.firestore() // firebase의 Cloud FireStore사용

exports.createUser = functions.auth.user().onCreate(async (user) => {
  const { uid, email, displayName, photoURL } = user
  const u = {
    email,
    displayName,
    photoURL,
    createdAt: new Date().getTime(),
    level: email === functions.config().admin.email ? 0 : 5 // firebase의 functions설정을 사용하여 백그라운드로 사용자 권한 부여
  }
  db.ref('users').child(uid).set(u) // firebase의 Realtime Database에 users에 값이 들어감
})
exports.deleteUser = functions.auth.user().onDelete(async (user) => {
  const { uid } = user
  db.ref('users').child(uid).remove() // firebase에서 uid에 해당하는 정보 삭제
})
// firebse에서는 database를 count하는 함수가 없어, 게시판에 글이 작성될때 백그라운드로 카운트하게 만듬
exports.incrementBoardCount = functions.firestore.document('boards/{bId}').onCreate(async (snap, context) =>{ // firebase의 cloud Firestore에 저장될때
  try {
    await fdb.collection('meta').doc('boards').update('count', admin.firestore.FieldValue.increment(1)) // 글 작성하면 meta컬렉션에 boards에 count필드에 값이 더해짐
  } catch (e) {
    await fdb.collection('meta').doc('boards').set({ count: 1 }) // 글이 처음 작성될시 1로 
  }
})
exports.decrementBoardCount = functions.firestore.document('boards/{bId}').onDelete(async (snap, context) =>{
  await fdb.collection('meta').doc('boards').update('count', admin.firestore.FieldValue.increment(-1)) // 글이 삭제 되면 -1
})

