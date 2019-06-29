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
      const editor = new Quill(this.$refs.editor, {
        theme: "snow"
      });
      editor.root.innerHTML = this.value;
      editor.on("text-change", () => {
        this.$emit("input", editor.getText() ? editor.root.innerHTML : "");
      });
    });
  }
};
</script>

