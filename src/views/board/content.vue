<template>
  <v-container fluid>
    <v-card>
      <v-toolbar color="accent" dense flat dark>
        <v-toolbar-title v-text="info.title"></v-toolbar-title>
      <v-spacer/>
      <template v-if="user">
        <v-btn icon @click="write" :disabled="user.level > 0"><v-icon>mdi-pencil</v-icon></v-btn>
        <v-btn icon @click="articleWrite" :disabled="user.level > 4"><v-icon>mdi-plus</v-icon></v-btn>
      </template>
      </v-toolbar>
      <v-card-text v-if="info.createdAt">
        <v-alert color="info" outlined dismissible>
          <div style="white-space: pre-line">{{info.description}}</div>
          <div class="text-right forn-italic caption">작성일: {{info.createdAt.toDate()}}</div>
          <div class="text-right forn-italic caption">수정일: {{info.updatedAt.toDate()}}</div>
        </v-alert>
      </v-card-text>
      <v-card-text>
        <board-article :info="info" :document="document"></board-article>
      </v-card-text>
    </v-card>
  </v-container>
</template>
<script>
import BoardArticle from './article/index'
export default {
  components: { BoardArticle },
  props: ['document'],
  data () {
    return {
      unsubscribe: null,
      info: {
        category: '',
        title: '',
        description: ''
      },
      loading: false
    }
  },
  watch: { // document 변화 감지
    document () {
      this.subscribe()
    }
  },
  computed: {
    user () {
      return this.$store.state.user
    }
  },
  created () {
    this.subscribe() // 구독
  },
  destroyed () {
    if (this.unsubscribe) this.unsubscribe()
  },
  methods: {
    subscribe () {
      if (this.unsubscribe) this.unsubscribe() // 구독하기 전에 해지 먼저
      const ref = this.$firebase.firestore().collection('boards').doc(this.document)
      this.unsubscribe = ref.onSnapshot(doc => {
        if (!doc.exists) return this.write() // 데이터가 없으면 현재path에서 push해서 ../wrtie라우팅
        this.info = doc.data()
      })
    },
    async write () {
      this.$router.push(this.$route.path + '/board-write')
    },
    async articleWrite () {
      this.$router.push({ path: this.$route.path + '/article-write', query: { articleId: '' } })
    }
  }
}
</script>
