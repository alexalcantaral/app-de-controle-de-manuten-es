import { api } from "./api";
import { Manutencao, StatusManutencao, TipoManutencao } from "../types";

export interface FiltrosManutencao {
  status?: StatusManutencao;
  tipo?: TipoManutencao;
  complemento?: boolean;
}

export interface CriarManutencaoPayload {
  prazo: string; // ISO date string
  tipo: TipoManutencao;
  descricaoSolicitada: string;
  laboratorioId: number;
}

export interface EditarManutencaoPayload extends Partial<CriarManutencaoPayload> {
  status?: StatusManutencao;
  descricaoAposFinalizada?: string | null;
  tecnicoResponsavelId?: string;
}

const paramsDeFiltros = (filtros?: FiltrosManutencao) => ({
  status: filtros?.status,
  tipo: filtros?.tipo,
  complemento: filtros?.complemento ? "true" : "false",
});

export const manutencaoService = {
  /** Lista todas as manutenções (visão geral, usada pelo coordenador). */
  listar: async (filtros?: FiltrosManutencao) => {
    const { data } = await api.get<Manutencao[]>("/manutencao", {
      params: paramsDeFiltros(filtros),
    });
    return data;
  },

  /**
   * Lista apenas as manutenções relacionadas ao usuário logado
   * (solicitadas por ele, ou atribuídas a ele no caso do técnico).
   */
  listarMinhas: async (filtros?: FiltrosManutencao) => {
    const { data } = await api.get<Manutencao[]>("/manutencao/minhas", {
      params: paramsDeFiltros(filtros),
    });
    return data;
  },

  buscarPorId: async (id: number) => {
    const { data } = await api.get<Manutencao>(`/manutencao/${id}`);
    return data;
  },

  criar: async (payload: CriarManutencaoPayload) => {
    const { data } = await api.post<Manutencao>("/manutencao", payload);
    return data;
  },

  editar: async (id: number, payload: EditarManutencaoPayload) => {
    const { data } = await api.patch<Manutencao>(`/manutencao/${id}`, payload);
    return data;
  },

  concluir: async (id: number, descricaoAposFinalizada: string) => {
    const { data } = await api.patch<Manutencao>(`/manutencao/${id}/concluir`, {
      descricaoAposFinalizada,
    });
    return data;
  },

  cancelar: async (id: number) => {
    const { data } = await api.patch<Manutencao>(`/manutencao/${id}/cancelar`);
    return data;
  },

  deletar: async (id: number) => {
    await api.delete(`/manutencao/${id}`);
  },
};
