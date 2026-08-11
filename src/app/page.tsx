const accents = ["a", "å", "ä", "æ", "à", "â", "ã"];
const navigation = ["ABOUT", "FOUNDATION", "SEASONS", "ARCHIVE", "MANIFESTO"];
const gridSize = 9;

const accentMatrix = Array.from({ length: gridSize }, (_, row) =>
  Array.from(
    { length: gridSize },
    (_, column) => accents[(row + Math.floor(column / 2)) % accents.length],
  ),
);

const aeaMatrix = Array.from({ length: gridSize }, (_, row) =>
  Array.from({ length: gridSize }, (_, column) => ["a", "e", "a"][(row + column) % 3]),
);

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
          {accentMatrix.map((row, rowIndex) =>
            row.map((letter, columnIndex) => (
              <span className="glyph" key={`${rowIndex}-${columnIndex}`}>
                <span className="accent-letter">{letter}</span>
                <span className="aea-letter">{aeaMatrix[rowIndex][columnIndex]}</span>
              </span>
            )),
          )}
        </div>
      </section>
    </main>
  );
}
