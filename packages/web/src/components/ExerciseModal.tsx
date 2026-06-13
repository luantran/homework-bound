import {
  Button,
  CloseButton,
  Dialog,
  Field,
  Select,
  createListCollection,
  HStack,
  Portal,
  Slider,
  Text,
  Stack,
} from "@chakra-ui/react";
import {
  SchoolLevelValues,
  QuestionCategoryValues,
  QuestionSubCategory,
  type Exercise,
} from "@homework-bound/shared";
import { useState } from "react";

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
  //inputs
  const [category, setCategory] = useState(exercise?.category || "");
  //   const [context, setContext] = useState(exercise?.context || "");
  const [minLevel, setMinLevel] = useState(exercise?.min_level || null);
  const [maxLevel, setMaxLevel] = useState(exercise?.max_level || null);

  const [tags, setTags] = useState<string[]>(exercise?.tags || []);
  //   const [questions, setQuestions] = useState(exercise?.questions || []);

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
            <Dialog.Header>
              <Dialog.Title>{title}</Dialog.Title>
              <Dialog.CloseTrigger asChild>
                <CloseButton size="sm" />
              </Dialog.CloseTrigger>
            </Dialog.Header>
            <Dialog.Body>
              <HStack gap={4} mb={4}>
                <Field.Root flex={1}>
                  <Field.Label>Category</Field.Label>
                  <Select.Root
                    collection={categoryCollection}
                    value={[category]}
                    onValueChange={(details) => {
                      setCategory(details.value[0]);
                      setTags([]);
                    }}
                  >
                    <Select.HiddenSelect />
                    <Select.Control>
                      <Select.Trigger>
                        <Select.ValueText placeholder="Select category" />
                      </Select.Trigger>
                      <Select.IndicatorGroup>
                        <Select.Indicator />
                      </Select.IndicatorGroup>
                    </Select.Control>
                    <Portal>
                      <Select.Positioner>
                        <Select.Content>
                          {categoryCollection.items.map((item) => (
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
                <Field.Root flex={1}>
                  <Field.Label>Tags</Field.Label>
                  <Select.Root
                    key={category}
                    collection={tagCollection}
                    value={tags}
                    onValueChange={(details) => setTags(details.value)}
                    multiple
                  >
                    <Select.HiddenSelect />
                    <Select.Control>
                      <Select.Trigger>
                        <Select.ValueText placeholder="Select tags" />
                      </Select.Trigger>
                      <Select.IndicatorGroup>
                        <Select.ClearTrigger asChild>
                          <Button size="xs" variant="ghost">
                            ✕
                          </Button>
                        </Select.ClearTrigger>
                        <Select.Indicator />
                      </Select.IndicatorGroup>
                    </Select.Control>
                    <Portal>
                      <Select.Positioner>
                        <Select.Content>
                          {tagCollection.items.map((item) => (
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
                <Field.Root flex={1}>
                  <Field.Label>School Level</Field.Label>
                  <Stack w="full">
                    <HStack justify="space-between" mb={1}>
                      <Text fontSize="sm">
                        {SchoolLevelValues[minLevel ?? 1]}
                      </Text>
                      <Text fontSize="sm">
                        {SchoolLevelValues[maxLevel ?? 11]}
                      </Text>
                    </HStack>
                    <Slider.Root
                      min={1}
                      max={11}
                      step={1}
                      value={[minLevel ?? 2, maxLevel ?? 4]}
                      onValueChange={(details) => {
                        setMinLevel(details.value[0]);
                        setMaxLevel(details.value[1]);
                      }}
                      thumbCollisionBehavior="push"
                      pb={8}
                    >
                      <Slider.Control w="full">
                        <Slider.Track
                          h="8px"
                          style={{
                            background:
                              "linear-gradient(to right, rgba(59,130,246,0.6) 0% 55%, rgba(34,197,94,0.6) 55% 100%)",
                          }}
                        >
                          <Slider.Range bg="redAlpha.100" />
                        </Slider.Track>

                        <Slider.Thumbs />
                      </Slider.Control>
                      <Slider.Marks
                        marks={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]}
                      />
                    </Slider.Root>
                  </Stack>
                </Field.Root>
              </HStack>
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
