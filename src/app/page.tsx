import { AnubisAvatarGenerator } from "@/components/anubis-avatar-generator";
import { Header } from "@/components/header";
import { Send, LineChart, Twitter, MessageSquareQuote } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground">
            <Header />
            <main className="flex-grow flex flex-col items-center justify-center p-4 sm:p-8">
                <div className="flex flex-col items-center gap-8">
                     <AnubisAvatarGenerator />
                     <div className="w-full max-w-xl text-center">
                        <Link href="/meme-generator">
                            <Button size="lg" className="w-full sm:w-auto px-10 py-6 text-lg">
                                <MessageSquareQuote className="mr-2" />
                                Create a Meme
                            </Button>
                        </Link>
                     </div>
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
