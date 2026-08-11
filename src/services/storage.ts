import AsyncStorage from "@react-native-async-storage/async-storage";
import { TokensAutenticacao, Usuario } from "../types";

/**
 * Armazenamento interno do dispositivo (AsyncStorage).
 * Guarda a sessão do usuário para manter o login entre aberturas do app.
 */
const CHAVES = {
  TOKENS: "@manutencoes:tokens",
  USUARIO: "@manutencoes:usuario",
};

export const storage = {
  salvarTokens: (tokens: TokensAutenticacao) =>
    AsyncStorage.setItem(CHAVES.TOKENS, JSON.stringify(tokens)),

  buscarTokens: async (): Promise<TokensAutenticacao | null> => {
    const dados = await AsyncStorage.getItem(CHAVES.TOKENS);
    return dados ? JSON.parse(dados) : null;
  },

  salvarUsuario: (usuario: Usuario) =>
    AsyncStorage.setItem(CHAVES.USUARIO, JSON.stringify(usuario)),

  buscarUsuario: async (): Promise<Usuario | null> => {
    const dados = await AsyncStorage.getItem(CHAVES.USUARIO);
    return dados ? JSON.parse(dados) : null;
  },

  limparSessao: () =>
    AsyncStorage.multiRemove([CHAVES.TOKENS, CHAVES.USUARIO]),
};
