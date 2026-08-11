import React, { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text } from "react-native";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { laboratorioService } from "../../services/laboratorio.service";
import { usuarioService } from "../../services/usuario.service";
import { Usuario } from "../../types";
import { colors, spacing } from "../../theme";
import {
  Botao,
  CampoSelecao,
  CampoTexto,
  Carregando,
} from "../../components";
import { RootStackScreenProps } from "../../navigation/types";
import { extrairMensagemErro } from "../../services/api";

const esquemaLaboratorio = z.object({
  nome: z
    .string()
    .min(3, "O nome deve ter pelo menos 3 caracteres")
    .max(50, "O nome deve ter no máximo 50 caracteres"),
  descricao: z.string().optional(),
  responsavelId: z
    .string({ message: "Selecione o responsável" })
    .uuid("Selecione o responsável"),
});

type DadosLaboratorio = z.infer<typeof esquemaLaboratorio>;

export const LaboratorioFormScreen = ({
  route,
  navigation,
}: RootStackScreenProps<"LaboratorioForm">) => {
  const laboratorio = route.params?.laboratorio;
  const editando = !!laboratorio;

  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);

  const { control, handleSubmit } = useForm<DadosLaboratorio>({
    resolver: zodResolver(esquemaLaboratorio),
    defaultValues: {
      nome: laboratorio?.nome ?? "",
      descricao: laboratorio?.descricao ?? "",
      responsavelId: laboratorio?.responsavelId,
    },
  });

  useEffect(() => {
    usuarioService
      .listar()
      .then((dados) => setUsuarios(dados.filter((u) => u.ativo)))
      .catch((e) => Alert.alert("Erro", extrairMensagemErro(e)))
      .finally(() => setCarregando(false));
  }, []);

  if (carregando) return <Carregando mensagem="Carregando formulário..." />;

  const aoSalvar = handleSubmit(async (dados) => {
    try {
      setEnviando(true);
      const payload = {
        nome: dados.nome,
        descricao: dados.descricao?.trim() ? dados.descricao.trim() : null,
        responsavelId: dados.responsavelId,
      };
      if (editando) {
        await laboratorioService.editar(laboratorio.id, payload);
        Alert.alert("Tudo certo", "Laboratório atualizado com sucesso.");
      } else {
        await laboratorioService.criar(payload);
        Alert.alert("Tudo certo", "Laboratório cadastrado com sucesso.");
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
          ? "Atualize as informações do laboratório."
          : "Cadastre um laboratório e defina o usuário responsável por ele."}
      </Text>

      <CampoTexto
        control={control}
        name="nome"
        rotulo="Nome do laboratório"
        placeholder="Ex.: Laboratório de Redes"
        icone="flask-outline"
      />

      <CampoTexto
        control={control}
        name="descricao"
        rotulo="Descrição (opcional)"
        placeholder="Ex.: Bloco B, sala 12 — 20 computadores"
        multiline
      />

      <CampoSelecao
        control={control}
        name="responsavelId"
        rotulo="Responsável"
        icone="person-outline"
        placeholder="Selecione o responsável"
        opcoes={usuarios.map((usuario) => ({
          rotulo: usuario.nome,
          valor: usuario.id,
          descricao: usuario.email,
        }))}
      />

      <Botao
        titulo={editando ? "Salvar alterações" : "Cadastrar laboratório"}
        icone="save-outline"
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
