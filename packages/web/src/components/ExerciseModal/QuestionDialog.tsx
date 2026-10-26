import {
  Button,
  CloseButton,
  Dialog,
  Field,
  Group,
  HStack,
  IconButton,
  Input,
  Menu,
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
import { ChevronDown } from "lucide-react";
import { useState } from "react";

type ConfirmMode = "confirm" | "next";

const CONFIRM_MODE_KEY = "hb.questionConfirmMode";
const CONFIRM_LABELS: Record<ConfirmMode, string> = {
  confirm: "Confirm",
  next: "Confirm & next",
};

// localStorage can throw (private windows, blocked storage), so fall back to plain Confirm
const loadConfirmMode = (): ConfirmMode => {
  try {
    return localStorage.getItem(CONFIRM_MODE_KEY) === "next"
      ? "next"
      : "confirm";
  } catch {
    return "confirm";
  }
};

const saveConfirmMode = (mode: ConfirmMode) => {
  try {
    localStorage.setItem(CONFIRM_MODE_KEY, mode);
  } catch {
    // not remembering the choice is fine
  }
};

type Props = {
  isOpen: boolean;
  isEditMode: boolean;
  questionNumber: number;
  totalQuestions: number;
  form: Partial<CreateQuestion>;
  setForm: (form: Partial<CreateQuestion>) => void;
  onClose: () => void;
  onCancel: () => void;
  onConfirm: (question: CreateQuestion) => void;
  onConfirmAndNext: (question: CreateQuestion) => void;
};

export default function QuestionDialog({
  isOpen,
  isEditMode,
  questionNumber,
  totalQuestions,
  form,
  setForm,
  onClose,
  onCancel,
  onConfirm,
  onConfirmAndNext,
}: Props) {
  const [confirmMode, setConfirmMode] = useState<ConfirmMode>(loadConfirmMode);

  const typeCollection = createListCollection({
    items: QuestionTypeValues.map((v) => ({ label: v, value: v })),
  });

  const mcqValid =
    form.type !== "mcq" ||
    Object.values(form.options ?? {}).filter(Boolean).length >= 2;
  const canConfirm = Boolean(
    form.type && form.prompt && form.answer && mcqValid,
  );

  const handleConfirm = (mode: ConfirmMode) => {
    if (!canConfirm) return;
    setConfirmMode(mode);
    saveConfirmMode(mode);
    const question: CreateQuestion = {
      type: form.type as CreateQuestion["type"],
      prompt: form.prompt!,
      answer: form.answer!,
      options: form.type === "mcq" ? form.options : undefined,
    };
    if (mode === "next") onConfirmAndNext(question);
    else onConfirm(question);
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
                {isEditMode
                  ? `Edit Question ${questionNumber} of ${totalQuestions}`
                  : `New Question ${questionNumber}`}
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
                      <Select.HiddenSelect data-testid="native-select-question-type" />
                      <Select.Control>
                        <Select.Trigger data-testid="select-question-type">
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
                      data-testid="input-question-prompt"
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
                      data-testid="input-question-answer"
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
                        {(["A", "B", "C", "D", "E"] as const).map((key) => (
                          <HStack key={key}>
                            <Text w="20px" fontSize="sm" fontWeight="bold">
                              {key}
                            </Text>
                            <Input
                              data-testid={`input-option-${key}`}
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
              {/* Split button: the main part repeats the last choice, the arrow picks the other one */}
              <Group attached>
                <Button
                  colorPalette="blue"
                  onClick={() => handleConfirm(confirmMode)}
                  disabled={!canConfirm}
                >
                  {CONFIRM_LABELS[confirmMode]}
                </Button>
                <Menu.Root
                  positioning={{ placement: "top-end" }}
                  onSelect={(d) => handleConfirm(d.value as ConfirmMode)}
                >
                  <Menu.Trigger asChild>
                    <IconButton
                      colorPalette="blue"
                      aria-label="More options"
                      disabled={!canConfirm}
                      borderLeftWidth="1px"
                      borderLeftColor="blue.700"
                    >
                      <ChevronDown />
                    </IconButton>
                  </Menu.Trigger>
                  <Portal>
                    <Menu.Positioner>
                      <Menu.Content>
                        <Menu.Item value="confirm">
                          {CONFIRM_LABELS.confirm}
                        </Menu.Item>
                        <Menu.Item value="next">
                          {CONFIRM_LABELS.next}
                        </Menu.Item>
                      </Menu.Content>
                    </Menu.Positioner>
                  </Portal>
                </Menu.Root>
              </Group>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
