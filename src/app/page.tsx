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

const accentMatrix = Array.from({ length: rowCount }, () =>
  Array.from({ length: columnCount }, () => "a"),
);

const aeMatrix = Array.from({ length: rowCount }, (_, row) =>
  Array.from({ length: columnCount }, (_, column) => ["a", "e"][(row + column) % 2]),
);

export default function Home() {
  const [litCells, setLitCells] = useState<Set<string>>(() => new Set());
  const [paintOrder, setPaintOrder] = useState<string[]>([]);
  const [formingBox, setFormingBox] = useState(false);
  const [formedCount, setFormedCount] = useState(0);
  const expiryTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    const timers = expiryTimers.current;
    return () => timers.forEach((timer) => clearTimeout(timer));
  }, []);

  useEffect(() => {
    if (formingBox || litCells.size !== totalCells) return;
    expiryTimers.current.forEach((timer) => clearTimeout(timer));
    expiryTimers.current.clear();
    setFormingBox(true);
  }, [formingBox, litCells]);

  useEffect(() => {
    if (!formingBox || formedCount >= paintOrder.length) return;
    const timer = setTimeout(() => setFormedCount((count) => count + 1), 22);
    return () => clearTimeout(timer);
  }, [formingBox, formedCount, paintOrder.length]);

  function paintGrid(event: ReactPointerEvent<HTMLElement>) {
    if (formingBox) return;

    const bounds = event.currentTarget.getBoundingClientRect();
    const column = Math.min(columnCount - 1, Math.max(0, Math.floor(((event.clientX - bounds.left) / bounds.width) * columnCount)));
    const row = Math.min(rowCount - 1, Math.max(0, Math.floor(((event.clientY - bounds.top) / bounds.height) * rowCount)));
    const crossedCells = crossOffsets
      .map((offset) => ({ row: row + offset.row, column: column + offset.column }))
      .filter((cell) => cell.row >= 0 && cell.row < rowCount && cell.column >= 0 && cell.column < columnCount);

    const keys = crossedCells.map((cell) => cellKey(cell.row, cell.column));
    setLitCells((current) => {
      const next = new Set(current);
      keys.forEach((key) => next.add(key));
      return next;
    });
    setPaintOrder((current) => [...current, ...keys.filter((key) => !current.includes(key))]);

    keys.forEach((key) => {
      const timerKey = `center/${key}`;
      const previousTimer = expiryTimers.current.get(timerKey);
      if (previousTimer) clearTimeout(previousTimer);
      expiryTimers.current.set(timerKey, setTimeout(() => {
        expiryTimers.current.delete(timerKey);
        setLitCells((current) => {
          if (!current.has(key)) return current;
          const next = new Set(current);
          next.delete(key);
          return next;
        });
      }, 3000));
    });
  }

  const formedCells = new Set(paintOrder.slice(0, formedCount));

  return (
    <main className="poster">
      <section
        className="word-mark"
        aria-label="AEA typographic composition"
        onPointerMove={paintGrid}
        onPointerDown={paintGrid}
      >
        <div className="accent-grid" aria-hidden="true">
          {accentMatrix.map((row, rowIndex) =>
            row.map((letter, columnIndex) => {
              const key = cellKey(rowIndex, columnIndex);
              return (
                <span
                  className="glyph"
                  data-active={litCells.has(key)}
                  data-formed={formedCells.has(key)}
                  key={key}
                >
                  <span className="accent-letter">{letter}</span>
                  <span className="aea-letter">{aeMatrix[rowIndex][columnIndex]}</span>
                </span>
              );
            }),
          )}
        </div>
      </section>
    </main>
  );
}
