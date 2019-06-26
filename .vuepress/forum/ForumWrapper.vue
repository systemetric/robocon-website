<template>
  <div class="forum-wrapper">
    <ForumHeader @login="login" @logout="logout" />
    <main>
      <template v-if="route.path === '' && threads !== null">
        <ThreadItem
          v-for="thread in threads"
          :key="thread.id"
          :thread="thread"
        ></ThreadItem>
      </template>
    </main>
  </div>
</template>

<script>
import ForumHeader from "./ForumHeader";
import ThreadItem from "./ThreadItem";
import store, { ACTION_GET_THREADS, MUTATION_SET_USER } from "./store";
import { mapState } from "vuex";
import nprogress from "nprogress";

export default {
  name: "forum",
  components: { ThreadItem, ForumHeader },
  computed: {
    ...mapState(["threads"]),
    route() {
      let hash = this.$route.hash;
      if (hash.startsWith("#")) hash = hash.substring(1);
      const split = hash.split("=");
      return {
        path: split[0],
        params: split[1] ? split[1].split("/") : undefined
      };
    }
  },
  mounted() {
    import("./auth").then(auth => {
      auth.service.addListener("user", this.onUserChanged);
      auth.service.loginSilently();
    });

    this.$watch("route", {
      immediate: true,
      handler: this.onRouteChanged
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
      this.$store.commit(MUTATION_SET_USER, user);
    },
    onRouteChanged(route) {
      console.log("Route:", route);
      if (route.path === "" && this.threads === null) {
        nprogress.start();
        this.$store
          .dispatch(ACTION_GET_THREADS)
          .then(() => nprogress.done())
          .catch(err => {
            console.error(err);
            return nprogress.done();
          });
      }
    }
  },
  store
};
</script>

<style lang="sass" src="./styles.sass"></style>
