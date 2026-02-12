export function SiteFooter() {
  return (
    <footer className="border-t py-6">
      <div className="container flex flex-col items-center gap-2 text-center text-sm text-muted-foreground mx-auto px-4">
        <p>&copy; {new Date().getFullYear()} ChatGate. All rights reserved.</p>
        <p>Messenger automation for small businesses.</p>
      </div>
    </footer>
  );
}
