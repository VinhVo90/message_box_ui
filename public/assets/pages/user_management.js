const CRUD_FLAG = {
  CREATE: 'C',
  RETRIEVE: 'R',
  UPDATE: 'U',
  DELETE: 'D'
}

let DATE_FORMAT = 'YYYY.MM.DD'
Vue.component('v-select', VueSelect.VueSelect);
window.app = new Vue({
  el: '#app',
  data: function () {
    return {
      userId: '',
      userType: '',
      userList: [],
      groupList: [],
      userHistoryList: [],
      waiting: false,
      selectedSystemId: ''
    }
  },

  mounted() {
    $(document).keyup(function (e) {
      if (e.keyCode == 27) { // escape key maps to keycode `27`
        $('.modal').modal('hide')
      }
    });

    $('#table_user_list').DataTable({
      paging: false
    });
  },

  updated() {
    
  },

  watch: {

  },

  methods: {
    onBtnSearchClick() {
      this.waiting = true;
      axios.post('/api/getUsers', {
        params: {
          userId: this.userId,
          userType: this.userType
        }
      }).then((response) => {
        this.groupList = [];
        this.selectedSystemId = '';
        setTimeout(() => {
          this.loadUserTableData(response.data);
          this.waiting = false;
          setTimeout(() => {
            this.initUserTableEvent();
          }, 100);
        }, 100);

      }).catch(ex => {
        this.waiting = false;
        console.log(ex);
      });
    },

    loadUserTableData(data) {
      const table = $('#table_user_list').DataTable({
        data: data,
        columns: [
          { 
            data : 'FLAG',
            className: 'text-center hidden-column',
            createdCell:  function (td, cellData, rowData, row, col) {
              $(td).attr('colName', 'FLAG');
            }
          },
          {
            data: null,
            defaultContent: `<input type="checkbox">`,
            orderable: false,
            className: 'text-center',
            createdCell:  function (td, cellData, rowData, row, col) {
              $(td).attr('colName', 'DEL');
            }
          },
          {
            data : 'SYSTEM_ID',
            className: 'text-center',
            createdCell:  function (td, cellData, rowData, row, col) {
              $(td).attr('class', 'system-id');
              $(td).attr('colName', 'SYSTEM_ID');
              $(td).attr('title', 'View group list');
            }
          },
          {
            data : 'USER_ID',
            className: 'editabled-cell',
            createdCell:  function (td, cellData, rowData, row, col) {
              $(td).attr('contenteditable', 'true');
              $(td).attr('colName', 'USER_ID');
            }
          },
          {
            data : 'PASSWORD',
            className: 'editabled-cell',
            createdCell:  function (td, cellData, rowData, row, col) {
              $(td).attr('contenteditable', 'true');
              $(td).attr('colName', 'PASSWORD');
            }
          },            
          {
            data : 'USER_TYPE',
            orderable: false,
            render: function(data, type, row, meta) {
              let userTypeSelect = `<select class="browser-default custom-select editabled-cell">`;
              for (let i = 0; i < commonData.userType.length; i += 1) {
                const op = commonData.userType[i];
                if (op === data)  userTypeSelect += `<option value="${op}" selected>${op}</option>`;
                else              userTypeSelect += `<option value="${op}">${op}</option>`;
              }
              userTypeSelect += `</select>`;

              return userTypeSelect;
            },
            createdCell:  function (td, cellData, rowData, row, col) {
              $(td).attr('colName', 'USER_TYPE');
            }
          },
          {
            data : 'UPDATED',
            className: 'text-center',
            createdCell:  function (td, cellData, rowData, row, col) {
              $(td).attr('colName', 'UPDATED');
            }
          },
          {
            data : 'SYSTEM_ID',
            render: function (data, type, row, meta ) {
              if (data == '' || data == null) {
                  return ``;
              } else {
                return `<label class="history-label">History</label>`;
              }
            },
            className: 'text-center'
          }     
        ],
        bDestroy: true,
        paging: false
      });
    },

    onLoadUserHistory(systemId) {
      this.waiting = true;
      axios.post('/api/getUserHistory', {
        params: {
          systemId: systemId
        }
      }).then((response) => {
        setTimeout(() => {
          this.userHistoryList = response.data;
          this.waiting = false;
        }, 100);

      }).catch(ex => {
        this.waiting = false;
        console.log(ex);
      });
    },

    onAddUser() {
      if ($('#table_user_list').DataTable().rows().data().length === 0) {
        this.loadUserTableData([{FLAG: CRUD_FLAG.CREATE, SYSTEM_ID: '', USER_ID: '', PASSWORD: '', USER_TYPE: '', UPDATED: ''}]);
      } else {
        const res = $('#table_user_list').DataTable().row.add({FLAG: CRUD_FLAG.CREATE, SYSTEM_ID: '', USER_ID: '', PASSWORD: '', USER_TYPE: '', UPDATED: ''}).draw(false);
      }

      $('#table_user_list td[colName="DEL"] input').unbind();
      $('#table_user_list td[colName="DEL"] input').click(function() {
        const flag = $(this).parents('tr').find('td[colName="FLAG"]')[0].innerHTML;
        if (this.checked && flag === CRUD_FLAG.CREATE) {
          $('#table_user_list').DataTable().row($(this).parents('tr')).remove().draw();
        }
      });
    },

    onSaveUser() {
      this.waiting = true;
      if (!this.validateUserTable()) return;

      const dataTable = this.getUserDataTable();

      if (dataTable.length === 0) {
        this.waiting = false;
        toastr.info('There is no any change to save.');
        return;
      }
      axios.post('/api/saveUsers', {
        params: {
          data: dataTable
        }
      }).then((response) => {
        this.waiting = false;
        this.onBtnSearchClick();
      }).catch(ex => {
        this.waiting = false;
        console.log(ex);
      });
    },

    getUserDataTable() {
      let dataTable = [];
      if ($('#table_user_list').DataTable().rows().data().length === 0) return [];

      const rows = $('#table_user_list').find('tbody tr');

      if (rows.length > 0) {
        for (let i = 0; i < rows.length; i += 1) {
          const $row = $(rows[i]);
          const cols = $row.find('td');
          let dataRow = {};

          for (let j = 0; j < cols.length; j += 1) {
            const $col = $(cols[j]);
            if ($col.attr('colName') === 'DEL') {
              const checked = $($col.find('input')[0]).is(':checked');
              if (checked) dataRow['FLAG'] = CRUD_FLAG.DELETE;
            } else if ($col.attr('colName') === 'USER_TYPE') {
              dataRow['USER_TYPE'] = $col.find('select')[0].value;
            } else {
              dataRow[$col.attr('colName')] = $col.text();
            }
          }
          if (dataRow['FLAG'] !== CRUD_FLAG.RETRIEVE) {
            dataTable.push(dataRow);
          }
        }
      }

      return dataTable;
    },

    onLoadGroupList(systemId) {
      this.waiting = true;
      this.selectedSystemId = systemId;

      axios.post('/api/getGroups',{
        params: {
          systemId
        }
      }).then((response) => {
        this.waiting = false;
        this.groupList = [];
        setTimeout(() => {
          this.groupList = response.data;
        }, 100);
      }).catch(ex => {
        this.waiting = false;
        console.log(ex);
      });
    },

    onAddGroup() {
      if (this.selectedSystemId === '') {
        alert('Select an user.');
        return;
      }

      this.groupList.push({
        FLAG: CRUD_FLAG.CREATE,
        SYSTEM_ID: '',
        GROUP_ID: ''
      });
    },

    onSaveGroup() {
      if (this.selectedSystemId === '') {
        alert('Select an user.');
        return;
      }
      
      this.waiting = true;
      axios.post('/api/saveGroups', {
        params: {
          data: this.getGroupDataTable(),
          systemId: this.selectedSystemId
        }
      }).then((response) => {
        this.waiting = false;
        this.onLoadGroupList(this.selectedSystemId);
      }).catch(ex => {
        this.waiting = false;
        console.log(ex);
      });
    },

    getGroupDataTable() {
      let dataTable = [];
      const rows = $('#table_group_list').find('tr');

      if (rows.length > 1) {
        for (let i = 1; i < rows.length; i += 1) {
          const $row = $(rows[i]);
          const cols = $row.find('td');
          let dataRow = {};

          for (let j = 0; j < cols.length; j += 1) {
            const $col = $(cols[j]);
            if ($col.attr('colName') === 'DEL') {
              const checked = $($col.find('input')[0]).is(':checked');
              if (checked) dataRow['FLAG'] = CRUD_FLAG.DELETE;
            } else {
              dataRow[$col.attr('colName')] = $col.text();
            }
          }

          dataTable.push(dataRow);
        }
      }

      return dataTable;
    },

    initUserTableEvent() {
      const self = this;

      $('#table_user_list .history-label').unbind();
      $('#table_user_list .history-label').click(function() {
        const systemId = $(this).closest('tr').find('td')[2].innerHTML;
        $('#historySystemId').val(systemId);
        $('#userHistoryDialog').modal('show');
        self.onLoadUserHistory(systemId);
      });

      $('#table_user_list td[colName="SYSTEM_ID"]').unbind();
      $('#table_user_list td[colName="SYSTEM_ID"]').click(function() {
        const systemId = this.innerHTML;
        if (systemId === '') return;

        self.onLoadGroupList(systemId);
      });

      $('#table_user_list td[colName="DEL"] input').unbind();
      $('#table_user_list td[colName="DEL"] input').click(function() {
        const flag = $(this).parents('tr').find('td[colName="FLAG"]')[0].innerHTML;
        if (this.checked && flag === CRUD_FLAG.CREATE) {
          $('#table_user_list').DataTable().row($(this).parents('tr')).remove().draw();
        }
      });

      const $editable = $('#table_user_list .editabled-cell');
      $editable.unbind();

      for (let i = 0; i < $editable.length; i += 1) {
        // ignore new row
        if ($($($editable[i]).closest('tr').find('td')[0]).text() === CRUD_FLAG.CREATE) continue;

        if ($editable[i].tagName === 'SELECT') {
          $editable[i].setAttribute('data-orig',$editable[i].value);
        } else {
          $editable[i].setAttribute('data-orig',$editable[i].innerHTML);
        }

        $editable[i].onblur = function() {
          let value = '';
          if (this.tagName === 'SELECT') {
            value = this.value;
          } else {
            value = this.innerHTML;
          }
          if (value == this.getAttribute('data-orig')) {
            // no change
            $($(this).closest('tr').find('td')[0]).text(CRUD_FLAG.RETRIEVE);
          } else {
            // change has happened, store new value
            $($(this).closest('tr').find('td')[0]).text(CRUD_FLAG.UPDATE);
          }
        };
      }
    },
    validateUserTable() {
      if ($('#table_user_list').DataTable().rows().data().length === 0) return true;

      const rows = $('#table_user_list').find('tbody tr');

      if (rows.length > 0) {
        for (let i = 0; i < rows.length; i += 1) {
          const $row = $(rows[i]);
          const cols = $row.find('td');
          for (let j = 0; j < cols.length; j += 1) {
            const $col = $(cols[j]);
            if ($col.attr('colName') === 'USER_ID') {
              const value = $col.text();
              const reg = /^\w+$/;
              if (value === "") {
                this.waiting = false;
                toastr.error("Enter User Id please.");
                $col.focus();
                return false;
              } else if (!reg.test(value)) {
                this.waiting = false;
                toastr.error("Username must contain only letters, numbers and underscores!");
                $col.focus();
                return false;
              }
            } else if ($col.attr('colName') === 'PASSWORD') {
              const value = $col.text();
              if (value === "") {
                this.waiting = false;
                toastr.error("Enter Password please.");
                $col.focus();
                return false;
              }
            }
          }
        }
      }

      return true;
    }
  }
});
