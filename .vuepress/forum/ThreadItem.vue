<template>
  <a class="thread" :href="`#thread=${thread.id}`">
    <ProfileImage :user="thread.author"></ProfileImage>
    <div class="thread-details">
      <h3>{{ thread.title }}</h3>
      <p class="light">
        Created by {{ thread.author.name }} on
        {{ thread.created.toLocaleString().replace(", ", " at ") }}
      </p>
    </div>
  </a>
</template>

<script>
import ProfileImage from "./ProfileImage";
import { mapGetters } from "vuex";

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
    ...mapGetters(["isModerator"])
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
    margin-right: 0.75rem
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
