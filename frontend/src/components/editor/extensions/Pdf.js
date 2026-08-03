import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import PdfView from "../nodeviews/PdfView";

const Pdf = Node.create({
  name: "pdf",
  group: "block",
  atom: true,

  addAttributes() {
    return { src: { default: null } };
  },

  parseHTML() {
    return [{ tag: "div[data-type='pdf']" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "pdf" })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(PdfView);
  },
});

export default Pdf;
