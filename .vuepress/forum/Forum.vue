<template>
  <div class="forum-wrapper">
    <ForumHeader @login="login" @logout="logout" />
    <main>
      <template v-if="selectedRoute.path === ''">
        <ThreadItem v-for="thread in threads" :key="thread.id" :thread="thread"></ThreadItem>
      </template>
      <template v-else-if="selectedRoute.path === 'thread'">
        <MessageItem
          v-for="message in selectedThreadsMessages"
          :key="message.id"
          :message="message"
        ></MessageItem>
      </template>
      <template v-else-if="selectedRoute.path === 'new'">
        <QuillEditor v-model="testEditorValue" />
        <div v-html="testEditorValue"></div>
      </template>
    </main>
  </div>
</template>

<script>
import ForumHeader from "./ForumHeader";
import ThreadItem from "./ThreadItem";
import MessageItem from "./MessageItem";
import QuillEditor from "./editor/QuillEditor";
import store, {
  ACTION_GET_MESSAGES,
  ACTION_GET_THREADS,
  MUTATION_SET_USER
} from "./store";
import { mapState } from "vuex";
import nprogress from "nprogress";

export default {
  name: "forum",
  components: { MessageItem, ThreadItem, ForumHeader, QuillEditor },
  data() {
    return {
      testEditorValue: "<p>Hello <b>there</b>!</p>",
      selectedRoute: {
        path: null,
        params: undefined
      }
    };
  },
  computed: {
    ...mapState(["threads", "messages"]),
    route() {
      let hash = this.$route.hash;
      if (hash.startsWith("#")) hash = hash.substring(1);
      const split = hash.split("=");
      return {
        path: split[0],
        params: split[1] ? split[1].split("/") : undefined
      };
    },
    selectedThreadsMessages() {
      return this.selectedRoute.path === "thread" && this.selectedRoute.params
        ? this.messages[this.selectedRoute.params[0]]
        : undefined;
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
    handleRouteLoadPromise(promise, route) {
      promise
        //TODO: replace this with a user facing error message
        .catch(err => console.error(err))
        .finally(() => {
          this.selectedRoute = route;
          return nprogress.done();
        });
    },
    onRouteChanged(route) {
      console.log("Route:", route);
      if (route.path === "") {
        nprogress.start();
        this.handleRouteLoadPromise(
          this.$store.dispatch(ACTION_GET_THREADS),
          route
        );
      } else if (route.path === "thread" && route.params) {
        nprogress.start();
        this.handleRouteLoadPromise(
          this.$store.dispatch(ACTION_GET_MESSAGES, route.params[0]),
          route
        );
      } else {
        this.selectedRoute = route;
        //TODO: 404
      }
    }
  },
  store
};
</script>

<style lang="sass" src="./styles.sass"></style>
