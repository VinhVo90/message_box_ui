
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
    let self = this;
    $('#sendTimeDate').daterangepicker({
      timePicker: true,
      autoUpdateInput: false,
      format: 'YYYY-MM-DD HH:mm',
      locale: {
        format: self.momentDateFormat
      }
    }, (start, end) => {
      let startDate = self.getTimeRange(start);
      let endDate = self.getTimeRange(end);
      self.searchData.sendTime = 'SendTime';
      self.searchData.sendTimeFrom = startDate.start;
      self.searchData.sendTimeTo = endDate.end;
      $('#sendTimeDate').val(start.format(self.momentDateFormat) + ' - ' + end.format(self.momentDateFormat));
    });

    this.initTimeEvent('#sendTimeDate');

    $('#recvTimeDate').daterangepicker({
      timePicker: true,
      autoUpdateInput: false,
      format: 'YYYY-MM-DD HH:mm',
      locale: {
        format: self.momentDateFormat
      }
    }, (start, end) => {
      let startDate = self.getTimeRange(start);
      let endDate = self.getTimeRange(end);
      self.searchData.recvTime = 'RecvTime';
      self.searchData.recvTimeFrom = startDate.start;
      self.searchData.recvTimeTo = endDate.end;
      $('#recvTimeDate').val(start.format(self.momentDateFormat) + ' - ' + end.format(self.momentDateFormat));
    });

    this.initTimeEvent('#recvTimeDate');
  },
  methods: {

    onBtnSearchClick() {
      this.waiting = true;
      let self = this;

      axios.post('/sender/search-message-transaction', this.searchData).then((response) => {
        this.waiting = false;
        let data = this.formatArrayMessage(response.data);

        let table = $('#messageTable').DataTable({
          data: data,
          columns: [
            {data : 'RECIPIENT_ID'},
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
          $("#recipientDialog").modal("show");
        })

        this.messageData = data;
      });
      setTimeout(() => {
        this.waiting = false;
      }, 30000);
    },

    onSendNewMessage() {
      this.selectedMessage = {
        RECIPIENT_ID : '',
        GROUP_ID : '',
        NAME : '',
        CONTENT : ''
      }
      $("#recipientDialog").modal("show");
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
        let data = response.data;
        if (data.error) {
          toastr.error(data.data)
        }
        else {
          $("#recipientDialog").modal("hide");
          toastr.success('Send success');
        }
      }).catch((error) => {
        this.waiting = false;
        console.log(error);
      });
      setTimeout(() => {
        this.waiting = false;
      }, 30000);
    },

    formatArrayMessage(data) {
      return data.map((item, index, array) => {
        if (item['SEND_TIME'] != '' && item['SEND_TIME'] != null) {
          item['SEND_TIME_FORMAT'] = this.formatDateMessage(item['SEND_TIME']);
        }
        else {
          item['SEND_TIME_FORMAT'] = '';
        }
        
        if (item['RECV_TIME'] != '' && item['RECV_TIME'] != null) {
          item['RECV_TIME_FORMAT'] = this.formatDateMessage(item['RECV_TIME']);
        }
        else {
          item['RECV_TIME_FORMAT'] = '';
        }
        return item;
      });
    },

    formatDateMessage(date) {
      return moment(date).format(this.momentDateFormat);
    },

    getTimeRange(dateParam) {
      let dateObject = moment(dateParam.format(this.momentDateFormat), this.momentDateFormat);
      let result = {
        start : dateObject.valueOf(),
        end : dateObject.clone().add(1, 'days').valueOf() - 1
      }
      return result;
    },

    initTimeEvent(dateSelect) {
      let self = this;
      $(dateSelect).on('apply.daterangepicker', function(ev, picker) {
        $(this).val(picker.startDate.format(self.momentDateFormat) + ' - ' + picker.endDate.format(self.momentDateFormat));
      });

      $(dateSelect).on('cancel.daterangepicker', function(ev, picker) {
          $(this).val('');
      });
    }
  }
});