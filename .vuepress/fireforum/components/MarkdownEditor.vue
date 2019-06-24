<template>
  <div class="markdown-editor">
    <!--suppress HtmlFormInputWithoutLabel -->
    <textarea ref="editor"></textarea>
  </div>
</template>

<script>
export default {
  name: "markdown-editor",
  props: {
    value: {
      type: String,
      default: ""
    }
  },
  data() {
    return {
      editor: null
    };
  },
  mounted() {
    import("simplemde/dist/simplemde.min").then(mde => {
      const SimpleMDE = mde.default;
      // noinspection JSUnresolvedVariable
      this.editor = new SimpleMDE({
        element: this.$refs.editor,
        spellChecker: false,
        initialValue: this.value,
        toolbar: [
          "bold",
          "italic",
          "strikethrough",
          "heading",
          "|",
          "code",
          "quote",
          "unordered-list",
          "ordered-list",
          "|",
          "link",
          "image",
          "horizontal-rule",
          "|",
          "guide"
        ],
        placeholder: "Message"
      });
      this.editor.codemirror.on("change", () => {
        // noinspection JSUnresolvedFunction
        this.$emit("input", this.editor.value());
      });
    });
  },
  beforeDestroy() {
    //if (this.editor) this.editor.toTextArea();
  },
  watch: {
    value(newValue) {
      if (this.editor && this.editor.value() !== newValue) {
        this.editor.value(newValue);
      }
    }
  }
};
</script>

<style lang="stylus">
@import '~simplemde/dist/simplemde.min.css';

.form .markdown-editor
  width: calc(100%)
  > .editor-toolbar,
  > .CodeMirror,
  > .editor-statusbar
    width: calc(100% - 24px)
  > .editor-toolbar,
  > .CodeMirror *
    text-align: left
  > .CodeMirror
    margin-bottom: 1rem

.message .message-content
  .markdown-editor
    .editor-toolbar:not(:last-child)
      margin-bottom: 0 !important
      background-color: white
    > .editor-toolbar,
    > .CodeMirror *
      text-align: left

.editor-statusbar
  display: none
</style>
