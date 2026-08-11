import React from "react";
import { StyleSheet, TouchableOpacity, View, ViewStyle } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { colors, radius, shadow, spacing } from "../theme";

interface CartaoProps {
  children: React.ReactNode;
  onPress?: () => void;
  onLongPress?: () => void;
  estilo?: ViewStyle;
  indice?: number;
}

/** Cartão base com sombra e animação de entrada, usado nas listas do app. */
export const Cartao = ({
  children,
  onPress,
  onLongPress,
  estilo,
  indice = 0,
}: CartaoProps) => {
  const conteudo = onPress ? (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      onLongPress={onLongPress}
      style={[styles.cartao, estilo]}
    >
      {children}
    </TouchableOpacity>
  ) : (
    <View style={[styles.cartao, estilo]}>{children}</View>
  );

  return (
    <Animated.View
      entering={FadeInDown.delay(Math.min(indice, 8) * 60).springify()}
    >
      {conteudo}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cartao: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm + 4,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card,
  },
});
