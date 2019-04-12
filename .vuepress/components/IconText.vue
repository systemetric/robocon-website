<template>
  <div class="icon-text">
    <div :style="{ backgroundImage: `url(${icon})` }"></div>
    <p><slot /></p>
  </div>
</template>

<script>
export default {
  name: "icon-text",
  props: {
    icon: {
      type: String,
      required: true
    }
  }
};
</script>

<style lang="stylus">
.icon-text
  text-align center
  max-width 300px
  margin 0 auto
  div
    width 96px
    height 96px
    background-size contain
    background-position center
    margin 0 auto
</style>
