import Image from "next/image";

export function Header() {
  return (
    <header className="p-4 sm:p-6">
      <div className="flex items-center gap-3">
        <Image src="/logo.png" alt="Anubis Dog AI" width={32} height={32} />
        <h2 className="text-xl font-bold text-primary-foreground tracking-wide">
          Anubis Dog AI
        </h2>
      </div>
    </header>
  );
}
