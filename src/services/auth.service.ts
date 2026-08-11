import { api } from "./api";
import { TokensAutenticacao, Usuario } from "../types";

export const authService = {
  login: async (email: string, senha: string) => {
    const { data } = await api.post<TokensAutenticacao>("/auth/login", {
      email,
      senha,
    });
    return data;
  },

  verificarToken: async (access: string) => {
    await api.post("/auth/verificar-token", { access });
  },

  buscarUsuarioLogado: async () => {
    const { data } = await api.get<Usuario>("/auth/usuario-logado");
    return data;
  },
};
