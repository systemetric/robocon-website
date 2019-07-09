<template>
  <a :href="to" class="link-button" target="_blank" rel="noopener noreferrer">
    <slot />
  </a>
</template>

<script>
export default {
  name: "link-button",
  props: {
    to: {
      type: String,
      default: "#"
    }
  }
};
</script>

<style lang="stylus">
@import '../theme/styles/config.styl';

a.link-button {
  display: block;
  font-size: 1.2rem;
  color: #fff;
  background-color: $accentColor;
  padding: 0.8rem 1.6rem;
  border-radius: 4px;
  transition: background-color 0.1s ease;
  box-sizing: border-box;
  border-bottom: 1px solid darken($accentColor, 10%);
  text-decoration: none !important;

  &:hover {
    background-color: lighten($accentColor, 10%);
  }
}
</style>
