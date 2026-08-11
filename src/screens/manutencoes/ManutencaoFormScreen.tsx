import React, { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text } from "react-native";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "../../contexts/AuthContext";
import { manutencaoService } from "../../services/manutencao.service";
import { laboratorioService } from "../../services/laboratorio.service";
import { usuarioService } from "../../services/usuario.service";
import { Laboratorio, Usuario } from "../../types";
import { colors, spacing } from "../../theme";
import {
  Botao,
  CampoData,
  CampoSelecao,
  CampoTexto,
  Carregando,
} from "../../components";
import { RootStackScreenProps } from "../../navigation/types";
import { extrairMensagemErro } from "../../services/api";

const esquemaManutencao = z.object({
  descricaoSolicitada: z
    .string()
    .min(10, "A descrição deve ter pelo menos 10 caracteres"),
  tipo: z.enum(["PREVENTIVA", "CORRETIVA"], {
    message: "Selecione o tipo da manutenção",
  }),
  laboratorioId: z
    .number({ message: "Selecione o laboratório" })
    .int()
    .positive("Selecione o laboratório"),
  prazo: z
    .string({ message: "Informe o prazo" })
    .min(1, "Informe o prazo")
    .refine((valor) => new Date(valor) > new Date(), {
      message: "O prazo precisa ser uma data futura",
    }),
  tecnicoResponsavelId: z.string().optional(),
});

type DadosManutencao = z.infer<typeof esquemaManutencao>;

export const ManutencaoFormScreen = ({
  route,
  navigation,
}: RootStackScreenProps<"ManutencaoForm">) => {
  const manutencao = route.params?.manutencao;
  const editando = !!manutencao;
  const { ehCoordenador } = useAuth();

  const [laboratorios, setLaboratorios] = useState<Laboratorio[]>([]);
  const [tecnicos, setTecnicos] = useState<Usuario[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);

  const { control, handleSubmit } = useForm<DadosManutencao>({
    resolver: zodResolver(esquemaManutencao),
    defaultValues: {
      descricaoSolicitada: manutencao?.descricaoSolicitada ?? "",
      tipo: manutencao?.tipo ?? "CORRETIVA",
      laboratorioId:
        manutencao?.laboratorioId ?? manutencao?.LaboratorioManutencao?.id,
      prazo: manutencao?.prazo ?? "",
      tecnicoResponsavelId:
        manutencao?.tecnicoResponsavelId ?? manutencao?.TecnicoResponsavel?.id,
    },
  });

  useEffect(() => {
    const carregarOpcoes = async () => {
      try {
        const [dadosLaboratorios, dadosUsuarios] = await Promise.all([
          laboratorioService.listar(),
          // A API não possui filtro por cargo: filtramos os técnicos no app
          ehCoordenador ? usuarioService.listar() : Promise.resolve([]),
        ]);
        setLaboratorios(dadosLaboratorios);
        setTecnicos(dadosUsuarios.filter((u) => u.cargo === "TECNICO" && u.ativo));
      } catch (e) {
        Alert.alert("Erro", extrairMensagemErro(e));
      } finally {
        setCarregando(false);
      }
    };
    carregarOpcoes();
  }, [ehCoordenador]);

  if (carregando) return <Carregando mensagem="Carregando formulário..." />;

  const aoSalvar = handleSubmit(async (dados) => {
    try {
      setEnviando(true);
      if (editando) {
        await manutencaoService.editar(manutencao.id, {
          descricaoSolicitada: dados.descricaoSolicitada,
          tipo: dados.tipo,
          laboratorioId: dados.laboratorioId,
          prazo: new Date(dados.prazo).toISOString(),
          // Somente o coordenador pode reatribuir o técnico
          ...(ehCoordenador && dados.tecnicoResponsavelId
            ? { tecnicoResponsavelId: dados.tecnicoResponsavelId }
            : {}),
        });
        Alert.alert("Tudo certo", "Manutenção atualizada com sucesso.");
      } else {
        await manutencaoService.criar({
          descricaoSolicitada: dados.descricaoSolicitada,
          tipo: dados.tipo,
          laboratorioId: dados.laboratorioId,
          prazo: new Date(dados.prazo).toISOString(),
        });
        Alert.alert(
          "Solicitação registrada",
          "A manutenção foi criada e um técnico foi atribuído automaticamente."
        );
      }
      navigation.goBack();
    } catch (e) {
      Alert.alert("Erro ao salvar", extrairMensagemErro(e));
    } finally {
      setEnviando(false);
    }
  });

  return (
    <ScrollView
      style={styles.tela}
      contentContainerStyle={styles.conteudo}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.explicacao}>
        {editando
          ? "Atualize os dados da manutenção."
          : "Descreva o problema ou o serviço preventivo desejado. O sistema atribuirá automaticamente o técnico com menos manutenções."}
      </Text>

      <CampoTexto
        control={control}
        name="descricaoSolicitada"
        rotulo="Descrição do problema/serviço"
        placeholder="Ex.: O projetor da sala 12 não liga e apresenta cheiro de queimado."
        multiline
      />

      <CampoSelecao
        control={control}
        name="tipo"
        rotulo="Tipo de manutenção"
        icone="options-outline"
        opcoes={[
          {
            rotulo: "Corretiva",
            valor: "CORRETIVA",
            descricao: "Corrigir um problema existente",
          },
          {
            rotulo: "Preventiva",
            valor: "PREVENTIVA",
            descricao: "Inspeção e prevenção de falhas",
          },
        ]}
      />

      <CampoSelecao
        control={control}
        name="laboratorioId"
        rotulo="Laboratório"
        icone="flask-outline"
        placeholder="Selecione o laboratório"
        opcoes={laboratorios.map((laboratorio) => ({
          rotulo: laboratorio.nome,
          valor: laboratorio.id,
          descricao: laboratorio.descricao ?? undefined,
        }))}
      />

      <CampoData
        control={control}
        name="prazo"
        rotulo="Prazo desejado"
        dataMinima={new Date(Date.now() + 24 * 60 * 60 * 1000)}
      />

      {editando && ehCoordenador && (
        <CampoSelecao
          control={control}
          name="tecnicoResponsavelId"
          rotulo="Técnico responsável"
          icone="build-outline"
          placeholder="Manter técnico atual"
          opcoes={tecnicos.map((tecnico) => ({
            rotulo: tecnico.nome,
            valor: tecnico.id,
            descricao: tecnico.email,
          }))}
        />
      )}

      <Botao
        titulo={editando ? "Salvar alterações" : "Solicitar manutenção"}
        icone={editando ? "save-outline" : "send-outline"}
        onPress={aoSalvar}
        carregando={enviando}
        estilo={{ marginTop: spacing.sm }}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: colors.background,
  },
  conteudo: {
    padding: spacing.md,
    paddingBottom: spacing.xl * 2,
  },
  explicacao: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
});
