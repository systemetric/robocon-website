<template>
  <a class="thread" :href="`#thread=${thread.id}`">
    <ProfileImage :user="thread.author" :large="true"></ProfileImage>
    <div class="thread-details">
      <h3>{{ thread.title }}</h3>
      <p class="light">
        Created by {{ authorName }} on
        {{ thread.created.toLocaleString().replace(", ", " at ") }}
      </p>
    </div>
  </a>
</template>

<script>
import ProfileImage from "./ProfileImage";
import { mapState } from "vuex";

export default {
  name: "thread",
  components: { ProfileImage },
  props: {
    thread: {
      type: Object,
      required: true
    }
  },
  computed: {
    ...mapState(["user"]),
    authorName() {
      return this.user !== null && this.user.sub === this.thread.author.id
        ? "You"
        : this.thread.author.name;
    }
  }
};
</script>

<style lang="sass">
a.thread
  display: flex
  flex-direction: row
  align-items: center
  margin-top: 1rem
  color: unset
  font-weight: unset
  text-decoration: none
  .profile-image
    margin-right: 1rem
  .thread-details
    flex-grow: 1
    h3
      margin: 0 0 0.4rem 0
    p
      margin: 0.4rem 0
  .icon-wrapper
    margin-left: 0.75rem
    &:not(.pinned)
      opacity: 0
    &.can-pin:hover
      opacity: 0.5
</style>
