import React, { useState } from "react";
import {
  Control,
  Controller,
  FieldPath,
  FieldValues,
} from "react-hook-form";
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing } from "../theme";

export interface OpcaoSelecao {
  rotulo: string;
  valor: string | number;
  descricao?: string;
}

interface CampoSelecaoProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  rotulo: string;
  placeholder?: string;
  opcoes: OpcaoSelecao[];
  icone?: keyof typeof Ionicons.glyphMap;
}

/** Campo de seleção (abre um modal com a lista de opções), controlado pelo react-hook-form. */
export function CampoSelecao<T extends FieldValues>({
  control,
  name,
  rotulo,
  placeholder = "Selecione...",
  opcoes,
  icone,
}: CampoSelecaoProps<T>) {
  const [aberto, setAberto] = useState(false);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { value, onChange }, fieldState: { error } }) => {
        const opcaoSelecionada = opcoes.find((o) => o.valor === value);
        return (
          <View style={styles.container}>
            <Text style={styles.rotulo}>{rotulo}</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              style={[styles.caixa, !!error && styles.caixaErro]}
              onPress={() => setAberto(true)}
            >
              {icone && (
                <Ionicons
                  name={icone}
                  size={20}
                  color={colors.textMuted}
                  style={{ marginRight: spacing.sm }}
                />
              )}
              <Text
                style={[
                  styles.valor,
                  !opcaoSelecionada && { color: colors.textMuted },
                ]}
                numberOfLines={1}
              >
                {opcaoSelecionada?.rotulo ?? placeholder}
              </Text>
              <Ionicons
                name="chevron-down"
                size={20}
                color={colors.textMuted}
              />
            </TouchableOpacity>
            {error && <Text style={styles.erro}>{error.message}</Text>}

            <Modal
              visible={aberto}
              transparent
              animationType="slide"
              onRequestClose={() => setAberto(false)}
            >
              <TouchableOpacity
                style={styles.fundoModal}
                activeOpacity={1}
                onPress={() => setAberto(false)}
              >
                <View style={styles.conteudoModal}>
                  <View style={styles.puxador} />
                  <Text style={styles.tituloModal}>{rotulo}</Text>
                  <FlatList
                    data={opcoes}
                    keyExtractor={(item) => String(item.valor)}
                    ListEmptyComponent={
                      <Text style={styles.listaVazia}>
                        Nenhuma opção disponível
                      </Text>
                    }
                    renderItem={({ item }) => {
                      const selecionada = item.valor === value;
                      return (
                        <TouchableOpacity
                          style={[
                            styles.opcao,
                            selecionada && styles.opcaoSelecionada,
                          ]}
                          onPress={() => {
                            onChange(item.valor);
                            setAberto(false);
                          }}
                        >
                          <View style={{ flex: 1 }}>
                            <Text
                              style={[
                                styles.opcaoTexto,
                                selecionada && { color: colors.primary },
                              ]}
                            >
                              {item.rotulo}
                            </Text>
                            {item.descricao && (
                              <Text style={styles.opcaoDescricao}>
                                {item.descricao}
                              </Text>
                            )}
                          </View>
                          {selecionada && (
                            <Ionicons
                              name="checkmark-circle"
                              size={22}
                              color={colors.primary}
                            />
                          )}
                        </TouchableOpacity>
                      );
                    }}
                  />
                </View>
              </TouchableOpacity>
            </Modal>
          </View>
        );
      }}
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
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  erro: {
    color: colors.danger,
    fontSize: 13,
    marginTop: 4,
  },
  fundoModal: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.5)",
    justifyContent: "flex-end",
  },
  conteudoModal: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.lg,
    maxHeight: "70%",
  },
  puxador: {
    width: 44,
    height: 5,
    borderRadius: radius.full,
    backgroundColor: colors.border,
    alignSelf: "center",
    marginBottom: spacing.md,
  },
  tituloModal: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    marginBottom: spacing.md,
  },
  listaVazia: {
    color: colors.textSecondary,
    textAlign: "center",
    paddingVertical: spacing.lg,
  },
  opcao: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
  },
  opcaoSelecionada: {
    backgroundColor: colors.primaryLight,
  },
  opcaoTexto: {
    fontSize: 16,
    color: colors.text,
    fontWeight: "500",
  },
  opcaoDescricao: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
