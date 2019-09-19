
let DATE_FORMAT = 'YYYY.MM.DD'
Vue.component('v-select', VueSelect.VueSelect);
window.app = new Vue({
  el: '#app',
  data: {
    waiting: false,
    username: '',
    password: ''
  },

  mounted() {
    setTimeout(() => {
      $('#username').focus();
    }, 200);
  },

  methods: {
    onLogin() {
      if (this.username === "") {
        warningMsg('Please input username');
        return;
      }

      if (this.password === "") {
        warningMsg('Please input password');
        return;
      }

      this.waiting = true;
      axios.post('/api/getUserinfo', {
        params: {
          username: this.username,
          password: this.password
        }
      }).then((response) => {
        this.waiting = false;
        setTimeout(function() {
          console.log(response.data);
          if (response.data.length === 0) {
            warningMsg('Incorrect usename/password');
            return;
          }

          // window.open("/user_management","_self");
        },100);
        
      }).catch(ex => {
        this.waiting = false;
        console.log(ex);
        errorMsg(ex);
      });

      setTimeout(() => {
        this.waiting = false;
      }, 30000);
    },

    onInputKeyDown(e) {
      if (e.keyCode === 13) {
        this.onLogin();
      }
    }
  }
});
