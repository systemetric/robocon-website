<template>
  <RequireLogin :user="user" :user-codes="userCodes" @doing="$emit('doing', $event)">
    <p>Ask your question here and we'll try to get back to you as soon as possible...</p>
    <input type="text" placeholder="Title" v-model="title">
    <!--<textarea rows="6" placeholder="Message" v-model="message"></textarea>-->
    <MarkdownEditor v-model="message"></MarkdownEditor>
    <button :disabled="!valid" @click="create">Ask</button>
  </RequireLogin>
</template>

<script>
import RequireLogin from "../../components/RequireLogin";
import MarkdownEditor from "../../components/MarkdownEditor";

export default {
  name: "create-thread",
  components: {
    RequireLogin,
    MarkdownEditor
  },
  props: {
    user: {
      required: true
    },
    userCodes: {
      required: true
    }
  },
  data() {
    return {
      title: "",
      message: ""
    };
  },
  computed: {
    valid() {
      return this.title !== "" && this.message !== "";
    }
  },
  methods: {
    create() {
      this.$emit("doing", true);
      import("../../../firebase")
        .then(({ createThread }) =>
          createThread(this.title, this.message, this.user)
        )
        .then(() => {
          this.title = "";
          this.message = "";
          this.$emit("doing", false);
        });
    }
  }
};
</script>
