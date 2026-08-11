import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing } from "../theme";

interface ListaVaziaProps {
  titulo: string;
  mensagem?: string;
  icone?: keyof typeof Ionicons.glyphMap;
}

/** Estado vazio padrão para as listas do aplicativo. */
export const ListaVazia = ({
  titulo,
  mensagem,
  icone = "file-tray-outline",
}: ListaVaziaProps) => (
  <View style={styles.container}>
    <View style={styles.circulo}>
      <Ionicons name={icone} size={36} color={colors.primary} />
    </View>
    <Text style={styles.titulo}>{titulo}</Text>
    {mensagem && <Text style={styles.mensagem}>{mensagem}</Text>}
  </View>
);

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: spacing.xl * 2,
    paddingHorizontal: spacing.lg,
  },
  circulo: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  titulo: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.text,
    textAlign: "center",
  },
  mensagem: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: spacing.xs,
  },
});
