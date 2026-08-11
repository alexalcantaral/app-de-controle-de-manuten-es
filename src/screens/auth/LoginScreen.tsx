import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { useAuth } from "../../contexts/AuthContext";
import { Botao, CampoTexto } from "../../components";
import { colors, radius, spacing } from "../../theme";
import { extrairMensagemErro } from "../../services/api";

const esquemaLogin = z.object({
  email: z
    .string()
    .min(1, "Informe o e-mail")
    .email("O e-mail informado não é válido"),
  senha: z
    .string()
    .min(6, "A senha deve ter pelo menos 6 caracteres"),
});

type DadosLogin = z.infer<typeof esquemaLogin>;

export const LoginScreen = () => {
  const { login } = useAuth();
  const [enviando, setEnviando] = useState(false);

  const { control, handleSubmit } = useForm<DadosLogin>({
    resolver: zodResolver(esquemaLogin),
    defaultValues: { email: "", senha: "" },
  });

  const aoEntrar = handleSubmit(async ({ email, senha }) => {
    try {
      setEnviando(true);
      await login(email.trim(), senha);
    } catch (erro) {
      Alert.alert("Falha no login", extrairMensagemErro(erro));
    } finally {
      setEnviando(false);
    }
  });

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View entering={FadeInUp.duration(600)} style={styles.topo}>
          <View style={styles.logo}>
            <Ionicons name="construct" size={40} color={colors.textOnPrimary} />
          </View>
          <Text style={styles.titulo}>Manutenções IFPB</Text>
          <Text style={styles.subtitulo}>
            Controle de manutenções de laboratórios e equipamentos
          </Text>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(200).duration(600)}
          style={styles.formulario}
        >
          <Text style={styles.tituloFormulario}>Entrar</Text>
          <CampoTexto
            control={control}
            name="email"
            rotulo="E-mail"
            placeholder="seu@email.com"
            icone="mail-outline"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <CampoTexto
            control={control}
            name="senha"
            rotulo="Senha"
            placeholder="Sua senha"
            icone="lock-closed-outline"
            segredo
            autoCapitalize="none"
          />
          <Botao
            titulo="Entrar"
            icone="log-in-outline"
            onPress={aoEntrar}
            carregando={enviando}
            estilo={{ marginTop: spacing.sm }}
          />
          <Text style={styles.dica}>
            Acesse com as credenciais fornecidas pela coordenação.
          </Text>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.primary,
    justifyContent: "flex-end",
  },
  topo: {
    alignItems: "center",
    paddingVertical: spacing.xl * 1.5,
    paddingHorizontal: spacing.lg,
  },
  logo: {
    width: 84,
    height: 84,
    borderRadius: 26,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  titulo: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.textOnPrimary,
  },
  subtitulo: {
    fontSize: 14,
    color: "rgba(255,255,255,0.85)",
    textAlign: "center",
    marginTop: spacing.xs,
    maxWidth: 280,
  },
  formulario: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.xl + 8,
    borderTopRightRadius: radius.xl + 8,
    padding: spacing.lg,
    paddingBottom: spacing.xl * 1.5,
  },
  tituloFormulario: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.text,
    marginBottom: spacing.md,
  },
  dica: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: spacing.md,
  },
});
