// Walks a Tiptap JSON document collecting every @mention node's user id.
export function extractMentionIds(doc) {
  const ids = new Set();

  function walk(node) {
    if (!node) return;
    if (node.type === "mention" && node.attrs?.id) ids.add(String(node.attrs.id));
    if (Array.isArray(node.content)) node.content.forEach(walk);
  }

  walk(doc);
  return [...ids];
}

export function newlyMentionedIds(previousDoc, nextDoc) {
  const previous = new Set(extractMentionIds(previousDoc));
  return extractMentionIds(nextDoc).filter((id) => !previous.has(id));
}
