import React from "react";
import SnakePreview from "./snakePreviewer";

interface GameCardProps {
  title: string;
  score: number;
  previewer?: React.ReactNode;
  onClick: () => void;
}

const GameCard: React.FC<GameCardProps> = ({
  title,
  score,
  previewer,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      style={{
        width: "300px",
        height: "auto",
        backgroundColor: "#333",
        color: "white",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-around",
        alignItems: "center",
        borderRadius: "10px",
        cursor: "pointer",
        padding: "10px",
        gap: "10px",
         transition: "transform 0.3s ease",   // ← suaviza a animação
      }}
       onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.transform = "scale(1.05)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.transform = "scale(1)";
      }}
    >
      <div style={{ fontSize: "24px" }}>{title}</div>
      <div>Score: {score}</div>
      {previewer ? previewer : <div>Preview not available</div>}
      <div
      // style={{ width: "100px", height: "100px", backgroundColor: "black" }}
      >
        {/* Pode ser um canvas ou outro componente */}
      </div>
    </div>
  );
};

const GameMenu: React.FC<{ startGame: (game: string) => void }> = ({
  startGame,
}) => {
  const games = [
    { title: "Snake", score: 10, previewer: <SnakePreview /> },
    { title: "xadrex", score: 5 },
    { title: "damas", score: 5 },
    { title: "plataforma", score: 5 },
    { title: "luta", score: 5 },
    { title: "Outro Jogo", score: 5 },
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "20px",
        padding: "20px",
        backgroundColor: "#111",
        justifyContent: "center",
        alignContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        minWidth: "100vw",
        color: "white",
      }}
    >
      {games.map((game) => (
        <GameCard
          key={game.title}
          title={game.title}
          score={game.score}
          previewer={game.previewer}
          onClick={() => startGame(game.title)}
        />
      ))}
    </div>
  );
};

export default GameMenu;
