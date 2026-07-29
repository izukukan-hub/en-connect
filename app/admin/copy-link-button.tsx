"use client";

import { useState } from "react";

export function CopyLinkButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="rounded border px-2 py-1 text-xs text-gray-700 hover:bg-gray-100"
    >
      {copied ? "コピーしました" : "コピー"}
    </button>
  );
}
