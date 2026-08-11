import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { radius } from "../theme";

interface EtiquetaProps {
  texto: string;
  cor: string;
  fundo: string;
  pequena?: boolean;
}

/** Selo colorido usado para status, tipo e cargo. */
export const Etiqueta = ({ texto, cor, fundo, pequena = false }: EtiquetaProps) => (
  <View style={[styles.base, { backgroundColor: fundo }, pequena && styles.pequena]}>
    <Text style={[styles.texto, { color: cor }, pequena && styles.textoPequeno]}>
      {texto}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.full,
    paddingHorizontal: 12,
    paddingVertical: 5,
    alignSelf: "flex-start",
  },
  pequena: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  texto: {
    fontSize: 13,
    fontWeight: "600",
  },
  textoPequeno: {
    fontSize: 11,
  },
});
