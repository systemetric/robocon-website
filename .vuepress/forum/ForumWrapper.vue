<template>
  <div class="forum-wrapper">
    <ForumHeader @login="login" @logout="logout" />
    <main>
      <template v-if="threads !== null">
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

export default {
  name: "forum",
  components: { ThreadItem, ForumHeader },
  computed: {
    ...mapState(["threads"])
  },
  mounted() {
    import("./auth").then(auth => {
      auth.service.addListener("user", this.onUserChanged);
      auth.service.loginSilently();
    });
    // noinspection JSIgnoredPromiseFromCall
    this.$store.dispatch(ACTION_GET_THREADS);
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
    }
  },
  store
};
</script>

<style lang="sass" src="./styles.sass"></style>
