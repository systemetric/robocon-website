<template>
  <div class="forum-loader"></div>
</template>

<script>
export default {
  name: "loader"
};
</script>

<style lang="sass">
$loader-size: 2rem
$loader-color: #0094ff

.forum-loader
  border: 6px solid rgba(0, 0, 0, 0.1)
  border-left-color: $loader-color
  animation: spin 0.8s infinite linear
  position: relative
  display: inline-block
  vertical-align: top
  border-radius: 50%
  width: $loader-size
  height: $loader-size

@keyframes spin
  0%
    transform: rotate(0deg)
  100%
    transform: rotate(360deg)
</style>
