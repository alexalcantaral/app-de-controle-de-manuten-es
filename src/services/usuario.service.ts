import { api } from "./api";
import { Cargo, Usuario } from "../types";

export interface CriarUsuarioPayload {
  nome: string;
  cargo: Cargo;
  email: string;
  senha: string;
  instituicaoId: number | null;
  ativo?: boolean;
}

export type EditarUsuarioPayload = Partial<CriarUsuarioPayload>;

export const usuarioService = {
  listar: async (search?: string, inativos?: boolean, cargo?: Cargo) => {
    const { data } = await api.get<Usuario[]>("/user", {
      params: {
        search: search || undefined,
        inativos: inativos ? "true" : "false",
        cargo: cargo || undefined,
      },
    });
    return data;
  },

  buscarPorId: async (id: string) => {
    const { data } = await api.get<Usuario>(`/user/${id}`);
    return data;
  },

  criar: async (payload: CriarUsuarioPayload) => {
    const { data } = await api.post<Usuario>("/user", payload);
    return data;
  },

  editar: async (id: string, payload: EditarUsuarioPayload) => {
    const { data } = await api.patch<Usuario>(`/user/${id}`, payload);
    return data;
  },
};
