<template>
  <div class="forum content">
    <ClientOnly>
      <div v-if="!hasLoaded" class="loader-container"><Loader /></div>
      <Threads
        v-else-if="!id"
        :threads="threads"
        :user="user"
        :user-codes="userCodes"
        @doing="handleDoing"
      ></Threads>
      <Thread
        v-else
        :thread="thread"
        :messages="messages"
        :user="user"
        :user-codes="userCodes"
        @doing="handleDoing"
      ></Thread>
      <OperationAnimation :doing="doingCount > 0"></OperationAnimation>
    </ClientOnly>
  </div>
</template>

<script>
import Threads from "./pages/threads/Threads";
import Thread from "./pages/thread/Thread";
import Loader from "./components/Loader";
import OperationAnimation from "./components/OperationAnimation";

// noinspection JSUnusedGlobalSymbols
export default {
  name: "forum",
  components: {
    OperationAnimation,
    Loader,
    Threads,
    Thread
  },
  data() {
    return {
      threads: [],
      messages: [],
      userCodes: {},
      user: null,
      authListenerUnsubscribe: null,
      userLoaded: false,
      userCodesLoaded: false,
      doingCount: 0
    };
  },
  computed: {
    id() {
      let id = this.$route.hash;
      if (id.startsWith("#")) id = id.substring(1);
      if (id.endsWith(".html"))
        id = id.substring(0, id.length - ".html".length);
      return id;
    },
    thread() {
      return this.threads.find(thread => thread[".key"] === this.id);
    },
    hasLoaded() {
      const threadsLoaded = this.threads.length > 0;
      const messagesLoaded = this.messages.length > 0;

      return (
        (this.$route.params.id
          ? threadsLoaded && messagesLoaded
          : threadsLoaded) &&
        this.userLoaded &&
        this.userCodesLoaded
      );
    }
  },
  beforeMount() {
    import("../firebase").then(({ threadsRef, userCodesRef }) => {
      import("../firebase/auth").then(({ auth }) => {
        // noinspection JSUnresolvedFunction
        this.authListenerUnsubscribe = auth.onAuthStateChanged(user => {
          this.user = user;
          this.userLoaded = true;
        });
      });

      // noinspection JSUnresolvedFunction
      this.$binding("threads", threadsRef.orderBy("lastModified", "desc"));
      this.$binding("userCodes", userCodesRef).then(
        () => (this.userCodesLoaded = true)
      );

      // noinspection JSUnresolvedFunction
      this.$watch("$route", this.updateThreadsMessages, {
        immediate: true
      });
      // noinspection JSUnresolvedFunction
      this.$watch("thread", this.updateTitle, {
        immediate: true
      });
    });
  },
  beforeDestroy() {
    if (this.authListenerUnsubscribe) this.authListenerUnsubscribe();
  },
  methods: {
    handleDoing(doing) {
      this.doingCount += doing ? 1 : -1;
    },
    updateThreadsMessages() {
      if ("messages" in this.$firestore) {
        console.log("Unbind");
        this.$unbind("messages");
      }

      if (this.id) {
        import("../firebase").then(({ threadsRef }) => {
          // noinspection JSUnresolvedFunction
          this.$binding(
            "messages",
            threadsRef
              .doc(this.id)
              .collection("messages")
              .orderBy("lastModified")
          );
        });
      }
    },
    updateTitle() {
      document.title = `${this.thread ? this.thread.title : "Forum"} | ${
        this.$site.title
      }`;
    }
  }
};
</script>

<style lang="sass">
@import "../../node_modules/vue-loaders/dist/vue-loaders.css"

$accentColor: #0094FF
$border-colour: #CFD4DB
$text-colour: #2C3E50

.forum.content
  .operation-animation
    position: fixed
    bottom: 1rem
    left: 1rem
    z-index: 100
  > *:first-child
    margin: 0
  > h1
    margin-top: 0
    padding: 0
  input, button, textarea
    box-sizing: border-box
    width: 100%
    border: 1px solid $border-colour
    background-color: white
    color: $text-colour
    display: block
    border-radius: 1rem
    outline: none
    transition: all 0.3s ease
    font-size: 0.9rem
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif
    &:active, &:focus
      border-color: $accentColor
    &.danger
      &:active, &:focus
        border-color: #ff4641
  input
    cursor: text
    line-height: 2rem
    padding: 0 1rem
  button
    padding: 0.25rem 1rem
    height: 34px
    &.small
      padding: 0 0.8rem
      height: 28px
      width: auto
    &:not(:disabled)
      cursor: pointer
      &:hover
        opacity: 0.7
    &:disabled
      opacity: 0.5
      cursor: not-allowed
  textarea
    min-width: 100%
    max-width: 100%
    padding: 0.7rem 1rem
  input::placeholder, textarea::placeholder
    color: #CCC
  .loader-container
    text-align: center
  .list
    display: flex
    flex-direction: column
    a
      color: unset
      font-weight: unset
      text-decoration: none !important
      transition: all 0.3s ease-in-out
      &:hover
        opacity: 0.7
  .form p
    margin: 0.5rem 0
.fade-enter-active, .fade-leave-active
  transition: opacity 0.5s ease-in-out
.fade-enter, .fade-leave-to
  opacity: 0
</style>
