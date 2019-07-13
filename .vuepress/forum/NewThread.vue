<template>
  <div class="new-thread">
    <input type="text" placeholder="Title" v-model="title" />
    <QuillEditor ref="editor">
      <template slot="bottom-buttons">
        <a class="button" @click="$router.push('/forum/')">Cancel</a>
        <a
          class="button primary"
          :class="{disabled: disabled}"
          :title="user ? '' : 'You must be logged in to post!'"
          @click="createThread"
        >Post Message</a>
      </template>
    </QuillEditor>
  </div>
</template>

<script>
import QuillEditor from "./components/editor/QuillEditor";
import {
  ACTION_CREATE_THREAD,
  MODULE_USER,
  MODULE_THREADS,
  showWarning
} from "./store";
import { mapState, mapActions } from "vuex";
import nprogress from "nprogress";

export default {
  name: "new-thread",
  components: { QuillEditor },
  data() {
    return {
      title: "",
      posting: false
    };
  },
  computed: {
    ...mapState(MODULE_USER, ["user"]),
    disabled() {
      return !this.user || this.posting;
    }
  },
  created() {
    this.showTitleRequiredNotification = showWarning(
      "You must give your message a title!"
    )(this.$store.dispatch);
    this.showContentRequiredNotification = showWarning(
      "Your message cannot be empty!"
    )(this.$store.dispatch);
  },
  methods: {
    ...mapActions(MODULE_THREADS, [ACTION_CREATE_THREAD]),
    createThread() {
      if (this.disabled) return;

      if (this.title === "") {
        this.showTitleRequiredNotification();
        return;
      }
      const content = this.$refs.editor.getContent();
      if (content === "") {
        this.showContentRequiredNotification();
        return;
      }

      this.posting = true;
      nprogress.start();
      this[ACTION_CREATE_THREAD]({
        title: this.title,
        content: content
      }).then(() => {
        this.$router.push("/forum/");
        this.posting = false;
        nprogress.done();
      });
    }
  }
};
</script>

<style lang="sass">
.forum-wrapper .new-thread
    input
        display: block
        width: calc(100% - 1.6rem - 2px)
        margin-top: 0.65rem
    .quill-editor
        margin-top: 1rem
</style>
