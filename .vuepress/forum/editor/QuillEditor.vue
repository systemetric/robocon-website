<template>
  <div>
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
      const editor = new Quill(this.$refs.editor, {
        theme: "snow",
        modules: {
          syntax: {
            highlight: text => {
              let result = hljs.highlightAuto(text);
              setTimeout(() =>
                this.$emit(
                  "input",
                  editor.getText() ? editor.root.innerHTML : ""
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
      editor.root.innerHTML = this.value;
      editor.on("text-change", () => {
        this.$emit("input", editor.getText() ? editor.root.innerHTML : "");
      });
    });
  }
};
</script>
