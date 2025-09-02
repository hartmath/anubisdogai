import { AnubisAvatarGenerator } from "@/components/anubis-avatar-generator";
import { AnubisIcon } from "@/components/icons";

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground p-4 sm:p-8 flex flex-col items-center">
      <div className="w-full max-w-5xl mx-auto flex flex-col items-center text-center gap-6 pt-12 pb-8">
        <div className="flex items-center gap-4 text-primary animate-glow">
          <AnubisIcon className="w-12 h-12 sm:w-16 sm:h-16" />
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-headline font-bold tracking-tighter">
            Anubis Avatar Alchemist
          </h1>
        </div>
        <p className="max-w-3xl text-lg sm:text-xl text-muted-foreground font-body">
          Become part of the pantheon. Unleash your inner deity and transform your profile with the power of AI and ancient Egyptian futurism.
        </p>
      </div>

      <AnubisAvatarGenerator />
    </main>
  );
}
