"use client";

import { useState } from "react";
import Link from "next/link";

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="sm:hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 transition hover:bg-emerald-100"
        aria-label="Menu"
      >
        {isOpen ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12h18M3 6h18M3 18h18" />
          </svg>
        )}
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-[1050] mt-2 rounded-2xl border border-emerald-100 bg-white/95 p-4 shadow-xl backdrop-blur-xl">
          <nav className="flex flex-col gap-2">
            <Link
              href="/"
              onClick={() => setIsOpen(false)}
              className="rounded-xl px-4 py-3 text-sm font-semibold text-zinc-700 transition hover:bg-emerald-50 hover:text-emerald-700"
            >
              Hızlı Bul
            </Link>
            <Link
              href="/nobetci"
              onClick={() => setIsOpen(false)}
              className="rounded-xl px-4 py-3 text-sm font-semibold text-zinc-700 transition hover:bg-emerald-50 hover:text-emerald-700"
            >
              Şehirler
            </Link>
            <Link
              href="/rehber"
              onClick={() => setIsOpen(false)}
              className="rounded-xl px-4 py-3 text-sm font-semibold text-zinc-700 transition hover:bg-emerald-50 hover:text-emerald-700"
            >
              Rehber
            </Link>
            <Link
              href="/hakkimizda"
              onClick={() => setIsOpen(false)}
              className="rounded-xl px-4 py-3 text-sm font-semibold text-zinc-700 transition hover:bg-emerald-50 hover:text-emerald-700"
            >
              Hakkımızda
            </Link>
          </nav>
        </div>
      )}
    </div>
  );
}
