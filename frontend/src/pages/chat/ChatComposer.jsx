import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Add01Icon,
  Attachment01Icon,
  AtIcon,
  SmileIcon,
  Mic01Icon,
  SentIcon,
  Cancel01Icon,
  Doc01Icon,
} from "hugeicons-react";
import IconPicker from "@/components/ui/IconPicker";
import Avatar from "@/components/ui/Avatar";
import { uploadFile } from "@/lib/uploads";
import { useChatStore } from "@/store/chatStore";

export default function ChatComposer({ onSend, replyingTo, onCancelReply }) {
  const members = useChatStore((s) => s.members);

  const [draft, setDraft] = useState("");
  const [attachOpen, setAttachOpen] = useState(false);
  const [attachPos, setAttachPos] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [mentionOpen, setMentionOpen] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [pendingAttachment, setPendingAttachment] = useState(null);

  const attachTriggerRef = useRef(null);
  const fileInputRef = useRef(null);
  const inputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  function openAttachMenu() {
    const rect = attachTriggerRef.current.getBoundingClientRect();
    setAttachPos({ bottom: window.innerHeight - rect.top + 8, left: rect.left });
    setAttachOpen(true);
  }

  function handleChangeDraft(e) {
    const value = e.target.value;
    setDraft(value);
    const cursor = e.target.selectionStart;
    const match = value.slice(0, cursor).match(/@(\S*)$/);
    if (match) {
      setMentionQuery(match[1]);
      setMentionOpen(true);
    } else {
      setMentionOpen(false);
    }
  }

  function insertMention(member) {
    const cursor = inputRef.current?.selectionStart ?? draft.length;
    const before = draft.slice(0, cursor).replace(/@(\S*)$/, `@${member.name} `);
    const after = draft.slice(cursor);
    setDraft(before + after);
    setMentionOpen(false);
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  function insertMentionTrigger() {
    setAttachOpen(false);
    const cursor = inputRef.current?.selectionStart ?? draft.length;
    const before = draft.slice(0, cursor);
    const after = draft.slice(cursor);
    const needsSpace = before.length > 0 && !before.endsWith(" ");
    setDraft(`${before}${needsSpace ? " " : ""}@${after}`);
    setMentionQuery("");
    setMentionOpen(true);
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  function insertEmoji(emoji) {
    const cursor = inputRef.current?.selectionStart ?? draft.length;
    setDraft(draft.slice(0, cursor) + emoji + draft.slice(cursor));
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  async function handleFilePick(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    setAttachOpen(false);
    if (!file) return;
    setUploading(true);
    try {
      const isImage = file.type.startsWith("image/");
      const { url } = await uploadFile(file);
      setPendingAttachment({ url, type: isImage ? "image" : "file", name: file.name });
      requestAnimationFrame(() => inputRef.current?.focus());
    } catch (err) {
      window.alert(err.message);
    } finally {
      setUploading(false);
    }
  }

  async function handleToggleRecording() {
    if (recording) {
      mediaRecorderRef.current?.stop();
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        setRecording(false);
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        if (blob.size === 0) return;
        setUploading(true);
        try {
          const file = new File([blob], "voice-message.webm", { type: "audio/webm" });
          const { url } = await uploadFile(file);
          setPendingAttachment({ url, type: "audio", name: "Voice message" });
        } catch (err) {
          window.alert(err.message);
        } finally {
          setUploading(false);
        }
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setRecording(true);
    } catch {
      window.alert("Microphone access is required to record a voice message.");
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if ((!draft.trim() && !pendingAttachment) || uploading) return;
    const body = draft.trim();
    const attachment = pendingAttachment;
    setDraft("");
    setPendingAttachment(null);
    setMentionOpen(false);
    await onSend(body, attachment, replyingTo?._id);
    onCancelReply?.();
  }

  const filteredMentionMembers = members.filter((m) =>
    m.name.toLowerCase().includes(mentionQuery.toLowerCase())
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-1.5 rounded-2xl border border-(--color-border) bg-(--color-canvas) px-3 py-2.5 shadow-sm"
    >
      {replyingTo && (
        <div className="flex items-center gap-2 rounded-lg bg-black/5 px-2.5 py-1.5 dark:bg-white/10">
          <div className="min-w-0 flex-1 border-l-2 border-(--color-accent) pl-2">
            <div className="text-xs font-medium text-(--color-accent)">
              {replyingTo.author?.name ?? "Message"}
            </div>
            <div className="truncate text-xs text-(--color-text-muted)">
              {replyingTo.body || replyingTo.attachment?.name || "Attachment"}
            </div>
          </div>
          <button
            type="button"
            onClick={onCancelReply}
            className="shrink-0 rounded-full p-1 text-(--color-text-muted) hover:bg-black/5 dark:hover:bg-white/10"
          >
            <Cancel01Icon size={14} strokeWidth={1.8} />
          </button>
        </div>
      )}

      {pendingAttachment && (
        <div className="flex items-center gap-2 rounded-lg bg-black/5 px-2.5 py-1.5 dark:bg-white/10">
          {pendingAttachment.type === "image" ? (
            <img
              src={pendingAttachment.url}
              alt={pendingAttachment.name}
              className="h-10 w-10 shrink-0 rounded-md object-cover"
            />
          ) : (
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-black/5 dark:bg-white/10">
              {pendingAttachment.type === "audio" ? (
                <Mic01Icon size={16} strokeWidth={1.8} />
              ) : (
                <Doc01Icon size={16} strokeWidth={1.8} />
              )}
            </span>
          )}
          <div className="min-w-0 flex-1 text-xs text-(--color-text-muted)">
            <div className="truncate font-medium text-(--color-text)">{pendingAttachment.name}</div>
            <div>Ready to send</div>
          </div>
          <button
            type="button"
            onClick={() => setPendingAttachment(null)}
            className="shrink-0 rounded-full p-1 text-(--color-text-muted) hover:bg-black/5 dark:hover:bg-white/10"
          >
            <Cancel01Icon size={14} strokeWidth={1.8} />
          </button>
        </div>
      )}

      <div className="relative">
        <input
          ref={inputRef}
          value={draft}
          onChange={handleChangeDraft}
          placeholder={uploading ? "Uploading…" : recording ? "Recording…" : "Message…"}
          disabled={uploading}
          className="w-full border-none bg-transparent text-sm outline-none placeholder:text-(--color-text-muted)"
        />

        {mentionOpen && filteredMentionMembers.length > 0 && (
          <div className="absolute bottom-full left-0 z-30 mb-2 w-56 rounded-lg border border-(--color-border) bg-(--color-canvas) p-1 shadow-lg">
            {filteredMentionMembers.slice(0, 6).map((m) => (
              <button
                key={m._id}
                type="button"
                onClick={() => insertMention(m)}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-black/5 dark:hover:bg-white/10"
              >
                <Avatar name={m.name} size={18} />
                <span className="truncate">{m.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button
            ref={attachTriggerRef}
            type="button"
            onClick={openAttachMenu}
            title="Add"
            className="flex h-7 w-7 items-center justify-center rounded-full text-(--color-text-muted) hover:bg-black/5 dark:hover:bg-white/10"
          >
            <Add01Icon size={16} strokeWidth={1.8} />
          </button>

          <IconPicker
            trigger={
              <span
                title="Emoji"
                className="flex h-7 w-7 items-center justify-center rounded-full text-(--color-text-muted) hover:bg-black/5 dark:hover:bg-white/10"
              >
                <SmileIcon size={16} strokeWidth={1.8} />
              </span>
            }
            onSelect={insertEmoji}
          />

          <button
            type="button"
            onClick={handleToggleRecording}
            title="Record a voice message"
            className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors ${
              recording
                ? "bg-red-500 text-white"
                : "text-(--color-text-muted) hover:bg-black/5 dark:hover:bg-white/10"
            }`}
          >
            <Mic01Icon size={16} strokeWidth={1.8} />
          </button>
        </div>

        <button
          type="submit"
          disabled={(!draft.trim() && !pendingAttachment) || uploading}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-(--color-accent) text-white disabled:opacity-30"
        >
          <SentIcon size={14} strokeWidth={1.8} />
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.pdf,.csv"
        className="hidden"
        onChange={handleFilePick}
      />

      {attachOpen &&
        attachPos &&
        createPortal(
          <>
            <div className="fixed inset-0 z-40" onClick={() => setAttachOpen(false)} />
            <div
              style={{ bottom: attachPos.bottom, left: attachPos.left }}
              className="fixed z-50 w-64 rounded-lg border border-(--color-border) bg-(--color-canvas) p-1 shadow-lg"
            >
              <button
                type="button"
                onClick={() => {
                  setAttachOpen(false);
                  fileInputRef.current?.click();
                }}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-black/5 dark:hover:bg-white/10"
              >
                <Attachment01Icon size={15} strokeWidth={1.8} />
                Add images, PDFs, or CSVs
              </button>
              <button
                type="button"
                onClick={insertMentionTrigger}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-black/5 dark:hover:bg-white/10"
              >
                <AtIcon size={15} strokeWidth={1.8} />
                Mention pages or people
              </button>
            </div>
          </>,
          document.body
        )}
    </form>
  );
}
