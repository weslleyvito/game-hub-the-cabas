import React, { useEffect, useState } from "react";

interface Position {
  x: number;
  y: number;
}

const SnakePreview: React.FC = () => {
  const [snake, setSnake] = useState<Position[]>([{ x: 0, y: 0 }]);
  const [direction, setDirection] = useState<Position>({ x: 1, y: 0 });
  const gridSize = 10;

  useEffect(() => {
    const interval = setInterval(() => {
      setSnake((prev) => {
        const head = prev[0];
        const newHead = {
          x: (head.x + direction.x + gridSize) % gridSize,
          y: (head.y + direction.y + gridSize) % gridSize,
        };
        let newSnake = [newHead, ...prev];
        if (newSnake.length > 5) newSnake.pop();
        return newSnake;
      });

      if (Math.random() < 0.3) {
        const dirs = [
          { x: 1, y: 0 },
          { x: -1, y: 0 },
          { x: 0, y: 1 },
          { x: 0, y: -1 },
        ];
        setDirection(dirs[Math.floor(Math.random() * dirs.length)]);
      }
    }, 300);

    return () => clearInterval(interval);
  }, [direction]);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
        gridTemplateRows: `repeat(${gridSize}, 1fr)`,
        gap: "2px",
        backgroundColor: "#222",
        width: "100%",
        maxWidth: "250px", 
        aspectRatio: "1 / 1", // ✅ Mantém formato quadrado sempre
      }}
    >
      {Array.from({ length: gridSize * gridSize }).map((_, i) => {
        const x = i % gridSize;
        const y = Math.floor(i / gridSize);
        const isSnake = snake.some((seg) => seg.x === x && seg.y === y);
        return (
          <div
            key={i}
            style={{
              backgroundColor: isSnake ? "lime" : "black",
              width: "100%",
              height: "100%",
            }}
          />
        );
      })}
    </div>
  );
};

export default SnakePreview;
