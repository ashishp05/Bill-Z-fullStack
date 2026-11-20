import { useEffect, useState } from "react";
import { Button } from "../common/Button";
import { Card } from "../common/Card";
import { DesignIcon, SectionHeading } from "../common/Design";
interface InstallEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}
export function InstallPrompt() {
  const [prompt, setPrompt] = useState<InstallEvent | null>(null);
  const [message, setMessage] = useState("");
  const [installed, setInstalled] = useState(
    matchMedia("(display-mode: standalone)").matches,
  );
  useEffect(() => {
    const capture = (e: Event) => {
      e.preventDefault();
      setPrompt(e as InstallEvent);
    };
    const done = () => setInstalled(true);
    window.addEventListener("beforeinstallprompt", capture);
    window.addEventListener("appinstalled", done);
    return () => {
      window.removeEventListener("beforeinstallprompt", capture);
      window.removeEventListener("appinstalled", done);
    };
  }, []);
  async function install() {
    if (prompt) {
      await prompt.prompt();
      const result = await prompt.userChoice;
      if (result.outcome === "accepted") setInstalled(true);
      setPrompt(null);
    } else
      setMessage(
        "Open your browser menu and choose “Install app” or “Add to Home Screen”.",
      );
  }
  if (installed) return null;
  return (
    <Card className="install-card">
      <div className="flex items-center gap-3.5">
        <img
          src="/favicon.svg"
          alt="Bill-Z Brand"
          className="w-12 h-12 rounded-xl shadow-sm flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <SectionHeading title="Bill-Z, one tap away" />
          <p className="hint">
            Install Bill-Z for quick access from your home screen.
          </p>
        </div>
      </div>
      <Button
        variant="outline"
        fullWidth
        leftIcon={<DesignIcon screen="dashboard" name="imgDownload" />}
        onClick={() => void install()}
      >
        Install App
      </Button>
      {message && (
        <p className="hint" role="status">
          {message}
        </p>
      )}
    </Card>
  );
}
