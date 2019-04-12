<template>
  <div class="robocon-app-notice">
    <div class="robocon-app-notice-qr-code"></div>
    <p class="robocon-app-notice-information">
      Download the Robocon App to see upcoming rounds, the leaderboard, and get
      notified when your team needs to be in the arena.
      <span
        >Scan the code to the left or visit
        <a href="https://app.hr-robocon.org/dl">app.hr-robocon.org/dl</a> on
        your mobile device.</span
      ><span class="mobile"
        >Visit
        <a href="https://app.hr-robocon.org/dl">app.hr-robocon.org/dl</a> on
        your mobile device.</span
      >
    </p>
  </div>
</template>

<script>
export default {
  name: "robocon-app-notice"
};
</script>

<style lang="stylus">
.robocon-app-notice
  display flex
  flex-direction row
  align-items center
  margin-bottom 16px
  .robocon-app-notice-qr-code
    min-width 200px
    min-height 200px
    margin-right 20px
    background-image url("/images/robocon-app-qr-code.svg")
    background-position center
    background-size contain
    background-repeat no-repeat
  .robocon-app-notice-information
    flex-grow 1
  span
    &.mobile
      display none
    &:not(.mobile)
      display inline
  @media(max-width 719px)
    .robocon-app-notice-qr-code
      display none
    span
      &.mobile
        display inline
      &:not(.mobile)
        display none
</style>
