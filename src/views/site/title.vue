<template>
  <v-toolbar-title>{{title}}
    <template v-if="(user && user.level === 0 )">
      <v-btn icon @click="openDialog"><v-icon>mdi-pencil</v-icon></v-btn>
    </template>
    <v-dialog v-model="dialog" max-width="400">
      <v-card>
        <v-card-title>
          제목 수정
          <v-spacer/>
          <v-btn icon @click="save"><v-icon>mdi-content-save</v-icon></v-btn>
          <v-btn icon @click="dialog=false"><v-icon>mdi-close</v-icon></v-btn>
        </v-card-title>
        <v-card-text>
          <v-text-field v-model="text" solo label="제목" @keypress.enter="save" hide-details />
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-toolbar-title>
</template>
<script>
export default {
  props: ['title'], // app.vue에서 받은 데이터
  data () {
    return {
      dialog: false,
      text: this.title
    }
  },
  computed: {
    user () {
      return this.$store.state.user
    }
  },
  methods: {
    openDialog () {
      this.dialog = true
    },
    async save () {
      try {
        await this.$firebase.database().ref().child('site').update({ title: this.text }) // 제목 수정
      } finally {
        this.dialog = false
      }
    }
  }
}
</script>
