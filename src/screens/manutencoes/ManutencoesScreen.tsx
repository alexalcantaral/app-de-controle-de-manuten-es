import React, { useCallback, useState } from "react";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../contexts/AuthContext";
import { manutencaoService } from "../../services/manutencao.service";
import { Manutencao, StatusManutencao } from "../../types";
import {
  colors,
  spacing,
  statusManutencaoTheme,
  tipoManutencaoTheme,
} from "../../theme";
import {
  BotaoFlutuante,
  Carregando,
  Cartao,
  Etiqueta,
  FiltroChips,
  ListaVazia,
} from "../../components";
import { RootStackParamList } from "../../navigation/types";
import { formatarData, prazoVencido } from "../../utils/formatadores";
import { extrairMensagemErro } from "../../services/api";

type Navegacao = NativeStackNavigationProp<RootStackParamList>;

type FiltroStatus = StatusManutencao | undefined;

const OPCOES_FILTRO: { rotulo: string; valor: FiltroStatus }[] = [
  { rotulo: "Todas", valor: undefined },
  { rotulo: "Solicitadas", valor: "SOLICITADA" },
  { rotulo: "Concluídas", valor: "CONCLUIDA" },
  { rotulo: "Canceladas", valor: "CANCELADA" },
];

export const ManutencoesScreen = () => {
  const { ehCoordenador, ehTecnico } = useAuth();
  const navigation = useNavigation<Navegacao>();

  const [manutencoes, setManutencoes] = useState<Manutencao[]>([]);
  const [filtroStatus, setFiltroStatus] = useState<FiltroStatus>(undefined);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    try {
      setErro(null);
      const filtros = { status: filtroStatus, complemento: true };
      const dados = ehCoordenador
        ? await manutencaoService.listar(filtros)
        : await manutencaoService.listarMinhas(filtros);
      // Mais recentes primeiro
      dados.sort(
        (a, b) =>
          new Date(b.dataSolicitada).getTime() -
          new Date(a.dataSolicitada).getTime()
      );
      setManutencoes(dados);
    } catch (e) {
      setErro(extrairMensagemErro(e));
    } finally {
      setCarregando(false);
      setAtualizando(false);
    }
  }, [ehCoordenador, filtroStatus]);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar])
  );

  if (carregando) return <Carregando mensagem="Buscando manutenções..." />;

  return (
    <View style={styles.tela}>
      <View style={styles.cabecalho}>
        <Text style={styles.titulo}>
          {ehCoordenador ? "Todas as manutenções" : "Minhas manutenções"}
        </Text>
        <Text style={styles.subtitulo}>
          {ehTecnico
            ? "Manutenções atribuídas a você"
            : ehCoordenador
              ? "Visão geral do sistema"
              : "Solicitações feitas por você"}
        </Text>
      </View>

      <FiltroChips
        opcoes={OPCOES_FILTRO}
        valorSelecionado={filtroStatus}
        aoSelecionar={setFiltroStatus}
      />

      <FlatList
        data={manutencoes}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.lista}
        refreshControl={
          <RefreshControl
            refreshing={atualizando}
            onRefresh={() => {
              setAtualizando(true);
              carregar();
            }}
            colors={[colors.primary]}
          />
        }
        ListEmptyComponent={
          <ListaVazia
            icone="construct-outline"
            titulo={erro ? "Erro ao carregar" : "Nenhuma manutenção encontrada"}
            mensagem={
              erro ??
              (ehTecnico
                ? "Quando uma manutenção for atribuída a você, ela aparecerá aqui."
                : "Toque no botão + para solicitar uma manutenção.")
            }
          />
        }
        renderItem={({ item, index }) => {
          const temaStatus = statusManutencaoTheme[item.status];
          const temaTipo = tipoManutencaoTheme[item.tipo];
          const atrasada =
            item.status === "SOLICITADA" && prazoVencido(item.prazo);

          return (
            <Cartao
              indice={index}
              onPress={() =>
                navigation.navigate("ManutencaoDetalhe", { id: item.id })
              }
            >
              <View style={styles.linhaTopo}>
                <Text style={styles.identificador}>#{item.id}</Text>
                <View style={styles.etiquetas}>
                  <Etiqueta
                    pequena
                    texto={temaTipo.label}
                    cor={temaTipo.color}
                    fundo={temaTipo.bg}
                  />
                  <Etiqueta
                    pequena
                    texto={temaStatus.label}
                    cor={temaStatus.color}
                    fundo={temaStatus.bg}
                  />
                </View>
              </View>

              <Text style={styles.descricao} numberOfLines={2}>
                {item.descricaoSolicitada}
              </Text>

              <View style={styles.linhaInfo}>
                <Ionicons name="flask-outline" size={15} color={colors.textMuted} />
                <Text style={styles.info}>
                  {item.LaboratorioManutencao?.nome ??
                    `Laboratório #${item.laboratorioId ?? "?"}`}
                </Text>
              </View>

              <View style={styles.rodape}>
                <View style={styles.linhaInfo}>
                  <Ionicons
                    name="calendar-outline"
                    size={15}
                    color={atrasada ? colors.danger : colors.textMuted}
                  />
                  <Text
                    style={[styles.info, atrasada && { color: colors.danger }]}
                  >
                    Prazo: {formatarData(item.prazo)}
                    {atrasada ? " (vencido)" : ""}
                  </Text>
                </View>
                {item.TecnicoResponsavel && (
                  <View style={styles.linhaInfo}>
                    <Ionicons
                      name="build-outline"
                      size={15}
                      color={colors.textMuted}
                    />
                    <Text style={styles.info}>
                      {item.TecnicoResponsavel.nome.split(" ")[0]}
                    </Text>
                  </View>
                )}
              </View>
            </Cartao>
          );
        }}
      />

      {!ehTecnico && (
        <BotaoFlutuante onPress={() => navigation.navigate("ManutencaoForm")} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: colors.background,
  },
  cabecalho: {
    paddingTop: 60,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xs,
  },
  titulo: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.text,
  },
  subtitulo: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  lista: {
    padding: spacing.md,
    paddingBottom: 100,
  },
  linhaTopo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  identificador: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textMuted,
  },
  etiquetas: {
    flexDirection: "row",
    gap: spacing.xs + 2,
  },
  descricao: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text,
    marginBottom: spacing.sm,
    lineHeight: 21,
  },
  linhaInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  info: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  rodape: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.xs + 2,
  },
});
