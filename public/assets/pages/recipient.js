
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
            if (data['RECV_TIME'] == '' || data['RECV_TIME'] != null) {
              self.selectedMessage = Object.assign({}, data);
              this.waiting = true;
              axios.post('/recipient/mark-as-read', [data]).then((response) => {
                this.waiting = false;
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

        this.messageData = response.data;
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
        toastr.success('Done');
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