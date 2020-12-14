<template>
  <v-card>
    <board-index v-if="collection === 'board' && document === 'list'"></board-index>
    <board-content v-else-if="collection === 'board'" :document="document"></board-content>
    <page-index v-else-if="collection === 'page' && document === 'list'"></page-index>
    <page-content v-else-if="collection === 'page'" :document="document"></page-content>
    <error-page v-else></error-page>
  </v-card>
</template>
<script>
import BoardIndex from './board/index'
import BoardContent from './board/content'
import PageIndex from './page/index'
import pageContent from './page/content'
import ErrorPage from './error'

export default {
  components: {
    BoardIndex,
    BoardContent,
    PageIndex,
    pageContent,
    ErrorPage
  },
  computed: {
    collection () {
      return this.$route.params.collection
    },
    document () {
      return this.$route.params.document
    }
  }
}
</script>
