<template>
  <header class="forum-header">
    <h1>Forum</h1>
    <!--suppress HtmlUnknownTag -->
    <template v-if="userLoaded">
      <!--suppress HtmlUnknownAnchorTarget -->
      <a v-if="user" href="#create" class="button">New Thread</a>
      <ProfileImage v-if="user" :user="user" :small="true">
        <Dropdown>
          <span
            >Welcome to the forum, <b>{{ user.nickname }}</b
            >!<i v-if="isModerator" class="light"> (Moderator)</i></span
          >
          <hr />
          <a href="" @click.prevent="$emit('logout')">Logout</a>
        </Dropdown>
      </ProfileImage>
      <a v-else href="" @click.prevent="$emit('login')" class="button">Login</a>
    </template>
    <Loader v-else />
  </header>
</template>

<script>
import Dropdown from "./Dropdown";
import ProfileImage from "./ProfileImage";
import Loader from "./Loader";
import { mapState, mapGetters } from "vuex";

export default {
  name: "forum-header",
  components: { Dropdown, ProfileImage, Loader },
  computed: {
    ...mapState(["user", "userLoaded"]),
    ...mapGetters(["isModerator"])
  }
};
</script>

<style lang="sass">
@import "variables"

.forum-header
  display: flex
  flex-direction: row
  align-items: center
  h1
    margin: 0 0 4px 0
    flex-grow: 1
  @media(max-width: 419px)
    h1
      display: none
    .button
      flex-grow: 1
  .profile-image
    width: $profile-image-size-small
    height: $profile-image-size-small
    min-width: $profile-image-size-small
    border-radius: $profile-image-size-small / 2
    background-color: white
    background-position: center
    background-size: cover
    position: relative
    .forum-dropdown
      top: $profile-image-size-small
      right: 0
      display: none
    &:hover .forum-dropdown
      display: block
  > *:not(:last-child)
    margin-right: 0.75rem
</style>
