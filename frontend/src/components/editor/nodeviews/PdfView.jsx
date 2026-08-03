import { NodeViewWrapper } from "@tiptap/react";
import { Pdf01Icon } from "hugeicons-react";

export default function PdfView({ node }) {
  const { src } = node.attrs;
  const filename = decodeURIComponent(src.split("/").pop()?.split("?")[0] ?? "Document.pdf");

  return (
    <NodeViewWrapper className="harjeeo-media harjeeo-media-pdf">
      <iframe src={src} title={filename} />
      <a href={src} target="_blank" rel="noreferrer" className="harjeeo-pdf-bar">
        <Pdf01Icon size={16} strokeWidth={1.8} />
        <span>{filename}</span>
      </a>
    </NodeViewWrapper>
  );
}
