
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
        sender: '',
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
      let self = this;

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

      axios.post('/recipient/search-message-transaction', this.searchData).then((response) => {
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

        let table = $('#messageTable').DataTable({
          data: response.data,
          columns: [
            {data : 'SENDER_ID'},
            {data : 'GROUP_ID'},
            {data : 'SEND_TIME_FORMAT'},
            {data : 'RECV_TIME_FORMAT'},
            {data : 'NAME'}
          ],
          bDestroy: true,
          pagingType: 'full_numbers'
        });

        $('#messageTable').on('click', 'tbody tr', function(event) {
          let data = table.row(this).data();
          self.selectedMessage = Object.assign({}, data);
          $("#senderDialog").modal("show");
        })

        this.messageData = response.data;
      });
      setTimeout(() => {
        this.waiting = false;
      }, 30000);
    },

    onRowClick(message) {
      this.selectedMessage = Object.assign({}, message);
      $("#senderDialog").modal("show");
    }
  }
});