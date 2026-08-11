"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";

const navigation = ["ABOUT", "FOUNDATION", "SEASONS", "ARCHIVE", "MANIFESTO"];
const rowCount = 13;
const columnCount = 9;

const accentMatrix = Array.from({ length: rowCount }, () =>
  Array.from({ length: columnCount }, () => "a"),
);

const aeaMatrix = Array.from({ length: rowCount }, (_, row) =>
  Array.from({ length: columnCount }, (_, column) => ["a", "e"][(row + column) % 2]),
);

const crossOffsets = [
  { row: 0, column: 0 },
  { row: -1, column: 0 },
  { row: 1, column: 0 },
  { row: 0, column: -1 },
  { row: 0, column: 1 },
];

const cellKey = (row: number, column: number) => `${row}-${column}`;

export default function Home() {
  const [litCells, setLitCells] = useState<Set<string>>(() => new Set());
  const [blockState, setBlockState] = useState<"none" | "holding" | "revealing">("none");
  const [revealRadius, setRevealRadius] = useState(-1);
  const expiryTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    const timers = expiryTimers.current;
    return () => timers.forEach((timer) => clearTimeout(timer));
  }, []);

  useEffect(() => {
    if (blockState !== "none" || litCells.size !== rowCount * columnCount) return;

    expiryTimers.current.forEach((timer) => clearTimeout(timer));
    expiryTimers.current.clear();
    setLitCells(new Set());
    setBlockState("holding");
  }, [blockState, litCells]);

  useEffect(() => {
    if (blockState !== "holding") return;

    const timer = setTimeout(() => {
      setRevealRadius(0);
      setBlockState("revealing");
    }, 8000);

    return () => clearTimeout(timer);
  }, [blockState]);

  useEffect(() => {
    if (blockState !== "revealing") return;

    const maximumRadius = Math.hypot((rowCount - 1) / 2, (columnCount - 1) / 2);
    if (revealRadius > maximumRadius) {
      setRevealRadius(-1);
      setBlockState("none");
      return;
    }

    const timer = setTimeout(() => setRevealRadius((current) => current + 1), 90);
    return () => clearTimeout(timer);
  }, [blockState, revealRadius]);

  function updatePointerCell(event: ReactPointerEvent<HTMLElement>) {
    if (blockState !== "none") return;

    const bounds = event.currentTarget.getBoundingClientRect();
    const column = Math.min(columnCount - 1, Math.max(0, Math.floor(((event.clientX - bounds.left) / bounds.width) * columnCount)));
    const row = Math.min(rowCount - 1, Math.max(0, Math.floor(((event.clientY - bounds.top) / bounds.height) * rowCount)));

    const crossedCells = crossOffsets
      .map((offset) => ({ row: row + offset.row, column: column + offset.column }))
      .filter((cell) => cell.row >= 0 && cell.row < rowCount && cell.column >= 0 && cell.column < columnCount);

    setLitCells((current) => {
      const next = new Set(current);
      crossedCells.forEach((cell) => next.add(cellKey(cell.row, cell.column)));
      return next;
    });

    crossedCells.forEach((cell) => {
      const key = cellKey(cell.row, cell.column);
      const previousTimer = expiryTimers.current.get(key);
      if (previousTimer) clearTimeout(previousTimer);

      expiryTimers.current.set(
        key,
        setTimeout(() => {
          expiryTimers.current.delete(key);
          setLitCells((current) => {
            if (!current.has(key)) return current;
            const next = new Set(current);
            next.delete(key);
            return next;
          });
        }, 3000),
      );
    });
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
      >
        <div className="accent-grid" data-block={blockState} aria-hidden="true">
          {accentMatrix.map((row, rowIndex) =>
            row.map((letter, columnIndex) => {
              const isActive = litCells.has(cellKey(rowIndex, columnIndex));
              const isRevealed = blockState === "revealing"
                && Math.hypot(rowIndex - (rowCount - 1) / 2, columnIndex - (columnCount - 1) / 2) <= revealRadius;

              return (
                <span
                  className="glyph"
                  data-active={isActive}
                  data-revealed={isRevealed}
                  key={`${rowIndex}-${columnIndex}`}
                >
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
