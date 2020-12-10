import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    editable: true,
    fireUser: null
  },
  mutations: {
    setEdit (state, edit) { // 메뉴의 편집버튼의 true,false state저장 ==> 메뉴는 주소가 변해도 상태가 변하지 않아야 되므로
      state.editable = edit
    },
    setFireUser (state, fu) { // ../plugins/firebase.js에서 firebase의 회원정보를 읽어 저장하기 위해 설정
      state.fireUser = fu
    }
  },
  actions: {
  },
  modules: {
  }
})
