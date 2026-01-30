"use client";

import { useState, useRef, useEffect } from "react";
import { useProfiles } from "@/hooks/useProfiles";
import { addImportedProfile } from "@/lib/profileStore";
import { getProfile as fetchRemoteProfile } from "@/lib/syncApi";

export default function ProfileManager() {
  const { profiles, activeProfile, createProfile, switchProfile, deleteProfile, renameProfile } = useProfiles();
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [importCode, setImportCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [importError, setImportError] = useState("");
  const [jsonImportMsg, setJsonImportMsg] = useState("");
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close panel on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Focus input when creating
  useEffect(() => {
    if (creating && inputRef.current) {
      inputRef.current.focus();
    }
  }, [creating]);

  function handleCreate() {
    const trimmed = newName.trim();
    if (!trimmed) return;
    createProfile(trimmed);
    setNewName("");
    setCreating(false);
  }

  function handleRename(id: string) {
    const trimmed = editName.trim();
    if (trimmed) {
      renameProfile(id, trimmed);
    }
    setEditingId(null);
    setEditName("");
  }

  function handleCopyCode() {
    if (!activeProfile) return;
    navigator.clipboard.writeText(activeProfile.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleExportJson() {
    if (!activeProfile) return;
    const json = JSON.stringify(activeProfile, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `profile-${activeProfile.name}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImportJson(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setJsonImportMsg("");
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string);
        if (
          typeof data.id === "string" &&
          typeof data.name === "string" &&
          Array.isArray(data.purchased) &&
          Array.isArray(data.wishlist) &&
          typeof data.updatedAt === "number"
        ) {
          addImportedProfile(data, true);
          setJsonImportMsg("匯入成功");
          setTimeout(() => setJsonImportMsg(""), 2000);
        } else {
          setJsonImportMsg("檔案格式不正確");
        }
      } catch {
        setJsonImportMsg("無法解析 JSON 檔案");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg glass text-sm text-[var(--color-foreground)]/80 hover:text-[var(--color-foreground)] hover:border-[var(--color-border-hover)] transition-all duration-200"
      >
        <svg className="w-4 h-4 text-[var(--color-accent)]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        <span className="truncate max-w-[120px]">
          {activeProfile?.name ?? "未選擇角色"}
        </span>
        <svg className={`w-3 h-3 transition-transform duration-200 text-[var(--color-muted-foreground)] ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div
          className="fixed inset-x-3 top-14 sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:w-80 max-h-[80vh] overflow-y-auto rounded-xl shadow-xl z-50 p-4 space-y-4"
          style={{
            background: "rgba(18, 18, 26, 0.95)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: "1px solid var(--color-border)",
          }}
        >
          {/* Profile list */}
          {profiles.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs text-[var(--color-muted-foreground)] uppercase tracking-wider font-[family-name:var(--font-mono)]">角色列表</p>
              {profiles.map((p) => (
                <div
                  key={p.id}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 ${
                    p.id === activeProfile?.id
                      ? "bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20"
                      : "hover:bg-white/5 border border-transparent"
                  }`}
                  onClick={() => switchProfile(p.id)}
                >
                  <div
                    className={`w-2 h-2 rounded-full flex-shrink-0 transition-all ${
                      p.id === activeProfile?.id
                        ? "bg-[var(--color-accent)] shadow-[0_0_8px_rgba(245,158,11,0.4)]"
                        : "bg-[var(--color-muted-foreground)]/40"
                    }`}
                  />
                  {editingId === p.id ? (
                    <input
                      className="flex-1 bg-[var(--color-muted)] text-sm text-[var(--color-foreground)] rounded-md px-2 py-1 border border-[var(--color-border)] outline-none focus:border-[var(--color-accent)]/50 focus:ring-1 focus:ring-[var(--color-accent)]/20"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleRename(p.id);
                        if (e.key === "Escape") setEditingId(null);
                      }}
                      onBlur={() => handleRename(p.id)}
                      onClick={(e) => e.stopPropagation()}
                      autoFocus
                    />
                  ) : (
                    <span className="flex-1 text-sm text-[var(--color-foreground)]/90 truncate">{p.name}</span>
                  )}
                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingId(p.id);
                        setEditName(p.name);
                      }}
                      className="text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] p-1 rounded transition-colors"
                      title="重新命名"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    {profiles.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`確定要刪除「${p.name}」嗎？`)) {
                            deleteProfile(p.id);
                          }
                        }}
                        className="text-[var(--color-muted-foreground)] hover:text-red-400 p-1 rounded transition-colors"
                        title="刪除"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Create profile */}
          {creating ? (
            <div className="flex gap-2">
              <input
                ref={inputRef}
                className="flex-1 h-10 bg-[var(--color-muted)] text-sm text-[var(--color-foreground)] rounded-lg px-3 border border-[var(--color-border)] outline-none focus:border-[var(--color-accent)]/50 focus:ring-1 focus:ring-[var(--color-accent)]/20"
                placeholder="角色名稱"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreate();
                  if (e.key === "Escape") setCreating(false);
                }}
              />
              <button
                onClick={handleCreate}
                className="px-4 h-10 bg-[var(--color-accent)] hover:brightness-110 text-[var(--color-accent-foreground)] text-sm font-medium rounded-lg transition-all duration-200 shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] active:scale-[0.98]"
              >
                新增
              </button>
            </div>
          ) : (
            <button
              onClick={() => setCreating(true)}
              className="w-full text-sm text-[var(--color-accent)] hover:text-[var(--color-accent)] py-2.5 border border-dashed border-[var(--color-accent)]/20 rounded-lg hover:border-[var(--color-accent)]/40 hover:bg-[var(--color-accent)]/5 transition-all duration-200"
            >
              + 新增角色
            </button>
          )}

          {/* Share code */}
          {activeProfile && (
            <div className="pt-3 border-t border-[var(--color-border)] space-y-2">
              <p className="text-xs text-[var(--color-muted-foreground)] uppercase tracking-wider font-[family-name:var(--font-mono)]">分享碼</p>
              <div className="flex gap-2 items-center">
                <code className="flex-1 bg-[var(--color-muted)] text-sm text-[var(--color-accent)] px-3 py-2 rounded-lg font-[family-name:var(--font-mono)] tracking-widest border border-[var(--color-border)]">
                  {activeProfile.id}
                </code>
                <button
                  onClick={handleCopyCode}
                  className="px-3 py-2 rounded-lg glass text-sm text-[var(--color-foreground)]/80 hover:text-[var(--color-foreground)] hover:border-[var(--color-border-hover)] transition-all duration-200"
                >
                  {copied ? "已複製" : "複製"}
                </button>
              </div>
            </div>
          )}

          {/* Import share code */}
          <div className="space-y-2">
            <p className="text-xs text-[var(--color-muted-foreground)] uppercase tracking-wider font-[family-name:var(--font-mono)]">匯入碼</p>
            <div className="flex gap-2">
              <input
                className="flex-1 h-10 bg-[var(--color-muted)] text-sm text-[var(--color-foreground)] rounded-lg px-3 border border-[var(--color-border)] outline-none focus:border-[var(--color-accent)]/50 focus:ring-1 focus:ring-[var(--color-accent)]/20 font-[family-name:var(--font-mono)] tracking-wider"
                placeholder="貼上分享碼"
                value={importCode}
                onChange={(e) => setImportCode(e.target.value)}
              />
              <button
                onClick={async () => {
                  const code = importCode.trim();
                  if (code.length !== 8) return;
                  setImportLoading(true);
                  setImportError("");
                  try {
                    const remote = await fetchRemoteProfile(code);
                    if (remote) {
                      addImportedProfile(remote, true);
                      setImportCode("");
                    } else {
                      setImportError("找不到此分享碼");
                    }
                  } catch {
                    setImportError("匯入失敗，請稍後再試");
                  } finally {
                    setImportLoading(false);
                  }
                }}
                disabled={importCode.trim().length !== 8 || importLoading}
                className="px-4 h-10 bg-emerald-600 hover:bg-emerald-500 disabled:bg-[var(--color-muted)] disabled:text-[var(--color-muted-foreground)] text-white text-sm font-medium rounded-lg transition-all duration-200 active:scale-[0.98]"
              >
                {importLoading ? "匯入中..." : "匯入"}
              </button>
            </div>
            {importError && (
              <p className="text-xs text-red-400">{importError}</p>
            )}
          </div>

          {/* Export/Import JSON */}
          {activeProfile && (
            <div className="pt-3 border-t border-[var(--color-border)] space-y-1">
              <div className="flex gap-2">
                <button
                  onClick={handleExportJson}
                  className="flex-1 text-xs text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] py-2 rounded-lg glass hover:border-[var(--color-border-hover)] transition-all duration-200"
                >
                  匯出 JSON
                </button>
                <label className="flex-1 text-xs text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] py-2 rounded-lg glass hover:border-[var(--color-border-hover)] transition-all duration-200 text-center cursor-pointer">
                  匯入 JSON
                  <input type="file" accept=".json" onChange={handleImportJson} className="hidden" />
                </label>
              </div>
              {jsonImportMsg && (
                <p className={`text-xs ${jsonImportMsg === "匯入成功" ? "text-emerald-400" : "text-red-400"}`}>
                  {jsonImportMsg}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
