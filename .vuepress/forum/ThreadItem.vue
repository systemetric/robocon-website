<template>
  <a class="thread" :class="{pinned: thread.pinned}" :href="`#thread=${thread.id}`">
    <ProfileImage :user="thread.author" :large="true" />
    <div class="thread-details">
      <div class="title-edit" v-if="editingTitle">
        <input type="text" v-model="title" @click.prevent />
        <SaveIcon @click.prevent="saveTitle" class="feather-button" />
      </div>
      <h3 v-else>
        <span class="thread-title">{{ thread.title }}</span>
        <span v-if="canEdit" title="Edit Title">
          <EditIcon size="24" @click.prevent="editTitle" class="feather-button" />
        </span>
        <span v-if="isModerator" title="Pin Thread">
          <PinIcon @click="togglePinned" class="feather-button pin-button" />
        </span>
        <span v-if="isModerator" title="Delete Thread">
          <Trash2Icon size="24" @click.prevent="deleteThread" class="feather-button" />
        </span>
      </h3>
      <p class="light">
        Created by {{ authorName }} on
        {{ thread.created.toLocaleString().replace(", ", " at ") }}
      </p>
    </div>
  </a>
</template>

<script>
import ProfileImage from "./components/ProfileImage";
import { SaveIcon, EditIcon, Trash2Icon } from "vue-feather-icons";
import PinIcon from "./components/PinIcon";
import { mapState, mapGetters, mapActions } from "vuex";
import {
  MODULE_USER,
  MODULE_THREADS,
  ACTION_EDIT_TITLE,
  ACTION_DELETE_THREAD,
  ACTION_TOGGLE_PINNED_THREAD,
  canEdit
} from "./store";
import nprogress from "nprogress";

export default {
  name: "thread",
  components: { ProfileImage, SaveIcon, EditIcon, Trash2Icon, PinIcon },
  props: {
    thread: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      title: "",
      editingTitle: false
    };
  },
  computed: {
    ...mapState(MODULE_USER, ["user"]),
    ...mapGetters(MODULE_USER, ["isModerator"]),
    authorName() {
      return this.user !== null && this.user.sub === this.thread.author.id
        ? "You"
        : this.thread.author.name;
    },
    canEdit() {
      return canEdit(this.thread, this.$store);
    }
  },
  methods: {
    ...mapActions(MODULE_THREADS, [
      ACTION_EDIT_TITLE,
      ACTION_DELETE_THREAD,
      ACTION_TOGGLE_PINNED_THREAD
    ]),
    editTitle() {
      this.title = this.thread.title;
      this.editingTitle = true;
    },
    saveTitle() {
      nprogress.start();
      this[ACTION_EDIT_TITLE]({
        thread: this.thread,
        newTitle: this.title
      }).then(() => nprogress.done());
      this.editingTitle = false;
    },
    togglePinned() {
      if (!this.isModerator) return;
      nprogress.start();
      this[ACTION_TOGGLE_PINNED_THREAD](this.thread).then(() =>
        nprogress.done()
      );
    },
    deleteThread() {
      if (!this.isModerator) return;
      const confirmation = confirm(
        `Are you sure you want to delete the entire thread: "${this.thread.title}"? This is a permanent action and cannot be undone.`
      );
      if (confirmation) {
        nprogress.start();
        this[ACTION_DELETE_THREAD](this.thread.id).then(() => nprogress.done());
      }
    }
  }
};
</script>

<style lang="sass">
@import "variables"

a.thread
  display: flex
  flex-direction: row
  align-items: flex-start
  margin-top: 1rem
  color: #2c3e50
  font-weight: unset
  text-decoration: none
  .profile-image
    margin-right: 1rem
  .thread-details
    flex-grow: 1
    .title-edit
      display: flex
      align-items: center
      input
        flex-grow: 1
      .feather
        margin-left: 0.5rem
    h3
      margin: 0 0 0.4rem 0
      > span.thread-title, > span svg,
        vertical-align: middle
      span:first-child
        margin-right: 4px
      .feather
        display: none
    p
      margin: 0.4rem 0
  &:hover
    .thread-details h3 .feather
        display: inline-block
  .icon-wrapper
    margin-left: 0.75rem
    &:not(.pinned)
      opacity: 0
    &.can-pin:hover
      opacity: 0.5
  &.pinned
    .pin-button
      stroke: $primary-color
</style>
