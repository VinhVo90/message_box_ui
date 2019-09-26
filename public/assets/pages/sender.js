
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
      momentDateFormat: 'DD/MM/YYYY HH:mm:ss',
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
    const self = this;
    $('#sendTimeDate').daterangepicker({
      timePicker: true,
      timePickerSeconds: true,
      timePicker24Hour: true,
      autoUpdateInput: false,
      format: self.momentDateFormat,
      locale: {
        format: self.momentDateFormat
      }
    }, (start, end) => {
      self.searchData.sendTime = 'SendTime';
      self.searchData.sendTimeFrom = start.valueOf();
      self.searchData.sendTimeTo = end.valueOf();
      $('#sendTimeDate').val(start.format(self.momentDateFormat) + ' - ' + end.format(self.momentDateFormat));
    });

    this.initTimeEvent('#sendTimeDate', 'Send');

    $('#recvTimeDate').daterangepicker({
      timePicker: true,
      timePickerSeconds: true,
      timePicker24Hour: true,
      autoUpdateInput: false,
      format: self.momentDateFormat,
      locale: {
        format: self.momentDateFormat
      }
    }, (start, end) => {
      self.searchData.recvTime = 'RecvTime';
      self.searchData.recvTimeFrom = start.valueOf();
      self.searchData.recvTimeTo = end.valueOf();
      $('#recvTimeDate').val(start.format(self.momentDateFormat) + ' - ' + end.format(self.momentDateFormat));
    });

    this.initTimeEvent('#recvTimeDate', 'Recv');
  },
  methods: {

    onBtnSearchClick() {
      this.waiting = true;
      const self = this;

      axios.post('/sender/search-message-transaction', this.searchData).then((response) => {
        this.waiting = false;
        const data = this.formatArrayMessage(response.data);

        const table = $('#messageTable').DataTable({
          data: data,
          columns: [
            {data : 'RECIPIENT_ID'},
            {data : 'GROUP_ID'},
            {data : 'SEND_TIME_FORMAT'},
            {data : 'RECV_TIME_FORMAT'},
            {data : 'NAME',
            className: "msg-name-cell"}
          ],
          bDestroy: true,
          pagingType: 'full_numbers',
          ordering: false
        });

        $('#messageTable tbody td.msg-name-cell').prop('title', 'Show Message');

        $('#messageTable').on('click', 'tbody td.msg-name-cell', function(event) {
          const data = table.row($(this).parents('tr')).data();
          self.selectedMessage = Object.assign({}, data);
          $("#recipientDialog").modal("show");
        });

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
        const data = response.data;
        if (data.error) {
          toastr.error(data.data)
        } else {
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
        } else {
          item['SEND_TIME_FORMAT'] = '';
        }
        
        if (item['RECV_TIME'] != '' && item['RECV_TIME'] != null) {
          item['RECV_TIME_FORMAT'] = this.formatDateMessage(item['RECV_TIME']);
        } else {
          item['RECV_TIME_FORMAT'] = '';
        }
        return item;
      });
    },

    formatDateMessage(date) {
      return moment(date).format(this.momentDateFormat);
    },

    getTimeRange(dateParam) {
      const dateObject = moment(dateParam.format(this.momentDateFormat), this.momentDateFormat);
      const result = {
        start : dateObject.valueOf(),
        end : dateObject.clone().add(1, 'days').valueOf() - 1
      }
      return result;
    },

    initTimeEvent(dateSelect, type) {
      const self = this;
      $(dateSelect).on('apply.daterangepicker', function(ev, picker) {
        $(this).val(picker.startDate.format(self.momentDateFormat) + ' - ' + picker.endDate.format(self.momentDateFormat));
      });

      $(dateSelect).on('cancel.daterangepicker', function(ev, picker) {
        $(this).val('');
        if (type == 'Send') {
          self.searchData['sendTime'] = null;
          self.searchData['sendTimeFrom'] = null;
          self.searchData['sendTimeTo'] = null;
        } else {
          self.searchData['recvTime'] = null;
          self.searchData['recvTimeFrom'] = null;
          self.searchData['recvTimeTo'] = null;
        }
      });
    }
  }
});