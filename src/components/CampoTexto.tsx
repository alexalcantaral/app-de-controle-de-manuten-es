import React, { useState } from "react";
import {
  Control,
  Controller,
  FieldPath,
  FieldValues,
} from "react-hook-form";
import {
  KeyboardTypeOptions,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing } from "../theme";

interface CampoTextoProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  rotulo: string;
  placeholder?: string;
  icone?: keyof typeof Ionicons.glyphMap;
  segredo?: boolean;
  multiline?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
}

/** Campo de texto controlado pelo react-hook-form com exibição de erro de validação. */
export function CampoTexto<T extends FieldValues>({
  control,
  name,
  rotulo,
  placeholder,
  icone,
  segredo = false,
  multiline = false,
  keyboardType,
  autoCapitalize = "sentences",
}: CampoTextoProps<T>) {
  const [ocultar, setOcultar] = useState(segredo);
  const [focado, setFocado] = useState(false);

  return (
    <Controller
      control={control}
      name={name}
      render={({
        field: { value, onChange, onBlur },
        fieldState: { error },
      }) => (
        <View style={styles.container}>
          <Text style={styles.rotulo}>{rotulo}</Text>
          <View
            style={[
              styles.caixa,
              multiline && styles.caixaMultiline,
              focado && styles.caixaFocada,
              !!error && styles.caixaErro,
            ]}
          >
            {icone && (
              <Ionicons
                name={icone}
                size={20}
                color={focado ? colors.primary : colors.textMuted}
                style={styles.icone}
              />
            )}
            <TextInput
              style={[styles.input, multiline && styles.inputMultiline]}
              value={value != null ? String(value) : ""}
              onChangeText={onChange}
              onBlur={() => {
                setFocado(false);
                onBlur();
              }}
              onFocus={() => setFocado(true)}
              placeholder={placeholder}
              placeholderTextColor={colors.textMuted}
              secureTextEntry={ocultar}
              multiline={multiline}
              keyboardType={keyboardType}
              autoCapitalize={autoCapitalize}
            />
            {segredo && (
              <TouchableOpacity onPress={() => setOcultar(!ocultar)}>
                <Ionicons
                  name={ocultar ? "eye-outline" : "eye-off-outline"}
                  size={20}
                  color={colors.textMuted}
                />
              </TouchableOpacity>
            )}
          </View>
          {error && <Text style={styles.erro}>{error.message}</Text>}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  rotulo: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 6,
  },
  caixa: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    minHeight: 52,
  },
  caixaMultiline: {
    alignItems: "flex-start",
    paddingVertical: spacing.sm,
  },
  caixaFocada: {
    borderColor: colors.primary,
  },
  caixaErro: {
    borderColor: colors.danger,
  },
  icone: {
    marginRight: spacing.sm,
    marginTop: 0,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    paddingVertical: 12,
  },
  inputMultiline: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  erro: {
    color: colors.danger,
    fontSize: 13,
    marginTop: 4,
  },
});
