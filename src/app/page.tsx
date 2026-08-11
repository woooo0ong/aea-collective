"use client";

import { useState, type PointerEvent as ReactPointerEvent } from "react";

const accents = ["a", "å", "ä", "æ", "à", "â", "ã"];
const navigation = ["ABOUT", "FOUNDATION", "SEASONS", "ARCHIVE", "MANIFESTO"];
const rowCount = 9;
const columnCount = 13;

const accentMatrix = Array.from({ length: rowCount }, (_, row) =>
  Array.from(
    { length: columnCount },
    (_, column) => accents[(row + Math.floor(column / 2)) % accents.length],
  ),
);

const aeaMatrix = Array.from({ length: rowCount }, (_, row) =>
  Array.from({ length: columnCount }, (_, column) => ["A", "E", "A"][(row + column) % 3]),
);

export default function Home() {
  const [pointerCell, setPointerCell] = useState<{ row: number; column: number } | null>(null);

  function updatePointerCell(event: ReactPointerEvent<HTMLElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    const column = Math.min(columnCount - 1, Math.max(0, Math.floor(((event.clientX - bounds.left) / bounds.width) * columnCount)));
    const row = Math.min(rowCount - 1, Math.max(0, Math.floor(((event.clientY - bounds.top) / bounds.height) * rowCount)));

    setPointerCell((current) =>
      current?.row === row && current.column === column ? current : { row, column },
    );
  }

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

      <section
        className="word-mark"
        aria-label="AEA typographic composition"
        onPointerMove={updatePointerCell}
        onPointerDown={updatePointerCell}
        onPointerLeave={() => setPointerCell(null)}
      >
        <div className="accent-grid" aria-hidden="true">
          {accentMatrix.map((row, rowIndex) =>
            row.map((letter, columnIndex) => {
              const isActive = pointerCell !== null
                && Math.hypot(rowIndex - pointerCell.row, columnIndex - pointerCell.column) <= 1.65;

              return (
                <span className="glyph" data-active={isActive} key={`${rowIndex}-${columnIndex}`}>
                  <span className="accent-letter">{letter}</span>
                  <span className="aea-letter">{aeaMatrix[rowIndex][columnIndex]}</span>
                </span>
              );
            }),
          )}
        </div>
      </section>
    </main>
  );
}
