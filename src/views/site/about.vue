<template>
  <v-row>
    <v-col md="4" offset-md="4" class="pt-15">
      <v-card v-if="$store.state.fireUser"> <!--store에 값이 저장되어 어디든 사용 가능-->
        <v-avatar size="56" class="ma-4" md="1">
          <v-img :src="$store.state.fireUser.photoURL"></v-img>
        </v-avatar>
        <h1 class="mx-4" md="3">{{$store.state.fireUser.displayName}} 님 안녕하세요. </h1>
      </v-card>
      <v-card v-else>
        <h1 class="ma-10 pa-3">로그인 해주세요</h1>
      </v-card>
    </v-col>
  </v-row>
</template>
<script>
export default {

}
</script>
