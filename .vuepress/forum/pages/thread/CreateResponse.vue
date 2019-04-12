<template>
  <RequireLogin :user="user" :user-codes="userCodes" @doing="$emit('doing', $event)">
    <p>Post your answer here...</p>
    <!--<textarea rows="6" placeholder="Message" v-model="message"></textarea>-->
    <MarkdownEditor v-model="message"></MarkdownEditor>
    <button :disabled="!valid" @click="create">Post</button>
  </RequireLogin>
</template>

<script>
import RequireLogin from "../../components/RequireLogin";
import MarkdownEditor from "../../components/MarkdownEditor";

export default {
  name: "create-response",
  components: {
    MarkdownEditor,
    RequireLogin
  },
  props: {
    user: {
      required: true
    },
    userCodes: {
      required: true
    },
    threadKey: {
      type: String,
      required: true
    },
    threadName: {
      type: String,
      required: true
    },
    users: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      message: ""
    };
  },
  computed: {
    valid() {
      return this.message !== "";
    }
  },
  methods: {
    create() {
      this.$emit("doing", true);
      import("../../../firebase")
        .then(({ createMessage }) =>
          createMessage(
            this.threadKey,
            this.threadName,
            this.message,
            this.user,
            this.users
          )
        )
        .then(() => {
          this.message = "";
          this.$emit("doing", false);
        });
    }
  }
};
</script>
