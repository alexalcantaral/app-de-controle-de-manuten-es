import { api } from "./api";
import { ImagemManutencao } from "../types";

export interface ArquivoUpload {
  uri: string;
  nome: string;
  mimetype: string;
}

const montarFormData = (arquivos: ArquivoUpload[]) => {
  const formData = new FormData();
  arquivos.forEach((arquivo) => {
    formData.append("files", {
      uri: arquivo.uri,
      name: arquivo.nome,
      type: arquivo.mimetype,
    } as unknown as Blob);
  });
  return formData;
};

export const imagemService = {
  listarDeManutencao: async (idManutencao: number) => {
    const { data } = await api.get<ImagemManutencao[]>(
      `/imagem/manutencao/${idManutencao}`
    );
    return data;
  },

  upload: async (idManutencao: number, arquivos: ArquivoUpload[]) => {
    const { data } = await api.post<ImagemManutencao[]>(
      `/imagem/manutencao/${idManutencao}`,
      montarFormData(arquivos),
      { headers: { "Content-Type": "multipart/form-data" }, timeout: 60000 }
    );
    return data;
  },

  atualizar: async (idImagem: number, arquivo: ArquivoUpload) => {
    const { data } = await api.patch<ImagemManutencao>(
      `/imagem/${idImagem}/manutencao`,
      montarFormData([arquivo]),
      { headers: { "Content-Type": "multipart/form-data" }, timeout: 60000 }
    );
    return data;
  },

  deletar: async (idImagem: number) => {
    await api.delete(`/imagem/${idImagem}/manutencao`);
  },
};
