/**
 * File: src/components/landing/SearchBar.tsx
 * Description: The search button of the home page. A quiet "Search" with a magnifier; pressed (or "/" anywhere on the page) it
 * becomes a line to type on, and the categories on the screen filter as you type. Escape clears it and puts the button back.
 * No box: a hairline under the words, like every field in the lab.
 */
"use client";
import { useEffect, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';

const typing = (t: EventTarget | null) => t instanceof HTMLElement && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable);

export default function SearchBar({ value, onChange, found, total }: { value: string; onChange: (v: string) => void; found: number; total: number }) {
  const [open, setOpen] = useState(false);
  const input = useRef<HTMLInputElement | null>(null);
  const shown = open || value !== '';

  // "/" opens the search from anywhere on the page, unless you are already typing somewhere.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === '/' && !typing(e.target) && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (open) input.current?.focus();
  }, [open]);

  if (!shown) {
    return (
      <button type="button" className="fw-search__button" onClick={() => setOpen(true)} aria-label="Search the lab (press /)">
        <Search size={18} strokeWidth={1.5} aria-hidden />
        <span className="fw-kicker">Search</span>
      </button>
    );
  }

  const close = () => {
    onChange('');
    setOpen(false);
  };

  return (
    <div role="search" className="flex min-w-0 items-center gap-3">
      <Search size={18} strokeWidth={1.5} aria-hidden className="shrink-0 text-ink-2" />
      <input
        ref={input}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') close();
        }}
        placeholder="Search categories and experiments"
        aria-label="Search categories and experiments"
        autoComplete="off"
        spellCheck={false}
        className="fw-search__input"
      />
      {value !== '' && (
        <span className="fw-kicker fw-tabular shrink-0 text-ink-2" aria-live="polite">
          {found} of {total}
        </span>
      )}
      <button type="button" className="fw-search__button" onClick={close} aria-label="Clear the search">
        <X size={18} strokeWidth={1.5} aria-hidden />
      </button>
    </div>
  );
}
