<template>
  <v-progress-circular indeterminate v-if="loading"></v-progress-circular><!--로그인 중일때 보이는 로딩 화면-->
  <v-menu offset-y v-else-if="!$store.state.fireUser"><!-- 비로그인 상태 -->
    <template v-slot:activator="{ on }">
      <v-btn icon v-on="on"><v-icon>mdi-account</v-icon></v-btn>
    </template>
    <v-card>
      <v-card-title>로그인</v-card-title>
      <v-divider/>
      <v-card-actions>
        <v-btn color="red" dark @click="signInWithGoogle" block><v-icon left>mdi-google</v-icon> 구글 로그인</v-btn>
      </v-card-actions>
    </v-card>
  </v-menu>
  <v-menu offset-y v-else><!-- 로그인 상태 -->
    <template v-slot:activator="{ on }">
      <v-btn icon v-on="on">
        <v-avatar size="24">
          <v-img :src="$store.state.fireUser.photoURL"></v-img>
        </v-avatar>
      </v-btn>
    </template>
    <v-card class="pa-2">
      <v-card-title>정보</v-card-title>
      <v-text class="mx-3">{{$store.state.fireUser.displayName}} 님</v-text>
      <v-divider/>
      <v-card-actions>
        <v-btn  class="mt-2" dark @click="signOut" block>로그아웃</v-btn>
      </v-card-actions>
    </v-card>
  </v-menu>
</template>
<script>

export default {
  data () {
    return {
      loading: false
    }
  },
  methods: {
    async signInWithGoogle () { // google login
      const provider = new this.$firebase.auth.GoogleAuthProvider() // 구글제공 객체의 인스턴스를 생성
      this.$firebase.auth().languageCode = 'ko' // 로그인과정 한글화
      this.loading = true
      try {
        const sn = await this.$firebase.auth().signInWithPopup(provider) // 팝업창 로그인화면
        this.$store.commit('setFireUser', sn.user) // 사용자 정보 store에 저장
        console.log(sn.user)
      } finally {
        this.loading = false
      }
    },
    signOut () {
      this.$firebase.auth().signOut() // 로그아웃
    }
  }
}
</script>
