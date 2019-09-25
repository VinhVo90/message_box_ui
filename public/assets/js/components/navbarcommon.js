window.navbarapp = new Vue({
  el: '#navbar-messagebox',
  data: function () {
    return {
      waiting: false
    }
  },
  methods: {
    async logout() {
      this.waiting = true;
      await axios.post('/logout').then((response) => {
        this.waiting = false;
        window.location.replace('/');
      });
      setTimeout(() => {
        this.waiting = false;
      }, 30000);
    }
  }
});