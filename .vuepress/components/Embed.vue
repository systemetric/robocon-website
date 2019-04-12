<template>
  <div class="embed" :style="{paddingBottom: `${(1 / aspectRatio) * 100}%`}">
    <slot></slot>
  </div>
</template>

<script>
export default {
  props: {
    aspectRatio: {
      type: Number,
      default: 16 / 9
    }
  }
}
</script>

<style lang="stylus">
.embed {
  position: relative;
  height: 0;

  iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
}
</style>
