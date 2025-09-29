export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t py-6 text-sm text-muted-foreground">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div>© {year} Alliance IT Service. All rights reserved.</div>
        <div className="flex items-center gap-4">
          <a href="#" className="hover:text-foreground">
            Privacy
          </a>
          <a href="#" className="hover:text-foreground">
            Terms
          </a>
          <a href="#" className="hover:text-foreground">
            Support
          </a>
        </div>
      </div>
    </footer>
  );
}
