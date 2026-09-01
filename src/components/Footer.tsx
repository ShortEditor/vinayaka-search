import { GiElephant } from "react-icons/gi";

export default function Footer() {
  return (
    <footer className="bg-text text-bg mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white">
              <GiElephant className="w-5 h-5" />
            </div>
            <span className="font-bold font-[var(--font-heading)] text-sm">
              Vinayaka Vigrahalu
            </span>
          </div>
          <p className="text-xs text-text-light text-center">
            © {new Date().getFullYear()} Vinayaka Vigrahalu Marketplace. All
            rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
