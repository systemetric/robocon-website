<template>
  <div class="threads">
    <Thread
      v-for="thread in threads"
      :key="thread.id"
      :thread="thread"
    ></Thread>
  </div>
</template>

<script>
import Thread from "./Thread";

export default {
  name: "threads",
  components: { Thread },
  props: {
    threads: {
      type: Array,
      required: true
    }
  }
};
</script>

<style></style>
