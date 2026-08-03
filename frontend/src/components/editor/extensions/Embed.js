import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import EmbedView from "../nodeviews/EmbedView";

const Embed = Node.create({
  name: "embed",
  group: "block",
  atom: true,

  addAttributes() {
    return { src: { default: null } };
  },

  parseHTML() {
    return [{ tag: "div[data-type='embed']" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "embed" })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(EmbedView);
  },
});

export default Embed;
