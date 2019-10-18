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
          :thread-id="selectedRoute.params[0]"
          :message="message"
        ></MessageItem>
        <MessageItem
          v-if="user"
          key="creating"
          :thread-id="selectedRoute.params[0]"
          :creating="true"
        ></MessageItem>
      </template>
      <NewThread v-else-if="selectedRoute.path === 'new'" />
    </main>
    <Notifications />
  </div>
</template>

<script>
import ForumHeader from "./ForumHeader";
import ThreadItem from "./ThreadItem";
import MessageItem from "./MessageItem";
import NewThread from "./NewThread";
import Notifications from "./Notifications";
import store, {
  MODULE_THREADS,
  MODULE_USER,
  ACTION_GET_MESSAGES,
  ACTION_GET_THREADS,
  MUTATION_SET_USER
} from "./store/";
import { mapState, mapMutations, mapActions } from "vuex";
import nprogress from "nprogress";

export default {
  name: "forum",
  components: {
    MessageItem,
    ThreadItem,
    ForumHeader,
    NewThread,
    Notifications
  },
  data() {
    return {
      selectedRoute: {
        path: null,
        params: undefined
      }
    };
  },
  computed: {
    ...mapState(MODULE_THREADS, ["threads", "messages"]),
    ...mapState(MODULE_USER, ["user"]),
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
    },
    isIE() {
      return (
        "-ms-scroll-limit" in document.documentElement.style &&
        "-ms-ime-align" in document.documentElement.style
      );
    }
  },
  mounted() {
    import("./store/auth").then(auth => {
      auth.service.addListener("user", this.onUserChanged);
      auth.service.loginSilently();
    });

    this.$watch("route", {
      immediate: true,
      handler: this.onRouteChanged
    });

    // Fix route hash detection in IE11
    console.log("IE:", this.isIE);
    if (this.isIE) {
      window.addEventListener("hashchange", this.ieOnRouteChanged, false);
    }
  },
  beforeDestroy() {
    if (this.isIE) {
      window.removeEventListener("hashchange", this.ieOnRouteChanged);
    }
    import("./store/auth").then(auth =>
      auth.service.removeListener("user", this.onUserChanged)
    );
  },
  methods: {
    ...mapMutations(MODULE_USER, [MUTATION_SET_USER]),
    ...mapActions(MODULE_THREADS, [ACTION_GET_THREADS, ACTION_GET_MESSAGES]),
    login() {
      import("./store/auth").then(auth => auth.service.login());
    },
    logout() {
      import("./store/auth").then(auth => auth.service.logout());
    },
    onUserChanged(user) {
      console.log("User:", user);
      this[MUTATION_SET_USER](user);
    },
    onRouteChanged(route) {
      console.log("Route:", route);

      const setSelectedRoute = () => {
        this.selectedRoute = route;
        nprogress.done();
      };

      if (route.path === "") {
        nprogress.start();
        this[ACTION_GET_THREADS]().then(setSelectedRoute);
      } else if (route.path === "thread" && route.params) {
        nprogress.start();
        //Preload Quill for editing threads
        import("./components/editor/quill");
        this[ACTION_GET_MESSAGES](route.params[0]).then(setSelectedRoute);
      } else if (route.path === "new") {
        nprogress.start();
        import("./components/editor/quill").then(setSelectedRoute);
      } else {
        console.warn("Unknown route:", route);
        this.selectedRoute = route;
        //TODO: 404
      }
    },
    ieOnRouteChanged(e) {
      const currentPath = window.location.hash;
      if (this.$route.hash !== currentPath) {
        this.$router.push(currentPath);
      }
    }
  },
  store
};
</script>

<style lang="sass" src="./styles.sass"></style>
