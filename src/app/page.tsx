import { AnubisAvatarGenerator } from "@/components/anubis-avatar-generator";
import { Header } from "@/components/header";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-grow flex flex-col items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-5xl mx-auto flex flex-col items-center text-center gap-8">
          <div className="flex flex-col items-center gap-4">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-headline font-bold tracking-tighter text-primary">
              Create Your Anubis Dog AI Avatar
            </h1>
            <p className="max-w-xl text-lg sm:text-xl text-muted-foreground font-body">
              Upload your photo to get started. The AI will generate a new avatar in the Anubis style.
            </p>
          </div>
          <AnubisAvatarGenerator />
        </div>
      </main>
      <footer className="text-center p-4 text-sm text-muted-foreground">
        Edit with Lovable
      </footer>
    </div>
  );
}
