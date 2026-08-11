import React, { useState } from "react";
import {
  Control,
  Controller,
  FieldPath,
  FieldValues,
} from "react-hook-form";
import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing } from "../theme";
import { formatarData } from "../utils/formatadores";

interface CampoDataProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  rotulo: string;
  dataMinima?: Date;
}

/** Campo de data com seletor nativo, controlado pelo react-hook-form. */
export function CampoData<T extends FieldValues>({
  control,
  name,
  rotulo,
  dataMinima,
}: CampoDataProps<T>) {
  const [aberto, setAberto] = useState(false);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { value, onChange }, fieldState: { error } }) => (
        <View style={styles.container}>
          <Text style={styles.rotulo}>{rotulo}</Text>
          <TouchableOpacity
            activeOpacity={0.7}
            style={[styles.caixa, !!error && styles.caixaErro]}
            onPress={() => setAberto(true)}
          >
            <Ionicons
              name="calendar-outline"
              size={20}
              color={colors.textMuted}
              style={{ marginRight: spacing.sm }}
            />
            <Text
              style={[styles.valor, !value && { color: colors.textMuted }]}
            >
              {value ? formatarData(value) : "Selecione a data"}
            </Text>
          </TouchableOpacity>
          {error && <Text style={styles.erro}>{error.message}</Text>}

          {aberto && (
            <DateTimePicker
              value={value ? new Date(value) : dataMinima ?? new Date()}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              minimumDate={dataMinima}
              onChange={(_evento, dataSelecionada) => {
                setAberto(false);
                if (dataSelecionada) onChange(dataSelecionada.toISOString());
              }}
            />
          )}
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
  caixaErro: {
    borderColor: colors.danger,
  },
  valor: {
    fontSize: 16,
    color: colors.text,
  },
  erro: {
    color: colors.danger,
    fontSize: 13,
    marginTop: 4,
  },
});
