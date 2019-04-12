<template>
  <div>
    <div v-if="messages.length === 0" class="loader-container"><Loader /></div>
    <div class="list">
      <MessageItem
        v-for="(message, i) of messages"
        :key="message['.key']"
        :index="i"
        :user="user"
        :thread-key="thread['.key']"
        :message="message"
        @doing="$emit('doing', $event)"
      />
    </div>
    <CreateResponse
      v-if="messages.length > 0"
      :user="user"
      :user-codes="userCodes"
      :thread-key="thread['.key']"
      :thread-name="thread.title"
      :users="users"
      @doing="$emit('doing', $event)"
    />
  </div>
</template>

<script>
import MessageItem from "../../components/MessageItem";
import CreateResponse from "./CreateResponse";
import Loader from "../../components/Loader";

export default {
  name: "thread",
  components: {
    Loader,
    MessageItem,
    CreateResponse
  },
  props: {
    thread: {
      type: Object,
      required: true
    },
    messages: {
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
  computed: {
    users() {
      return this.messages.map(message => message.author);
    }
  }
};
</script>

<style>
.operation-animation.thread-loader {
  position: unset;
}
</style>
