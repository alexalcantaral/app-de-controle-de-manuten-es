import React from "react";
import { DefaultTheme, NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../contexts/AuthContext";
import { colors } from "../theme";
import { Carregando } from "../components";
import { RootStackParamList, TabsParamList } from "./types";

import { LoginScreen } from "../screens/auth/LoginScreen";
import { InicioScreen } from "../screens/inicio/InicioScreen";
import { ManutencoesScreen } from "../screens/manutencoes/ManutencoesScreen";
import { ManutencaoDetalheScreen } from "../screens/manutencoes/ManutencaoDetalheScreen";
import { ManutencaoFormScreen } from "../screens/manutencoes/ManutencaoFormScreen";
import { LaboratoriosScreen } from "../screens/laboratorios/LaboratoriosScreen";
import { LaboratorioFormScreen } from "../screens/laboratorios/LaboratorioFormScreen";
import { MapaScreen } from "../screens/instituicoes/MapaScreen";
import { InstituicaoFormScreen } from "../screens/instituicoes/InstituicaoFormScreen";
import { UsuariosScreen } from "../screens/usuarios/UsuariosScreen";
import { UsuarioFormScreen } from "../screens/usuarios/UsuarioFormScreen";
import { PerfilScreen } from "../screens/perfil/PerfilScreen";
import { DashboardScreen } from "../screens/dashboard/DashboardScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tabs = createBottomTabNavigator<TabsParamList>();

const temaNavegacao = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    primary: colors.primary,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
  },
};

const iconesTabs: Record<
  keyof TabsParamList,
  { ativo: keyof typeof Ionicons.glyphMap; inativo: keyof typeof Ionicons.glyphMap }
> = {
  Inicio: { ativo: "home", inativo: "home-outline" },
  Manutencoes: { ativo: "construct", inativo: "construct-outline" },
  Mapa: { ativo: "map", inativo: "map-outline" },
  Perfil: { ativo: "person", inativo: "person-outline" },
};

const AbasApp = () => (
  <Tabs.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.textMuted,
      tabBarStyle: {
        borderTopColor: colors.border,
        height: 62,
        paddingBottom: 8,
        paddingTop: 6,
      },
      tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
      tabBarIcon: ({ focused, color, size }) => (
        <Ionicons
          name={
            focused
              ? iconesTabs[route.name as keyof TabsParamList].ativo
              : iconesTabs[route.name as keyof TabsParamList].inativo
          }
          size={size}
          color={color}
        />
      ),
    })}
  >
    <Tabs.Screen
      name="Inicio"
      component={InicioScreen}
      options={{ title: "Início" }}
    />
    <Tabs.Screen
      name="Manutencoes"
      component={ManutencoesScreen}
      options={{ title: "Manutenções" }}
    />
    <Tabs.Screen name="Mapa" component={MapaScreen} options={{ title: "Mapa" }} />
    <Tabs.Screen
      name="Perfil"
      component={PerfilScreen}
      options={{ title: "Perfil" }}
    />
  </Tabs.Navigator>
);

export const Rotas = () => {
  const { autenticado, carregandoSessao } = useAuth();

  if (carregandoSessao) {
    return <Carregando mensagem="Carregando sua sessão..." />;
  }

  return (
    <NavigationContainer theme={temaNavegacao}>
      {!autenticado ? (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name={"Login" as never} component={LoginScreen} />
        </Stack.Navigator>
      ) : (
        <Stack.Navigator
          screenOptions={{
            headerTintColor: colors.text,
            headerTitleStyle: { fontWeight: "700" },
            headerShadowVisible: false,
            headerStyle: { backgroundColor: colors.background },
          }}
        >
          <Stack.Screen
            name="Tabs"
            component={AbasApp}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="ManutencaoDetalhe"
            component={ManutencaoDetalheScreen}
            options={{ title: "Detalhes da manutenção" }}
          />
          <Stack.Screen
            name="ManutencaoForm"
            component={ManutencaoFormScreen}
            options={({ route }) => ({
              title: route.params?.manutencao
                ? "Editar manutenção"
                : "Solicitar manutenção",
            })}
          />
          <Stack.Screen
            name="Laboratorios"
            component={LaboratoriosScreen}
            options={{ title: "Laboratórios" }}
          />
          <Stack.Screen
            name="LaboratorioForm"
            component={LaboratorioFormScreen}
            options={({ route }) => ({
              title: route.params?.laboratorio
                ? "Editar laboratório"
                : "Novo laboratório",
            })}
          />
          <Stack.Screen
            name="InstituicaoForm"
            component={InstituicaoFormScreen}
            options={({ route }) => ({
              title: route.params?.instituicao
                ? "Editar instituição"
                : "Nova instituição",
            })}
          />
          <Stack.Screen
            name="Usuarios"
            component={UsuariosScreen}
            options={{ title: "Usuários" }}
          />
          <Stack.Screen
            name="UsuarioForm"
            component={UsuarioFormScreen}
            options={({ route }) => ({
              title: route.params?.usuario ? "Editar usuário" : "Novo usuário",
            })}
          />
          <Stack.Screen
            name="Dashboard"
            component={DashboardScreen}
            options={{ title: "Dashboard" }}
          />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
};
