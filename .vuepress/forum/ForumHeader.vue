<template>
  <header class="forum-header">
    <h1 @click="$router.push('/forum/')">Forum</h1>
    <!--suppress HtmlUnknownTag -->
    <template v-if="userLoaded">
      <!--suppress HtmlUnknownAnchorTarget -->
      <a
        v-if="user"
        href="#new"
        class="button"
        :class="{disabled: $route.hash === '#new'}"
      >New Thread</a>
      <!-- <a v-if="user && $route.hash !== '#new'" href="#new" class="button">New Thread</a> -->
      <!-- <div v-else-if="user && $route.hash === '#new'" class="spacer"></div> -->
      <ProfileImage v-if="user" :user="user">
        <Dropdown>
          <span>
            Welcome to the forum,
            <b>{{ user.nickname }}</b>!
            <i v-if="isModerator" class="light">(Moderator)</i>
          </span>
          <hr />
          <a href @click.prevent="$emit('logout')">Logout</a>
        </Dropdown>
      </ProfileImage>
      <a v-else href @click.prevent="$emit('login')" class="button">Login</a>
    </template>
    <Loader v-else />
  </header>
</template>

<script>
import Dropdown from "./components/Dropdown";
import ProfileImage from "./components/ProfileImage";
import Loader from "./components/Loader";
import { mapState, mapGetters } from "vuex";
import { MODULE_USER } from "./store";

export default {
  name: "forum-header",
  components: { Dropdown, ProfileImage, Loader },
  computed: {
    ...mapState(MODULE_USER, ["user", "userLoaded"]),
    ...mapGetters(MODULE_USER, ["isModerator"])
  }
};
</script>

<style lang="sass">
@import "variables"

.forum-header
  display: flex
  flex-direction: row
  align-items: center
  justify-content: center
  h1
    margin: 0 0 4px 0
    flex-grow: 1
    cursor: pointer
  .spacer
    display: none
    flex-grow: 1
  @media(max-width: 419px)
    h1
      display: none
    .spacer
      display: block
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
