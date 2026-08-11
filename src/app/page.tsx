export default function Home() {
  return (
    <main className="min-h-screen bg-white text-black flex items-center justify-center px-6">
      <div className="text-center space-y-6">
        <h1 className="text-5xl md:text-7xl font-semibold tracking-tight">
          AEA*
        </h1>

        <p className="text-sm md:text-base tracking-[0.2em] uppercase">
          The Anti-Establishment Artists* Collective
        </p>

        <p className="text-lg md:text-xl italic">Art* Before Industry</p>

        <button className="mt-10 border border-black px-6 py-3 text-sm tracking-[0.2em] uppercase hover:bg-black hover:text-white transition-colors duration-300">
          Enter
        </button>
      </div>
    </main>
  );
}
