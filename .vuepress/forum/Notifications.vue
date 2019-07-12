<template>
  <div class="notifications">
    <transition-group name="notification">
      <div
        v-for="notification in notifications"
        :key="notification.id"
        class="notification"
        :class="{[notification.level]: true}"
        @click="dismiss(notification.id)"
      >{{notification.content}}</div>
    </transition-group>
  </div>
</template>

<script>
import { mapState } from "vuex";
import { MODULE_NOTIFICATIONS, MUTATION_REMOVE_NOTIFICATION } from "./store/";

export default {
  name: "messages",
  computed: {
    ...mapState(MODULE_NOTIFICATIONS, ["notifications"])
  },
  methods: {
    dismiss(notificationId) {
      this.$store.commit(
        MODULE_NOTIFICATIONS + MUTATION_REMOVE_NOTIFICATION,
        notificationId
      );
    }
  }
};
</script>

<style lang="sass">
@import "variables"

.notifications
  position: fixed
  z-index: 50
  bottom: 1rem
  right: 1rem
  width: 250px
  @media(max-width: 419px)
    width: auto
    left: 1rem
  .notification
    padding: 1rem
    border-radius: 4px
    border-bottom: 1px solid transparent
    cursor: pointer
    color: white
    transition: background-color 0.1s ease, opacity 0.5s, transform 0.5s
    &:not(:last-child)
      margin-bottom: 1rem
    @each $name, $color in $notification-colors
      &.#{$name}
        background-color: $color
        border-bottom-color: darken($color, 5%)
        &:hover
          background-color: lighten($color, 5%)
.notification-enter,
.notification-leave-to
  opacity: 0
  transform: translateX(30px)
</style>


