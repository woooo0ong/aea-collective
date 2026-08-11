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

type Tile = {
  id: string;
  x: number;
  y: number;
  filled: boolean;
  litCells: Set<string>;
};

const cellKey = (row: number, column: number) => `${row}-${column}`;

const accentMatrix = Array.from({ length: rowCount }, () =>
  Array.from({ length: columnCount }, () => "a"),
);

const aeMatrix = Array.from({ length: rowCount }, (_, row) =>
  Array.from({ length: columnCount }, (_, column) => ["a", "e"][(row + column) % 2]),
);

export default function Home() {
  const [tiles, setTiles] = useState<Tile[]>([
    { id: "0:0", x: 0, y: 0, filled: false, litCells: new Set() },
  ]);
  const expiryTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    const timers = expiryTimers.current;
    return () => timers.forEach((timer) => clearTimeout(timer));
  }, []);

  function paintTile(tileId: string, event: ReactPointerEvent<HTMLElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    const column = Math.min(columnCount - 1, Math.max(0, Math.floor(((event.clientX - bounds.left) / bounds.width) * columnCount)));
    const row = Math.min(rowCount - 1, Math.max(0, Math.floor(((event.clientY - bounds.top) / bounds.height) * rowCount)));
    const crossedCells = crossOffsets
      .map((offset) => ({ row: row + offset.row, column: column + offset.column }))
      .filter((cell) => cell.row >= 0 && cell.row < rowCount && cell.column >= 0 && cell.column < columnCount);

    setTiles((current) => current.map((tile) => {
      if (tile.id !== tileId || tile.filled) return tile;
      const nextCells = new Set(tile.litCells);
      crossedCells.forEach((cell) => nextCells.add(cellKey(cell.row, cell.column)));
      return {
        ...tile,
        filled: nextCells.size === totalCells,
        litCells: nextCells.size === totalCells ? new Set() : nextCells,
      };
    }));

    crossedCells.forEach((cell) => {
      const key = `${tileId}/${cellKey(cell.row, cell.column)}`;
      const previousTimer = expiryTimers.current.get(key);
      if (previousTimer) clearTimeout(previousTimer);
      expiryTimers.current.set(key, setTimeout(() => {
        expiryTimers.current.delete(key);
        setTiles((current) => current.map((tile) => {
          if (tile.id !== tileId || tile.filled) return tile;
          const nextCells = new Set(tile.litCells);
          nextCells.delete(cellKey(cell.row, cell.column));
          return { ...tile, litCells: nextCells };
        }));
      }, 3000));
    });
  }

  function growFromTile(tile: Tile, event: ReactPointerEvent<HTMLElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    const relativeX = event.clientX - (bounds.left + bounds.width / 2);
    const relativeY = event.clientY - (bounds.top + bounds.height / 2);
    const horizontal = Math.abs(relativeX) >= Math.abs(relativeY);
    const x = tile.x + (horizontal ? Math.sign(relativeX) || 1 : 0);
    const y = tile.y + (horizontal ? 0 : Math.sign(relativeY) || 1);
    const id = `${x}:${y}`;

    setTiles((current) => (
      current.some((existing) => existing.id === id)
        ? current
        : [...current, { id, x, y, filled: false, litCells: new Set() }]
    ));
  }

  return (
    <main className="poster">
      {tiles.map((tile) => (
        <section
          className="word-mark"
          data-filled={tile.filled}
          key={tile.id}
          style={{ transform: `translate(-50%, -50%) translate(${tile.x * 100}%, ${tile.y * 100}%)` }}
          aria-label={tile.filled ? "Completed AEA block" : "AEA typographic composition"}
          onPointerMove={(event) => {
            if (tile.filled) growFromTile(tile, event);
            else paintTile(tile.id, event);
          }}
          onPointerDown={(event) => {
            if (!tile.filled) paintTile(tile.id, event);
          }}
        >
          <div className="accent-grid" aria-hidden="true">
            {accentMatrix.map((row, rowIndex) =>
              row.map((letter, columnIndex) => {
                const isActive = tile.litCells.has(cellKey(rowIndex, columnIndex));
                return (
                  <span className="glyph" data-active={isActive} key={`${rowIndex}-${columnIndex}`}>
                    <span className="accent-letter">{letter}</span>
                    <span className="aea-letter">{aeMatrix[rowIndex][columnIndex]}</span>
                  </span>
                );
              }),
            )}
          </div>
        </section>
      ))}
    </main>
  );
}
