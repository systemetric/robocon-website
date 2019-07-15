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
import ProfileImage from "./components/ProfileImage";
import { mapState } from "vuex";
import { MODULE_USER } from "./store";

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
    ...mapState(MODULE_USER, ["user"]),
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
      border-radius: 0 0.5rem 0.5rem
      > *
        margin-top: 0
        &:last-child
          margin-bottom: 0
        &:not(:last-child)
          margin-bottom: 0.5rem
      h1, h2, h3
        padding: 0
      code
        background-color: rgba(27, 31, 35, 0.05)
        border-radius: 3px
        font-size: 85%
        margin: 0
        padding: 0.2em 0.4em
      blockquote
        font-size: 1rem
    > p
      margin: 0.4rem 0
</style>
