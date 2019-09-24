
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
    let self = this;
    $('#sendTimeDate').daterangepicker({
      timePicker: true,
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
    });

    $('#recvTimeDate').daterangepicker({
      timePicker: true,
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
    });
  },
  methods: {

    onBtnFindClick() {
      this.waiting = true;
      let self = this;

      axios.post('/recipient/search-message-transaction', this.searchData).then((response) => {
        this.waiting = false;
        let data = this.formatArrayMessage(response.data)

        let table = $('#messageTable').DataTable({
          data: data,
          columns: [
            {
              "data": null,
              "defaultContent": `<input type="checkbox" class="mark-as-read">`,
              "orderable": false
            },
            {data : 'SENDER_ID'},
            {data : 'GROUP_ID'},
            {data : 'SEND_TIME_FORMAT'},
            {data : 'RECV_TIME_FORMAT'},
            {data : 'NAME'},
            {data : 'RECV_TIME', render: function (data, type, row, meta ) {
              if (data == '' || data == null){
                return `<span class="unread-message">Unread</span>`;
              } else {
                return `<span class="read-message">Read</span>`;
              }
            },
            className: "text-center"}
          ],
          bDestroy: true,
          pagingType: 'full_numbers'
        });

        $('#checkboxAll').attr('disabled', false);

        $('#checkboxAll').change(function() {
          if (this.checked) {
            $('#messageTable tbody span.unread-message').each(function( index ) {
              $(this).parents('tr').find('input[type="checkbox"].mark-as-read').prop('checked', true);
            });
          }
          else {
            $('#messageTable tbody span.unread-message').each(function( index ) {
              $(this).parents('tr').find('input[type="checkbox"].mark-as-read').prop('checked', false);
            });
          }
        });

        $('selectAllMessage').removeClass( "sorting_asc sorting" );

        $('#messageTable').on('click', 'tbody tr', function(event) {
          let data = table.row(this).data();
          if (typeof data != 'undefined') {
            if (data['RECV_TIME'] == '' || data['RECV_TIME'] == null) {
              self.selectedMessage = Object.assign({}, data);
              this.waiting = true;
              axios.post('/recipient/read-message', [data]).then((response) => {
                this.waiting = false;
                self.redrawTable(response.data);
                $("#senderDialog").modal("show");
              });
              setTimeout(() => {
                this.waiting = false;
              }, 30000);
            } else {
              self.selectedMessage = Object.assign({}, data);
              $("#senderDialog").modal("show");
            }
          }
        })

        $('#messageTable').on('click', 'input[type="checkbox"].mark-as-read', function(event) {
          let data = table.row( $(this).parents('tr') ).data();
          event.stopPropagation();
        });

        this.messageData = data;
      });
      setTimeout(() => {
        this.waiting = false;
      }, 30000);
    },

    onMarkAsRead() {
      let data = [];
      $( 'input[type="checkbox"].mark-as-read:checked' ).each(function( index ) {
        let rowData = $('#messageTable').DataTable().row( $(this).parents('tr') ).data();
        data.push(rowData);
      });
      this.waiting = true;

      axios.post('/recipient/mark-as-read', data).then((response) => {
        this.waiting = false;
        this.onBtnFindClick();
        toastr.success('Done');
      });
      setTimeout(() => {
        this.waiting = false;
      }, 30000);
    },

    onRowClick(message) {
      this.selectedMessage = Object.assign({}, message);
      $("#senderDialog").modal("show");
    },

    redrawTable(readData) {
      let self = this;
      let messageTable = $('#messageTable').DataTable();
      messageTable.rows().every( function ( rowIdx, tableLoop, rowLoop ) {
        var data = this.data();
        for (let i = 0; i < readData.length; i++) {
          let message = readData[i];
          if (data['TX_ID'] == message['txId']) {
            data['RECV_TIME'] = message['recvDate'];
            data['RECV_TIME_FORMAT'] = self.formatDateMessage(message['recvDate']);
            break;
          }
        }
        messageTable.row(rowIdx).data(data).draw();
      } );
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
    }
  }
});