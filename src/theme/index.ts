export const colors = {
  primary: "#4F46E5",
  primaryDark: "#4338CA",
  primaryLight: "#EEF2FF",
  secondary: "#0EA5E9",

  background: "#F8FAFC",
  surface: "#FFFFFF",
  border: "#E2E8F0",

  text: "#0F172A",
  textSecondary: "#64748B",
  textMuted: "#94A3B8",
  textOnPrimary: "#FFFFFF",

  success: "#16A34A",
  successLight: "#DCFCE7",
  warning: "#D97706",
  warningLight: "#FEF3C7",
  danger: "#DC2626",
  dangerLight: "#FEE2E2",
  info: "#2563EB",
  infoLight: "#DBEAFE",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
};

export const shadow = {
  card: {
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
};

export const statusManutencaoTheme = {
  SOLICITADA: { label: "Solicitada", color: colors.warning, bg: colors.warningLight },
  CONCLUIDA: { label: "Concluída", color: colors.success, bg: colors.successLight },
  CANCELADA: { label: "Cancelada", color: colors.danger, bg: colors.dangerLight },
} as const;

export const tipoManutencaoTheme = {
  PREVENTIVA: { label: "Preventiva", color: colors.info, bg: colors.infoLight },
  CORRETIVA: { label: "Corretiva", color: "#9333EA", bg: "#F3E8FF" },
} as const;

export const cargoTheme = {
  COORDENADOR: { label: "Coordenador(a)", color: colors.primary, bg: colors.primaryLight },
  PROFESSOR: { label: "Professor(a)", color: colors.secondary, bg: "#E0F2FE" },
  TECNICO: { label: "Técnico(a)", color: colors.success, bg: colors.successLight },
} as const;
