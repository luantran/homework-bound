import {
  Stack,
  Accordion,
  Field,
  Select,
  Portal,
  HStack,
  Button,
  TagsInput,
  Slider,
  Textarea,
  Text,
  createListCollection,
} from "@chakra-ui/react";
import {
  QuestionCategoryValues,
  QuestionSubCategory,
  SchoolLevelValues,
  type CreateExercise,
} from "@homework-bound/shared";
import { type Dispatch, type SetStateAction, useState } from "react";
import type { ExerciseForm } from ".";

type Props = {
  form: ExerciseForm;
  setForm: Dispatch<SetStateAction<ExerciseForm>>;
};

export default function ExerciseLeftPanel({ form, setForm }: Props) {
  const [selected, setSelected] = useState<string[]>([]);

  const categoryCollection = createListCollection({
    items: QuestionCategoryValues.map((v) => ({ label: v, value: v })),
  });

  const tagCollection = createListCollection({
    items: (QuestionSubCategory[form.category ?? ""] || []).map((v) => ({
      label: v,
      value: v,
    })),
  });

  return (
    <Stack
      w="30%"
      borderRightWidth="1px"
      px={4}
      pt={2}
      pb={4}
      gap={3}
      overflowY="auto"
      minH={0}
    >
      <Accordion.Root
        collapsible
        multiple
        defaultValue={["details"]}
        display="flex"
        flexDir="column"
        gap={3}
      >
        <Accordion.Item value="details" border="1px solid" borderRadius="md">
          <Accordion.ItemTrigger p={3}>
            Details
            <Accordion.ItemIndicator ml="auto" />
          </Accordion.ItemTrigger>
          <Accordion.ItemContent>
            <Stack px={3} pb={3} gap={4}>
              <Field.Root>
                <Field.Label>Category</Field.Label>
                <Select.Root
                  collection={categoryCollection}
                  value={form.category ? [form.category] : []}
                  onValueChange={(details) => {
                    setForm((f) => ({
                      ...f,
                      category: details.value[0] as CreateExercise["category"],
                      tags: [],
                    }));
                    setSelected([]);
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

              <Field.Root>
                <Field.Label>Tags</Field.Label>
                <HStack w="full">
                  <Select.Root
                    key={form.category}
                    collection={tagCollection}
                    value={selected}
                    onValueChange={(details) => setSelected(details.value)}
                    multiple
                    flex={1}
                    disabled={!form.category}
                  >
                    <Select.HiddenSelect />
                    <Select.Control>
                      <Select.Trigger>
                        <Select.ValueText placeholder="Select tags" />
                      </Select.Trigger>
                      <Select.IndicatorGroup>
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
                  <Button
                    size="sm"
                    disabled={selected.length === 0}
                    onClick={() => {
                      setForm((f) => ({
                        ...f,
                        tags: [...new Set([...(f.tags ?? []), ...selected])],
                      }));
                      setSelected([]);
                    }}
                  >
                    Add
                  </Button>
                </HStack>
                <TagsInput.Root
                  value={form.tags ?? []}
                  onValueChange={(details) =>
                    setForm((f) => ({ ...f, tags: details.value }))
                  }
                  mt={2}
                  w="full"
                >
                  <TagsInput.Control borderWidth={0} p={0}>
                    {(form.tags ?? []).length === 0 && (
                      <Text fontSize="sm" color="gray.400">
                        No tags selected
                      </Text>
                    )}
                    <TagsInput.Context>
                      {(api) =>
                        api.value.map((value, index) => (
                          <TagsInput.Item
                            key={index}
                            index={index}
                            value={value}
                          >
                            <TagsInput.ItemPreview>
                              <TagsInput.ItemText>
                                {value.split(".").at(-1)}
                              </TagsInput.ItemText>
                              <TagsInput.ItemDeleteTrigger />
                            </TagsInput.ItemPreview>
                            <TagsInput.ItemInput />
                          </TagsInput.Item>
                        ))
                      }
                    </TagsInput.Context>
                  </TagsInput.Control>
                </TagsInput.Root>
              </Field.Root>

              <Field.Root>
                <Field.Label>School Level</Field.Label>
                <Stack w="full">
                  <HStack justify="space-between">
                    <Text fontSize="sm">
                      {SchoolLevelValues[form.min_level ?? 2]}
                    </Text>
                    <Text fontSize="sm">
                      {SchoolLevelValues[form.max_level ?? 4]}
                    </Text>
                  </HStack>
                  <Slider.Root
                    min={1}
                    max={11}
                    step={1}
                    value={[form.min_level ?? 2, form.max_level ?? 4]}
                    onValueChange={(details) => {
                      setForm((f) => ({
                        ...f,
                        min_level: details.value[0],
                        max_level: details.value[1],
                      }));
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
                    <Slider.Marks marks={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]} />
                  </Slider.Root>
                </Stack>
              </Field.Root>
            </Stack>
          </Accordion.ItemContent>
        </Accordion.Item>
      </Accordion.Root>

      <Accordion.Root
        collapsible
        multiple
        defaultValue={["prompt"]}
        display="flex"
        flexDir="column"
        gap={3}
      >
        <Accordion.Item value="prompt" border="1px solid" borderRadius="md">
          <Accordion.ItemTrigger p={3}>
            Prompt
            <Accordion.ItemIndicator ml="auto" />
          </Accordion.ItemTrigger>
          <Accordion.ItemContent>
            <Stack px={3} pb={3}>
              <Textarea
                placeholder="Prompt..."
                value={form.prompt ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, prompt: e.target.value }))
                }
              />
            </Stack>
          </Accordion.ItemContent>
        </Accordion.Item>

        <Accordion.Item value="context" border="1px solid" borderRadius="md">
          <Accordion.ItemTrigger p={3}>
            Context
            <Accordion.ItemIndicator ml="auto" />
          </Accordion.ItemTrigger>
          <Accordion.ItemContent>
            <Stack px={3} pb={3}>
              <Textarea
                placeholder="Context..."
                value={form.context ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, context: e.target.value }))
                }
                rows={12}
              />
            </Stack>
          </Accordion.ItemContent>
        </Accordion.Item>
      </Accordion.Root>
    </Stack>
  );
}
