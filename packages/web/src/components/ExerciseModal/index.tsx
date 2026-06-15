import { Button, CloseButton, Dialog, Portal, Box } from "@chakra-ui/react";
import {
  type CreateExercise,
  type Exercise,
  type Question,
} from "@homework-bound/shared";
import { useState } from "react";
import ExerciseLeftPanel from "./ExerciseLeftPanel";
import ExerciseRightPanel from "./ExerciseRightPanel";
import { createExercise, updateExercise } from "../../lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export type ExerciseForm = Partial<Omit<CreateExercise, "questions">> & {
  questions: Question[];
};

const toForm = (ex?: Exercise): ExerciseForm => ({
  category: ex?.category,
  min_level: ex?.min_level ?? undefined,
  max_level: ex?.max_level ?? undefined,
  tags: ex?.tags,
  context: ex?.context,
  questions: ex?.questions ?? [],
  prompt: ex?.prompt,
});

export default function ExerciseModal({
  isOpen,
  onClose,
  exercise,
}: {
  isOpen: boolean;
  onClose: () => void;
  exercise?: Exercise;
}) {
  const isEditMode = Boolean(exercise);
  const title = isEditMode ? "Edit Exercise" : "New Exercise";

  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  const [form, setForm] = useState<ExerciseForm>(toForm(exercise));

  if (isOpen && !prevIsOpen) {
    setPrevIsOpen(true);
    setForm(toForm(exercise));
  } else if (!isOpen && prevIsOpen) {
    setPrevIsOpen(false);
  }

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (payload: CreateExercise) =>
      exercise ? updateExercise(exercise.id, payload) : createExercise(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exercises"] });
      onClose();
    },
  });

  const onSave = () => {
    const payload: CreateExercise = {
      category: form.category!,
      prompt: form.prompt ?? undefined,
      context: form.context ?? undefined,
      tags: form.tags ?? undefined,
      min_level: form.min_level,
      max_level: form.max_level,
      questions: form.questions.map((q) => ({
        prompt: q.prompt,
        hint: q.hint ?? undefined,
        answer: q.answer,
        type: q.type,
        options: q.options ?? undefined,
        tags: q.tags ?? undefined,
        min_level: q.min_level ?? undefined,
        max_level: q.max_level ?? undefined,
      })),
    };
    mutation.mutate(payload);
  };

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(details) => !details.open && onClose()}
      size="cover"
      placement="center"
      motionPreset="slide-in-bottom"
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header py={3}>
              <Dialog.Title>{title}</Dialog.Title>
              <Dialog.CloseTrigger asChild>
                <CloseButton size="sm" />
              </Dialog.CloseTrigger>
            </Dialog.Header>
            <Box
              h="2px"
              bgGradient="to-r"
              gradientFrom="blue.400"
              gradientTo="green.400"
            />
            <Dialog.Body
              p={0}
              display="flex"
              flex={1}
              minH={0}
              overflow="hidden"
            >
              <ExerciseLeftPanel form={form} setForm={setForm} />
              <ExerciseRightPanel
                questions={form.questions}
                setQuestions={(questions) =>
                  setForm((f) => ({ ...f, questions }))
                }
              />
            </Dialog.Body>
            <Dialog.Footer py={2} borderTopWidth="1px">
              <Button
                disabled={mutation.isPending}
                variant="ghost"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                loading={mutation.isPending}
                onClick={onSave}
                colorPalette="blue"
              >
                Save
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
