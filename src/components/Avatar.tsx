import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors } from "../theme";
import { iniciaisDoNome } from "../utils/formatadores";

interface AvatarProps {
  nome: string;
  tamanho?: number;
  cor?: string;
  fundo?: string;
}

/** Avatar circular com as iniciais do nome. */
export const Avatar = ({
  nome,
  tamanho = 44,
  cor = colors.primary,
  fundo = colors.primaryLight,
}: AvatarProps) => (
  <View
    style={[
      styles.circulo,
      {
        width: tamanho,
        height: tamanho,
        borderRadius: tamanho / 2,
        backgroundColor: fundo,
      },
    ]}
  >
    <Text style={[styles.texto, { color: cor, fontSize: tamanho * 0.38 }]}>
      {iniciaisDoNome(nome)}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  circulo: {
    alignItems: "center",
    justifyContent: "center",
  },
  texto: {
    fontWeight: "700",
  },
});
