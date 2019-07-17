<template>
  <div class="message" :class="{resolved: resolved}">
    <ProfileImage :user="creating ? userAsAuthor : message.author" :large="true" />
    <div class="message-details">
      <RequiresRegistration v-if="editingContent || creating" action="reply to this thread">
        <QuillEditor ref="editor" :value="creating ? '': message.content">
          <template slot="bottom-buttons">
            <a v-if="!creating" class="button" @click="editingContent = false">Cancel</a>
            <a
              class="button primary"
              :class="{disabled: posting}"
              @click="saveMessage"
            >{{creating ? "Post Response" : "Save"}}</a>
          </template>
        </QuillEditor>
      </RequiresRegistration>
      <template v-else>
        <div class="message-content" v-html="message.content"></div>
        <div class="message-meta">
          <p class="light">
            Created by {{ authorName }} on
            {{ message.created.toLocaleString().replace(", ", " at ") }}
          </p>
          <div v-if="canEdit" class="message-button" title="Edit Message">
            <EditIcon size="24" class="feather-button" @click="editingContent = true" />
          </div>
          <div
            v-if="canEdit"
            class="message-button"
            :title="`Mark as ${message.resolved ? 'Unresolved' : 'Resolved'}`"
          >
            <CheckCircleIcon
              size="24"
              class="feather-button resolve-button"
              @click="toggleResolved"
            />
          </div>
          <div v-if="isModerator && !message.root" class="message-button" title="Delete Message">
            <Trash2Icon size="24" class="feather-button" @click="deleteMessage" />
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import ProfileImage from "./components/ProfileImage";
import RequiresRegistration from "./components/RequiresRegistration";
import QuillEditor from "./components/editor/QuillEditor";
import { EditIcon, CheckCircleIcon, Trash2Icon } from "vue-feather-icons";
import { mapState, mapGetters, mapActions } from "vuex";
import {
  MODULE_USER,
  MODULE_THREADS,
  ACTION_EDIT_MESSAGE,
  ACTION_RESOLVE_MESSAGE,
  ACTION_DELETE_MESSAGE,
  ACTION_CREATE_MESSAGE,
  showWarning,
  canEdit
} from "./store";
import nprogress from "nprogress";

export default {
  name: "message",
  components: {
    ProfileImage,
    RequiresRegistration,
    QuillEditor,
    EditIcon,
    CheckCircleIcon,
    Trash2Icon
  },
  props: {
    threadId: {
      type: String,
      required: true
    },
    message: {
      type: Object
    },
    creating: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      editingContent: false,
      posting: false
    };
  },
  computed: {
    ...mapState(MODULE_USER, ["user"]),
    ...mapGetters(MODULE_USER, ["isModerator", "userAsAuthor"]),
    authorName() {
      return this.user !== null && this.user.sub === this.message.author.id
        ? "You"
        : this.message.author.name;
    },
    canEdit() {
      return canEdit(this.message, this.$store);
    },
    resolved() {
      return this.message && this.message.resolved;
    }
  },
  created() {
    this.showContentRequiredNotification = showWarning(
      "Your message cannot be empty!"
    )(this.$store.dispatch);
  },
  methods: {
    ...mapActions(MODULE_THREADS, [
      ACTION_EDIT_MESSAGE,
      ACTION_RESOLVE_MESSAGE,
      ACTION_DELETE_MESSAGE,
      ACTION_CREATE_MESSAGE
    ]),
    saveMessage() {
      const content = this.$refs.editor.getContent();
      if (content === "") {
        this.showContentRequiredNotification();
        return;
      }
      nprogress.start();
      if (this.creating) {
        this.posting = true;
        this[ACTION_CREATE_MESSAGE]({ threadId: this.threadId, content }).then(
          () => {
            this.posting = false;
            this.$refs.editor.clear();
            nprogress.done();
          }
        );
      } else {
        this[ACTION_EDIT_MESSAGE]({
          threadId: this.threadId,
          message: this.message,
          newContent: content
        }).then(() => nprogress.done());
        this.editingContent = false;
      }
    },
    toggleResolved() {
      nprogress.start();
      this[ACTION_RESOLVE_MESSAGE]({
        threadId: this.threadId,
        message: this.message,
        resolved: !this.message.resolved
      }).then(() => nprogress.done());
    },
    deleteMessage() {
      const confirmation = confirm(
        `Are you sure you want to delete this message? This is a permanent action and cannot be undone.`
      );
      if (confirmation) {
        nprogress.start();
        this[ACTION_DELETE_MESSAGE]({
          threadId: this.threadId,
          messageId: this.message.id
        }).then(() => nprogress.done());
      }
    }
  }
};
</script>

<style lang="sass">
@import "variables"

div.message
  display: flex
  flex-direction: row
  align-items: flex-start
  margin-top: 1rem
  .profile-image
    margin-right: 1rem
  .message-details
    flex-grow: 1
    .message-content
      padding: 1rem
      background-color: #eeeeee
      border-radius: 0 0.5rem 0.5rem
      > *
        margin-top: 0
        &:last-child
          margin-bottom: 0
        &:not(:last-child)
          margin-bottom: 0.5rem
      h1, h2, h3
        padding: 0
      code
        background-color: rgba(27, 31, 35, 0.05)
        border-radius: 3px
        font-size: 85%
        margin: 0
        padding: 0.2em 0.4em
      blockquote
        font-size: 1rem
    .message-meta
      display: flex
      align-items: center   
      > p
        flex-grow: 1
        margin: 0.4rem 0
      > .message-button
        min-width: 24px
        min-height: 24px
        display: none
        align-items: center
      > *:not(:last-child)
        margin-right: 8px
  &.resolved
    .message-details .message-content
      background-color: #d8efff
    .resolve-button
      stroke: $primary-color
  &:hover
    .message-details .message-meta > .message-button
      display: flex
</style>
