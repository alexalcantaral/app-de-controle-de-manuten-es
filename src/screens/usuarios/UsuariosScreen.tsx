import React, { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { usuarioService } from "../../services/usuario.service";
import { Cargo, Usuario } from "../../types";
import { cargoTheme, colors, radius, spacing } from "../../theme";
import {
  Avatar,
  BotaoFlutuante,
  Carregando,
  Cartao,
  Etiqueta,
  FiltroChips,
  ListaVazia,
} from "../../components";
import { RootStackParamList } from "../../navigation/types";
import { extrairMensagemErro } from "../../services/api";

type Navegacao = NativeStackNavigationProp<RootStackParamList>;

type FiltroCargo = Cargo | undefined;

const OPCOES_CARGO: { rotulo: string; valor: FiltroCargo }[] = [
  { rotulo: "Todos", valor: undefined },
  { rotulo: cargoTheme.COORDENADOR.label, valor: "COORDENADOR" },
  { rotulo: cargoTheme.PROFESSOR.label, valor: "PROFESSOR" },
  { rotulo: cargoTheme.TECNICO.label, valor: "TECNICO" },
];

export const UsuariosScreen = () => {
  const navigation = useNavigation<Navegacao>();

  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [busca, setBusca] = useState("");
  const [incluirInativos, setIncluirInativos] = useState(false);
  const [filtroCargo, setFiltroCargo] = useState<FiltroCargo>(undefined);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(
    async (termo: string, inativos: boolean, cargo: FiltroCargo) => {
      try {
        setErro(null);
        const dados = await usuarioService.listar(termo, inativos, cargo);
        setUsuarios(dados);
      } catch (e) {
        setErro(extrairMensagemErro(e));
      } finally {
        setCarregando(false);
        setAtualizando(false);
      }
    },
    []
  );

  // Busca na API com debounce enquanto o usuário digita
  useEffect(() => {
    const timer = setTimeout(
      () => carregar(busca, incluirInativos, filtroCargo),
      350
    );
    return () => clearTimeout(timer);
  }, [busca, incluirInativos, filtroCargo, carregar]);

  if (carregando) return <Carregando mensagem="Buscando usuários..." />;

  return (
    <View style={styles.tela}>
      <View style={styles.filtros}>
        <View style={styles.caixaBusca}>
          <Ionicons name="search-outline" size={20} color={colors.textMuted} />
          <TextInput
            style={styles.inputBusca}
            placeholder="Buscar por nome ou e-mail..."
            placeholderTextColor={colors.textMuted}
            value={busca}
            onChangeText={setBusca}
            autoCapitalize="none"
          />
        </View>
        <View style={styles.linhaInativos}>
          <Text style={styles.rotuloInativos}>Incluir usuários inativos</Text>
          <Switch
            value={incluirInativos}
            onValueChange={setIncluirInativos}
            trackColor={{ true: colors.primary, false: colors.border }}
            thumbColor="#FFF"
          />
        </View>
      </View>

      <FiltroChips
        opcoes={OPCOES_CARGO}
        valorSelecionado={filtroCargo}
        aoSelecionar={setFiltroCargo}
      />

      <FlatList
        data={usuarios}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.lista}
        refreshControl={
          <RefreshControl
            refreshing={atualizando}
            onRefresh={() => {
              setAtualizando(true);
              carregar(busca, incluirInativos, filtroCargo);
            }}
            colors={[colors.primary]}
          />
        }
        ListEmptyComponent={
          <ListaVazia
            icone="people-outline"
            titulo={erro ? "Erro ao carregar" : "Nenhum usuário encontrado"}
            mensagem={erro ?? "Ajuste a busca ou cadastre um novo usuário."}
          />
        }
        renderItem={({ item, index }) => {
          const tema = cargoTheme[item.cargo];
          return (
            <Cartao
              indice={index}
              onPress={() => navigation.navigate("UsuarioForm", { usuario: item })}
            >
              <View style={styles.linha}>
                <Avatar nome={item.nome} cor={tema.color} fundo={tema.bg} />
                <View style={{ flex: 1 }}>
                  <View style={styles.linhaNome}>
                    <Text style={styles.nome} numberOfLines={1}>
                      {item.nome}
                    </Text>
                    {!item.ativo && (
                      <Etiqueta
                        pequena
                        texto="Inativo"
                        cor={colors.textSecondary}
                        fundo={colors.border}
                      />
                    )}
                  </View>
                  <Text style={styles.email} numberOfLines={1}>
                    {item.email}
                  </Text>
                  <View style={{ marginTop: 6 }}>
                    <Etiqueta
                      pequena
                      texto={tema.label}
                      cor={tema.color}
                      fundo={tema.bg}
                    />
                  </View>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={colors.textMuted}
                />
              </View>
            </Cartao>
          );
        }}
      />

      <BotaoFlutuante onPress={() => navigation.navigate("UsuarioForm")} />
    </View>
  );
};

const styles = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: colors.background,
  },
  filtros: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  caixaBusca: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  inputBusca: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.text,
  },
  linhaInativos: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.sm,
  },
  rotuloInativos: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  lista: {
    padding: spacing.md,
    paddingTop: 0,
    paddingBottom: 100,
  },
  linha: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  linhaNome: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  nome: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
    flexShrink: 1,
  },
  email: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
