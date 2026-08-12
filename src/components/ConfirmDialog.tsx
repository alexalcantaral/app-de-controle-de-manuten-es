import React from "react";
import { Button, Dialog, Portal, Text } from "react-native-paper";
import { colors } from "../theme";

interface ConfirmDialogProps {
  visivel: boolean;
  titulo: string;
  mensagem: string;
  rotuloConfirmar?: string;
  destrutivo?: boolean;
  aoConfirmar: () => void;
  aoFechar: () => void;
}

/** Diálogo de confirmação temático (substitui Alert.alert nas ações destrutivas). */
export function ConfirmDialog({
  visivel,
  titulo,
  mensagem,
  rotuloConfirmar = "Confirmar",
  destrutivo = false,
  aoConfirmar,
  aoFechar,
}: ConfirmDialogProps) {
  return (
    <Portal>
      <Dialog visible={visivel} onDismiss={aoFechar}>
        <Dialog.Title>{titulo}</Dialog.Title>
        <Dialog.Content>
          <Text variant="bodyMedium">{mensagem}</Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={aoFechar}>Cancelar</Button>
          <Button
            onPress={aoConfirmar}
            textColor={destrutivo ? colors.danger : colors.primary}
          >
            {rotuloConfirmar}
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}
