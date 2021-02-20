import Vue from 'vue'
import moment from 'moment'
import 'moment/locale/ko'

moment.locale('ja')// ko , ja

Vue.prototype.$moment = moment
