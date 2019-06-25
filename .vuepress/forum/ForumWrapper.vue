<template>
  <div class="forum-wrapper">
    <ForumHeader
      :user="user"
      :user-loaded="userLoaded"
      @login="login"
      @logout="logout"
    />
    <main>
      <pre>{{ JSON.stringify(user, null, 2) }}</pre>
    </main>
  </div>
</template>

<script>
import ForumHeader from "./ForumHeader";

export default {
  name: "forum",
  components: { ForumHeader },
  data() {
    return {
      user: null,
      userLoaded: false
    };
  },
  mounted() {
    import("./auth").then(auth => {
      auth.service.addListener("user", this.onUserChanged);
      auth.service.loginSilently();
    });
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
  pre
    overflow-x: auto
</style>
