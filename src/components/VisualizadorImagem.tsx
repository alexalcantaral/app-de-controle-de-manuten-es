import React from "react";
import {
  Dimensions,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ImagemManutencao } from "../types";
import { colors, spacing } from "../theme";

interface VisualizadorImagemProps {
  imagem: ImagemManutencao | null;
  aoFechar: () => void;
}

const { width } = Dimensions.get("window");

/** Modal de visualização de mídia em tela cheia. */
export const VisualizadorImagem = ({
  imagem,
  aoFechar,
}: VisualizadorImagemProps) => (
  <Modal
    visible={!!imagem}
    transparent
    animationType="fade"
    onRequestClose={aoFechar}
  >
    <View style={styles.fundo}>
      <TouchableOpacity style={styles.botaoFechar} onPress={aoFechar}>
        <Ionicons name="close" size={28} color="#FFF" />
      </TouchableOpacity>
      {imagem && (
        <>
          <Image
            source={{ uri: imagem.url }}
            style={styles.imagem}
            resizeMode="contain"
          />
          <View style={styles.rodape}>
            <Ionicons name="image-outline" size={16} color="#CBD5E1" />
            <Text style={styles.legenda} numberOfLines={1}>
              {imagem.mimetype} · manutenção #{imagem.manutencaoId}
            </Text>
          </View>
        </>
      )}
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  fundo: {
    flex: 1,
    backgroundColor: "rgba(2, 6, 23, 0.96)",
    alignItems: "center",
    justifyContent: "center",
  },
  botaoFechar: {
    position: "absolute",
    top: 56,
    right: spacing.lg,
    zIndex: 2,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  imagem: {
    width,
    height: "70%",
  },
  rodape: {
    position: "absolute",
    bottom: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  legenda: {
    color: "#CBD5E1",
    fontSize: 13,
  },
});
