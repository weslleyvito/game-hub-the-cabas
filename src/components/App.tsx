import axios from "axios";
import { jwtDecode } from "jwt-decode";
import React, { useEffect, useState } from "react";
import GameBoard from "./GameBoard";
import GameMenu from "./gameCardsProps";

interface User {
  id: number;
  email_user: string;
  password?: string;
  name_user?: string;
}

interface DecodedToken {
  user_id: number;
  email_user: string;
  name_user?: string;
  score: number;
  // Adicione outros campos conforme sua API
}

const App: React.FC = () => {
  const [currentGame, setCurrentGame] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loginError, setLoginError] = useState("");
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerError, setRegisterError] = useState("");
  const [registerSuccess, setRegisterSuccess] = useState("");

  const api = axios.create({
    baseURL: "http://26.206.194.14:8000/",
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Dados que seriam buscados após login
  const [users, setUsers] = useState<User[]>([]);

  const handleLogin = async () => {
    try {
      const response = await api.post("/token-auth/", {
        email_user: email,
        password: senha,
      });
      console.log("Login bem-sucedido:", response.data);
      const token = response.data.access;

      // Salva o token para próximas requisições
      api.defaults.headers.common["Authorization"] = `Token ${token}`;
      setIsLoggedIn(true);
      setLoginError("");

      // Decodifica o token para extrair dados do usuário
      const decoded: DecodedToken = jwtDecode(token);
      console.log("Token decodificado:", decoded);

      // opcional: salvar token no localStorage
      localStorage.setItem("authToken", token);
      setUsers([
        {
          id: decoded.user_id,
          email_user: decoded.email_user,
          name_user: decoded.name_user,
        },
      ]);

      console.log;
    } catch (error: any) {
      console.error("Erro ao fazer login:", error);
      setLoginError("Email ou senha inválidos.");
    }
  };

  const handleRegister = async () => {
    try {
      const response = await api.post('user/create-no-auth/', {
        id: null,
        email_user: registerEmail,
        password: registerPassword,
        name_user: registerName,
      });
      console.log('api', api);
      setRegisterSuccess("Cadastro realizado com sucesso!");
      setRegisterError("");

      // Limpa os campos e fecha o modal após 2s
      setTimeout(() => {
        setShowRegisterModal(false);
        setRegisterEmail("");
        setRegisterPassword("");
        setRegisterName("");
        setRegisterSuccess("");
      }, 2000);
    } catch (error: any) {
      console.error("Erro ao cadastrar:", error.response.data);
      setRegisterError("Erro ao cadastrar. Verifique os dados.");
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setEmail("");
    setSenha("");
    setCurrentGame(null);
  };

  useEffect(() => {
    if (isLoggedIn) {
      // api
      //   .get("/usuarios/") // ou o endpoint certo para sua lista de usuários
      //   .then((res) => {
      //     setUsers(res.data);
      //     setLoading(false);
      //   })
      //   .catch((err) => {
      //     console.error("Erro ao buscar usuários:", err);
      //     setLoading(false);
      //   });
    }
  }, [isLoggedIn]);

  const handleStartGame = (game: string) => {
    setCurrentGame(game);
  };

  const handleBackToMenu = () => {
    setCurrentGame(null);
  };

  if (!isLoggedIn) {
    return (
      <div
        style={{
          background: "#111",
          minHeight: "100vh",
          color: "#fff",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <h2>Login</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: "10px", marginBottom: "10px", width: "250px" }}
        />
        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          style={{ padding: "10px", marginBottom: "10px", width: "250px" }}
        />
        <button onClick={handleLogin} style={{ padding: "10px 20px" }}>
          Entrar
        </button>
        <button
          onClick={() => setShowRegisterModal(true)}
          style={{ marginTop: "10px" }}
        >
          Cadastrar
        </button>

        {loginError && (
          <p style={{ color: "red", marginTop: "10px" }}>{loginError}</p>
        )}

        {showRegisterModal && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 999,
            }}
          >
            <div
              style={{
                backgroundColor: "#222",
                padding: "30px",
                borderRadius: "10px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "10px",
                width: "300px",
                color: "#fff",
              }}
            >
              <h3>Cadastrar</h3>
              <input
                placeholder="Nome"
                value={registerName}
                onChange={(e) => setRegisterName(e.target.value)}
                style={{ padding: "10px", marginBottom: "10px", width: "100%" }}
              />
              <input
                placeholder="Email"
                type="email"
                value={registerEmail}
                onChange={(e) => setRegisterEmail(e.target.value)}
                style={{ padding: "10px", marginBottom: "10px", width: "100%" }}
              />
              <input
                placeholder="Senha"
                type="password"
                value={registerPassword}
                onChange={(e) => setRegisterPassword(e.target.value)}
                style={{ padding: "10px", marginBottom: "10px", width: "100%" }}
              />
              <button
                onClick={handleRegister}
                style={{ padding: "10px 20px", width: "100%" }}
              >
                Cadastrar
              </button>
              <button
                onClick={() => setShowRegisterModal(false)}
                style={{ marginTop: "10px", width: "100%" }}
              >
                Cancelar
              </button>
              {registerError && (
                <p style={{ color: "red", marginTop: "10px" }}>
                  {registerError}
                </p>
              )}
              {registerSuccess && (
                <p style={{ color: "green", marginTop: "10px" }}>
                  {registerSuccess}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Tela principal (depois do login)
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#000",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 20,
          left: 20,
          backgroundColor: "#222",
          padding: "8px 16px",
          borderRadius: "8px",
          fontSize: "14px",
        }}
      >
        👤 {users[0]?.name_user}
      </div>

      <button
        onClick={handleLogout}
        style={{ position: "absolute", top: 20, right: 20 }}
      >
        Logout
      </button>

      {!currentGame ? (
        <>
          <GameMenu startGame={handleStartGame} />
          {}
        </>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            minWidth: "100vw",
          }}
        >
          <button
            onClick={handleBackToMenu}
            style={{
              margin: "20px",
              padding: "10px 20px",
              fontSize: "16px",
              cursor: "pointer",
            }}
          >
            Voltar ao Menu
          </button>
          {currentGame === "Snake" && <GameBoard />}
        </div>
      )}
    </div>
  );
};

export default App;
