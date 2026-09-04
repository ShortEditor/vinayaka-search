"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", icon: "storefront", iconFilled: "storefront", label: "Market" },
  { href: "/search", icon: "search", iconFilled: "search", label: "Search" },
  { href: "/orders", icon: "receipt_long", iconFilled: "receipt_long", label: "Orders" },
  { href: "/profile", icon: "person", iconFilled: "person", label: "Profile" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 py-3 bg-surface-container-low shadow-[0px_-2px_4px_rgba(43,33,24,0.08)] rounded-t-xl md:hidden">
      {navItems.map((item) => {
        const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.label}
            href={item.href}
            className={`flex flex-col items-center justify-center px-3 py-1 rounded-xl transition-all duration-200 ease-in-out ${
              isActive
                ? "text-primary font-bold bg-secondary-container/20"
                : "text-on-surface-variant opacity-70 hover:bg-surface-variant/30"
            }`}
          >
            <span
              className="material-symbols-outlined"
              style={{
                fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
                fontSize: "24px",
              }}
            >
              {isActive ? item.iconFilled : item.icon}
            </span>
            <span className="text-xs font-semibold mt-1 tracking-wide">
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
