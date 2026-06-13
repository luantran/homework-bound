import {
  CloseButton,
  Dialog,
  createListCollection,
  Portal,
  Box,
} from "@chakra-ui/react";
import {
  QuestionCategoryValues,
  QuestionSubCategory,
  type Exercise,
} from "@homework-bound/shared";
import { useState } from "react";
import ExerciseLeftPanel from "./ExerciseLeftPanel";
import ExerciseRightPanel from "./ExerciseRightPanel";

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

  const [category, setCategory] = useState(exercise?.category || "");
  const [minLevel, setMinLevel] = useState(exercise?.min_level || null);
  const [maxLevel, setMaxLevel] = useState(exercise?.max_level || null);
  const [tags, setTags] = useState<string[]>(exercise?.tags || []);
  const [selected, setSelected] = useState<string[]>([]);
  const [prompt, setPrompt] = useState("");
  const [context, setContext] = useState(exercise?.context || "");

  const categoryCollection = createListCollection({
    items: QuestionCategoryValues.map((v) => ({ label: v, value: v })),
  });

  const tagCollection = createListCollection({
    items: (QuestionSubCategory[category] || []).map((v) => ({
      label: v,
      value: v,
    })),
  });

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
              <ExerciseLeftPanel
                categoryCollection={categoryCollection}
                tagCollection={tagCollection}
                category={category}
                setCategory={setCategory}
                tags={tags}
                setTags={setTags}
                selected={selected}
                setSelected={setSelected}
                minLevel={minLevel}
                setMinLevel={setMinLevel}
                maxLevel={maxLevel}
                setMaxLevel={setMaxLevel}
                prompt={prompt}
                setPrompt={setPrompt}
                context={context}
                setContext={setContext}
              />

              <ExerciseRightPanel questions={[]} />
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
