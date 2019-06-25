<template>
  <div class="icon-wrapper">
    <div class="icon" :title="tooltip" :style="styles"></div>
  </div>
</template>

<script>
export default {
  name: "icon",
  props: {
    icon: {
      type: String,
      required: true
    },
    tooltip: {
      type: String
    },
    size: {
      type: Number,
      default: 24
    },
    rotate: {
      type: Number,
      default: 0
    }
  },
  computed: {
    styles() {
      const styles = {
        backgroundImage: `url('/icons/${this.icon}.svg')`,
        width: `${this.size}px`,
        height: `${this.size}px`
      };
      if (this.rotate !== 0) {
        styles.transform = `rotate(${this.rotate}deg)`;
      }
      return styles;
    }
  }
};
</script>

<style lang="sass">
.icon
  background-size: contain
  background-position: center
  background-repeat: no-repeat
</style>
