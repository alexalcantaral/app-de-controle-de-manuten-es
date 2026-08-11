import React, { useCallback, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useAuth } from "../../contexts/AuthContext";
import { manutencaoService } from "../../services/manutencao.service";
import { imagemService } from "../../services/imagem.service";
import { ImagemManutencao, Manutencao } from "../../types";
import {
  colors,
  radius,
  shadow,
  spacing,
  statusManutencaoTheme,
  tipoManutencaoTheme,
} from "../../theme";
import {
  Botao,
  CampoTexto,
  Carregando,
  Etiqueta,
  VisualizadorImagem,
} from "../../components";
import { RootStackScreenProps } from "../../navigation/types";
import { formatarData, formatarDataHora, prazoVencido } from "../../utils/formatadores";
import { extrairMensagemErro } from "../../services/api";

const esquemaConcluir = z.object({
  descricaoAposFinalizada: z
    .string()
    .min(20, "A descrição precisa ter no mínimo 20 caracteres."),
});

type DadosConcluir = z.infer<typeof esquemaConcluir>;

export const ManutencaoDetalheScreen = ({
  route,
  navigation,
}: RootStackScreenProps<"ManutencaoDetalhe">) => {
  const { id } = route.params;
  const { usuario, ehCoordenador, ehProfessor, ehTecnico } = useAuth();

  const [manutencao, setManutencao] = useState<Manutencao | null>(null);
  const [imagens, setImagens] = useState<ImagemManutencao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [enviandoImagem, setEnviandoImagem] = useState(false);
  const [processando, setProcessando] = useState(false);
  const [imagemAberta, setImagemAberta] = useState<ImagemManutencao | null>(null);
  const [modalConcluir, setModalConcluir] = useState(false);

  const { control, handleSubmit, reset } = useForm<DadosConcluir>({
    resolver: zodResolver(esquemaConcluir),
    defaultValues: { descricaoAposFinalizada: "" },
  });

  const carregar = useCallback(async () => {
    try {
      const [dadosManutencao, dadosImagens] = await Promise.all([
        manutencaoService.buscarPorId(id),
        imagemService.listarDeManutencao(id).catch(() => []),
      ]);
      setManutencao(dadosManutencao);
      setImagens(dadosImagens);
    } catch (e) {
      Alert.alert("Erro", extrairMensagemErro(e), [
        { text: "Voltar", onPress: () => navigation.goBack() },
      ]);
    } finally {
      setCarregando(false);
    }
  }, [id, navigation]);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar])
  );

  if (carregando || !manutencao) {
    return <Carregando mensagem="Carregando manutenção..." />;
  }

  const temaStatus = statusManutencaoTheme[manutencao.status];
  const temaTipo = tipoManutencaoTheme[manutencao.tipo];
  const solicitada = manutencao.status === "SOLICITADA";
  const atrasada = solicitada && prazoVencido(manutencao.prazo);

  const souSolicitante = manutencao.UsuarioSolicitou?.id === usuario?.id;
  const podeEditar = solicitada && (ehCoordenador || (ehProfessor && souSolicitante));
  const podeCancelar = podeEditar;
  const podeConcluir = solicitada && ehTecnico;
  const podeDeletar = ehCoordenador;
  const podeGerenciarImagens = ehCoordenador || ehTecnico;

  const selecionarEEnviarImagens = async () => {
    const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissao.granted) {
      Alert.alert(
        "Permissão necessária",
        "Autorize o acesso às suas fotos para enviar imagens."
      );
      return;
    }

    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      quality: 0.7,
    });
    if (resultado.canceled || resultado.assets.length === 0) return;

    try {
      setEnviandoImagem(true);
      await imagemService.upload(
        id,
        resultado.assets.map((asset, indice) => ({
          uri: asset.uri,
          nome: asset.fileName ?? `imagem-${Date.now()}-${indice}.jpg`,
          mimetype: asset.mimeType ?? "image/jpeg",
        }))
      );
      const novasImagens = await imagemService.listarDeManutencao(id);
      setImagens(novasImagens);
    } catch (e) {
      Alert.alert("Erro no upload", extrairMensagemErro(e));
    } finally {
      setEnviandoImagem(false);
    }
  };

  const confirmarRemocaoImagem = (imagem: ImagemManutencao) => {
    if (!podeGerenciarImagens) return;
    Alert.alert("Remover imagem", "Deseja remover esta imagem da manutenção?", [
      { text: "Manter", style: "cancel" },
      {
        text: "Remover",
        style: "destructive",
        onPress: async () => {
          try {
            await imagemService.deletar(imagem.id);
            setImagens((atuais) => atuais.filter((i) => i.id !== imagem.id));
          } catch (e) {
            Alert.alert("Erro", extrairMensagemErro(e));
          }
        },
      },
    ]);
  };

  const executarAcao = async (acao: () => Promise<unknown>, sucesso: string) => {
    try {
      setProcessando(true);
      await acao();
      Alert.alert("Tudo certo", sucesso);
      await carregar();
    } catch (e) {
      Alert.alert("Erro", extrairMensagemErro(e));
    } finally {
      setProcessando(false);
    }
  };

  const aoConcluir = handleSubmit(async ({ descricaoAposFinalizada }) => {
    setModalConcluir(false);
    reset();
    await executarAcao(
      () => manutencaoService.concluir(id, descricaoAposFinalizada),
      "Manutenção concluída com sucesso."
    );
  });

  const confirmarCancelamento = () => {
    Alert.alert("Cancelar manutenção", "Deseja realmente cancelar esta manutenção?", [
      { text: "Voltar", style: "cancel" },
      {
        text: "Cancelar manutenção",
        style: "destructive",
        onPress: () =>
          executarAcao(
            () => manutencaoService.cancelar(id),
            "Manutenção cancelada."
          ),
      },
    ]);
  };

  const confirmarExclusao = () => {
    Alert.alert(
      "Excluir manutenção",
      "Esta ação é permanente e removerá também as imagens. Continuar?",
      [
        { text: "Voltar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              setProcessando(true);
              await manutencaoService.deletar(id);
              navigation.goBack();
            } catch (e) {
              Alert.alert("Erro", extrairMensagemErro(e));
            } finally {
              setProcessando(false);
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.tela} contentContainerStyle={{ paddingBottom: 48 }}>
      {/* Cabeçalho */}
      <Animated.View entering={FadeInDown} style={styles.cartao}>
        <View style={styles.linhaTopo}>
          <Text style={styles.identificador}>Manutenção #{manutencao.id}</Text>
          <View style={styles.etiquetas}>
            <Etiqueta texto={temaTipo.label} cor={temaTipo.color} fundo={temaTipo.bg} />
            <Etiqueta
              texto={temaStatus.label}
              cor={temaStatus.color}
              fundo={temaStatus.bg}
            />
          </View>
        </View>

        <Text style={styles.descricao}>{manutencao.descricaoSolicitada}</Text>

        <LinhaDetalhe
          icone="flask-outline"
          rotulo="Laboratório"
          valor={
            manutencao.LaboratorioManutencao?.nome ??
            `#${manutencao.laboratorioId ?? "?"}`
          }
        />
        <LinhaDetalhe
          icone="person-outline"
          rotulo="Solicitada por"
          valor={manutencao.UsuarioSolicitou?.nome ?? "—"}
        />
        <LinhaDetalhe
          icone="build-outline"
          rotulo="Técnico responsável"
          valor={manutencao.TecnicoResponsavel?.nome ?? "—"}
        />
        <LinhaDetalhe
          icone="time-outline"
          rotulo="Solicitada em"
          valor={formatarDataHora(manutencao.dataSolicitada)}
        />
        <LinhaDetalhe
          icone="calendar-outline"
          rotulo="Prazo"
          valor={`${formatarData(manutencao.prazo)}${atrasada ? " (vencido)" : ""}`}
          corValor={atrasada ? colors.danger : undefined}
        />
      </Animated.View>

      {/* Descrição de conclusão */}
      {manutencao.descricaoAposFinalizada && (
        <Animated.View entering={FadeInDown.delay(80)} style={styles.cartao}>
          <Text style={styles.tituloSecao}>Relato da conclusão</Text>
          <Text style={styles.textoConclusao}>
            {manutencao.descricaoAposFinalizada}
          </Text>
        </Animated.View>
      )}

      {/* Galeria de imagens */}
      <Animated.View entering={FadeInDown.delay(160)} style={styles.cartao}>
        <View style={styles.linhaTopo}>
          <Text style={styles.tituloSecao}>
            Imagens ({imagens.length})
          </Text>
          {podeGerenciarImagens && (
            <TouchableOpacity
              style={styles.botaoUpload}
              onPress={selecionarEEnviarImagens}
              disabled={enviandoImagem}
            >
              <Ionicons
                name={enviandoImagem ? "cloud-upload" : "add"}
                size={18}
                color={colors.primary}
              />
              <Text style={styles.botaoUploadTexto}>
                {enviandoImagem ? "Enviando..." : "Adicionar"}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {imagens.length === 0 ? (
          <Text style={styles.semImagens}>
            Nenhuma imagem anexada a esta manutenção.
          </Text>
        ) : (
          <View style={styles.galeria}>
            {imagens.map((imagem) => (
              <TouchableOpacity
                key={imagem.id}
                activeOpacity={0.8}
                onPress={() => setImagemAberta(imagem)}
                onLongPress={() => confirmarRemocaoImagem(imagem)}
              >
                <Image source={{ uri: imagem.url }} style={styles.miniatura} />
              </TouchableOpacity>
            ))}
          </View>
        )}
        {podeGerenciarImagens && imagens.length > 0 && (
          <Text style={styles.dicaImagens}>
            Toque para ampliar · segure para remover
          </Text>
        )}
      </Animated.View>

      {/* Ações */}
      <View style={styles.acoes}>
        {podeConcluir && (
          <Botao
            titulo="Concluir manutenção"
            icone="checkmark-done-outline"
            onPress={() => setModalConcluir(true)}
            carregando={processando}
          />
        )}
        {podeEditar && (
          <Botao
            titulo="Editar"
            icone="create-outline"
            variante="secundario"
            onPress={() => navigation.navigate("ManutencaoForm", { manutencao })}
          />
        )}
        {podeCancelar && (
          <Botao
            titulo="Cancelar manutenção"
            icone="close-circle-outline"
            variante="contorno"
            onPress={confirmarCancelamento}
            carregando={processando}
          />
        )}
        {podeDeletar && (
          <Botao
            titulo="Excluir"
            icone="trash-outline"
            variante="perigo"
            onPress={confirmarExclusao}
            carregando={processando}
          />
        )}
      </View>

      {/* Visualizador de mídia em tela cheia */}
      <VisualizadorImagem
        imagem={imagemAberta}
        aoFechar={() => setImagemAberta(null)}
      />

      {/* Modal de conclusão (técnico) */}
      <Modal
        visible={modalConcluir}
        transparent
        animationType="slide"
        onRequestClose={() => setModalConcluir(false)}
      >
        <View style={styles.fundoModal}>
          <View style={styles.conteudoModal}>
            <Text style={styles.tituloModal}>Concluir manutenção</Text>
            <Text style={styles.subtituloModal}>
              Descreva o serviço realizado (mínimo de 20 caracteres).
            </Text>
            <CampoTexto
              control={control}
              name="descricaoAposFinalizada"
              rotulo="Descrição do serviço"
              placeholder="Ex.: Substituída a fonte do computador 3 e refeito o cabeamento da bancada."
              multiline
            />
            <Botao titulo="Confirmar conclusão" onPress={aoConcluir} />
            <Botao
              titulo="Voltar"
              variante="fantasma"
              onPress={() => setModalConcluir(false)}
            />
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const LinhaDetalhe = ({
  icone,
  rotulo,
  valor,
  corValor,
}: {
  icone: keyof typeof Ionicons.glyphMap;
  rotulo: string;
  valor: string;
  corValor?: string;
}) => (
  <View style={styles.linhaDetalhe}>
    <Ionicons name={icone} size={18} color={colors.textMuted} />
    <Text style={styles.rotuloDetalhe}>{rotulo}</Text>
    <Text style={[styles.valorDetalhe, corValor ? { color: corValor } : null]}>
      {valor}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: colors.background,
  },
  cartao: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    margin: spacing.md,
    marginBottom: 0,
    padding: spacing.md,
    ...shadow.card,
  },
  linhaTopo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  identificador: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textMuted,
  },
  etiquetas: {
    flexDirection: "row",
    gap: spacing.xs + 2,
  },
  descricao: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    lineHeight: 23,
    marginBottom: spacing.md,
  },
  linhaDetalhe: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 7,
    gap: spacing.sm,
  },
  rotuloDetalhe: {
    fontSize: 14,
    color: colors.textSecondary,
    width: 130,
  },
  valorDetalhe: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  },
  tituloSecao: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
  },
  textoConclusao: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 21,
    marginTop: spacing.sm,
  },
  botaoUpload: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.full,
  },
  botaoUploadTexto: {
    color: colors.primary,
    fontWeight: "600",
    fontSize: 13,
  },
  semImagens: {
    fontSize: 14,
    color: colors.textSecondary,
    paddingVertical: spacing.sm,
  },
  galeria: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  miniatura: {
    width: 96,
    height: 96,
    borderRadius: radius.md,
    backgroundColor: colors.border,
  },
  dicaImagens: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
  acoes: {
    margin: spacing.md,
    gap: spacing.sm,
  },
  fundoModal: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.5)",
    justifyContent: "flex-end",
  },
  conteudoModal: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  tituloModal: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.text,
  },
  subtituloModal: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
    marginBottom: spacing.md,
  },
});
