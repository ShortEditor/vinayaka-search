"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/lib/useAuth";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAuth();

  const drawerLinks = [
    { href: "/", icon: "storefront", fill: true, label: "Browse Idols" },
    { href: "/search", icon: "search", fill: false, label: "Search" },
    { href: "/orders", icon: "receipt_long", fill: false, label: "My Orders" },
    {
      href: user ? "/profile" : "/login",
      icon: user ? "account_circle" : "login",
      fill: false,
      label: user ? "My Profile" : "Sign In",
    },
    { href: "/list", icon: "add_circle", fill: false, label: "List Your Idol" },
  ];

  return (
    <>
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-4 h-16 bg-surface/95 backdrop-blur-md border-b border-clay-base">
        <button
          aria-label="Menu"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="text-primary hover:opacity-80 transition-opacity active:scale-95"
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>
            {mobileMenuOpen ? "close" : "menu"}
          </span>
        </button>

        <Link href="/">
          <h1 className="font-display text-[28px] md:text-[32px] font-semibold leading-tight text-primary tracking-tight">
            Matti Mūrti
          </h1>
        </Link>

        <div className="flex items-center gap-1">
          <Link
            href="/orders"
            aria-label="My Orders"
            className="text-primary hover:opacity-80 transition-opacity active:scale-95"
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>
              shopping_bag
            </span>
          </Link>
          <Link
            href={user ? "/profile" : "/login"}
            aria-label={user ? "My Profile" : "Sign In"}
            className="w-8 h-8 rounded-full bg-primary-container text-white flex items-center justify-center overflow-hidden hover:opacity-90 transition-opacity active:scale-95"
          >
            {user ? (
              <span className="text-sm font-bold font-display leading-none">
                {(user.displayName || user.email || "U").charAt(0).toUpperCase()}
              </span>
            ) : (
              <span className="material-symbols-outlined" style={{ fontSize: "20px", fontVariationSettings: "'FILL' 1" }}>
                person
              </span>
            )}
          </Link>
        </div>
      </header>

      {/* Mobile drawer menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 pt-16 animate-fade-in">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <nav className="relative bg-card-surface w-72 h-full shadow-xl p-6 space-y-2">
            {user && (
              <div className="px-4 pb-3 mb-2 border-b border-outline-variant/40">
                <p className="text-xs text-on-surface-variant">Signed in as</p>
                <p className="text-sm font-semibold text-on-surface truncate">
                  {user.displayName || user.email}
                </p>
              </div>
            )}
            {drawerLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-on-surface hover:bg-surface-container transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span
                  className="material-symbols-outlined text-primary"
                  style={{ fontVariationSettings: `'FILL' ${link.fill ? 1 : 0}`, fontSize: "20px" }}
                >
                  {link.icon}
                </span>
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}
