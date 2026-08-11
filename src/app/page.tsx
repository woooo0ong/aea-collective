const accents = ["a", "å", "ä", "æ", "à", "â", "ã"];
const navigation = ["ABOUT", "FOUNDATION", "SEASONS", "ARCHIVE", "MANIFESTO"];

export default function Home() {
  return (
    <main className="poster">
      <aside className="strip-shell" aria-label="AEA sections">
        <nav className="editorial-nav" aria-label="Primary navigation">
          {navigation.map((item) => (
            <a href={`#${item.toLowerCase()}`} key={item}>
              {item}
            </a>
          ))}
        </nav>

        <div className="red-strip" aria-hidden="true" />
        <span className="strip-label" aria-hidden="true">
          AEA*
        </span>
      </aside>

      <section className="word-mark" aria-label="AEA typographic composition">
        <div className="accent-grid" aria-hidden="true">
          {accents.map((letter, index) => (
            <span className={`glyph glyph-${index + 1}`} key={letter}>
              <span className="accent-letter">{letter}</span>
              <span className="aea-letter">aea</span>
            </span>
          ))}
        </div>
      </section>
    </main>
  );
}
