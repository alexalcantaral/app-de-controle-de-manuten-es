import React, { useCallback, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { PieChart, BarChart, LineChart } from "react-native-gifted-charts";
import Animated, { FadeInDown } from "react-native-reanimated";
import { dashboardService } from "../../services/dashboard.service";
import { Dashboard } from "../../types";
import { colors, radius, shadow, spacing } from "../../theme";
import { Carregando, ListaVazia } from "../../components";
import { RootStackParamList } from "../../navigation/types";
import { extrairMensagemErro } from "../../services/api";

type Navegacao = NativeStackNavigationProp<RootStackParamList>;

const CORES_STATUS = {
  SOLICITADA: colors.warning,
  CONCLUIDA: colors.success,
  CANCELADA: colors.danger,
};

const formatarMesRotulo = (mes: string) => {
  const [ano, mesNumero] = mes.split("-");
  const data = new Date(Number(ano), Number(mesNumero) - 1, 1);
  const rotulo = data.toLocaleDateString("pt-BR", { month: "short" });
  return rotulo.replace(".", "").replace(/^\w/, (c) => c.toUpperCase());
};

export const DashboardScreen = () => {
  const navigation = useNavigation<Navegacao>();

  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    try {
      setErro(null);
      const dados = await dashboardService.buscarMetricas();
      setDashboard(dados);
    } catch (e) {
      setErro(extrairMensagemErro(e));
    } finally {
      setCarregando(false);
      setAtualizando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar])
  );

  if (carregando) return <Carregando mensagem="Carregando dashboard..." />;

  if (!dashboard) {
    return (
      <ListaVazia
        icone="stats-chart-outline"
        titulo={erro ? "Erro ao carregar" : "Sem dados"}
        mensagem={erro ?? "Não há métricas para exibir no momento."}
      />
    );
  }

  const {
    contadoresGerais,
    manutencoesPorStatus,
    manutencoesPorTipo,
    manutencoesEmAtraso,
    cargaPorTecnico,
    evolucaoMensal,
    rankingLaboratorios,
  } = dashboard;

  const totalStatus =
    manutencoesPorStatus.SOLICITADA +
    manutencoesPorStatus.CONCLUIDA +
    manutencoesPorStatus.CANCELADA;

  const dadosPizza = (
    Object.keys(manutencoesPorStatus) as (keyof typeof manutencoesPorStatus)[]
  )
    .filter((status) => manutencoesPorStatus[status] > 0)
    .map((status) => ({
      value: manutencoesPorStatus[status],
      color: CORES_STATUS[status],
    }));

  const dadosBarrasTipo = [
    {
      value: manutencoesPorTipo.PREVENTIVA,
      label: "Preventiva",
      frontColor: colors.info,
    },
    {
      value: manutencoesPorTipo.CORRETIVA,
      label: "Corretiva",
      frontColor: "#9333EA",
    },
  ];

  const dadosLinhaEvolucao = evolucaoMensal.map((item) => ({
    value: item.quantidade,
    label: formatarMesRotulo(item.mes),
  }));

  return (
    <ScrollView
      style={styles.tela}
      contentContainerStyle={{ paddingBottom: spacing.xl }}
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
    >
      {erro && (
        <View style={styles.avisoErro}>
          <Ionicons name="cloud-offline-outline" size={18} color={colors.danger} />
          <Text style={styles.avisoErroTexto}>{erro}</Text>
        </View>
      )}

      {/* Contadores gerais */}
      <View style={styles.grade}>
        <CartaoTotal
          rotulo="Usuários"
          valor={contadoresGerais.totalUsuarios}
          cor={colors.primary}
          icone="people-outline"
          indice={0}
        />
        <CartaoTotal
          rotulo="Usuários ativos"
          valor={contadoresGerais.totalUsuariosAtivos}
          cor={colors.success}
          icone="person-outline"
          indice={1}
        />
        <CartaoTotal
          rotulo="Laboratórios"
          valor={contadoresGerais.totalLaboratorios}
          cor={colors.info}
          icone="flask-outline"
          indice={2}
        />
        <CartaoTotal
          rotulo="Instituições"
          valor={contadoresGerais.totalInstituicoesEnsino}
          cor="#9333EA"
          icone="business-outline"
          indice={3}
        />
        <CartaoTotal
          rotulo="Manutenções"
          valor={contadoresGerais.totalManutencoes}
          cor={colors.warning}
          icone="construct-outline"
          indice={4}
        />
      </View>

      {/* Manutenções por status */}
      <Animated.View entering={FadeInDown.delay(240)} style={styles.cartaoGrafico}>
        <Text style={styles.tituloSecao}>Manutenções por status</Text>
        {totalStatus === 0 ? (
          <Text style={styles.semDados}>Nenhuma manutenção registrada ainda.</Text>
        ) : (
          <View style={styles.conteudoPizza}>
            <PieChart
              data={dadosPizza}
              donut
              radius={80}
              innerRadius={52}
              centerLabelComponent={() => (
                <View style={{ alignItems: "center" }}>
                  <Text style={styles.totalPizza}>{totalStatus}</Text>
                  <Text style={styles.totalPizzaRotulo}>total</Text>
                </View>
              )}
            />
            <View style={styles.legenda}>
              <ItemLegenda
                cor={colors.warning}
                texto={`Solicitadas (${manutencoesPorStatus.SOLICITADA})`}
              />
              <ItemLegenda
                cor={colors.success}
                texto={`Concluídas (${manutencoesPorStatus.CONCLUIDA})`}
              />
              <ItemLegenda
                cor={colors.danger}
                texto={`Canceladas (${manutencoesPorStatus.CANCELADA})`}
              />
            </View>
          </View>
        )}
      </Animated.View>

      {/* Manutenções por tipo */}
      <Animated.View entering={FadeInDown.delay(300)} style={styles.cartaoGrafico}>
        <Text style={styles.tituloSecao}>Por tipo de manutenção</Text>
        {manutencoesPorTipo.PREVENTIVA + manutencoesPorTipo.CORRETIVA === 0 ? (
          <Text style={styles.semDados}>Sem dados para exibir.</Text>
        ) : (
          <BarChart
            data={dadosBarrasTipo}
            barWidth={56}
            spacing={60}
            barBorderRadius={8}
            noOfSections={4}
            yAxisThickness={0}
            xAxisColor={colors.border}
            yAxisTextStyle={{ color: colors.textMuted, fontSize: 12 }}
            xAxisLabelTextStyle={{ color: colors.textSecondary, fontSize: 12 }}
            isAnimated
          />
        )}
      </Animated.View>

      {/* Evolução mensal */}
      <Animated.View entering={FadeInDown.delay(360)} style={styles.cartaoGrafico}>
        <Text style={styles.tituloSecao}>Evolução mensal (últimos 6 meses)</Text>
        {dadosLinhaEvolucao.every((item) => item.value === 0) ? (
          <Text style={styles.semDados}>Sem dados para exibir.</Text>
        ) : (
          <LineChart
            data={dadosLinhaEvolucao}
            color={colors.primary}
            thickness={3}
            noOfSections={4}
            yAxisThickness={0}
            xAxisColor={colors.border}
            yAxisTextStyle={{ color: colors.textMuted, fontSize: 12 }}
            xAxisLabelTextStyle={{ color: colors.textSecondary, fontSize: 12 }}
            dataPointsColor={colors.primary}
            curved
            isAnimated
          />
        )}
      </Animated.View>

      {/* Manutenções em atraso */}
      <Animated.View entering={FadeInDown.delay(420)} style={styles.cartaoGrafico}>
        <View style={styles.linhaTituloComContador}>
          <Text style={styles.tituloSecao}>Manutenções em atraso</Text>
          {manutencoesEmAtraso.quantidade > 0 && (
            <View style={styles.pilulaAtraso}>
              <Text style={styles.pilulaAtrasoTexto}>
                {manutencoesEmAtraso.quantidade}
              </Text>
            </View>
          )}
        </View>
        {manutencoesEmAtraso.maisUrgentes.length === 0 ? (
          <Text style={styles.semDados}>Nenhuma manutenção em atraso.</Text>
        ) : (
          manutencoesEmAtraso.maisUrgentes.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.linhaUrgente}
              activeOpacity={0.7}
              onPress={() =>
                navigation.navigate("ManutencaoDetalhe", { id: item.id })
              }
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.laboratorioUrgente} numberOfLines={1}>
                  {item.laboratorio}
                </Text>
                <Text style={styles.prazoUrgente}>
                  Prazo: {new Date(item.prazo).toLocaleDateString("pt-BR")}
                </Text>
              </View>
              <View style={styles.pilulaDias}>
                <Text style={styles.pilulaDiasTexto}>
                  {item.diasEmAtraso}d
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </Animated.View>

      {/* Carga por técnico */}
      <Animated.View entering={FadeInDown.delay(480)} style={styles.cartaoGrafico}>
        <Text style={styles.tituloSecao}>Carga por técnico</Text>
        {cargaPorTecnico.length === 0 ? (
          <Text style={styles.semDados}>Nenhum técnico ativo cadastrado.</Text>
        ) : (
          cargaPorTecnico.map((tecnico) => (
            <View key={tecnico.id} style={styles.linhaTecnico}>
              <Text style={styles.nomeTecnico} numberOfLines={1}>
                {tecnico.nome}
              </Text>
              <View style={styles.contadoresTecnico}>
                <ItemLegenda
                  cor={colors.success}
                  texto={`${tecnico.manutencoesConcluidas} concluídas`}
                />
                <ItemLegenda
                  cor={colors.warning}
                  texto={`${tecnico.manutencoesPendentes} pendentes`}
                />
              </View>
            </View>
          ))
        )}
      </Animated.View>

      {/* Ranking de laboratórios */}
      <Animated.View entering={FadeInDown.delay(540)} style={styles.cartaoGrafico}>
        <Text style={styles.tituloSecao}>Laboratórios com mais manutenções</Text>
        {rankingLaboratorios.length === 0 ? (
          <Text style={styles.semDados}>Sem dados para exibir.</Text>
        ) : (
          rankingLaboratorios.map((laboratorio, indice) => (
            <View key={laboratorio.id} style={styles.linhaRanking}>
              <View style={styles.posicaoRanking}>
                <Text style={styles.posicaoRankingTexto}>{indice + 1}</Text>
              </View>
              <Text style={styles.nomeRanking} numberOfLines={1}>
                {laboratorio.nome}
              </Text>
              <Text style={styles.quantidadeRanking}>
                {laboratorio.quantidadeManutencoes}
              </Text>
            </View>
          ))
        )}
      </Animated.View>
    </ScrollView>
  );
};

