import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "../theme";

/** Indicador de carregamento centralizado em tela cheia. */
export const Carregando = ({ mensagem }: { mensagem?: string }) => (
  <View style={styles.container}>
    <ActivityIndicator size="large" color={colors.primary} />
    {mensagem && <Text style={styles.mensagem}>{mensagem}</Text>}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
  mensagem: {
    marginTop: spacing.md,
    color: colors.textSecondary,
    fontSize: 15,
  },
});
