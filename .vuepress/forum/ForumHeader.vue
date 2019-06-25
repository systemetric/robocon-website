<template>
  <header class="forum-header">
    <h1>Forum</h1>
    <!--suppress HtmlUnknownTag -->
    <template v-if="userLoaded">
      <a v-if="user" href="" @click.prevent="$emit('create')" class="button"
        >New Thread</a
      >
      <div
        v-if="user"
        class="profile-image"
        :style="{ backgroundImage: `url(${user.picture})` }"
      >
        <Dropdown>
          <span
            >Welcome to the forum, <b>{{ user.nickname }}</b
            >!<i
              v-if="user['https://hr-robocon.org/is_moderator']"
              class="auth-detail"
            >
              (Moderator)</i
            ></span
          >
          <hr />
          <a href="" @click.prevent="$emit('logout')">Logout</a>
        </Dropdown>
      </div>
      <a v-else href="" @click.prevent="$emit('login')" class="button">Login</a>
    </template>
    <Loader v-else />
  </header>
</template>

<script>
import Dropdown from "./Dropdown";
import Loader from "./Loader";
export default {
  name: "forum-header",
  components: { Dropdown, Loader },
  props: {
    user: {
      required: true
    },
    userLoaded: {
      required: true,
      type: Boolean
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
    margin: 0 0 4px 0
    flex-grow: 1
  @media(max-width: 419px)
    h1
      display: none
    .button
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
    .auth-detail
      color: #AAAAAA
    .forum-dropdown
      top: $profile-image-size
      right: 0
      display: none
    &:hover .forum-dropdown
      display: block
  > *:not(:last-child)
    margin-right: 0.75rem
</style>
