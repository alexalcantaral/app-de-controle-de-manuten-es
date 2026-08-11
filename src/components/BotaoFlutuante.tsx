import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { ZoomIn } from "react-native-reanimated";
import { colors, spacing } from "../theme";

interface BotaoFlutuanteProps {
  onPress: () => void;
  icone?: keyof typeof Ionicons.glyphMap;
}

/** Botão de ação flutuante (FAB) exibido no canto inferior direito. */
export const BotaoFlutuante = ({
  onPress,
  icone = "add",
}: BotaoFlutuanteProps) => (
  <Animated.View entering={ZoomIn.delay(200)} style={styles.container}>
    <TouchableOpacity activeOpacity={0.8} style={styles.botao} onPress={onPress}>
      <Ionicons name={icone} size={28} color={colors.textOnPrimary} />
    </TouchableOpacity>
  </Animated.View>
);

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    right: spacing.lg,
    bottom: spacing.lg,
  },
  botao: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
});
