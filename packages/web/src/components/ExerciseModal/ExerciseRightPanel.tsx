import {
  Stack,
  Accordion,
  Text,
  HStack,
  Badge,
  Button,
} from "@chakra-ui/react";
import type { CreateQuestion, Question } from "@homework-bound/shared";
import { useState } from "react";
import QuestionDialog from "./QuestionDialog";

const emptyForm: Partial<CreateQuestion> = {};

const toQuestionForm = (q: Question): Partial<CreateQuestion> => ({
  type: q.type,
  prompt: q.prompt,
  answer: q.answer,
  options: q.options,
});

type Props = {
  questions: Question[];
  setQuestions: (v: Question[]) => void;
};

export default function ExerciseRightPanel({ questions, setQuestions }: Props) {
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [form, setForm] = useState<Partial<CreateQuestion>>(emptyForm);

  const openAdd = () => {
    if (editIndex !== null) setForm(emptyForm); // switching from edit → reset
    setEditIndex(null);
    setIsDialogOpen(true);
  };

  const openEdit = (i: number) => {
    if (editIndex !== i) {
      // different question → pre-fill with that question's data
      setForm(toQuestionForm(questions[i]));
    }
    // same question after backdrop close → preserve current form
    setEditIndex(i);
    setIsDialogOpen(true);
  };

  const handleCancel = () => {
    setForm(emptyForm);
    setEditIndex(null);
    setIsDialogOpen(false);
  };

  const handleConfirm = (q: CreateQuestion) => {
    if (editIndex !== null) {
      setQuestions(
        questions.map((item, idx) =>
          idx === editIndex ? (q as Question) : item,
        ),
      );
    } else {
      setQuestions([...questions, q as Question]);
    }
    setForm(emptyForm);
    setEditIndex(null);
    setIsDialogOpen(false);
  };

  const handleConfirmAndNext = (q: CreateQuestion) => {
    if (editIndex === null) {
      // adding: keep the dialog open with a blank form for the next question
      setQuestions([...questions, q as Question]);
      setForm(emptyForm);
      return;
    }
    const updated = questions.map((item, idx) =>
      idx === editIndex ? (q as Question) : item,
    );
    setQuestions(updated);
    const next = editIndex + 1;
    if (next >= updated.length) {
      // last question: same as plain Confirm
      setForm(emptyForm);
      setEditIndex(null);
      setIsDialogOpen(false);
      return;
    }
    setForm(toQuestionForm(updated[next]));
    setEditIndex(next);
  };

  return (
    <Stack flex={1} px={4} pt={2} pb={4} overflowY="auto">
      <Accordion.Root
        collapsible
        multiple
        defaultValue={["questions"]}
        display="flex"
        flexDir="column"
        gap={3}
      >
        <Accordion.Item value="questions" border="1px solid" borderRadius="md">
          <Accordion.ItemTrigger p={3}>
            Questions
            <Accordion.ItemIndicator ml="auto" />
          </Accordion.ItemTrigger>
          <Accordion.ItemContent p={3}>
            <Stack gap={2}>
              {questions.length === 0 && (
                <Text fontSize="sm" color="gray.400">
                  No questions yet
                </Text>
              )}
              {questions.map((q, i) => (
                <HStack
                  key={i}
                  p={3}
                  borderWidth="1px"
                  borderRadius="md"
                  justify="space-between"
                >
                  <Stack gap={0} flex={1}>
                    <Text fontSize="sm" fontWeight="medium">
                      {q.prompt}
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      Answer: {q.answer}
                    </Text>
                  </Stack>
                  <HStack>
                    <Badge>{q.type}</Badge>
                    <HStack ml={4}>
                      <Button
                        data-testid={`button-edit-question-${i}`}
                        size="xs"
                        variant="outline"
                        onClick={() => openEdit(i)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="xs"
                        variant="outline"
                        colorPalette="red"
                        onClick={() =>
                          setQuestions(questions.filter((_, idx) => idx !== i))
                        }
                      >
                        Delete
                      </Button>
                    </HStack>
                  </HStack>
                </HStack>
              ))}

              <QuestionDialog
                isOpen={isDialogOpen}
                isEditMode={editIndex !== null}
                form={form}
                setForm={setForm}
                onClose={() => setIsDialogOpen(false)}
                onCancel={handleCancel}
                onConfirm={handleConfirm}
                onConfirmAndNext={handleConfirmAndNext}
              />

              <Button size="sm" variant="outline" onClick={openAdd}>
                Add Question
              </Button>
            </Stack>
          </Accordion.ItemContent>
        </Accordion.Item>
      </Accordion.Root>
    </Stack>
  );
}
