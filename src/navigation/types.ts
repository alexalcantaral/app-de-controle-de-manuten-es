import { NavigatorScreenParams } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { InstituicaoEnsino, Laboratorio, Manutencao, Usuario } from "../types";

export type RootStackParamList = {
  Tabs: NavigatorScreenParams<TabsParamList> | undefined;
  ManutencaoDetalhe: { id: number };
  ManutencaoForm: { manutencao?: Manutencao } | undefined;
  Laboratorios: undefined;
  LaboratorioForm: { laboratorio?: Laboratorio } | undefined;
  InstituicaoForm:
    | { instituicao?: InstituicaoEnsino; latitude?: number; longitude?: number }
    | undefined;
  Usuarios: undefined;
  UsuarioForm: { usuario?: Usuario } | undefined;
  Dashboard: undefined;
};

export type TabsParamList = {
  Inicio: undefined;
  Manutencoes: undefined;
  Mapa: undefined;
  Perfil: undefined;
};

export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;
