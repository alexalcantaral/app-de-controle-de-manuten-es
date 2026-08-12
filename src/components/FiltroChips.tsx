import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity } from "react-native";
import { colors, radius, spacing } from "../theme";

export interface OpcaoChip<V> {
  rotulo: string;
  valor: V;
}

interface FiltroChipsProps<V> {
  opcoes: OpcaoChip<V>[];
  valorSelecionado: V;
  aoSelecionar: (valor: V) => void;
}

/** Linha horizontal de chips de filtro (usada nas listagens). */
export function FiltroChips<V extends string | undefined>({
  opcoes,
  valorSelecionado,
  aoSelecionar,
}: FiltroChipsProps<V>) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scroll}
      contentContainerStyle={styles.container}
    >
      {opcoes.map((opcao) => {
        const ativo = opcao.valor === valorSelecionado;
        return (
          <TouchableOpacity
            key={opcao.rotulo}
            style={[styles.chip, ativo && styles.chipAtivo]}
            onPress={() => aoSelecionar(opcao.valor)}
          >
            <Text style={[styles.texto, ativo && styles.textoAtivo]}>
              {opcao.rotulo}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 0,
  },
  container: {
    flexGrow: 0,
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  chipAtivo: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  texto: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  textoAtivo: {
    color: colors.textOnPrimary,
  },
});
