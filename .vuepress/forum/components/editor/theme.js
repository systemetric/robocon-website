import Emitter from "quill/core/emitter";
import Delta from "quill-delta";
import { BaseTooltip } from "quill/themes/base";
import SnowTheme from "quill/themes/snow";
import LinkBlot from "quill/formats/link";
import { Range } from "quill/core/selection";
import icons from "quill/ui/icons";

// Copied from quill/themes/snow with some changes for embedding images

class CustomSnowTheme extends SnowTheme {
  extendToolbar(toolbar) {
    toolbar.container.classList.add("ql-snow");
    this.buildButtons(
      [].slice.call(toolbar.container.querySelectorAll("button")),
      icons
    );
    this.buildPickers(
      [].slice.call(toolbar.container.querySelectorAll("select")),
      icons
    );
    this.tooltip = new CustomSnowTooltip(this.quill, this.options.bounds);
    if (toolbar.container.querySelector(".ql-link")) {
      this.quill.keyboard.addBinding({ key: "K", shortKey: true }, function(
        range,
        context
      ) {
        toolbar.handlers["link"].call(toolbar, !context.format.link);
      });
    }
  }
}

class CustomSnowTooltip extends BaseTooltip {
  constructor(quill, bounds) {
    super(quill, bounds);
    this.preview = this.root.querySelector("a.ql-preview");
  }

  listen() {
    super.listen();
    this.root.querySelector("a.ql-action").addEventListener("click", event => {
      if (this.root.classList.contains("ql-editing")) {
        this.save();
      } else {
        this.edit("link", this.preview.textContent);
      }
      event.preventDefault();
    });
    this.root.querySelector("a.ql-remove").addEventListener("click", event => {
      if (this.linkRange != null) {
        let range = this.linkRange;
        this.restoreFocus();
        this.quill.formatText(range, "link", false, Emitter.sources.USER);
        delete this.linkRange;
      }
      event.preventDefault();
      this.hide();
    });
    this.quill.on(
      Emitter.events.SELECTION_CHANGE,
      (range, oldRange, source) => {
        if (range == null) return;
        if (range.length === 0 && source === Emitter.sources.USER) {
          let [link, offset] = this.quill.scroll.descendant(
            LinkBlot,
            range.index
          );
          if (link != null) {
            this.linkRange = new Range(range.index - offset, link.length());
            let preview = LinkBlot.formats(link.domNode);
            this.preview.textContent = preview;
            this.preview.setAttribute("href", preview);
            this.show();
            this.position(this.quill.getBounds(this.linkRange));
            return;
          }
        } else {
          delete this.linkRange;
        }
        this.hide();
      }
    );
  }

  show() {
    super.show();
    this.root.removeAttribute("data-mode");
  }

  save() {
    let value = this.textbox.value;
    switch (this.root.getAttribute("data-mode")) {
      case "link": {
        let scrollTop = this.quill.root.scrollTop;
        if (this.linkRange) {
          this.quill.formatText(
            this.linkRange,
            "link",
            value,
            Emitter.sources.USER
          );
          delete this.linkRange;
        } else {
          this.restoreFocus();
          this.quill.format("link", value, Emitter.sources.USER);
        }
        this.quill.root.scrollTop = scrollTop;
        break;
      }
      case "image": {
        let range = this.quill.getSelection(true);
        this.quill.updateContents(
          new Delta()
            .retain(range.index)
            .delete(range.length)
            .insert({ image: value }),
          Emitter.sources.USER
        );
        this.quill.setSelection(range.index + 1, Emitter.sources.SILENT);
        break;
      }
      case "video": {
        value = extractVideoUrl(value);
      } // eslint-disable-next-line no-fallthrough
      case "formula": {
        if (!value) break;
        let range = this.quill.getSelection(true);
        if (range != null) {
          let index = range.index + range.length;
          this.quill.insertEmbed(
            index,
            this.root.getAttribute("data-mode"),
            value,
            Emitter.sources.USER
          );
          if (this.root.getAttribute("data-mode") === "formula") {
            this.quill.insertText(index + 1, " ", Emitter.sources.USER);
          }
          this.quill.setSelection(index + 2, Emitter.sources.USER);
        }
        break;
      }
      default:
    }
    this.textbox.value = "";
    this.hide();
  }
}
CustomSnowTooltip.TEMPLATE = [
  '<a class="ql-preview" target="_blank" href="about:blank"></a>',
  '<input type="text" data-formula="e=mc^2" data-link="https://quilljs.com" data-video="Embed URL" data-image="Image URL">',
  '<a class="ql-action"></a>',
  '<a class="ql-remove"></a>'
].join("");

function extractVideoUrl(url) {
  let match =
    url.match(
      /^(?:(https?):\/\/)?(?:(?:www|m)\.)?youtube\.com\/watch.*v=([a-zA-Z0-9_-]+)/
    ) ||
    url.match(/^(?:(https?):\/\/)?(?:(?:www|m)\.)?youtu\.be\/([a-zA-Z0-9_-]+)/);
  if (match) {
    return (
      (match[1] || "https") +
      "://www.youtube.com/embed/" +
      match[2] +
      "?showinfo=0"
    );
  }
  if ((match = url.match(/^(?:(https?):\/\/)?(?:www\.)?vimeo\.com\/(\d+)/))) {
    // eslint-disable-line no-cond-assign
    return (
      (match[1] || "https") + "://player.vimeo.com/video/" + match[2] + "/"
    );
  }
  return url;
}

export default CustomSnowTheme;
