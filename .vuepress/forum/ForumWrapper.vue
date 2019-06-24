<template>
  <div>
    <button @click="login">Login</button><br />
    <button @click="logout">Logout</button>
  </div>
</template>

<script>
export default {
  name: "forum",
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
      //console.log(auth);
    }
  }
};
</script>
