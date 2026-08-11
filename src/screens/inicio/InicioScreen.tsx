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
import { PieChart, BarChart } from "react-native-gifted-charts";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useAuth } from "../../contexts/AuthContext";
import { manutencaoService } from "../../services/manutencao.service";
import { Manutencao } from "../../types";
import { colors, radius, shadow, spacing, cargoTheme } from "../../theme";
import { Carregando } from "../../components";
import { RootStackParamList } from "../../navigation/types";
import { extrairMensagemErro } from "../../services/api";

type Navegacao = NativeStackNavigationProp<RootStackParamList>;

const CORES_STATUS = {
  SOLICITADA: colors.warning,
  CONCLUIDA: colors.success,
  CANCELADA: colors.danger,
};

export const InicioScreen = () => {
  const { usuario, ehCoordenador, ehTecnico } = useAuth();
  const navigation = useNavigation<Navegacao>();

  const [manutencoes, setManutencoes] = useState<Manutencao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const carregarDados = useCallback(async () => {
    try {
      setErro(null);
      const dados = ehCoordenador
        ? await manutencaoService.listar({ complemento: true })
        : await manutencaoService.listarMinhas({ complemento: true });
      setManutencoes(dados);
    } catch (e) {
      setErro(extrairMensagemErro(e));
    } finally {
      setCarregando(false);
      setAtualizando(false);
    }
  }, [ehCoordenador]);

  useFocusEffect(
    useCallback(() => {
      carregarDados();
    }, [carregarDados])
  );

  if (carregando) return <Carregando mensagem="Carregando resumo..." />;

  const totais = {
    SOLICITADA: manutencoes.filter((m) => m.status === "SOLICITADA").length,
    CONCLUIDA: manutencoes.filter((m) => m.status === "CONCLUIDA").length,
    CANCELADA: manutencoes.filter((m) => m.status === "CANCELADA").length,
  };
  const totalGeral = manutencoes.length;

  const dadosPizza = (
    Object.keys(totais) as (keyof typeof totais)[]
  )
    .filter((status) => totais[status] > 0)
    .map((status) => ({
      value: totais[status],
      color: CORES_STATUS[status],
    }));

  const dadosBarras = [
    {
      value: manutencoes.filter((m) => m.tipo === "PREVENTIVA").length,
      label: "Preventiva",
      frontColor: colors.info,
    },
    {
      value: manutencoes.filter((m) => m.tipo === "CORRETIVA").length,
      label: "Corretiva",
      frontColor: "#9333EA",
    },
  ];

  const temaCargo = usuario ? cargoTheme[usuario.cargo] : null;

  return (
    <ScrollView
      style={styles.tela}
      contentContainerStyle={{ paddingBottom: spacing.xl }}
      refreshControl={
        <RefreshControl
          refreshing={atualizando}
          onRefresh={() => {
            setAtualizando(true);
            carregarDados();
          }}
          colors={[colors.primary]}
        />
      }
    >
      {/* Cabeçalho */}
      <View style={styles.cabecalho}>
        <View style={{ flex: 1 }}>
          <Text style={styles.saudacao}>Olá, {usuario?.nome?.split(" ")[0]} 👋</Text>
          {temaCargo && (
            <Text style={[styles.cargo, { color: "rgba(255,255,255,0.9)" }]}>
              {temaCargo.label}
            </Text>
          )}
        </View>
        <Ionicons name="construct" size={34} color="rgba(255,255,255,0.85)" />
      </View>

      {erro && (
        <View style={styles.avisoErro}>
          <Ionicons name="cloud-offline-outline" size={18} color={colors.danger} />
          <Text style={styles.avisoErroTexto}>{erro}</Text>
        </View>
      )}

      {/* Cartões de totais */}
      <View style={styles.linhaTotais}>
        <CartaoTotal
          rotulo="Solicitadas"
          valor={totais.SOLICITADA}
          cor={colors.warning}
          icone="time-outline"
          indice={0}
        />
        <CartaoTotal
          rotulo="Concluídas"
          valor={totais.CONCLUIDA}
          cor={colors.success}
          icone="checkmark-done-outline"
          indice={1}
        />
        <CartaoTotal
          rotulo="Canceladas"
          valor={totais.CANCELADA}
          cor={colors.danger}
          icone="close-circle-outline"
          indice={2}
        />
      </View>

      {/* Gráficos */}
      <Animated.View entering={FadeInDown.delay(240)} style={styles.cartaoGrafico}>
        <Text style={styles.tituloSecao}>
          {ehTecnico ? "Minhas manutenções por status" : "Manutenções por status"}
        </Text>
        {totalGeral === 0 ? (
          <Text style={styles.semDados}>
            Nenhuma manutenção registrada ainda.
          </Text>
        ) : (
          <View style={styles.conteudoPizza}>
            <PieChart
              data={dadosPizza}
              donut
              radius={80}
              innerRadius={52}
              centerLabelComponent={() => (
                <View style={{ alignItems: "center" }}>
                  <Text style={styles.totalPizza}>{totalGeral}</Text>
                  <Text style={styles.totalPizzaRotulo}>total</Text>
                </View>
              )}
            />
            <View style={styles.legenda}>
              <ItemLegenda cor={colors.warning} texto={`Solicitadas (${totais.SOLICITADA})`} />
              <ItemLegenda cor={colors.success} texto={`Concluídas (${totais.CONCLUIDA})`} />
              <ItemLegenda cor={colors.danger} texto={`Canceladas (${totais.CANCELADA})`} />
            </View>
          </View>
        )}
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(320)} style={styles.cartaoGrafico}>
        <Text style={styles.tituloSecao}>Por tipo de manutenção</Text>
        {totalGeral === 0 ? (
          <Text style={styles.semDados}>Sem dados para exibir.</Text>
        ) : (
          <BarChart
            data={dadosBarras}
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

      {/* Atalhos */}
      <Text style={[styles.tituloSecao, styles.tituloAtalhos]}>Acesso rápido</Text>
      <View style={styles.linhaAtalhos}>
        <Atalho
          titulo="Manutenções"
          icone="construct-outline"
          onPress={() =>
            navigation.navigate("Tabs", { screen: "Manutencoes" })
          }
        />
        <Atalho
          titulo="Laboratórios"
          icone="flask-outline"
          onPress={() => navigation.navigate("Laboratorios")}
        />
        {ehCoordenador && (
          <Atalho
            titulo="Usuários"
            icone="people-outline"
            onPress={() => navigation.navigate("Usuarios")}
          />
        )}
        {ehCoordenador && (
          <Atalho
            titulo="Dashboard"
            icone="stats-chart-outline"
            onPress={() => navigation.navigate("Dashboard")}
          />
        )}
      </View>
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
    entering={FadeInDown.delay(80 + indice * 80)}
    style={styles.cartaoTotal}
  >
    <Ionicons name={icone} size={22} color={cor} />
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

const Atalho = ({
  titulo,
  icone,
  onPress,
}: {
  titulo: string;
  icone: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}) => (
  <TouchableOpacity style={styles.atalho} activeOpacity={0.7} onPress={onPress}>
    <View style={styles.atalhoIcone}>
      <Ionicons name={icone} size={24} color={colors.primary} />
    </View>
    <Text style={styles.atalhoTexto}>{titulo}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: colors.background,
  },
  cabecalho: {
    backgroundColor: colors.primary,
    paddingTop: 64,
    paddingBottom: spacing.xl + spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomLeftRadius: radius.xl + 4,
    borderBottomRightRadius: radius.xl + 4,
    flexDirection: "row",
    alignItems: "center",
  },
  saudacao: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.textOnPrimary,
  },
  cargo: {
    fontSize: 14,
    marginTop: 2,
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
  linhaTotais: {
    flexDirection: "row",
    paddingHorizontal: spacing.md,
    marginTop: -spacing.lg,
    gap: spacing.sm,
  },
  cartaoTotal: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card,
  },
  valorTotal: {
    fontSize: 24,
    fontWeight: "800",
    marginTop: 4,
  },
  rotuloTotal: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
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
  tituloAtalhos: {
    marginHorizontal: spacing.md,
    marginTop: spacing.lg,
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
  linhaAtalhos: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  atalho: {
    flexBasis: "47%",
    flexGrow: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    paddingVertical: spacing.md,
    ...shadow.card,
  },
  atalhoIcone: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xs + 2,
  },
  atalhoTexto: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text,
  },
});
