import {
  Button,
  CloseButton,
  Dialog,
  Field,
  HStack,
  Input,
  Portal,
  RadioGroup,
  Select,
  Stack,
  Text,
  createListCollection,
} from "@chakra-ui/react";
import {
  type CreateQuestion,
  QuestionTypeValues,
} from "@homework-bound/shared";

type Props = {
  isOpen: boolean;
  isEditMode: boolean;
  form: Partial<CreateQuestion>;
  setForm: (form: Partial<CreateQuestion>) => void;
  onClose: () => void;
  onCancel: () => void;
  onConfirm: (question: CreateQuestion) => void;
};

export default function QuestionDialog({
  isOpen,
  isEditMode,
  form,
  setForm,
  onClose,
  onCancel,
  onConfirm,
}: Props) {
  const typeCollection = createListCollection({
    items: QuestionTypeValues.map((v) => ({ label: v, value: v })),
  });

  const mcqValid =
    form.type !== "mcq" ||
    Object.values(form.options ?? {}).filter(Boolean).length >= 2;
  const canConfirm = Boolean(
    form.type && form.prompt && form.answer && mcqValid,
  );

  const handleConfirm = () => {
    if (!canConfirm) return;
    onConfirm({
      type: form.type as CreateQuestion["type"],
      prompt: form.prompt!,
      answer: form.answer!,
      options: form.type === "mcq" ? form.options : undefined,
    });
  };

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(details) => !details.open && onClose()}
      size="xl"
      placement="center"
      motionPreset="slide-in-bottom"
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header py={3}>
              <Dialog.Title>
                {isEditMode ? "Edit Question" : "New Question"}
              </Dialog.Title>
              <Dialog.CloseTrigger asChild>
                <CloseButton size="sm" />
              </Dialog.CloseTrigger>
            </Dialog.Header>

            <Dialog.Body>
              <Stack gap={4}>
                <HStack align="flex-start" gap={3}>
                  <Field.Root w="180px" flexShrink={0} required>
                    <Field.Label>Type</Field.Label>
                    <Select.Root
                      collection={typeCollection}
                      value={form.type ? [form.type] : []}
                      onValueChange={(d) =>
                        setForm({
                          ...form,
                          type: d.value[0] as CreateQuestion["type"],
                        })
                      }
                    >
                      <Select.HiddenSelect />
                      <Select.Control>
                        <Select.Trigger>
                          <Select.ValueText placeholder="Select type" />
                        </Select.Trigger>
                        <Select.IndicatorGroup>
                          <Select.Indicator />
                        </Select.IndicatorGroup>
                      </Select.Control>
                      <Portal>
                        <Select.Positioner>
                          <Select.Content>
                            {typeCollection.items.map((item) => (
                              <Select.Item key={item.value} item={item}>
                                {item.label}
                                <Select.ItemIndicator />
                              </Select.Item>
                            ))}
                          </Select.Content>
                        </Select.Positioner>
                      </Portal>
                    </Select.Root>
                  </Field.Root>

                  <Field.Root flex={1} required>
                    <Field.Label>Prompt</Field.Label>
                    <Input
                      value={form.prompt ?? ""}
                      onChange={(e) =>
                        setForm({ ...form, prompt: e.target.value })
                      }
                      placeholder="Question text..."
                    />
                  </Field.Root>

                  <Field.Root flex={1} required>
                    <Field.Label>Answer</Field.Label>
                    <Input
                      disabled={form.type === "mcq"}
                      value={form.answer ?? ""}
                      onChange={(e) =>
                        setForm({ ...form, answer: e.target.value })
                      }
                      placeholder="Correct answer..."
                    />
                  </Field.Root>
                </HStack>

                {form.type === "mcq" && (
                  <Stack gap={2}>
                    <HStack>
                      <Text fontSize="sm" fontWeight="medium" flex={1}>
                        Options
                      </Text>
                      <Text
                        fontSize="sm"
                        fontWeight="medium"
                        w="100px"
                        textAlign="center"
                      >
                        Select answer
                      </Text>
                    </HStack>
                    <RadioGroup.Root
                      value={form.answer ?? ""}
                      onValueChange={(d) =>
                        setForm({ ...form, answer: d.value ?? undefined })
                      }
                    >
                      <Stack gap={2}>
                        {["A", "B", "C", "D", "E"].map((key) => (
                          <HStack key={key}>
                            <Text w="20px" fontSize="sm" fontWeight="bold">
                              {key}
                            </Text>
                            <Input
                              value={form.options?.[key] || ""}
                              onChange={(e) =>
                                setForm({
                                  ...form,
                                  options: {
                                    ...form.options,
                                    [key]: e.target.value,
                                  },
                                })
                              }
                              placeholder={`Option ${key}...`}
                            />
                            <HStack w="100px" justify="center">
                              <RadioGroup.Item
                                value={key}
                                disabled={!form.options?.[key]}
                              >
                                <RadioGroup.ItemHiddenInput />
                                <RadioGroup.ItemIndicator />
                              </RadioGroup.Item>
                            </HStack>
                          </HStack>
                        ))}
                      </Stack>
                    </RadioGroup.Root>
                  </Stack>
                )}
              </Stack>
            </Dialog.Body>

            <Dialog.Footer>
              <Button variant="ghost" onClick={onCancel}>
                Cancel
              </Button>
              <Button
                colorPalette="blue"
                onClick={handleConfirm}
                disabled={!canConfirm}
              >
                Confirm
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
