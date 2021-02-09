<template>
  <v-app>
    <v-app-bar
      app
      color="#8C030E"
      dark
    >
      <v-app-bar-nav-icon @click="drawer = !drawer"/>
      <site-title :title="site.title"></site-title>
      <v-spacer/>
      <site-sign></site-sign><!--컴포넌트를 케밥케이스로 사용-->
    </v-app-bar>
    <v-navigation-drawer
        app
        v-model="drawer"
        width="370"
      >
      <site-menu :items="site.menu"></site-menu>
    </v-navigation-drawer>
    <v-content>
      <router-view/>
    </v-content>
    <site-footer :footer="site.footer"></site-footer>
  </v-app>
</template>

<script>
import SiteTitle from '@/views/site/title' // 컴포넌트 상속
import SiteFooter from '@/views/site/footer'
import SiteMenu from '@/views/site/menu'
import SiteSign from '@/views/site/sign'

export default {
  components: { SiteTitle, SiteFooter, SiteMenu, SiteSign },
  name: 'App',
  data () {
    return {
      drawer: false,
      site: { // 초기에 새성하기 위해 만든값 != firebase에 있는 데이터
        menu: [
          {
            title: 'home',
            active: true,
            icon: 'mdi-home',
            subItems: [
              {
                title: 'Dashboard',
                to: '/'
              },
              {
                title: 'About',
                to: '/about'
              }
            ]
          },
          {
            title: 'about',
            icon: 'mdi-account',
            subItems: [
              {
                title: 'xxx',
                to: '/xxx'
              }
            ]
          }
        ],
        title: '나의 타이틀입니다.',
        footer: ' CRUD'
      }
    }
  },
  created () {
    this.subscribe()
  },
  methods: {
    subscribe () {
      this.$firebase.database().ref().child('site').on('value', (sn) => { // firebase의 database에서 Site에 해당하는 값을 다 읽음
        const v = sn.val()
        if (!v) {
          this.$firebase.database().ref().child('site').set(this.site) // firebase에 값이 없다면 생성
          return
        }
        this.site = v // 읽은 값 저장
      }, (e) => {
        console.log(e.message)
      })
    }
  }
}
</script>
