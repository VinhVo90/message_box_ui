
let DATE_FORMAT = 'YYYY.MM.DD'
Vue.component('v-select', VueSelect.VueSelect);
window.app = new Vue({
  el: '#app',
  data: function () {
    return {
      configCb: [],
      valueCb: [],
      waiting: false,
      configs: [],
      typeSearch: '',
      valueSearch: {label: 'ALL', value: 'ALL'},
      taskDesc: '',
      currGroupId: '',
      currTaskId: '',
      fileName: '',
      action: '',
      task: {
        taskId: '',
        description: '',
        schedule: '',
        source: '',
        filter: [''],
        inputBk: [''],
        converters: [''],
        outputBk: [''],
        destination: ''
      },
      allItem: {label: 'ALL', value: 'ALL'}
    }
  },
  mounted() {

  },
  methods: {

    onBtnSearchClick() {
      if (this.valueSearch) {
        //search task by group
        this.waiting = true; 
        axios.post('/api/getTaskListByGroup', {
          type: this.typeSearch.value, 
          value: this.valueSearch.value, 
          desc: this.taskDesc 
        }).then((response) => {
          this.waiting = false;
          this.configs = response.data;
        });
        setTimeout(() => {
          this.waiting = false;
        }, 30000);
      } else {
        if (this.typeSearch.value == "GID") {
          warningMsg('Please select the Group ID.')
        } else {
          warningMsg('Please select the Task ID.')
        }
      }
    },

    getTaskDetail(config) {
      this.waiting = true;
      let keys = [];
      for (var key in config) {
        keys.push(key);
      }
      this.currGroupId = config.GROUP_ID;
      this.currTaskId = config.TASK_ID;
      axios.post('/api/getConfigDetails', {
        fileName: config.CONFIG_PATH
      }).then((response) => {
        this.waiting = false;
        const data = response.data;
        if (data) {
          //reset data
          this.task = {
            taskId: '',
            description: '',
            schedule: '',
            source: '',
            filter: [''],
            inputBk: [''],
            converters: [''],
            outputBk: [''],
            destination: ''
          };
          //get basic info
          if (data.info) {
            this.task.taskId = data.info.id ? data.info.id : "";
            this.task.description = data.info.description ? data.info.description : "";
            this.task.schedule = data.info.schedule ? data.info.schedule : "";
          }

          //get route info
          if (data.route) {
            let inputStr = "";
            $.each(data.route, (index, item) => {
              if (item && item.type) {
                if (item.type == "SOURCE") {
                  this.task.source = item.path;
                } else if (item.type == "INPUT_BACKUP") {
                  this.task.inputBk = [];
                  this.task.inputBk.push(item.path);
                } else if (item.type == "OUTPUT_BACKUP") {
                  this.task.outputBk = [];
                  this.task.outputBk.push(item.path);
                } else if (item.type == "DESTINATION") {
                  this.task.destination = item.path
                }
              }
            });
          }

          //get filters for input
          if (data.filters) {
            this.task.filter = [];
            $.each(data.filters, (index, filter) => {
              var resultArr = Object.keys(filter).map(function (key) {
                return { name: String(key), value: filter[key] };
              });
              this.task.filter.push(resultArr);
            });
          }

          //get converters for processing
          if (data.converters) {
            this.task.converters = [];
            $.each(data.converters, (index, converter) => {
              var resultArr = Object.keys(converter).map(function (key) {
                return { name: String(key), value: converter[key] };
              });

              this.task.converters.push(resultArr);
            });
          }
        }
      }).catch(error => {
        this.waiting = false;
        warningMsg(error.response.data.message);
      });

      setTimeout(() => {
        this.waiting = false;
      }, 30000);
    },

    getTypeNameCb() {
      this.configCb = [{ label: 'Group Id', value: 'GID' }, { label: 'Task Id', value: 'TID' }];
      this.typeSearch = this.configCb[0];
      this.getValueByTypeCb();
    },

    getValueByTypeCb() {
      this.waiting = true
      const formData = {
        type: this.typeSearch.value
      }

      axios
        .post('/api/getValueByType', formData)
        .then((response) => {
          this.waiting = false
          
          response.data.unshift(this.allItem)
          this.valueCb = response.data
          this.valueSearch = this.allItem

        })
        .catch((err) => {
          this.waiting = false
          errorMsg(err.response.data.message)
        })
    },

    typeSearchChange(val) {
      if(val && val.value){
        this.typeSearch = val
        this.getValueByTypeCb();
      }
    },

    openSelectFile() {
      $('#fileTreeDemo_1').fileTree({ root: '', script: 'connectors/jqueryFileTree.js', folderEvent: 'dblclick', expandSpeed: 1, collapseSpeed: 1, multiSelect : true }, (file) => {
        var tmpArr = file.split('/')
        if (tmpArr.length > 0) {
          this.fileName = tmpArr[tmpArr.length - 1]
        }
        $('#fileModal').modal('hide')
      });
      $('#fileModal').modal('show');
    },

    onBtnAddClick() {
      //check pass first
      this.action = "ADD";
      this.onConfirmPassword();
    },

    onBtnDeleteClick() {
      if (this.currGroupId == undefined || this.currGroupId.trim() == "") {
        if (this.typeSearch.value == "GID") {
          warningMsg('Please select the Group ID.');
        } else {
          warningMsg('Please select the Task ID.');
        }
        return;
      }
      this.action = "DEL";
      this.onConfirmPassword();
    },

    onConfirmPassword() {
      //show popup confirm pass.
      $('#passInput').val('');
      setTimeout(function (){
        $('#passInput').focus();
      }, 300);
      $('#passwordModal').modal('show');
    },

    //check password
    checkPassword() {
      const password = $('#passInput').val();
      this.waiting = true;
      axios.post('/api/checkPassword', {
        password: password,
      }).then((response) => {
        this.waiting = false;
        if (response.data.value) {
          $('#passwordModal').modal('toggle');
          if (this.action == "ADD") {
            this.openPopupNewTask();
          } else {
            this.deleteTask();
          }
        } else {
          warningMsgAndFocus("Incorrect password. Please try again!", (done) => {
            setTimeout(
              function () {
                $('#passInput').focus();
              }, 300);
          });
          return;
        }
      });
      setTimeout(() => {
        this.waiting = false;
      }, 30000);
    },

    openPopupNewTask() {
      //reset form
      $('#groupId').val('');
      $('#filePath').val('');
      $('#inputDesc').val('');
      //show popup add new task
      $('#addNewTaskModal').modal('show');
    },

    addNewTask() {
      //check group id
      const newGroupId = $('#groupId').val();
      if (newGroupId == undefined || newGroupId.trim() == "") {
        warningMsgAndFocus("Please enter the Group ID!", (done) => {
          $('#groupId').focus();
        });
        return;
      }

      //check config file
      if (this.fileName == undefined || this.fileName.trim() == "") {
        warningMsg('Please choose the config file!');
        return;
      }

      this.waiting = true;

      var formData = {
        groupId: newGroupId,
        fileName: this.fileName,
        desc: $('#inputDesc').val().trim()
      };

      axios.post('/api/addNewTask', formData).then((response) => {
        this.waiting = false;
        successMsg("Save successful.");
        $('#addNewTaskModal').modal('toggle');
        this.onBtnSearchClick();
        this.fileName = '';
      }).catch(error => {
        this.waiting = false;
        warningMsg(error.response.data.message);
      });

      setTimeout(() => {
        this.waiting = false;
      }, 30000);

    },

    deleteTask() {
      //confirm delete
      Swal({
        title: 'Are you sure?',
        text: 'You will not be able to recover this action!',
        type: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'No, keep it'
      }).then((result) => {
        if (result.value) {
          this.waiting = true
          let param = { key: this.currTaskId }
          let api = '/api/deleteTask'
          if (this.typeSearch.value == 'GID') {
            api = '/api/deleteGroup'
            param = { key: this.currGroupId }
          }
          axios
            .post(api, param)
            .then((response) => {
              this.waiting = false
              successMsg('Data were removed success fully')
              this.getValueByTypeCb();
              this.onBtnSearchClick();
              this.currGroupId = ''
              this.currTaskId = ''
            })
            .catch((err) => {
              this.waiting = false
              errorMsg(err.response.data.message)
            })
        }
      })
    }
  }
});

Split(['#c', '#d'], {
  direction: 'vertical',
  sizes: [25, 75],
  gutterSize: 8,
  cursor: 'row-resize'
})