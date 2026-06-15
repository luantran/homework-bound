import { Button, CloseButton, Dialog, Portal, Text } from "@chakra-ui/react";

type Props = {
  isOpen: boolean;
  isLoading: boolean;
  title?: string;
  description?: string;
  onClose: () => void;
  onConfirm: () => void;
};

export default function DeleteDialog({
  isOpen,
  isLoading,
  title = "Delete",
  description = "Are you sure? This cannot be undone.",
  onClose,
  onConfirm,
}: Props) {
  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(details) => !details.open && onClose()}
      placement="center"
      motionPreset="slide-in-bottom"
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>{title}</Dialog.Title>
              <Dialog.CloseTrigger asChild>
                <CloseButton size="sm" />
              </Dialog.CloseTrigger>
            </Dialog.Header>
            <Dialog.Body>
              <Text>{description}</Text>
            </Dialog.Body>
            <Dialog.Footer>
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button
                colorPalette="red"
                loading={isLoading}
                onClick={onConfirm}
              >
                Delete
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
