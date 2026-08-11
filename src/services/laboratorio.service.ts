import { api } from "./api";
import { Laboratorio } from "../types";

export interface LaboratorioPayload {
  nome: string;
  descricao?: string | null;
  responsavelId: string;
}

export const laboratorioService = {
  listar: async () => {
    const { data } = await api.get<Laboratorio[]>("/laboratorios");
    return data;
  },

  buscarPorId: async (id: number) => {
    const { data } = await api.get<Laboratorio>(`/laboratorios/${id}`);
    return data;
  },

  criar: async (payload: LaboratorioPayload) => {
    const { data } = await api.post<Laboratorio>("/laboratorios", payload);
    return data;
  },

  editar: async (id: number, payload: Partial<LaboratorioPayload>) => {
    const { data } = await api.put<Laboratorio>(`/laboratorios/${id}`, payload);
    return data;
  },

  deletar: async (id: number) => {
    await api.delete(`/laboratorios/${id}`);
  },
};
