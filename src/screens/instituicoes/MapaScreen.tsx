import React, { useCallback, useRef, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker, Region } from "react-native-maps";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInUp } from "react-native-reanimated";
import { useAuth } from "../../contexts/AuthContext";
import { instituicaoService } from "../../services/instituicao.service";
import { InstituicaoEnsino } from "../../types";
import { colors, radius, shadow, spacing } from "../../theme";
import { RootStackParamList } from "../../navigation/types";
import { formatarCnpj } from "../../utils/formatadores";
import { extrairMensagemErro } from "../../services/api";

type Navegacao = NativeStackNavigationProp<RootStackParamList>;

// IFPB Campus Cajazeiras como região inicial do mapa
const REGIAO_INICIAL: Region = {
  latitude: -6.8897,
  longitude: -38.5578,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
};

export const MapaScreen = () => {
  const { ehCoordenador } = useAuth();
  const navigation = useNavigation<Navegacao>();
  const referenciaMapa = useRef<MapView>(null);

  const [instituicoes, setInstituicoes] = useState<InstituicaoEnsino[]>([]);
  const [selecionada, setSelecionada] = useState<InstituicaoEnsino | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    try {
      setErro(null);
      const dados = await instituicaoService.listar();
      setInstituicoes(dados);
    } catch (e) {
      setErro(extrairMensagemErro(e));
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar])
  );

  const focarInstituicao = (instituicao: InstituicaoEnsino) => {
    setSelecionada(instituicao);
    referenciaMapa.current?.animateToRegion(
      {
        latitude: instituicao.latitude,
        longitude: instituicao.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      },
      600
    );
  };

  const confirmarExclusao = (instituicao: InstituicaoEnsino) => {
    Alert.alert(
      "Excluir instituição",
      `Deseja excluir "${instituicao.nome}"?`,
      [
        { text: "Manter", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              await instituicaoService.deletar(instituicao.id);
              setSelecionada(null);
              carregar();
            } catch (e) {
              Alert.alert("Erro", extrairMensagemErro(e));
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.tela}>
      <MapView
        ref={referenciaMapa}
        style={StyleSheet.absoluteFill}
        initialRegion={REGIAO_INICIAL}
        onLongPress={
          ehCoordenador
            ? (evento) => {
                const { latitude, longitude } = evento.nativeEvent.coordinate;
                navigation.navigate("InstituicaoForm", { latitude, longitude });
              }
            : undefined
        }
      >
        {instituicoes.map((instituicao) => (
          <Marker
            key={instituicao.id}
            coordinate={{
              latitude: instituicao.latitude,
              longitude: instituicao.longitude,
            }}
            title={instituicao.nome}
            description={formatarCnpj(instituicao.cnpj)}
            pinColor={
              selecionada?.id === instituicao.id ? colors.primary : undefined
            }
            onPress={() => setSelecionada(instituicao)}
          />
        ))}
      </MapView>

      {/* Cabeçalho flutuante */}
      <Animated.View entering={FadeInUp} style={styles.cabecalho}>
        <Ionicons name="school-outline" size={20} color={colors.primary} />
        <Text style={styles.tituloCabecalho}>
          Instituições de ensino ({instituicoes.length})
        </Text>
      </Animated.View>

      {erro && (
        <View style={styles.avisoErro}>
          <Text style={styles.avisoErroTexto}>{erro}</Text>
        </View>
      )}

      {ehCoordenador && (
        <View style={styles.dicaContainer}>
          <Text style={styles.dica}>
            Segure em um ponto do mapa para cadastrar uma instituição ali
          </Text>
        </View>
      )}

      {/* Carrossel de instituições */}
      <View style={styles.rodape}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.carrossel}
        >
          {instituicoes.map((instituicao) => {
            const ativa = selecionada?.id === instituicao.id;
            return (
              <TouchableOpacity
                key={instituicao.id}
                activeOpacity={0.85}
                style={[styles.cartaoInstituicao, ativa && styles.cartaoAtivo]}
                onPress={() => focarInstituicao(instituicao)}
              >
                <View style={styles.linhaCartao}>
                  <View style={styles.iconeInstituicao}>
                    <Ionicons name="school" size={18} color={colors.primary} />
                  </View>
                  <Text style={styles.nomeInstituicao} numberOfLines={1}>
                    {instituicao.nome}
                  </Text>
                </View>
                <Text style={styles.cnpj}>{formatarCnpj(instituicao.cnpj)}</Text>
                {ehCoordenador && ativa && (
                  <View style={styles.acoesCartao}>
                    <TouchableOpacity
                      style={styles.botaoAcao}
                      onPress={() =>
                        navigation.navigate("InstituicaoForm", { instituicao })
                      }
                    >
                      <Ionicons name="create-outline" size={16} color={colors.primary} />
                      <Text style={styles.textoAcao}>Editar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.botaoAcao}
                      onPress={() => confirmarExclusao(instituicao)}
                    >
                      <Ionicons name="trash-outline" size={16} color={colors.danger} />
                      <Text style={[styles.textoAcao, { color: colors.danger }]}>
                        Excluir
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
          {instituicoes.length === 0 && !erro && (
            <View style={styles.cartaoInstituicao}>
              <Text style={styles.nomeInstituicao}>Nenhuma instituição</Text>
              <Text style={styles.cnpj}>
                {ehCoordenador
                  ? "Segure no mapa para cadastrar a primeira."
                  : "As instituições cadastradas aparecerão aqui."}
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  tela: {
    flex: 1,
  },
  cabecalho: {
    position: "absolute",
    top: 56,
    left: spacing.md,
    right: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.full,
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    ...shadow.card,
    elevation: 4,
  },
  tituloCabecalho: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
  },
  avisoErro: {
    position: "absolute",
    top: 110,
    left: spacing.md,
    right: spacing.md,
    backgroundColor: colors.dangerLight,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  avisoErroTexto: {
    color: colors.danger,
    fontSize: 13,
  },
  dicaContainer: {
    position: "absolute",
    top: 112,
    alignSelf: "center",
    backgroundColor: "rgba(15, 23, 42, 0.75)",
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
  },
  dica: {
    color: "#FFF",
    fontSize: 12,
  },
  rodape: {
    position: "absolute",
    bottom: spacing.md,
    left: 0,
    right: 0,
  },
  carrossel: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  cartaoInstituicao: {
    width: 250,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    ...shadow.card,
    elevation: 4,
  },
  cartaoAtivo: {
    borderColor: colors.primary,
  },
  linhaCartao: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  iconeInstituicao: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  nomeInstituicao: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
  },
  cnpj: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 6,
  },
  acoesCartao: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  botaoAcao: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  textoAcao: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.primary,
  },
});
