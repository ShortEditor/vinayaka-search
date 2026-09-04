export default function Footer() {
  return (
    <footer className="bg-inverse-surface text-inverse-on-surface mt-auto hidden md:block">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-display text-lg font-semibold">
              Matti Mūrti
            </span>
          </div>
          <p className="text-xs text-inverse-on-surface/60 text-center">
            © {new Date().getFullYear()} Matti Mūrti Marketplace. All
            rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
