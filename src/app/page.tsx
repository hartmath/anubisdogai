import { AnubisAvatarGenerator } from "@/components/anubis-avatar-generator";
import { Header } from "@/components/header";
import { Send, LineChart, Twitter, MessageSquareQuote } from "lucide-react";
import Link from "next/link";


export default function Home() {
    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground">
            <Header />
            <main className="flex-grow flex flex-col items-center justify-center p-4 sm:p-8">
                <div className="flex flex-col items-center gap-8">
                     <AnubisAvatarGenerator />
                     <Link href="/meme-generator" className="group flex flex-col items-center gap-2 text-primary hover:text-primary/80 transition-colors">
                        <MessageSquareQuote className="h-10 w-10" />
                        <span className="font-semibold text-lg">Or create a meme</span>
                     </Link>
                </div>
            </main>
            <footer className="text-center p-6 text-sm text-muted-foreground">
                <div className="flex justify-center gap-4 mb-4">
                    <a
                        href="https://x.com/ctoando"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-primary transition-colors"
                    >
                        <Twitter className="h-5 w-5" />
                        <span className="sr-only">X</span>
                    </a>
                    <a
                        href="http://t.me/andocto"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-primary transition-colors"
                    >
                        <Send className="h-5 w-5" />
                        <span className="sr-only">Telegram</span>
                    </a>
                    <a
                        href="https://www.geckoterminal.com/ton/pools/EQDLTkY_oTODgSiqcrsYcmQ1Jf8XY3PDX3DIXuGD2q2-V6CC"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-primary transition-colors"
                    >
                        <LineChart className="h-5 w-5" />
                        <span className="sr-only">GeckoTerminal</span>
                    </a>
                </div>
                <p>&copy; 2025 Anubis Dog AI. All Rights Reserved.</p>
            </footer>
        </div>
    );
}
