import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useAuth } from "../../contexts/AuthContext";
import { instituicaoService } from "../../services/instituicao.service";
import { InstituicaoEnsino } from "../../types";
import { cargoTheme, colors, radius, shadow, spacing } from "../../theme";
import { Avatar, ConfirmDialog, Etiqueta } from "../../components";
import { formatarData } from "../../utils/formatadores";
import { API_HOST } from "../../../config/env";

export const PerfilScreen = () => {
  const { usuario, logout } = useAuth();
  const [instituicao, setInstituicao] = useState<InstituicaoEnsino | null>(null);
  const [confirmandoSaida, setConfirmandoSaida] = useState(false);

  useEffect(() => {
    if (usuario?.instituicaoId) {
      instituicaoService
        .buscarPorId(usuario.instituicaoId)
        .then(setInstituicao)
        .catch(() => setInstituicao(null));
    }
  }, [usuario?.instituicaoId]);

  if (!usuario) return null;

  const tema = cargoTheme[usuario.cargo];

  const confirmarSaida = () => setConfirmandoSaida(true);

  return (
    <ScrollView style={styles.tela} contentContainerStyle={{ paddingBottom: 48 }}>
      <View style={styles.cabecalho}>
        <Avatar
          nome={usuario.nome}
          tamanho={92}
          cor={colors.primary}
          fundo="#FFFFFF"
        />
        <Text style={styles.nome}>{usuario.nome}</Text>
        <Text style={styles.email}>{usuario.email}</Text>
        <View style={{ marginTop: spacing.sm }}>
          <Etiqueta texto={tema.label} cor={colors.primary} fundo="#FFFFFF" />
        </View>
      </View>

      <Animated.View entering={FadeInDown.delay(100)} style={styles.cartao}>
        <Text style={styles.tituloSecao}>Informações da conta</Text>
        <LinhaInfo
          icone="school-outline"
          rotulo="Instituição"
          valor={
            usuario.instituicaoId
              ? instituicao?.nome ?? `#${usuario.instituicaoId}`
              : "Sem vínculo"
          }
        />
        <LinhaInfo
          icone="shield-checkmark-outline"
          rotulo="Situação"
          valor={usuario.ativo ? "Ativo" : "Inativo"}
        />
        <LinhaInfo
          icone="calendar-outline"
          rotulo="Cadastro"
          valor={formatarData(usuario.createdAt)}
        />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(180)} style={styles.cartao}>
        <Text style={styles.tituloSecao}>O que seu cargo pode fazer</Text>
        {usuario.cargo === "COORDENADOR" && (
          <>
            <ItemPermissao texto="Gerenciar usuários, laboratórios e instituições" />
            <ItemPermissao texto="Solicitar, editar, cancelar e excluir manutenções" />
            <ItemPermissao texto="Anexar e remover imagens das manutenções" />
          </>
        )}
        {usuario.cargo === "PROFESSOR" && (
          <>
            <ItemPermissao texto="Solicitar manutenções para os laboratórios" />
            <ItemPermissao texto="Editar e cancelar as próprias solicitações" />
            <ItemPermissao texto="Acompanhar o andamento das manutenções" />
          </>
        )}
        {usuario.cargo === "TECNICO" && (
          <>
            <ItemPermissao texto="Visualizar as manutenções atribuídas a você" />
            <ItemPermissao texto="Concluir manutenções com relato do serviço" />
            <ItemPermissao texto="Anexar imagens do serviço realizado" />
          </>
        )}
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(260)} style={styles.cartao}>
        <Text style={styles.tituloSecao}>Conexão</Text>
        <LinhaInfo icone="server-outline" rotulo="Servidor" valor={API_HOST} />
      </Animated.View>

      <TouchableOpacity style={styles.botaoSair} onPress={confirmarSaida}>
        <Ionicons name="log-out-outline" size={20} color={colors.danger} />
        <Text style={styles.textoSair}>Sair da conta</Text>
      </TouchableOpacity>

      <ConfirmDialog
        visivel={confirmandoSaida}
        titulo="Sair"
        mensagem="Deseja encerrar a sessão neste aparelho?"
        rotuloConfirmar="Sair"
        destrutivo
        aoConfirmar={() => {
          setConfirmandoSaida(false);
          logout();
        }}
        aoFechar={() => setConfirmandoSaida(false)}
      />
    </ScrollView>
  );
};

const LinhaInfo = ({
  icone,
  rotulo,
  valor,
}: {
  icone: keyof typeof Ionicons.glyphMap;
  rotulo: string;
  valor: string;
}) => (
  <View style={styles.linhaInfo}>
    <Ionicons name={icone} size={18} color={colors.textMuted} />
    <Text style={styles.rotuloInfo}>{rotulo}</Text>
    <Text style={styles.valorInfo} numberOfLines={1}>
      {valor}
    </Text>
  </View>
);

const ItemPermissao = ({ texto }: { texto: string }) => (
  <View style={styles.itemPermissao}>
    <Ionicons name="checkmark-circle" size={18} color={colors.success} />
    <Text style={styles.textoPermissao}>{texto}</Text>
  </View>
);

const styles = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: colors.background,
  },
  cabecalho: {
    backgroundColor: colors.primary,
    alignItems: "center",
    paddingTop: 72,
    paddingBottom: spacing.xl,
    borderBottomLeftRadius: radius.xl + 4,
    borderBottomRightRadius: radius.xl + 4,
  },
  nome: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.textOnPrimary,
    marginTop: spacing.md,
  },
  email: {
    fontSize: 14,
    color: "rgba(255,255,255,0.85)",
    marginTop: 2,
  },
  cartao: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    padding: spacing.md,
    ...shadow.card,
  },
  tituloSecao: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
    marginBottom: spacing.sm,
  },
  linhaInfo: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    gap: spacing.sm,
  },
  rotuloInfo: {
    fontSize: 14,
    color: colors.textSecondary,
    width: 100,
  },
  valorInfo: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  },
  itemPermissao: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    paddingVertical: 6,
  },
  textoPermissao: {
    flex: 1,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  botaoSair: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    marginHorizontal: spacing.md,
    marginTop: spacing.lg,
    paddingVertical: 14,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.dangerLight,
    backgroundColor: colors.surface,
  },
  textoSair: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.danger,
  },
});
