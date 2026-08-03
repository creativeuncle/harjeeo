import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import ToggleView from "../nodeviews/ToggleView";

const Toggle = Node.create({
  name: "toggle",
  group: "block",
  content: "block+",
  defining: true,

  addAttributes() {
    return {
      open: {
        default: true,
        parseHTML: (el) => el.getAttribute("data-open") !== "false",
        renderHTML: (attrs) => ({ "data-open": String(attrs.open) }),
      },
    };
  },

  parseHTML() {
    return [{ tag: "div[data-type='toggle']" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "toggle" }), 0];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ToggleView);
  },
});

export default Toggle;
