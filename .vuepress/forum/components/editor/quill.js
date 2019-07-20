import Quill from "quill/core";

import Toolbar from "quill/modules/toolbar";
import Syntax, { CodeBlock } from "quill/modules/syntax";

import SnowTheme from "./theme";

import Header from "quill/formats/header";

import Bold from "quill/formats/bold";
import Italic from "quill/formats/italic";
import Underline from "quill/formats/underline";

import { ColorStyle } from "quill/formats/color";
import Link from "quill/formats/link";
import Script from "quill/formats/script";

import Image from "quill/formats/image";
import List, { ListItem } from "quill/formats/list";
import Blockquote from "quill/formats/blockquote";
import { Code } from "quill/formats/code";

Quill.register({
  "modules/toolbar": Toolbar,
  "modules/syntax": Syntax,
  "themes/snow": SnowTheme,
  "formats/header": Header,
  "formats/bold": Bold,
  "formats/italic": Italic,
  "formats/underline": Underline,
  "formats/color": ColorStyle,
  "formats/link": Link,
  "formats/script": Script,
  "formats/image": Image,
  "formats/list": List,
  "formats/list-item": ListItem,
  "formats/blockquote": Blockquote,
  "formats/code-block": CodeBlock,
  "formats/code": Code
});

export default Quill;
