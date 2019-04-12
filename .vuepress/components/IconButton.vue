<template>
  <!--suppress JSUnresolvedFunction -->
  <button class="icon-button" @click="$emit('click')">
    <slot name="icon" />
    <span><slot /></span>
  </button>
</template>

<script>
export default {
  name: "icon-button"
};
</script>

<style lang="sass">
  button.icon-button
    display: flex !important
    align-items: center
    img
      width: 20px
      height: 20px
    span
      flex-grow: 1

</style>
