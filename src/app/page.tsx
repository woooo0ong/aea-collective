"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";

const rowCount = 13;
const columnCount = 9;
const totalCells = rowCount * columnCount;
const crossOffsets = [
  { row: 0, column: 0 },
  { row: -1, column: 0 },
  { row: 1, column: 0 },
  { row: 0, column: -1 },
  { row: 0, column: 1 },
];
const cellKey = (row: number, column: number) => `${row}-${column}`;
const expansionNames = ["top", "right", "bottom", "left"];

const accentMatrix = Array.from({ length: rowCount }, () =>
  Array.from({ length: columnCount }, () => "a"),
);

const aeaMatrix = Array.from({ length: rowCount }, (_, row) =>
  Array.from({ length: columnCount }, (_, column) => ["a", "e"][(row + column) % 2]),
);

export default function Home() {
  const [litCells, setLitCells] = useState<Set<string>>(() => new Set());
  const [centerFilled, setCenterFilled] = useState(false);
  const [expansionCount, setExpansionCount] = useState(0);
  const expiryTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const lastSector = useRef<number | null>(null);

  useEffect(() => {
    const timers = expiryTimers.current;
    return () => timers.forEach((timer) => clearTimeout(timer));
  }, []);

  useEffect(() => {
    if (centerFilled || litCells.size !== totalCells) return;
    expiryTimers.current.forEach((timer) => clearTimeout(timer));
    expiryTimers.current.clear();
    setLitCells(new Set());
    setCenterFilled(true);
  }, [centerFilled, litCells]);

  function paintCenter(event: ReactPointerEvent<HTMLElement>) {
    if (centerFilled) return;

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
      expiryTimers.current.set(key, setTimeout(() => {
        expiryTimers.current.delete(key);
        setLitCells((current) => {
          if (!current.has(key)) return current;
          const next = new Set(current);
          next.delete(key);
          return next;
        });
      }, 3000));
    });
  }

  function paintOutside(event: ReactPointerEvent<HTMLElement>) {
    if (!centerFilled || expansionCount >= 5) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const sector = Math.min(4, Math.max(0, Math.floor(((event.clientX - bounds.left) / bounds.width) * 5)));
    if (lastSector.current === sector) return;
    lastSector.current = sector;
    setExpansionCount((count) => Math.min(5, count + 1));
  }

  return (
    <main
      className="poster"
      onPointerMove={paintOutside}
      onPointerLeave={() => { lastSector.current = null; }}
    >
      {expansionNames.map((name, index) => (
        <div className={`expansion-block expansion-${name}`} data-visible={expansionCount > index} key={name} />
      ))}
      <div className="full-field" data-visible={expansionCount >= 5} />

      <section
        className="word-mark"
        aria-label="AEA typographic composition"
        onPointerMove={paintCenter}
        onPointerDown={paintCenter}
      >
        <div className="accent-grid" data-center-filled={centerFilled} aria-hidden="true">
          {accentMatrix.map((row, rowIndex) =>
            row.map((letter, columnIndex) => {
              const isActive = litCells.has(cellKey(rowIndex, columnIndex));
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
