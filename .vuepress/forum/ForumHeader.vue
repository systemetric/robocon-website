<template>
  <div class="forum-header">
    <h1>Forum</h1>
    <!--suppress HtmlUnknownTag -->
    <div
      v-if="user"
      class="profile-image"
      :style="{ backgroundImage: `url(${user.picture})` }"
    >
      <Dropdown>
        <span
          >Welcome to the forum, <b>{{ user.nickname }}</b
          >!</span
        >
        <hr />
        <a href="#" @click.prevent="$emit('logout')">Logout</a>
      </Dropdown>
    </div>
    <a v-else href="#" @click.prevent="$emit('login')" class="button">Login</a>
  </div>
</template>

<script>
import Dropdown from "./Dropdown";
export default {
  name: "forum-header",
  components: { Dropdown },
  props: {
    user: {
      required: true
    }
  }
};
</script>

<style lang="sass">
$profile-image-size: 2.5rem

.forum-header
  display: flex
  flex-direction: row
  align-items: center
  h1
    margin: 0
    flex-grow: 1
  .profile-image
    width: $profile-image-size
    height: $profile-image-size
    min-width: $profile-image-size
    border-radius: $profile-image-size / 2
    background-color: white
    background-position: center
    background-size: cover
    position: relative
    .forum-dropdown
      top: $profile-image-size
      right: 0
      display: none
    &:hover .forum-dropdown
      display: block
</style>
