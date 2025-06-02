import axios from "axios";
import { jwtDecode } from "jwt-decode";
import React, { useEffect, useState } from "react";
import { generateFood } from "./Food";
import type { Position } from "./Snake";
import { checkCollision, growSnake, moveSnake } from "./Snake";

const gridSize = 20;
const gridWidth = gridSize * 2;
const gridHeight = gridSize;
let score = 0;

// interface score_game {
//   user: number;
//   score: number;
//   type_score: string;
// }
type DecodedToken = {
  user_id: number;
  // add other properties if needed
};

const GameBoard: React.FC = () => {
  // estados
  const [snake, setSnake] = useState<Position[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Position>(
    generateFood(gridWidth, gridHeight, snake)
  );
  const [direction, setDirection] = useState<Position>({ x: 0, y: 0 });
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [snakeColor, setSnakeColor] = useState("#00FF00");
  const [showSettings, setShowSettings] = useState(false);
  const [showRanking, setShowRanking] = useState(false);
  const [topScores, setTopScores] = useState<any[]>([]);
  const [scoreSent, setScoreSent] = useState(false);

  const api = axios.create({
    baseURL: "http://26.206.194.14:8000/",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const fetchTopScores = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        console.error("Token não encontrado.");
        return;
      }

      const response = await api.get("score-user/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          type: "cobrinha",
        },
      });
      setTopScores(response.data.results);
      console.log("Top scores fetched:", response);
    } catch (error) {
      console.error("Erro ao buscar ranking:", error);
    }
  };

  const openRanking = () => {
    fetchTopScores();
    setShowRanking(true);
    setIsPaused(true);
  };

  const closeRanking = () => {
    setShowRanking(false);
    setIsPaused(false);
  };

  const sendScoreToAPI = async (score: number) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        console.error("Token não encontrado.");
        return;
      }

      const decoded = jwtDecode<DecodedToken>(token);
      const userId = decoded.user_id;

      await api.post(
        "score-user/create/",
        {
          user: userId,
          score: score,
          type_score: "cobrinha",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Score enviado com sucesso!");
    } catch (error: any) {
      console.error("Erro ao enviar score:", error.response?.data || error);
    }
  };

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState !== "visible") {
        setIsPaused(true);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === " ") {
        setIsPaused((prev) => !prev);
      }
      if (isPaused || gameOver || showSettings) return;

      switch (e.key) {
        case "ArrowUp":
          setDirection({ x: 0, y: -1 });
          break;
        case "ArrowDown":
          setDirection({ x: 0, y: 1 });
          break;
        case "ArrowLeft":
          setDirection({ x: -1, y: 0 });
          break;
        case "ArrowRight":
          setDirection({ x: 1, y: 0 });
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPaused, gameOver, showSettings]);

  useEffect(() => {
    if (gameOver && !scoreSent) {
      sendScoreToAPI(score);
      setScoreSent(true);
    }
  }, [gameOver, scoreSent, score]);

  useEffect(() => {
    if (gameOver || isPaused || showSettings) return;

    const interval = setInterval(() => {
      setSnake((prevSnake) => {
        const newSnake = moveSnake(prevSnake, direction);
        const head = newSnake[0];

        if (
          head.x < 0 ||
          head.x >= gridWidth ||
          head.y < 0 ||
          head.y >= gridHeight ||
          checkCollision(newSnake)
        ) {
          setGameOver(true);
          return prevSnake;
        }

        if (head.x === food.x && head.y === food.y) {
          const grownSnake = growSnake(newSnake);
          setFood(generateFood(gridWidth, gridHeight, grownSnake));
          score = grownSnake.length - 1;
          return grownSnake;
        }

        return newSnake;
      });
    }, 200);

    return () => clearInterval(interval);
  }, [direction, food, gameOver, isPaused, showSettings]);

  const resetGame = () => {
    setSnake([{ x: 10, y: 10 }]);
    setFood(generateFood(gridWidth, gridHeight, snake));
    setDirection({ x: 0, y: 0 });
    setGameOver(false);
    score = 0;
    setIsPaused(false);
    setScoreSent(false);
  };

  const openSettings = () => {
    setIsPaused(true);
    setShowSettings(true);
  };

  const closeSettings = () => {
    setShowSettings(false);
    setIsPaused(false);
  };

  return (
    <div
      style={{
        minWidth: "1200px",
        minHeight: "750px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#222",
        color: "#fff",
        textAlign: "center",
      }}
    >
      <h2>
        {gameOver
          ? "Game Over 😵"
          : isPaused || showSettings
          ? "Pausado ⏸️"
          : "Jogo em andamento 🐍"}{" "}
        | Pontuação: {score}
      </h2>

      <div style={{ margin: "10px" }}>
        <button
          onClick={resetGame}
          disabled={!gameOver}
          style={{ marginRight: "10px", padding: "10px 20px" }}
        >
          Reiniciar
        </button>

        <button
          onClick={() => setIsPaused((prev) => !prev)}
          disabled={gameOver || showSettings}
          style={{ marginRight: "10px", padding: "10px 20px" }}
        >
          {isPaused ? "Continuar ▶️" : "Pausar ⏸️"}
        </button>

        <button
          onClick={openSettings}
          disabled={gameOver}
          style={{ padding: "10px 20px" }}
        >
          Configurações ⚙️
        </button>

        <button
          onClick={openRanking}
          // disabled={gameOver || showSettings}
          style={{ padding: "10px 20px" }}
        >
          Ranking 🏆
        </button>
      </div>

      {/* Pop-up Ranking */}
      {showRanking && (
        <div
          style={{
            position: "fixed",
            top: "30%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "#444",
            padding: "30px",
            borderRadius: "10px",
            zIndex: 1000,
            color: "white",
            minWidth: "300px",
          }}
        >
          <h3>Top 10 Pontuações</h3>
          <ol style={{ textAlign: "left" }}>
            {topScores.length === 0 && <li>Carregando...</li>}
            {topScores.map((entry, index) => (
              <li key={index}>
                {entry.user.name_user} : {entry.score} {entry.score > 1 ? 'pontos' : 'ponto'}
              </li>
            ))}
          </ol>
          <button
            onClick={closeRanking}
            style={{ padding: "10px 20px", marginTop: "10px" }}
          >
            Fechar
          </button>
        </div>
      )}

      {showSettings && (
        <div
          style={{
            position: "fixed",
            top: "30%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "#444",
            padding: "30px",
            borderRadius: "10px",
            zIndex: 1000,
          }}
        >
          <h3>Configurações</h3>
          <div style={{ margin: "10px 0" }}>
            <label>Cor da Cobra: </label>
            <input
              type="color"
              value={snakeColor}
              onChange={(e) => setSnakeColor(e.target.value)}
              style={{ marginLeft: "10px" }}
            />
          </div>
          <button
            onClick={closeSettings}
            style={{ padding: "10px 20px", marginTop: "10px" }}
          >
            Salvar e Voltar
          </button>
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${gridWidth}, 20px)`,
          gridTemplateRows: `repeat(${gridHeight}, 20px)`,
          gap: "1px",
          backgroundColor: "#333",
          padding: "10px",
        }}
      >
        {Array.from({ length: gridWidth * gridHeight }).map((_, i) => {
          const x = i % gridWidth;
          const y = Math.floor(i / gridWidth);
          const isSnake = snake.some((seg) => seg.x === x && seg.y === y);
          const isFood = food.x === x && food.y === y;
          const isHead = snake[0].x === x && snake[0].y === y;

          return (
            <div
              key={i}
              style={{
                width: "20px",
                height: "20px",
                backgroundColor: isSnake
                  ? snakeColor
                  : isFood
                  ? "red"
                  : "black",
                position: "relative",
              }}
            >
              {isHead && (
                <>
                  {direction.x === 1 && (
                    <>
                      <div
                        style={{
                          width: "4px",
                          height: "4px",
                          backgroundColor: "black",
                          borderRadius: "50%",
                          position: "absolute",
                          top: "4px",
                          right: "4px",
                        }}
                      />
                      <div
                        style={{
                          width: "4px",
                          height: "4px",
                          backgroundColor: "black",
                          borderRadius: "50%",
                          position: "absolute",
                          bottom: "4px",
                          right: "4px",
                        }}
                      />
                    </>
                  )}
                  {direction.x === -1 && (
                    <>
                      <div
                        style={{
                          width: "4px",
                          height: "4px",
                          backgroundColor: "black",
                          borderRadius: "50%",
                          position: "absolute",
                          top: "4px",
                          left: "4px",
                        }}
                      />
                      <div
                        style={{
                          width: "4px",
                          height: "4px",
                          backgroundColor: "black",
                          borderRadius: "50%",
                          position: "absolute",
                          bottom: "4px",
                          left: "4px",
                        }}
                      />
                    </>
                  )}
                  {direction.y === 1 && (
                    <>
                      <div
                        style={{
                          width: "4px",
                          height: "4px",
                          backgroundColor: "black",
                          borderRadius: "50%",
                          position: "absolute",
                          bottom: "4px",
                          left: "4px",
                        }}
                      />
                      <div
                        style={{
                          width: "4px",
                          height: "4px",
                          backgroundColor: "black",
                          borderRadius: "50%",
                          position: "absolute",
                          bottom: "4px",
                          right: "4px",
                        }}
                      />
                    </>
                  )}
                  {direction.y === -1 && (
                    <>
                      <div
                        style={{
                          width: "4px",
                          height: "4px",
                          backgroundColor: "black",
                          borderRadius: "50%",
                          position: "absolute",
                          top: "4px",
                          left: "4px",
                        }}
                      />
                      <div
                        style={{
                          width: "4px",
                          height: "4px",
                          backgroundColor: "black",
                          borderRadius: "50%",
                          position: "absolute",
                          top: "4px",
                          right: "4px",
                        }}
                      />
                    </>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GameBoard;
