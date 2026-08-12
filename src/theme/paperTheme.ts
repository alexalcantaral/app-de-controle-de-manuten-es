import { MD3LightTheme } from "react-native-paper";
import { colors, radius } from "./index";

/** Tema do react-native-paper alinhado à paleta custom do app (theme/index.ts). */
export const paperTheme = {
  ...MD3LightTheme,
  roundness: radius.md / 4,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary,
    onPrimary: colors.textOnPrimary,
    primaryContainer: colors.primaryLight,
    onPrimaryContainer: colors.primaryDark,
    secondary: colors.secondary,
    error: colors.danger,
    errorContainer: colors.dangerLight,
    background: colors.background,
    surface: colors.surface,
    onSurface: colors.text,
    onSurfaceVariant: colors.textSecondary,
    outline: colors.border,
  },
};
