<template>
  <div class="link-button-list" :style="{maxWidth: maxWidth}">
    <slot />
  </div>
</template>

<script>
export default {
  name: "link-button-list",
  props: {
    maxWidth: {
      type: String,
      default: "300px"
    }
  }
};
</script>


<style lang="stylus">
.link-button-list {
  margin: 0 auto;

  .link-button:not(:last-child) {
    margin-bottom: 1rem;
  }
}
</style>
