function escapeText(text) {
  return text.replace(/([*_`[\]])/g, "\\$1");
}

function renderMarks(text, marks = []) {
  let out = escapeText(text);
  for (const mark of marks) {
    if (mark.type === "bold") out = `**${out}**`;
    else if (mark.type === "italic") out = `_${out}_`;
    else if (mark.type === "strike") out = `~~${out}~~`;
    else if (mark.type === "code") out = `\`${out}\``;
    else if (mark.type === "link") out = `[${out}](${mark.attrs?.href ?? ""})`;
  }
  return out;
}

function renderInline(content = []) {
  return content
    .map((node) => {
      if (node.type === "text") return renderMarks(node.text ?? "", node.marks);
      if (node.type === "mention") return `@${node.attrs?.label ?? ""}`;
      if (node.type === "hardBreak") return "  \n";
      return "";
    })
    .join("");
}

function renderList(node, ordered, depth) {
  const indent = "  ".repeat(depth);
  return (node.content ?? [])
    .map((item, i) => {
      const marker = ordered ? `${i + 1}.` : "-";
      const body = renderNodes(item.content ?? [], depth + 1).trim();
      return `${indent}${marker} ${body}`;
    })
    .join("\n");
}

function renderTaskList(node, depth) {
  const indent = "  ".repeat(depth);
  return (node.content ?? [])
    .map((item) => {
      const checked = item.attrs?.checked ? "x" : " ";
      const body = renderNodes(item.content ?? [], depth + 1).trim();
      return `${indent}- [${checked}] ${body}`;
    })
    .join("\n");
}

function renderNode(node, depth) {
  switch (node.type) {
    case "paragraph":
      return renderInline(node.content);
    case "heading": {
      const level = node.attrs?.level ?? 1;
      return `${"#".repeat(level)} ${renderInline(node.content)}`;
    }
    case "bulletList":
      return renderList(node, false, depth);
    case "orderedList":
      return renderList(node, true, depth);
    case "taskList":
      return renderTaskList(node, depth);
    case "blockquote":
      return renderNodes(node.content ?? [], depth)
        .split("\n")
        .map((line) => `> ${line}`)
        .join("\n");
    case "codeBlock": {
      const lang = node.attrs?.language ?? "";
      const code = (node.content ?? []).map((n) => n.text ?? "").join("");
      return `\`\`\`${lang}\n${code}\n\`\`\``;
    }
    case "image":
      return `![${node.attrs?.alt ?? ""}](${node.attrs?.src ?? ""})`;
    case "horizontalRule":
      return "---";
    default:
      return node.content ? renderNodes(node.content, depth) : "";
  }
}

function renderNodes(nodes, depth = 0) {
  return nodes.map((node) => renderNode(node, depth)).join("\n\n");
}

export function docToMarkdown(doc) {
  if (!doc?.content) return "";
  return renderNodes(doc.content).trim() + "\n";
}

export function downloadMarkdown(filename, doc) {
  const markdown = docToMarkdown(doc);
  const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.md`;
  a.click();
  URL.revokeObjectURL(url);
}
