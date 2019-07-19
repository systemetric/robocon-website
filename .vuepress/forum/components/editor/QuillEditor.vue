<template>
  <div class="quill-editor">
    <div ref="editor"></div>
    <div class="bottom-buttons">
      <slot name="bottom-buttons"></slot>
    </div>
  </div>
</template>

<script>
import hljs from "highlight.js/lib/highlight";
import javascript from "highlight.js/lib/languages/javascript";
import python from "highlight.js/lib/languages/python";
import xml from "highlight.js/lib/languages/xml";
hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("python", python);
hljs.registerLanguage("xml", xml);

export default {
  name: "quill-editor",
  props: {
    value: {
      type: String,
      default: ""
    }
  },
  mounted() {
    import("./quill").then(quillModule => {
      const Quill = quillModule.default;
      this.editor = new Quill(this.$refs.editor, {
        theme: "snow",
        placeholder: "Message",
        modules: {
          syntax: {
            highlight: text => {
              return hljs.highlightAuto(text).value;
            }
          },
          toolbar: {
            container: [
              [{ header: [1, 2, 3, false] }],
              ["bold", "italic", "underline"],
              [
                { color: [] },
                "link",
                "code",
                { script: "sub" },
                { script: "super" }
              ],
              ["image", "video"],
              [
                { list: "ordered" },
                { list: "bullet" },
                "blockquote",
                "code-block"
              ]
            ],
            handlers: {
              image: () => {
                this.editor.theme.tooltip.edit("image");
              }
            }
          }
        }
      });
      this.editor.root.innerHTML = this.value;
    });
  },
  destroyed() {
    if (this.editor) {
      this.editor.off("text-change");
    }
  },
  methods: {
    getContent() {
      return this.editor.getText().trim() ? this.editor.root.innerHTML : "";
    },
    clear() {
      this.editor.setContents([]);
    }
  }
};
</script>

<style lang="sass">
.quill-editor
  > .ql-toolbar
    border-top-left-radius: 4px
    border-top-right-radius: 4px
  > .ql-container
    border-bottom-left-radius: 4px
    border-bottom-right-radius: 4px
  .ql-editor
    p,
    ol,
    ul,
    pre,
    blockquote,
    h1,
    h2,
    h3,
    h4,
    h5,
    h6
      &:not(:last-child)
        margin-bottom: 0.5rem
    &.ql-blank::before
      margin-top: 3px
      font-style: normal
    ol, ul
      padding-left: 0
  .ql-container blockquote
    font-size: 13px
  .ql-container
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif
    font-size: 16px
  .bottom-buttons
    display: flex
    justify-content: flex-end
    .button
      margin-top: 1rem
      &:not(:last-child)
        margin-right: 1rem
  .ql-snow .ql-tooltip[data-mode=image]::before
    content: "Enter image:"
</style>
