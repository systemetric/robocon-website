<template>
  <div>
    <div ref="editor"></div>
  </div>
</template>

<script>
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

