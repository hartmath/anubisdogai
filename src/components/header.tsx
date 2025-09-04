import Image from "next/image";
import Link from "next/link";

export function Header() {
    return (
        <header className="p-4 sm:p-6">
            <Link href="/" className="flex items-center gap-3">
                <Image src="/logo.png" alt="Anubis Dog AI" width={40} height={40} />
                <h2 className="text-lg font-bold text-primary tracking-wide font-headline">
                    Anubis Dog AI
                </h2>
            </Link>
        </header>
    );
}
