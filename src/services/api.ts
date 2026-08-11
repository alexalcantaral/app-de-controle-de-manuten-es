import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { API_URL } from "../config/env";
import { TokensAutenticacao } from "../types";
import { storage } from "./storage";

export const api = axios.create({
  baseURL: API_URL,
  timeout: 20000,
  // Evita a página de aviso interstitial do localtunnel (loca.lt) sobre requisições JSON.
  headers: { "bypass-tunnel-reminder": "true" },
});

let tokensAtuais: TokensAutenticacao | null = null;
let aoExpirarSessao: (() => void) | null = null;

export const definirTokens = (tokens: TokensAutenticacao | null) => {
  tokensAtuais = tokens;
};

export const registrarCallbackSessaoExpirada = (callback: () => void) => {
  aoExpirarSessao = callback;
};

api.interceptors.request.use((config) => {
  if (tokensAtuais?.access && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${tokensAtuais.access}`;
  }
  return config;
});

let promessaRefresh: Promise<TokensAutenticacao> | null = null;

const atualizarTokens = async (): Promise<TokensAutenticacao> => {
  const { data } = await axios.post<TokensAutenticacao>(
    `${API_URL}/auth/atualizar-token`,
    { refresh: tokensAtuais?.refresh }
  );
  return data;
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const requisicaoOriginal = error.config as InternalAxiosRequestConfig & {
      _tentouRefresh?: boolean;
    };

    const naoAutorizado = error.response?.status === 401;
    const podeTentarRefresh =
      naoAutorizado &&
      tokensAtuais?.refresh &&
      requisicaoOriginal &&
      !requisicaoOriginal._tentouRefresh &&
      !requisicaoOriginal.url?.includes("/auth/");

    if (podeTentarRefresh) {
      requisicaoOriginal._tentouRefresh = true;
      try {
        promessaRefresh = promessaRefresh ?? atualizarTokens();
        const novosTokens = await promessaRefresh;
        promessaRefresh = null;

        tokensAtuais = novosTokens;
        await storage.salvarTokens(novosTokens);

        requisicaoOriginal.headers.Authorization = `Bearer ${novosTokens.access}`;
        return api(requisicaoOriginal);
      } catch {
        promessaRefresh = null;
        await storage.limparSessao();
        aoExpirarSessao?.();
      }
    }

    return Promise.reject(error);
  }
);

/** Extrai uma mensagem legível de um erro de requisição da API. */
export const extrairMensagemErro = (erro: unknown): string => {
  if (axios.isAxiosError(erro)) {
    const dados = erro.response?.data as
      | { message?: string; error?: string }
      | undefined;
    if (dados?.message) return dados.message;
    if (dados?.error) return dados.error;
    if (erro.code === "ECONNABORTED" || erro.message === "Network Error") {
      return "Não foi possível conectar ao servidor. Verifique sua conexão e o endereço da API.";
    }
  }
  return "Ocorreu um erro inesperado. Tente novamente.";
};
