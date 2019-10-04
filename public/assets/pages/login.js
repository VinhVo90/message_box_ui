
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
      if (this.username.trim() === "") {
        toastr.info('Enter username please!');
        $('#username').focus();
        return;
      }

      if (this.password.trim() === "") {
        toastr.info('Enter password please!');
        $('#password').focus();
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
        if (response.data.authenticated) {
          window.location.replace("/");
        } else {
          setTimeout(function() {
            console.log(response.data);
            if (response.data.length === 0) {
              toastr.error('Incorrect usename/password');
              $('#username').select();
            }
          },100);
        }
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
