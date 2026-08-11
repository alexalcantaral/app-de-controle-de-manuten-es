import { api } from "./api";
import { InstituicaoEnsino } from "../types";

export interface InstituicaoPayload {
  nome: string;
  cnpj: string;
  latitude: number;
  longitude: number;
}

export const instituicaoService = {
  listar: async () => {
    const { data } = await api.get<InstituicaoEnsino[]>("/instituicao-ensino");
    return data;
  },

  buscarPorId: async (id: number) => {
    const { data } = await api.get<InstituicaoEnsino>(
      `/instituicao-ensino/${id}`
    );
    return data;
  },

  criar: async (payload: InstituicaoPayload) => {
    const { data } = await api.post<InstituicaoEnsino>(
      "/instituicao-ensino",
      payload
    );
    return data;
  },

  editar: async (id: number, payload: Partial<InstituicaoPayload>) => {
    const { data } = await api.patch<InstituicaoEnsino>(
      `/instituicao-ensino/${id}`,
      payload
    );
    return data;
  },

  deletar: async (id: number) => {
    await api.delete(`/instituicao-ensino/${id}`);
  },
};
