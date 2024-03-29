
let DATE_FORMAT = 'YYYY.MM.DD'
Vue.component('v-select', VueSelect.VueSelect);
Vue.component('datepicker', vuejsDatepicker);

window.app = new Vue({
  el: '#app',
  data: function () {
    return {
      waiting: false,
      configs: [],
      datePickerFormat: 'dd/MM/yyyy',
      momentDateFormat: 'DD/MM/YYYY',
      searchData: {
        sendTime: null,
        sendTimeFrom: null,
        sendTimeTo: null,
        recvTime: null,
        recvTimeFrom: null,
        recvTimeTo: null,
        recipient: '',
        group: '',
        messageName: ''
      },
      messageData: [],
      selectedMessage: {}
    }
  },
  mounted() {

  },
  methods: {

    onBtnFindClick() {
      this.waiting = true;

      if (this.searchData.sendTime != null) {
        let sendDate = moment(moment(this.searchData.sendTime).format(this.momentDateFormat), this.momentDateFormat);
        this.searchData.sendTimeFrom = sendDate.valueOf();
        this.searchData.sendTimeTo = sendDate.clone().add(1, 'days').valueOf() - 1;
      }

      if (this.searchData.recvTime != null) {
        let recvDate = moment(moment(this.searchData.recvDate).format(this.momentDateFormat), this.momentDateFormat);
        this.searchData.sendTimeFrom = recvDate.valueOf();
        this.searchData.sendTimeTo = recvDate.clone().add(1, 'days').valueOf() - 1;
      }

      axios.post('/sender/search-message-transaction', this.searchData).then((response) => {
        this.waiting = false;
        let data = response.data.map((item, index, array) => {
          if (item['SEND_TIME'] != '' && item['SEND_TIME'] != null) {
            item['SEND_TIME_FORMAT'] = moment(item['SEND_TIME']).format(this.momentDateFormat);
          }
          else {
            item['SEND_TIME_FORMAT'] = '';
          }
          
          if (item['RECV_TIME'] != '' && item['RECV_TIME'] != null) {
            item['RECV_TIME_FORMAT'] = moment(item['RECV_TIME']).format(this.momentDateFormat);
          }
          else {
            item['RECV_TIME_FORMAT'] = '';
          }
          return item;
        });
        this.messageData = response.data;
      });
      setTimeout(() => {
        this.waiting = false;
      }, 30000);
    },

    onRowClick(message) {
      this.selectedMessage = Object.assign({}, message);
      $("#recipientDialog").modal("show");
    },

    onSendClick() {
      this.waiting = true;

      const postData = {
        sender : 'SENDER',
        recipient : this.selectedMessage['RECIPIENT_ID'],
        group : this.selectedMessage['GROUP_ID'],
        fileName : this.selectedMessage['NAME'],
        fileContent : this.selectedMessage['CONTENT']
      }

      axios.post('/sender/send-message', postData).then((response) => {
        this.waiting = false;
        $("#recipientDialog").modal("hide");
      }).catch((error) => {
        this.waiting = false;
        console.log(error);
      });
      setTimeout(() => {
        this.waiting = false;
      }, 30000);
    }
  }
});