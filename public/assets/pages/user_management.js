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
        this.userList = [];
        this.groupList = [];
        this.selectedSystemId = '';
        setTimeout(() => {
          this.userList = response.data; //this.makeDataTableFlag(response.data, CRUD_FLAG.RETRIEVE);
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

    onAddUser() {
      this.userList.push({
        FLAG: 'C',
        SYSTEM_ID: '',
        USER_ID: '',
        USER_TYPE: '',
        UPDATED: ''
      });
    },

    onSaveUser() {
      this.waiting = true;
      axios.post('/api/saveUsers', {
        params: {
          data: this.getUserDataTable()
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
      const rows = $('#table_user_list').find('tr');

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

    makeDataTableFlag(dataTable, flag = CRUD_FLAG.RETRIEVE) {
      let newDataTable = JSON.parse(JSON.stringify(dataTable));

      for (let i = 0; i < newDataTable.length; i += 1) {
        newDataTable[i]['FLAG'] = flag;
      }

      return newDataTable;
    },

    initUserTableEvent() {
      $('#table_user_list .history-label').unbind();

      $('#table_user_list .history-label').click(function() {
        alert($(this).text());
      });

      $('#table_user_list td[colName="SYSTEM_ID"]').unbind();

      const self = this;
      $('#table_user_list td[colName="SYSTEM_ID"]').click(function() {
        const systemId = this.innerHTML;
        self.onLoadGroupList(systemId);
      });

      const $editable = $('#table_user_list .editable-cell');
      $editable.unbind();

      for (let i = 0; i < $editable.length; i += 1){
        if ($($($editable[i]).closest('tr').find('td')[0]).text() === CRUD_FLAG.CREATE) continue;

        $editable[i].setAttribute('data-orig',$editable[i].innerHTML);

        const self = this;
        $editable[i].onblur = function() {
          if (this.innerHTML == this.getAttribute('data-orig')) {
            // no change
            $($(this).closest('tr').find('td')[0]).text(CRUD_FLAG.RETRIEVE);
          } else {
            // change has happened, store new value
            $($(this).closest('tr').find('td')[0]).text(CRUD_FLAG.UPDATE);
          }

          // const system_id = $($(this).closest('tr').find('td')[1]).text();
          // const user = self.userList.find(function(el) {
          //   return el.SYSTEM_ID === system_id;
          // });

          // user[$(this).attr('colName')] = this.innerHTML;
          // user['FLAG'] = $(this).closest('tr').find('td')[0].innerHTML;
        };
      }
    }
  }
});
