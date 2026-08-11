import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing } from "../theme";

type Variante = "primario" | "secundario" | "perigo" | "contorno" | "fantasma";

interface BotaoProps {
  titulo: string;
  onPress: () => void;
  variante?: Variante;
  icone?: keyof typeof Ionicons.glyphMap;
  carregando?: boolean;
  desabilitado?: boolean;
  estilo?: ViewStyle;
}

const fundoPorVariante: Record<Variante, string> = {
  primario: colors.primary,
  secundario: colors.primaryLight,
  perigo: colors.danger,
  contorno: "transparent",
  fantasma: "transparent",
};

const textoPorVariante: Record<Variante, string> = {
  primario: colors.textOnPrimary,
  secundario: colors.primary,
  perigo: colors.textOnPrimary,
  contorno: colors.primary,
  fantasma: colors.textSecondary,
};

export const Botao = ({
  titulo,
  onPress,
  variante = "primario",
  icone,
  carregando = false,
  desabilitado = false,
  estilo,
}: BotaoProps) => {
  const corTexto = textoPorVariante[variante];
  const inativo = desabilitado || carregando;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={inativo}
      style={[
        styles.base,
        { backgroundColor: fundoPorVariante[variante] },
        variante === "contorno" && styles.contorno,
        inativo && styles.desabilitado,
        estilo,
      ]}
    >
      {carregando ? (
        <ActivityIndicator color={corTexto} />
      ) : (
        <>
          {icone && (
            <Ionicons
              name={icone}
              size={18}
              color={corTexto}
              style={styles.icone}
            />
          )}
          <Text style={[styles.texto, { color: corTexto }]}>{titulo}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    minHeight: 50,
  },
  contorno: {
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  desabilitado: {
    opacity: 0.55,
  },
  icone: {
    marginRight: spacing.sm,
  },
  texto: {
    fontSize: 16,
    fontWeight: "600",
  },
});
