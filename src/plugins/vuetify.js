import Vue from 'vue'
import Vuetify, { VSnackbar, VBtn, VIcon } from 'vuetify/lib'
import VuetifyToast from 'vuetify-toast-snackbar' // 오류 catch를 해주는 라이브러리
import en from 'vuetify/es5/locale/en'
import ko from 'vuetify/es5/locale/ko'

const theme = {
  themes: {
    light: {
      primary: '#8C030E',
      secondary: '#024959',
      accent: '#590202',
      info: '#26010B'
    }
  }
}

const veutifyObj = new Vuetify({
  theme,
  lang: {
    locales: { en, ko },
    current: 'ko'
  }
})
Vue.use(Vuetify, {
  components: {
    VSnackbar,
    VBtn,
    VIcon
  }
})
Vue.use(VuetifyToast, {
  x: 'right', // default
  y: 'bottom', // default
  color: 'info', // default
  icon: 'mdi-information',
  iconColor: '', // default
  classes: [
    'body-2'
  ],
  timeout: 3000, // default
  dismissable: true, // default
  multiLine: false, // default
  vertical: false, // default
  queueable: false, // default
  showClose: false, // default
  closeText: '', // default
  closeIcon: 'close', // default
  closeColor: '', // default
  slot: [], // default
  shorts: {
    custom: {
      color: 'purple'
    }
  },
  property: '$toast', // default
  $vuetify: veutifyObj.framework
})
export default new Vuetify({
})
