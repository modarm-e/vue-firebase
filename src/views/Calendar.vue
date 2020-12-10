<template>
  <!-- 미완성 -->
  <v-row ma-3>
    <v-col>

      <v-sheet height="740">
        <v-calendar
          ref="calendar"
          color="primary"
        >

        </v-calendar>
      </v-sheet>
    </v-col>
    <v-col>
      <v-card>
        <v-form>
          <v-card-title>
            입력
            <v-spacer/>
          </v-card-title>
          <v-card-text>
            <v-text-field v-model="form.title"></v-text-field>
            <v-text-field v-model="form.date"></v-text-field>
          </v-card-text>
          <v-btn class="ma-4" @click="save" icon><v-icon>mdi-content-save</v-icon></v-btn>
        </v-form>
      </v-card>
    </v-col>
  </v-row>
</template>
<script>
export default {
  data () {
    return {
      form: {
        title: '',
        date: ''
      },
      dateOpen: false,
      start: '',
      type: 'month',
      typeOptions: [
        { text: 'Day', value: 'day' },
        { text: 'Week', value: 'week' },
        { text: 'Month', value: 'month' }
      ]
    }
  },
  methods: {
    async save () {
      try {
        this.loading = true
        await this.$firebase.database().ref().child('calendar').set(this.forms)
      } finally {
      }
    }
  }
}
</script>
