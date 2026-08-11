import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import MapView, { Marker, MapPressEvent } from "react-native-maps";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { instituicaoService } from "../../services/instituicao.service";
import { colors, radius, spacing } from "../../theme";
import { Botao, CampoTexto } from "../../components";
import { RootStackScreenProps } from "../../navigation/types";
import { extrairMensagemErro } from "../../services/api";

const esquemaInstituicao = z.object({
  nome: z
    .string()
    .min(3, "O nome deve ter pelo menos 3 caracteres")
    .max(50, "O nome deve ter no máximo 50 caracteres"),
  cnpj: z
    .string()
    .regex(/^\d{14}$/, "O CNPJ deve ter exatamente 14 números (sem pontuação)"),
});

type DadosInstituicao = z.infer<typeof esquemaInstituicao>;

export const InstituicaoFormScreen = ({
  route,
  navigation,
}: RootStackScreenProps<"InstituicaoForm">) => {
  const instituicao = route.params?.instituicao;
  const editando = !!instituicao;

  const [coordenada, setCoordenada] = useState({
    latitude: instituicao?.latitude ?? route.params?.latitude ?? -6.8897,
    longitude: instituicao?.longitude ?? route.params?.longitude ?? -38.5578,
  });
  const [enviando, setEnviando] = useState(false);

  const { control, handleSubmit } = useForm<DadosInstituicao>({
    resolver: zodResolver(esquemaInstituicao),
    defaultValues: {
      nome: instituicao?.nome ?? "",
      cnpj: instituicao?.cnpj ?? "",
    },
  });

  const aoTocarMapa = (evento: MapPressEvent) => {
    setCoordenada(evento.nativeEvent.coordinate);
  };

  const aoSalvar = handleSubmit(async (dados) => {
    try {
      setEnviando(true);
      const payload = {
        nome: dados.nome,
        cnpj: dados.cnpj,
        latitude: coordenada.latitude,
        longitude: coordenada.longitude,
      };
      if (editando) {
        await instituicaoService.editar(instituicao.id, payload);
        Alert.alert("Tudo certo", "Instituição atualizada com sucesso.");
      } else {
        await instituicaoService.criar(payload);
        Alert.alert("Tudo certo", "Instituição cadastrada com sucesso.");
      }
      navigation.goBack();
    } catch (e) {
      Alert.alert("Erro ao salvar", extrairMensagemErro(e));
    } finally {
      setEnviando(false);
    }
  });

  return (
    <ScrollView
      style={styles.tela}
      contentContainerStyle={styles.conteudo}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.explicacao}>
        Preencha os dados da instituição e toque no mapa para ajustar a
        localização exata.
      </Text>

      <CampoTexto
        control={control}
        name="nome"
        rotulo="Nome da instituição"
        placeholder="Ex.: IFPB Campus Cajazeiras"
        icone="school-outline"
      />

      <CampoTexto
        control={control}
        name="cnpj"
        rotulo="CNPJ (somente números)"
        placeholder="00000000000000"
        icone="document-text-outline"
        keyboardType="number-pad"
      />

      <Text style={styles.rotuloMapa}>Localização</Text>
      <View style={styles.mapaContainer}>
        <MapView
          style={styles.mapa}
          initialRegion={{
            ...coordenada,
            latitudeDelta: 0.03,
            longitudeDelta: 0.03,
          }}
          onPress={aoTocarMapa}
        >
          <Marker
            coordinate={coordenada}
            draggable
            onDragEnd={(evento) =>
              setCoordenada(evento.nativeEvent.coordinate)
            }
          />
        </MapView>
      </View>
      <Text style={styles.coordenadas}>
        Lat: {coordenada.latitude.toFixed(6)} · Long:{" "}
        {coordenada.longitude.toFixed(6)}
      </Text>

      <Botao
        titulo={editando ? "Salvar alterações" : "Cadastrar instituição"}
        icone="save-outline"
        onPress={aoSalvar}
        carregando={enviando}
        estilo={{ marginTop: spacing.md }}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: colors.background,
  },
  conteudo: {
    padding: spacing.md,
    paddingBottom: spacing.xl * 2,
  },
  explicacao: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  rotuloMapa: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 6,
  },
  mapaContainer: {
    borderRadius: radius.lg,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  mapa: {
    width: "100%",
    height: 240,
  },
  coordenadas: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 6,
    textAlign: "center",
  },
});
