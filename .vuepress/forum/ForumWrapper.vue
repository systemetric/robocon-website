<template>
  <div class="new-forum-wrapper">
    <button v-if="!user" @click="login">Login</button>
    <button v-else @click="logout">Logout</button>
    <hr />
    <pre>{{ JSON.stringify(user, null, 2) }}</pre>
  </div>
</template>

<script>
export default {
  name: "forum",
  data() {
    return {
      user: null
    };
  },
  mounted() {
    import("./auth").then(({ auth }) => {
      auth.addListener("user", this.onUserChanged);
      auth.loginSilently();
    });
  },
  beforeDestroy() {
    import("./auth").then(({ auth }) => {
      auth.removeListener("user", this.onUserChanged);
    });
  },
  methods: {
    login() {
      import("./auth").then(({ auth }) => {
        auth.login();
      });
    },
    logout() {
      import("./auth").then(({ auth }) => {
        auth.logout();
      });
    },
    onUserChanged(user) {
      console.log("User:", user);
      this.user = user;
      //console.log(auth);
    }
  }
};
</script>

<style lang="sass">
.new-forum-wrapper
  max-width: 800px
  margin: 0 auto
  padding: 1rem
  pre
    overflow-x: auto
</style>
