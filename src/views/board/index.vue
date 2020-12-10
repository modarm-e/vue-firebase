<template>
  <v-card>
    <v-card-title>게시판</v-card-title>
    <v-data-table
      :headers="headers"
      :items="items"
      :items-per-page="10"
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
            <v-text-field label="제목" outlined v-model="form.title"></v-text-field>
            <v-text-field label="내용" outlined v-model="form.content"></v-text-field>
          </v-card-text>
          <v-card-actions>
            <v-spacer/>
            <v-btn @click="update" v-if="selectedItem">저장</v-btn>
            <v-btn @click="add" v-else>저장</v-btn>
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
      options: { // 페이징 옵션 초기값
        sortBy: ['createAt'], // 생성날자
        sortDesc: [true] // 내림차순
      },
      docs: []
    }
  },
  watch: { // 반응형 콜백 / 변화를 감지
    options: {
      handler (n, o) { // n=new , o=old
        const arrow = n.page - o.page
        this.subscribe(arrow)
      },
      deep: true
    }
  },
  created () { // 처음 만들시
    // this.read()
  },
  destroyed () { // snapshot이 페이지가 이동되어도 끊어지지 않기때문에 데이터를 끊기위해 destroyed사용
    if (this.unsubscribe) this.unsubscribe() // 글의 데이터 변화 감지
    if (this.unsubscribeCount) this.unsubscribeCount() // 글의 갯수 변화 감지
  },
  methods: {
    subscribe (arrow) {
      this.unsubscribeCount = this.$firebase.firestore().collection('meta').doc('boards').onSnapshot((doc) => { // snapshot으로 실시간으로 변화되는 글 갯수 데이터를 읽음
        if (!doc.exists) return
        this.serverItemsLength = doc.data().count // 서버 사이드 페이징을 하기 위해 전체 데이터 갯수저장 // <<보안떄문에> -> .data() object객체 의 count값을 읽음
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
        case -1: query = ref.endBefore(head(this.docs)).limitToLast(limit) // 전페이지
          console.log('query', query)
          break

        case 1: query = ref.startAfter(last(this.docs)).limit(limit) // 다음페이지
          console.log('query', query)
          break

        default: query = ref.limit(limit) // 아무것도 안했을때
          console.log('query', query)
          break
      }
      this.unsubscribe = query.onSnapshot((sn) => { // 서버사이트로 정렬되어 페이지네이트 갯수만큼 실시간으로 데이터 읽음
        if (sn.empty) {
          this.items = []
          return
        }
        this.docs = sn.docs
        console.log('첫번째', head(sn.docs).data()) // 배열의 첫번째값 // head() last() 을 사용하여 다음 데이터를 정렬할 수 있음
        console.log('두번째', last(sn.docs).data()) // 배열의 마지막값
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
      this.selectedItem = item // 저장버튼이 update인지 create인지 판별
      this.dialog = true
      if (!item) { // id없을 때는 새로 데이터 추가이기 때문에 폼에 값을 비워줌
        this.form.title = ''
        this.form.content = ''
      } else { // 있을때는 값을 불러와서 수정
        this.form.title = item.title
        this.form.content = item.content
      }
    },
    add () { // 글 작성
      const item = {}
      Object.assign(item, this.form) // Object.assign(targer, source) ==> target에 source를 복사
      item.createAt = new Date() // createAt추가
      this.$firebase.firestore().collection('boards').add(item)
      this.dialog = false
      this.form.title = ''
      this.form.content = ''
    },
    update () { // 글 수정
      this.$firebase.firestore().collection('boards').doc(this.selectedItem.id).update(this.form)
      this.dialog = false
      this.form.title = ''
      this.form.content = ''
    },
    async read () { // 데이터 읽기
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
    remove (item) { // 글 삭제
      this.$firebase.firestore().collection('boards').doc(item.id).delete()
    }
  }
}
</script>
