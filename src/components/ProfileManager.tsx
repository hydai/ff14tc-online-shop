"use client";

import { useState, useRef, useEffect } from "react";
import { useProfiles } from "@/hooks/useProfiles";
import { addImportedProfile } from "@/lib/profileStore";
import { getProfile as fetchRemoteProfile } from "@/lib/syncApi";
import { Popover } from "@base-ui/react/popover";

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
  const inputRef = useRef<HTMLInputElement>(null);

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
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-800 hover:bg-gray-700 text-sm text-gray-200 transition-colors border border-gray-700"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        <span className="truncate max-w-[120px]">
          {activeProfile?.name ?? "未選擇角色"}
        </span>
        <svg className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Positioner side="bottom" align="end" sideOffset={4} className="z-50">
          <Popover.Popup className="w-[calc(100vw-1.5rem)] sm:w-72 max-h-[80vh] overflow-y-auto bg-gray-900 border border-gray-700 rounded-lg shadow-xl p-3 space-y-3">
            {/* Profile list */}
            {profiles.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs text-gray-500 uppercase tracking-wider">角色列表</p>
                {profiles.map((p) => (
                  <div
                    key={p.id}
                    className={`flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-colors ${
                      p.id === activeProfile?.id
                        ? "bg-blue-900/40 border border-blue-700/50"
                        : "hover:bg-gray-800"
                    }`}
                    onClick={() => switchProfile(p.id)}
                  >
                    <div
                      className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        p.id === activeProfile?.id ? "bg-blue-400" : "bg-gray-600"
                      }`}
                    />
                    {editingId === p.id ? (
                      <input
                        className="flex-1 bg-gray-800 text-sm text-white rounded px-1.5 py-0.5 border border-gray-600 outline-none focus:border-blue-500"
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
                      <span className="flex-1 text-sm text-gray-200 truncate">{p.name}</span>
                    )}
                    <div className="flex gap-1 flex-shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingId(p.id);
                          setEditName(p.name);
                        }}
                        className="text-gray-500 hover:text-gray-300 p-0.5"
                        title="重新命名"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
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
                          className="text-gray-500 hover:text-red-400 p-0.5"
                          title="刪除"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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
                  className="flex-1 bg-gray-800 text-sm text-white rounded-md px-2 py-1.5 border border-gray-600 outline-none focus:border-blue-500"
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
                  className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-md"
                >
                  新增
                </button>
              </div>
            ) : (
              <button
                onClick={() => setCreating(true)}
                className="w-full text-sm text-blue-400 hover:text-blue-300 py-1.5 border border-dashed border-gray-700 rounded-md hover:border-gray-600 transition-colors"
              >
                + 新增角色
              </button>
            )}

            {/* Share code */}
            {activeProfile && (
              <div className="pt-2 border-t border-gray-800 space-y-2">
                <p className="text-xs text-gray-500 uppercase tracking-wider">分享碼</p>
                <div className="flex gap-2 items-center">
                  <code className="flex-1 bg-gray-800 text-sm text-amber-300 px-2 py-1.5 rounded-md font-mono tracking-wider">
                    {activeProfile.id}
                  </code>
                  <button
                    onClick={handleCopyCode}
                    className="px-2 py-1.5 bg-gray-800 hover:bg-gray-700 text-sm text-gray-300 rounded-md border border-gray-700"
                  >
                    {copied ? "已複製" : "複製"}
                  </button>
                </div>
              </div>
            )}

            {/* Import share code */}
            <div className="space-y-2">
              <p className="text-xs text-gray-500 uppercase tracking-wider">匯入碼</p>
              <div className="flex gap-2">
                <input
                  className="flex-1 bg-gray-800 text-sm text-white rounded-md px-2 py-1.5 border border-gray-600 outline-none focus:border-blue-500 font-mono"
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
                  className="px-2 py-1.5 bg-emerald-700 hover:bg-emerald-600 disabled:bg-gray-700 disabled:text-gray-500 text-white text-sm rounded-md transition-colors"
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
              <div className="pt-2 border-t border-gray-800 space-y-1">
                <div className="flex gap-2">
                  <button
                    onClick={handleExportJson}
                    className="flex-1 text-xs text-gray-400 hover:text-gray-200 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-md transition-colors"
                  >
                    匯出 JSON
                  </button>
                  <label className="flex-1 text-xs text-gray-400 hover:text-gray-200 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-md transition-colors text-center cursor-pointer">
                    匯入 JSON
                    <input type="file" accept=".json" onChange={handleImportJson} className="hidden" />
                  </label>
                </div>
                {jsonImportMsg && (
                  <p className={`text-xs ${jsonImportMsg === "匯入成功" ? "text-green-400" : "text-red-400"}`}>
                    {jsonImportMsg}
                  </p>
                )}
              </div>
            )}
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
