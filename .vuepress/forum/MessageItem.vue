<template>
  <div class="message">
    <ProfileImage :user="message.author" :large="true"></ProfileImage>
    <div class="message-details">
      <div class="message-content" v-html="message.content"></div>
      <p class="light">
        Created by {{ authorName }} on
        {{ message.created.toLocaleString().replace(", ", " at ") }}
      </p>
    </div>
  </div>
</template>

<script>
import ProfileImage from "./ProfileImage";
import { mapState } from "vuex";

export default {
  name: "message",
  components: { ProfileImage },
  props: {
    message: {
      type: Object,
      required: true
    }
  },
  computed: {
    ...mapState(["user"]),
    authorName() {
      return this.user !== null && this.user.sub === this.message.author.id
        ? "You"
        : this.message.author.name;
    }
  }
};
</script>

<style lang="sass">
div.message
  display: flex
  flex-direction: row
  align-items: flex-start
  margin-top: 1rem
  .profile-image
    margin-right: 1rem
  .message-details
    flex-grow: 1
    .message-content
      padding: 1rem
      background-color: #eeeeee
      border-top-right-radius: 0.5rem
      border-bottom-left-radius: 0.5rem
      border-bottom-right-radius: 0.5rem
    p
      margin: 0.4rem 0
</style>
