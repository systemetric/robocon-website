<template>
  <div>
    <IconButton class="threads-icon-button" @click="clickTopButton"
      >Create Thread</IconButton
    >
    <div class="list">
      <!--suppress JSUnresolvedVariable, HtmlUnknownTag -->
      <a
        v-for="thread of threads"
        :key="thread['.key']"
        :href="`/forum/#${thread['.key']}.html`"
      >
        <ThreadItem :thread="thread" />
      </a>
    </div>
    <CreateThread
      :user="user"
      :user-codes="userCodes"
      @doing="$emit('doing', $event)"
    ></CreateThread>
  </div>
</template>

<script>
import ThreadItem from "../../components/ThreadItem";
import CreateThread from "./CreateThread";

export default {
  name: "threads",
  components: {
    ThreadItem,
    CreateThread
  },
  props: {
    threads: {
      type: Array,
      required: true
    },
    user: {
      required: true
    },
    userCodes: {
      required: true
    }
  },
  methods: {
    clickTopButton() {
      window.scrollTo(0, document.body.scrollHeight);
    }
  }
};
</script>

<style lang="sass">
.threads-icon-button
  max-width: 338px
  margin: 0 auto 1rem
</style>