const CartaoTotal = ({
  rotulo,
  valor,
  cor,
  icone,
  indice,
}: {
  rotulo: string;
  valor: number;
  cor: string;
  icone: keyof typeof Ionicons.glyphMap;
  indice: number;
}) => (
  <Animated.View
    entering={FadeInDown.delay(40 + indice * 60)}
    style={styles.cartaoTotal}
  >
    <Ionicons name={icone} size={20} color={cor} />
    <Text style={[styles.valorTotal, { color: cor }]}>{valor}</Text>
    <Text style={styles.rotuloTotal}>{rotulo}</Text>
  </Animated.View>
);

const ItemLegenda = ({ cor, texto }: { cor: string; texto: string }) => (
  <View style={styles.itemLegenda}>
    <View style={[styles.bolinha, { backgroundColor: cor }]} />
    <Text style={styles.textoLegenda}>{texto}</Text>
  </View>
);

const styles = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: colors.background,
  },
  avisoErro: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.dangerLight,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
  },
  avisoErroTexto: {
    flex: 1,
    color: colors.danger,
    fontSize: 13,
  },
  grade: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    gap: spacing.sm,
  },
  cartaoTotal: {
    width: "31%",
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.sm + 2,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card,
  },
  valorTotal: {
    fontSize: 20,
    fontWeight: "800",
    marginTop: 4,
  },
  rotuloTotal: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
    textAlign: "center",
  },
  cartaoGrafico: {
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
    marginBottom: spacing.md,
  },
  semDados: {
    color: colors.textSecondary,
    fontSize: 14,
    paddingVertical: spacing.md,
  },
  conteudoPizza: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingRight: spacing.sm,
  },
  totalPizza: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.text,
  },
  totalPizzaRotulo: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  legenda: {
    gap: spacing.sm,
  },
  itemLegenda: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs + 2,
  },
  bolinha: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  textoLegenda: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  linhaTituloComContador: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pilulaAtraso: {
    backgroundColor: colors.dangerLight,
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginBottom: spacing.md,
  },
  pilulaAtrasoTexto: {
    color: colors.danger,
    fontWeight: "700",
    fontSize: 13,
  },
  linhaUrgente: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  laboratorioUrgente: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  },
  prazoUrgente: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  pilulaDias: {
    backgroundColor: colors.dangerLight,
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  pilulaDiasTexto: {
    color: colors.danger,
    fontWeight: "700",
    fontSize: 12,
  },
  linhaTecnico: {
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  nomeTecnico: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
    marginBottom: spacing.xs + 2,
  },
  contadoresTecnico: {
    flexDirection: "row",
    gap: spacing.md,
  },
  linhaRanking: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  posicaoRanking: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  posicaoRankingTexto: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.primary,
  },
  nomeRanking: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
  },
  quantidadeRanking: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
  },
});
