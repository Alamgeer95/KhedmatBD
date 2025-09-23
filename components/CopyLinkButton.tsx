'use client';

import { useState } from 'react';

export default function CopyLinkButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="px-3 py-1 rounded-full border border-white/15 bg-white/5 hover:border-[#b88a4e]/50 transition"
      aria-label="Copy link"
    >
      {copied ? 'Copied!' : 'Copy Link'}
    </button>
  );
}
