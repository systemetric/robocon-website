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
      <NewThread v-else-if="selectedRoute.path === 'new'" />
    </main>
  </div>
</template>

<script>
import ForumHeader from "./ForumHeader";
import ThreadItem from "./ThreadItem";
import MessageItem from "./MessageItem";
import NewThread from "./NewThread";
import store, {
  MODULE_THREADS,
  MODULE_USER,
  ACTION_GET_MESSAGES,
  ACTION_GET_THREADS,
  MUTATION_SET_USER
} from "./store/";
import { mapState } from "vuex";
import nprogress from "nprogress";

export default {
  name: "forum",
  components: { MessageItem, ThreadItem, ForumHeader, NewThread },
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
    import("./store/auth").then(auth => {
      auth.service.addListener("user", this.onUserChanged);
      auth.service.loginSilently();
    });

    this.$watch("route", {
      immediate: true,
      handler: this.onRouteChanged
    });
  },
  beforeDestroy() {
    import("./store/auth").then(auth =>
      auth.service.removeListener("user", this.onUserChanged)
    );
  },
  methods: {
    login() {
      import("./store/auth").then(auth => auth.service.login());
    },
    logout() {
      import("./store/auth").then(auth => auth.service.logout());
    },
    onUserChanged(user) {
      console.log("User:", user);
      this.$store.commit(MODULE_USER + MUTATION_SET_USER, user);
    },
    handleRouteLoadPromise(promise, route) {
      //Would just use promise.finally here but it doesn't seem to work
      //in Firefox (probably something to do with this:
      //https://github.com/vuejs/vue-cli/issues/2012#issuecomment-410369818)
      const promiseFinally = () => {
        this.selectedRoute = route;
        nprogress.done();
      };
      promise.then(promiseFinally).catch(err => {
        //TODO: replace this with a user facing error message, perhaps do this in the store?
        console.error(err);
        promiseFinally();
      });
    },
    onRouteChanged(route) {
      console.log("Route:", route);
      if (route.path === "") {
        nprogress.start();
        this.handleRouteLoadPromise(
          this.$store.dispatch(MODULE_THREADS + ACTION_GET_THREADS),
          route
        );
      } else if (route.path === "thread" && route.params) {
        nprogress.start();
        this.handleRouteLoadPromise(
          this.$store.dispatch(
            MODULE_THREADS + ACTION_GET_MESSAGES,
            route.params[0]
          ),
          route
        );
      } else if (route.path === "new") {
        nprogress.start();
        import("./components/editor/quill").then(() => {
          this.selectedRoute = route;
          nprogress.done();
        });
      } else {
        console.warn("Unknown route:", route);
        this.selectedRoute = route;
        //TODO: 404
      }
    }
  },
  store
};
</script>

<style lang="sass" src="./styles.sass"></style>
