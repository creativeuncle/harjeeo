import * as Y from "yjs";
import { HocuspocusProvider } from "@hocuspocus/provider";
import { useAuthStore } from "@/store/authStore";

export function createCollabSession(docName) {
  const ydoc = new Y.Doc();
  const provider = new HocuspocusProvider({
    url: `${window.location.origin.replace(/^http/, "ws")}/collab`,
    name: docName,
    document: ydoc,
    token: () => useAuthStore.getState().accessToken ?? "",
  });
  return { ydoc, provider };
}
