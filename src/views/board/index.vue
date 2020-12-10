<template>
  <v-card>
    <v-card-title>board test</v-card-title>
    <v-data-table
      :headers="headers"
      :items="items"
      :items-per-page="5"
      :options.sync="options"
      :server-items-length="serverItemsLength"
      must-sort
      >
      <template v-slot:[`item.id`]="{ item }">
        <v-btn icon @click="openDialog(item)"><v-icon left>mdi-pencil</v-icon></v-btn>
        <v-btn icon @click="remove(item)"><v-icon left>mdi-delete</v-icon></v-btn>
      </template>
      <template v-slot:[`item.createdAt`]="{ item }">
        {{item.createdAt.toLocaleString()}}
      </template>
    </v-data-table>
    <v-card-actions>
      <v-btn @click="openDialog(null)"><v-icon left>mdi-pencil</v-icon></v-btn>
      <v-btn @click="read"><v-icon>mdi-page-next</v-icon></v-btn>
    </v-card-actions>
    <v-dialog max-width="500" v-model="dialog">
      <v-card>
        <v-form>
          <v-card-text>
            <v-text-field v-model="form.title"></v-text-field>
            <v-text-field v-model="form.content"></v-text-field>
          </v-card-text>
          <v-card-actions>
            <v-spacer/>
            <v-btn @click="update" v-if="selectedItem">save</v-btn>
            <v-btn @click="add" v-else>save</v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>
  </v-card>
</template>
<script>
import { head, last } from 'lodash'

export default {
  data () {
    return {
      headers: [
        { value: 'createdAt', text: '작성일' },
        { value: 'title', text: '제목' },
        { value: 'content', text: '내용' },
        { value: 'id', text: 'id', sortable: false }
      ],
      items: [],
      form: {
        title: '',
        content: ''
      },
      dialog: false,
      selectedItem: null,
      unsubscribe: null,
      unsubscribeCount: null,
      serverItemsLength: 0,
      options: {
        sortBy: ['createAt'],
        sortDesc: [true]
      },
      docs: []
    }
  },
  watch: {
    options: {
      handler (n, o) {
        const arrow = n.page - o.page
        this.subscribe(arrow)
      },
      deep: true
    }
  },
  created () {
    // this.read()
  },
  destroyed () { // subscribe가 페이지 이동되어도 끊어지지 않기때문에 안쓰면 끊기위해 destroyed사용
    if (this.unsubscribe) this.unsubscribe()
    if (this.unsubscribeCount) this.unsubscribeCount()
  },
  methods: {
    subscribe (arrow) {
      this.unsubscribeCount = this.$firebase.firestore().collection('meta').doc('boards').onSnapshot((doc) => {
        if (!doc.exists) return
        this.serverItemsLength = doc.data().count
      })
      const order = head(this.options.sortBy)
      console.log('oreder', order)
      const sort = head(this.options.sortDesc) ? 'desc' : 'asc'
      console.log('sort', sort)
      const limit = this.options.itemsPerPage
      console.log('limit', limit)

      const ref = this.$firebase.firestore().collection('boards').orderBy(order, sort)
      console.log('ref', ref)
      let query
      switch (arrow) {
        case -1: query = ref.endBefore(head(this.docs)).limitToLast(limit)
          console.log('query', query)
          break

        case 1: query = ref.startAfter(last(this.docs)).limit(limit)
          console.log('query', query)
          break

        default: query = ref.limit(limit) // 아무것도 안했을때
          console.log('query', query)
          break
      }
      this.unsubscribe = query.onSnapshot((sn) => {
        if (sn.empty) {
          this.items = []
          return
        }
        this.docs = sn.docs
        console.log('첫번째', head(sn.docs).data()) // 배열의 첫번째 --와 마지막을 기준으로 다음 데이터를 정렬할 수 있음
        console.log('두번째', last(sn.docs).data()) // 배열의 마지막
        this.items = sn.docs.map(v => {
          const item = v.data()
          console.log('item : ', item)
          return {
            id: v.id,
            title: item.title,
            content: item.content,
            createdAt: item.createAt.toDate()
          }
        })
        console.log('items : ', this.items)
      })
    },
    openDialog (item) {
      this.selectedItem = item
      this.dialog = true
      if (!item) {
        this.form.title = ''
        this.form.content = ''
      } else {
        this.form.title = item.title
        this.form.content = item.content
      }
    },
    add () {
      const item = {}
      Object.assign(item, this.form)
      item.createAt = new Date()
      this.$firebase.firestore().collection('boards').add(item)
      this.dialog = false
      this.form.title = ''
      this.form.content = ''
    },
    update () {
      this.$firebase.firestore().collection('boards').doc(this.selectedItem.id).update(this.form)
      this.dialog = false
      this.form.title = ''
      this.form.content = ''
    },
    async read () {
      const sn = await this.$firebase.firestore().collection('boards').get()
      this.items = sn.docs.map(v => {
        const item = v.data()
        // const now = item.createAt.toDate()
        // console.log(now)
        // var tomorrow = new Date(now.setDate(now.getDate() + 1))
        // console.log('내일: ', tomorrow.toLocaleString())
        return {
          id: v.id,
          title: item.title,
          content: item.content,
          createdAt: item.createAt.toDate()
        }
      })
      // console.log(this.items)
    },
    remove (item) {
      this.$firebase.firestore().collection('boards').doc(item.id).delete()
    }
  }
}
</script>
