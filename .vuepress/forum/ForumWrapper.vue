<template>
  <div>
    <button @click="login">Login</button><br />
    <button @click="logout">Logout</button>
  </div>
</template>

<script>
import auth from "./auth";

export default {
  name: "forum",
  created() {
    window.auth = auth;
    window.logIdToken = () => {
      auth.getIdToken().then(console.log);
    };
    auth.addListener("user", this.onUserChanged);
    auth.loginSilently();
  },
  destroyed() {
    auth.removeListener("user", this.onUserChanged);
  },
  methods: {
    login() {
      auth.login();
    },
    logout() {
      auth.logout();
    },
    onUserChanged(user) {
      console.log("User:", user);
      //console.log(auth);
    }
  }
};
</script>
