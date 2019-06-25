<template>
  <div class="forum-dropdown-wrapper">
    <div class="forum-dropdown"><slot></slot></div>
  </div>
</template>

<script>
export default {
  name: "dropdown"
};
</script>

<style lang="sass">
.forum-dropdown-wrapper::before
  content: ""
  position: absolute
  top: 0
  right: 0
  width: calc(200px + 0.8rem)
  height: 2.5rem
.forum-dropdown
  background: #fff
  width: 200px
  position: absolute
  border: 1px solid #cfd4db
  border-radius: 6px
  padding: 0.4rem
  > a, span
    display: block
    line-height: 1.4
    padding: 0.4rem 0.6rem
    border-radius: 4px
  > hr
    margin: 0.4rem 0
  > a
    cursor: pointer
    &:hover
      background-color: #f3f4f5
@media(max-width: 419px)
  .forum-dropdown-wrapper::before
    width: calc(100vw - 4rem)
  .forum-dropdown
    width: calc(100vw - 4.8rem)
</style>
