<template>
  <div class="profile-image" :class="{ large }" :style="{ backgroundImage: `url(${imageUrl})` }">
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: "profile-image",
  props: {
    user: {
      required: true
    },
    large: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    imageUrl() {
      if (this.user.picture) return this.user.picture;
      const name = this.user.nickname || this.user.name;
      const initial = name ? name.charAt(0).toUpperCase() : "?";
      return `http://via.placeholder.com/60/7FC9FF/FFFFFF?text=${initial}`;
    }
  }
};
</script>

<style lang="sass">
@import "../variables"

.profile-image
  width: $profile-image-size-small
  height: $profile-image-size-small
  min-width: $profile-image-size-small
  border-radius: $profile-image-size-small / 2
  @media(min-width: 420px)
    &.large
      width: $profile-image-size
      height: $profile-image-size
      min-width: $profile-image-size
      border-radius: $profile-image-size / 2
  background-color: white
  background-position: center
  background-size: cover
  position: relative
</style>
