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
import QuillEditor from "./editor/QuillEditor";
import { ACTION_CREATE_THREAD } from "./store";
import { mapState } from "vuex";
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
    ...mapState(["user"]),
    disabled() {
      return !this.user || this.posting;
    }
  },
  methods: {
    createThread() {
      if (!this.disabled) {
        const content = this.$refs.editor.getContent();
        if (this.title === "" || this.content === "") {
          //TODO: replace this with a user facing error message, perhaps do this in the store?
          console.warn("Thread must have title and message");
          return;
        }

        this.posting = true;
        nprogress.start();
        this.$store
          .dispatch(ACTION_CREATE_THREAD, {
            title: this.title,
            content: content
          })
          .then(() => {
            this.$router.push("/forum/");
            this.posting = false;
            nprogress.done();
          })
          .catch(err => {
            //TODO: replace this with a user facing error message, perhaps do this in the store?
            console.error(err);
            this.posting = false;
            nprogress.done();
          });
      }
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
