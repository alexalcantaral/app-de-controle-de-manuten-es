import React, { useCallback, useState } from "react";
import {
  Alert,
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
import { laboratorioService } from "../../services/laboratorio.service";
import { usuarioService } from "../../services/usuario.service";
import { Laboratorio, Usuario } from "../../types";
import { colors, spacing } from "../../theme";
import {
  Avatar,
  BotaoFlutuante,
  Carregando,
  Cartao,
  ConfirmDialog,
  ListaVazia,
} from "../../components";
import { RootStackParamList } from "../../navigation/types";
import { extrairMensagemErro } from "../../services/api";

type Navegacao = NativeStackNavigationProp<RootStackParamList>;

export const LaboratoriosScreen = () => {
  const { ehCoordenador } = useAuth();
  const navigation = useNavigation<Navegacao>();

  const [laboratorios, setLaboratorios] = useState<Laboratorio[]>([]);
  const [responsaveis, setResponsaveis] = useState<Record<string, Usuario>>({});
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [laboratorioParaExcluir, setLaboratorioParaExcluir] =
    useState<Laboratorio | null>(null);

  const carregar = useCallback(async () => {
    try {
      setErro(null);
      const [dadosLaboratorios, dadosUsuarios] = await Promise.all([
        laboratorioService.listar(),
        usuarioService.listar().catch(() => [] as Usuario[]),
      ]);
      setLaboratorios(dadosLaboratorios);
      setResponsaveis(
        Object.fromEntries(dadosUsuarios.map((u) => [u.id, u]))
      );
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

  const confirmarExclusao = (laboratorio: Laboratorio) => {
    if (!ehCoordenador) return;
    setLaboratorioParaExcluir(laboratorio);
  };

  const executarExclusao = async () => {
    const laboratorio = laboratorioParaExcluir;
    if (!laboratorio) return;
    setLaboratorioParaExcluir(null);
    try {
      await laboratorioService.deletar(laboratorio.id);
      setLaboratorios((atuais) =>
        atuais.filter((l) => l.id !== laboratorio.id)
      );
    } catch (e) {
      Alert.alert("Erro", extrairMensagemErro(e));
    }
  };

  if (carregando) return <Carregando mensagem="Buscando laboratórios..." />;

  return (
    <View style={styles.tela}>
      <FlatList
        data={laboratorios}
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
            icone="flask-outline"
            titulo={erro ? "Erro ao carregar" : "Nenhum laboratório cadastrado"}
            mensagem={
              erro ??
              (ehCoordenador
                ? "Toque no botão + para cadastrar o primeiro laboratório."
                : "Os laboratórios cadastrados aparecerão aqui.")
            }
          />
        }
        renderItem={({ item, index }) => {
          const responsavel = responsaveis[item.responsavelId];
          return (
            <Cartao
              indice={index}
              onPress={
                ehCoordenador
                  ? () =>
                      navigation.navigate("LaboratorioForm", {
                        laboratorio: item,
                      })
                  : undefined
              }
              onLongPress={() => confirmarExclusao(item)}
            >
              <View style={styles.linha}>
                <View style={styles.iconeLaboratorio}>
                  <Ionicons name="flask" size={22} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.nome}>{item.nome}</Text>
                  {item.descricao ? (
                    <Text style={styles.descricao} numberOfLines={2}>
                      {item.descricao}
                    </Text>
                  ) : null}
                  <View style={styles.linhaResponsavel}>
                    {responsavel ? (
                      <>
                        <Avatar nome={responsavel.nome} tamanho={22} />
                        <Text style={styles.responsavel}>
                          Responsável: {responsavel.nome}
                        </Text>
                      </>
                    ) : (
                      <Text style={styles.responsavel}>
                        Responsável não identificado
                      </Text>
                    )}
                  </View>
                </View>
                {ehCoordenador && (
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={colors.textMuted}
                  />
                )}
              </View>
            </Cartao>
          );
        }}
      />

      {ehCoordenador && (
        <BotaoFlutuante
          onPress={() => navigation.navigate("LaboratorioForm")}
        />
      )}

      <ConfirmDialog
        visivel={!!laboratorioParaExcluir}
        titulo="Excluir laboratório"
        mensagem={`Deseja excluir "${laboratorioParaExcluir?.nome}"?`}
        rotuloConfirmar="Excluir"
        destrutivo
        aoConfirmar={executarExclusao}
        aoFechar={() => setLaboratorioParaExcluir(null)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: colors.background,
  },
  lista: {
    padding: spacing.md,
    paddingBottom: 100,
  },
  linha: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  iconeLaboratorio: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  nome: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
  },
  descricao: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  linhaResponsavel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
  },
  responsavel: {
    fontSize: 12,
    color: colors.textMuted,
  },
});
