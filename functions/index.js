const functions = require('firebase-functions');
const admin = require("firebase-admin");
const serviceAccount = require("./key.json");
const region = functions.config().admin.region || 'us-central1'

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: functions.config().admin.db.url, // "https://flutter-e4766.firebaseio.com"
  storageBucket: functions.config().admin.bucket_url //flutter-e4766.appspot.com
});

const rdb = admin.database() // firebase의 Realtime Database사용
const db = admin.firestore() // firebase의 Cloud FireStore사용

exports.createUser = functions.region(region).auth.user().onCreate(async (user) => {
  const { uid, email, displayName, photoURL } = user
  const time = new Date()
  const u = {
    email,
    displayName,
    photoURL,
    createdAt: time,
    level: email === functions.config().admin.email ? 0 : 5, // firebase의 functions설정을 사용하여 백그라운드로 사용자 권한 부여
    visitedAt: time,
    visitCount: 0
  }
  await db.collection('users').doc(uid).set(u)
  u.createdAt = time.getTime()
  await rdb.ref('users').child(uid).set(u) // firebase의 Realtime Database에 users에 값이 들어감
  try{
    await db.collection('meta').doc('users').update({ count: admin.firestore.FieldValue.increment(1) })
  } catch (e) {
    await db.collection('meta').doc('users').set({ count: 1 })
  }
})
exports.deleteUser = functions.region(region).auth.user().onDelete(async (user) => {
  const { uid } = user
  await rdb.ref('users').child(uid).remove() // firebase에서 uid에 해당하는 정보 삭제
  await db.collection('users').doc(uid).delete()
  await db.collection('meta').doc('users').update({ count: admin.firestore.FieldValue.increment(-1) })
})
// firebase에서는 database를 count하는 함수가 없어, 게시판에 글이 작성될때 백그라운드로 카운트하게 만듬
exports.onCreateBoard = functions.region(region).firestore.document('boards/{bid}').onCreate(async (snap,context) =>{ // firebase의 cloud Firestore에 저장될때
  try {
    await db.collection('meta').doc('boards').update({ count: admin.firestore.FieldValue.increment(1) }) // 글 작성하면 meta컬렉션에 boards에 count필드에 값이 더해짐
  } catch (e) {
    await db.collection('meta').doc('boards').set({ count: 1 })// 글이 처음 작성될시 1로 
  }
})

exports.onDeleteBoard = functions.region(region).firestore.document('boards/{bid}').onDelete(async (snap, context) => {
  await db.collection('meta').doc('boards').update({ count: admin.firestore.FieldValue.increment(-1) })// 글이 삭제 되면 -1
  const batch = db.batch()
  const sn = await db.collection('boards').doc(context.params.bid).collection('articles').get()
  sn.docs.forEach(doc => batch.delete(doc.ref))
  await batch.commit()
})

exports.onCreateBoardArticle = functions.region(region).firestore
  .document('boards/{bid}/articles/{aid}')
  .onCreate((snap, context) => {
    return db.collection('boards').doc(context.params.bid)
      .update({ count: admin.firestore.FieldValue.increment(1) })
  })

exports.onDeleteBoardArticle = functions.region(region).firestore
  .document('boards/{bid}/articles/{aid}')
  .onDelete(async (snap, context) => {
    await db.collection('boards').doc(context.params.bid)
      .update({ count: admin.firestore.FieldValue.increment(-1) })
      .catch(e => console.error('boards update err: ' + e.message))

    try {
      // remove comment
      const batch = db.batch()
      const sn = await db.collection('boards').doc(context.params.bid)
        .collection('articles').doc(context.params.aid)
        .collection('comments').get()
      sn.docs.forEach(doc => batch.delete(doc.ref))
      await batch.commit()
    } catch (e) {
      console.error('comment remove err: ' + e.message)
    }

    // remove storage
    const ps = []
    ps.push('boards')
    ps.push(context.params.bid)
    ps.push(context.params.aid + '-' + snap.data().uid + '.md')

    await admin.storage().bucket().file(ps.join('/'))
      .delete()
      .catch(e => console.error('storage remove err: ' + e.message))
  })

exports.onCreateBoardComment = functions.region(region).firestore
  .document('boards/{bid}/articles/{aid}/comments/{cid}')
  .onCreate((snap, context) => {
    return db.collection('boards').doc(context.params.bid)
      .collection('articles').doc(context.params.aid)
      .update({ commentCount: admin.firestore.FieldValue.increment(1) })
  })

exports.onDeleteBoardComment = functions.region(region).firestore
  .document('boards/{bid}/articles/{aid}/comments/{cid}')
  .onDelete((snap, context) => {
    return db.collection('boards').doc(context.params.bid)
      .collection('articles').doc(context.params.aid)
      .update({ commentCount: admin.firestore.FieldValue.increment(-1) })
  })