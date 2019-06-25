<template>
  <div class="forum-wrapper">
    <ForumHeader
      :user="user"
      :user-loaded="userLoaded"
      @login="login"
      @logout="logout"
    />
    <main><Threads v-if="threads !== null" :threads="threads" /></main>
  </div>
</template>

<script>
import ForumHeader from "./ForumHeader";
import * as api from "./api";
import Threads from "./threads/Threads";

export default {
  name: "forum",
  components: { Threads, ForumHeader },
  data() {
    return {
      user: null,
      userLoaded: false,
      threads: null
    };
  },
  mounted() {
    import("./auth").then(auth => {
      auth.service.addListener("user", this.onUserChanged);
      auth.service.loginSilently();
    });
    api.getAllThreads().then(threads => (this.threads = threads));
  },
  beforeDestroy() {
    import("./auth").then(auth =>
      auth.service.removeListener("user", this.onUserChanged)
    );
  },
  methods: {
    login() {
      import("./auth").then(auth => auth.service.login());
    },
    logout() {
      import("./auth").then(auth => auth.service.logout());
    },
    onUserChanged(user) {
      console.log("User:", user);
      this.user = user;
      this.userLoaded = true;
    }
  }
};
</script>

<style lang="sass">
.forum-wrapper
  max-width: 740px
  margin: 0 auto
  padding: 2rem
  .button
    display: inline-block
    line-height: 1.4
    padding: 0.4rem 0.8rem
    border-radius: 4px
    border: 1px solid #cfd4db
    text-align: center
    &:hover
      background-color: #f3f4f5
  .light
    color: #AAAAAA
</style>
