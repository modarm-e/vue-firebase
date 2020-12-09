import Vue from 'vue'

Vue.config.errorHandler = e => {
  Vue.prototype.$toast.error(e.message)
  console.log('here')
}
