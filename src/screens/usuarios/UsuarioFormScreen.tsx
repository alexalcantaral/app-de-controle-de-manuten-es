import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { usuarioService } from "../../services/usuario.service";
import { instituicaoService } from "../../services/instituicao.service";
import { Cargo, InstituicaoEnsino } from "../../types";
import { colors, spacing } from "../../theme";
import {
  Botao,
  CampoSelecao,
  CampoTexto,
  Carregando,
} from "../../components";
import { RootStackScreenProps } from "../../navigation/types";
import { extrairMensagemErro } from "../../services/api";

const esquemaBase = z.object({
  nome: z
    .string()
    .min(3, "O nome deve ter pelo menos 3 caracteres")
    .max(50, "O nome deve ter no máximo 50 caracteres"),
  email: z.string().min(1, "Informe o e-mail").email("E-mail inválido"),
  cargo: z.enum(["COORDENADOR", "PROFESSOR", "TECNICO"], {
    message: "Selecione o cargo",
  }),
  instituicaoId: z.number().nullable().optional(),
  senha: z.string(),
});

const esquemaCriar = esquemaBase.refine(
  (dados) => dados.senha.length >= 8,
  { message: "A senha deve ter pelo menos 8 caracteres", path: ["senha"] }
);

// Na edição a senha é opcional: vazia mantém a atual
const esquemaEditar = esquemaBase.refine(
  (dados) => dados.senha.length === 0 || dados.senha.length >= 8,
  {
    message: "Se informada, a senha deve ter pelo menos 8 caracteres",
    path: ["senha"],
  }
);

type DadosUsuario = z.infer<typeof esquemaBase>;

const OPCOES_CARGO: { rotulo: string; valor: Cargo; descricao: string }[] = [
  {
    rotulo: "Professor(a)",
    valor: "PROFESSOR",
    descricao: "Solicita e acompanha manutenções",
  },
  {
    rotulo: "Técnico(a)",
    valor: "TECNICO",
    descricao: "Executa e conclui manutenções",
  },
  {
    rotulo: "Coordenador(a)",
    valor: "COORDENADOR",
    descricao: "Administra todo o sistema",
  },
];

export const UsuarioFormScreen = ({
  route,
  navigation,
}: RootStackScreenProps<"UsuarioForm">) => {
  const usuario = route.params?.usuario;
  const editando = !!usuario;

  const [instituicoes, setInstituicoes] = useState<InstituicaoEnsino[]>([]);
  const [ativo, setAtivo] = useState(usuario?.ativo ?? true);
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);

  const { control, handleSubmit } = useForm<DadosUsuario>({
    resolver: zodResolver(editando ? esquemaEditar : esquemaCriar),
    defaultValues: {
      nome: usuario?.nome ?? "",
      email: usuario?.email ?? "",
      cargo: usuario?.cargo ?? "PROFESSOR",
      instituicaoId: usuario?.instituicaoId ?? null,
      senha: "",
    },
  });

  useEffect(() => {
    instituicaoService
      .listar()
      .then(setInstituicoes)
      .catch((e) => Alert.alert("Erro", extrairMensagemErro(e)))
      .finally(() => setCarregando(false));
  }, []);

  if (carregando) return <Carregando mensagem="Carregando formulário..." />;

  const aoSalvar = handleSubmit(async (dados) => {
    try {
      setEnviando(true);
      if (editando) {
        await usuarioService.editar(usuario.id, {
          nome: dados.nome,
          email: dados.email,
          cargo: dados.cargo,
          instituicaoId: dados.instituicaoId ?? null,
          ativo,
          ...(dados.senha ? { senha: dados.senha } : {}),
        });
        Alert.alert("Tudo certo", "Usuário atualizado com sucesso.");
      } else {
        await usuarioService.criar({
          nome: dados.nome,
          email: dados.email,
          cargo: dados.cargo,
          instituicaoId: dados.instituicaoId ?? null,
          senha: dados.senha,
          ativo,
        });
        Alert.alert("Tudo certo", "Usuário cadastrado com sucesso.");
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
          ? "Atualize os dados do usuário. Deixe a senha em branco para mantê-la."
          : "Cadastre um novo usuário e defina o cargo dele no sistema."}
      </Text>

      <CampoTexto
        control={control}
        name="nome"
        rotulo="Nome completo"
        placeholder="Ex.: Maria da Silva"
        icone="person-outline"
      />

      <CampoTexto
        control={control}
        name="email"
        rotulo="E-mail"
        placeholder="usuario@ifpb.edu.br"
        icone="mail-outline"
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <CampoSelecao
        control={control}
        name="cargo"
        rotulo="Cargo"
        icone="briefcase-outline"
        opcoes={OPCOES_CARGO}
      />

      <CampoSelecao
        control={control}
        name="instituicaoId"
        rotulo="Instituição de ensino"
        icone="school-outline"
        placeholder="Sem vínculo"
        opcoes={instituicoes.map((instituicao) => ({
          rotulo: instituicao.nome,
          valor: instituicao.id,
        }))}
      />

      <CampoTexto
        control={control}
        name="senha"
        rotulo={editando ? "Nova senha (opcional)" : "Senha"}
        placeholder="Mínimo de 8 caracteres"
        icone="lock-closed-outline"
        segredo
        autoCapitalize="none"
      />

      <View style={styles.linhaAtivo}>
        <View style={{ flex: 1 }}>
          <Text style={styles.rotuloAtivo}>Usuário ativo</Text>
          <Text style={styles.descricaoAtivo}>
            Usuários inativos não conseguem acessar o sistema.
          </Text>
        </View>
        <Switch
          value={ativo}
          onValueChange={setAtivo}
          trackColor={{ true: colors.primary, false: colors.border }}
          thumbColor="#FFF"
        />
      </View>

      <Botao
        titulo={editando ? "Salvar alterações" : "Cadastrar usuário"}
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
  linhaAtivo: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.md,
    paddingVertical: spacing.sm,
  },
  rotuloAtivo: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  },
  descricaoAtivo: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
