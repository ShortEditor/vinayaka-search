"use client";

import Link from "next/link";
import { useState } from "react";
import { IoMenu, IoClose } from "react-icons/io5";
import { GiElephant } from "react-icons/gi";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-surface/95 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white transition-transform group-hover:scale-110">
              <GiElephant className="w-6 h-6" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold font-[var(--font-heading)] leading-tight gradient-text">
                Vinayaka Vigrahalu
              </h1>
              <p className="text-[10px] text-text-muted leading-none -mt-0.5">
                Find the perfect Ganesh idol
              </p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className="text-sm font-medium text-text-muted hover:text-primary transition-colors"
            >
              Browse Idols
            </Link>
            <Link href="/list" className="btn-primary text-sm py-2.5 px-5">
              List Your Idol
            </Link>
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-bg-alt transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <IoClose className="w-6 h-6" />
            ) : (
              <IoMenu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 pt-2 border-t border-border animate-fade-in">
            <nav className="flex flex-col gap-2">
              <Link
                href="/"
                className="px-4 py-3 rounded-xl text-sm font-medium text-text-muted hover:bg-bg-alt transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Browse Idols
              </Link>
              <Link
                href="/list"
                className="btn-primary text-sm mx-4"
                onClick={() => setMobileMenuOpen(false)}
              >
                List Your Idol
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
