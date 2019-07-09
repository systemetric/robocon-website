<template>
  <div class="quill-editor">
    <div ref="editor"></div>
  </div>
</template>

<script>
import hljs from "highlight.js/lib/highlight";
import javascript from "highlight.js/lib/languages/javascript";
import python from "highlight.js/lib/languages/python";
hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("python", python);
hljs.configure({
  languages: ["javascript", "python"]
});

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
      window.Quill = Quill;
      this.editor = new Quill(this.$refs.editor, {
        theme: "snow",
        modules: {
          syntax: {
            highlight: text => {
              let result = hljs.highlightAuto(text);
              setTimeout(() =>
                this.$emit(
                  "input",
                  this.editor.getText() ? this.editor.root.innerHTML : ""
                )
              );
              return result.value;
            }
          },
          toolbar: [
            [{ header: [1, 2, 3, false] }],
            ["bold", "italic", "underline"],
            [
              { color: [] },
              "link",
              "code",
              { script: "sub" },
              { script: "super" }
            ],
            ["blockquote", "code-block"]
          ]
        }
      });
      this.editor.root.innerHTML = this.value;
      //TODO: manually do this when the user clicks "Save" or something
      this.editor.on("text-change", () => {
        this.$emit(
          "input",
          this.editor.getText() ? this.editor.root.innerHTML : ""
        );
      });
    });
  },
  destroyed() {
    if (this.editor) {
      this.editor.off("text-change");
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
  .ql-container blockquote
    font-size: 13px
</style>
