
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
        sender: '',
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

      axios.post('/recipient/search-message-transaction', this.searchData).then((response) => {
        this.waiting = false;
        const data = this.formatArrayMessage(response.data)

        const table = $('#messageTable').DataTable({
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
            {data : 'NAME',
            className: "msg-name-cell"},
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
          pagingType: 'full_numbers',
          ordering: false
        });

        $('#checkboxAll').attr('disabled', false);

        $('#checkboxAll').change(function() {
          if (this.checked) {
            $('#messageTable tbody span.unread-message').each(function( index ) {
              $(this).parents('tr').find('input[type="checkbox"].mark-as-read').prop('checked', true);
            });
          } else {
            $('#messageTable tbody span.unread-message').each(function( index ) {
              $(this).parents('tr').find('input[type="checkbox"].mark-as-read').prop('checked', false);
            });
          }
        });

        $('#selectAllMessage').removeClass( "sorting_asc sorting" );

        $('#messageTable tbody td.msg-name-cell').prop('title', 'Show Message');

        $('#messageTable').on('click', 'tbody td.msg-name-cell', function(event) {
          const data = table.row($(this).parents('tr')).data();
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
          event.stopPropagation();
        });

        this.messageData = data;
      });
      setTimeout(() => {
        this.waiting = false;
      }, 30000);
    },

    onMarkAsRead() {
      const self = this;
      const data = [];
      $( 'input[type="checkbox"].mark-as-read:checked' ).each(function( index ) {
        const rowData = $('#messageTable').DataTable().row( $(this).parents('tr') ).data();
        data.push(rowData);
      });
      this.waiting = true;

      axios.post('/recipient/mark-as-read', data).then((response) => {
        this.waiting = false;
        self.redrawTable(response.data);
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
      const self = this;
      const messageTable = $('#messageTable').DataTable();
      messageTable.rows().every( function ( rowIdx, tableLoop, rowLoop ) {
        let data = this.data();
        for (let i = 0; i < readData.length; i += 1) {
          const message = readData[i];
          if (data['TX_ID'] == message['TX_ID']) {
            data['RECV_TIME'] = message['RECV_TIME'];
            data['RECV_TIME_FORMAT'] = self.formatDateMessage(message['RECV_TIME']);
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