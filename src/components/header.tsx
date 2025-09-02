import { LogoIcon } from "@/components/icons";

export function Header() {
  return (
    <header className="p-4 sm:p-6">
      <div className="flex items-center gap-3">
        <LogoIcon className="w-8 h-8" />
        <h2 className="text-xl font-bold text-primary-foreground tracking-wide">
          Anubis Dog AI
        </h2>
      </div>
    </header>
  );
}
