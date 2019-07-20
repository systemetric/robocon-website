import Emitter from "quill/core/emitter";
import Delta from "quill-delta";
import SnowTheme from "quill/themes/snow";

class CustomSnowTheme extends SnowTheme {
  extendToolbar(toolbar) {
    super.extendToolbar(toolbar);
    const originalSave = this.tooltip.save.bind(this.tooltip);
    this.tooltip.save = function() {
      const value = this.textbox.value;
      const mode = this.root.getAttribute("data-mode");
      if (mode === "image") {
        let range = this.quill.getSelection(true);
        this.quill.updateContents(
          new Delta()
            .retain(range.index)
            .delete(range.length)
            .insert({ image: value }),
          Emitter.sources.USER
        );
        this.quill.setSelection(range.index + 1, Emitter.sources.SILENT);
      } else {
        originalSave();
      }
    }.bind(this.tooltip);
  }
}

export default CustomSnowTheme;
