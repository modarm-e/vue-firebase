<template>
  <v-app>
    <v-app-bar
      app
      color="#1A237E"
      dark
    >
      <v-app-bar-nav-icon @click="drawer = !drawer"/>
      <site-title :title="site.title"></site-title>
      <v-spacer/>
      <v-btn icon @click="save"><v-icon>mdi-check</v-icon></v-btn>
      <v-btn icon @click="readOne"><v-icon>mdi-check</v-icon></v-btn>
    </v-app-bar>
    <v-navigation-drawer
        app
        v-model="drawer"
        width="350"
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
import SiteTitle from '@/views/site/title'
import SiteFooter from '@/views/site/footer'
import SiteMenu from '@/views/site/menu'

export default {
  components: { SiteTitle, SiteFooter, SiteMenu },
  name: 'App',
  data () {
    return {
      drawer: false,
      site: {
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
      this.$firebase.database().ref().child('site').on('value', (sn) => {
        const v = sn.val()
        if (!v) {
          this.$firebase.database().ref().child('site').set(this.site)
          return
        }
        this.site = v
      }, (e) => {
        console.log(e.message)
      })
    }
  }
}
</script>
