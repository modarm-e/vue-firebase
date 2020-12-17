import Vue from 'vue'
import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firebase-database'
import 'firebase/firebase-firestore'
import 'firebase/firebase-storage'
import firebaseConfig from '../../firebaseConfig'
import store from '../store/'

firebase.initializeApp(firebaseConfig)
let unsubscribe = null

const subscribe = (fu) => {
  const ref = firebase.firestore().collection('users').doc(fu.uid)
  unsubscribe = ref.onSnapshot(doc => {
    if (doc.exists) store.commit('setUser', doc.data())
  }, console.error)
}

firebase.auth().onAuthStateChanged((fu) => {
  store.commit('setFireUser', fu) // 로그인한 회원이 정보가 들어오면 store에 mutations을 사용하여 state에 회원정보를 저장
  if (!fu) {
    store.commit('setUser', null)
    if (unsubscribe) unsubscribe()
    return
  }
  subscribe(fu)
})

Vue.prototype.$firebase = firebase
