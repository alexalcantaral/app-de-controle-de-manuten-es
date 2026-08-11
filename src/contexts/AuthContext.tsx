import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Cargo, Usuario } from "../types";
import { authService } from "../services/auth.service";
import {
  definirTokens,
  registrarCallbackSessaoExpirada,
} from "../services/api";
import { storage } from "../services/storage";

interface AuthContextData {
  usuario: Usuario | null;
  carregandoSessao: boolean;
  autenticado: boolean;
  cargo: Cargo | null;
  ehCoordenador: boolean;
  ehProfessor: boolean;
  ehTecnico: boolean;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => Promise<void>;
  atualizarUsuario: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregandoSessao, setCarregandoSessao] = useState(true);

  const logout = useCallback(async () => {
    definirTokens(null);
    await storage.limparSessao();
    setUsuario(null);
  }, []);

  // Restaura a sessão salva no armazenamento interno ao abrir o app
  useEffect(() => {
    registrarCallbackSessaoExpirada(() => setUsuario(null));

    const restaurarSessao = async () => {
      try {
        const tokens = await storage.buscarTokens();
        if (!tokens) return;

        definirTokens(tokens);

        const usuarioSalvo = await storage.buscarUsuario();
        if (usuarioSalvo) setUsuario(usuarioSalvo);

        // Revalida com a API (o interceptor renova o token se necessário)
        const usuarioAtualizado = await authService.buscarUsuarioLogado();
        setUsuario(usuarioAtualizado);
        await storage.salvarUsuario(usuarioAtualizado);
      } catch {
        // Sessão inválida e não renovável: exige novo login
        await logout();
      } finally {
        setCarregandoSessao(false);
      }
    };

    restaurarSessao();
  }, [logout]);

  const login = useCallback(async (email: string, senha: string) => {
    const tokens = await authService.login(email, senha);
    definirTokens(tokens);
    await storage.salvarTokens(tokens);

    const usuarioLogado = await authService.buscarUsuarioLogado();
    setUsuario(usuarioLogado);
    await storage.salvarUsuario(usuarioLogado);
  }, []);

  const atualizarUsuario = useCallback(async () => {
    const usuarioAtualizado = await authService.buscarUsuarioLogado();
    setUsuario(usuarioAtualizado);
    await storage.salvarUsuario(usuarioAtualizado);
  }, []);

  const valor = useMemo<AuthContextData>(
    () => ({
      usuario,
      carregandoSessao,
      autenticado: !!usuario,
      cargo: usuario?.cargo ?? null,
      ehCoordenador: usuario?.cargo === "COORDENADOR",
      ehProfessor: usuario?.cargo === "PROFESSOR",
      ehTecnico: usuario?.cargo === "TECNICO",
      login,
      logout,
      atualizarUsuario,
    }),
    [usuario, carregandoSessao, login, logout, atualizarUsuario]
  );

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const contexto = useContext(AuthContext);
  if (!contexto || Object.keys(contexto).length === 0) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return contexto;
};
