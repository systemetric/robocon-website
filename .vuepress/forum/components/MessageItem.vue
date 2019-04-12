<template>
  <!--suppress JSUnresolvedVariable -->
  <ListItem :image="message.author.photo">
    <div class="message">
      <div class="message-content">
        <div
          v-if="!editing"
          v-html="message.renderedContent || message.content"
        ></div>
        <!--<textarea v-else rows="6" placeholder="Message" v-model="messageContent"></textarea>-->
        <MarkdownEditor
          :key="editorKey"
          v-else
          v-model="messageContent"
        ></MarkdownEditor>
        <div v-if="canEdit" class="buttons">
          <button class="small" @click="toggleEditState">
            {{ editing ? "Save" : "Edit" }}
          </button>
          <!--suppress HtmlUnknownTag -->
          <transition name="fade">
            <button
              v-if="editing && index !== 0"
              class="small danger"
              @click="deleteMessage"
            >
              Delete
            </button>
          </transition>
        </div>
      </div>
      <p class="light">
        Posted by {{ message.author.name }} on
        {{
          message.lastModified
            .toDate()
            .toLocaleString()
            .replace(", ", " at ")
        }}
      </p>
    </div>
  </ListItem>
</template>

<script>
import ListItem from "./ListItem";
import MarkdownEditor from "./MarkdownEditor";
import moderators from "../moderators";

export default {
  name: "message-item",
  components: {
    MarkdownEditor,
    ListItem
  },
  props: {
    index: {
      type: Number,
      required: true
    },
    user: {
      required: true
    },
    threadKey: {
      type: String,
      required: true
    },
    message: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      messageContent: "",
      editing: false,
      editorKey: 0
    };
  },
  computed: {
    canEdit() {
      if (!this.user) return false;
      return (
        this.user.uid === this.message.author.uid ||
        moderators.includes(this.user.uid)
      );
    }
  },
  methods: {
    toggleEditState() {
      this.editorKey++;
      if (this.editing) {
        this.$emit("doing", true);
        import("../../firebase")
          .then(({ updateMessage }) =>
            updateMessage(
              this.threadKey,
              this.message[".key"],
              this.messageContent
            )
          )
          .then(() => this.$emit("doing", false));
      } else {
        this.messageContent = this.message.content;
      }
      this.editing = !this.editing;
    },
    deleteMessage() {
      import("../../firebase").then(({ deleteMessage }) =>
        deleteMessage(this.threadKey, this.message[".key"])
      );
    }
  }
};
</script>

<style lang="sass">
$message-border-radius: 0.5rem

.message
  width: calc(100% - 2rem)
  height: calc(100% - 2rem)
  .message-content
    padding: 1rem
    background-color: #EEE
    border-top-right-radius: $message-border-radius
    border-bottom-left-radius: $message-border-radius
    border-bottom-right-radius: $message-border-radius
    max-width: 600px
    > div:not(.buttons)
      > *
        margin: 0 !important
        &:not(:last-child)
          margin-bottom: 0.5rem !important
      div[class*=language-]
        width: 100%
        border-radius: 6px
        margin: 0 !important
    .buttons
      margin-top: 0.3rem
      button
        width: auto
        display: inline-block
        &:not(:last-child)
          margin: 0 0.15rem 0 0
        &:not(:first-child)
          margin: 0 0 0 0.15rem
.forum.content .message .message-content a
  color: #0094ff
</style>
