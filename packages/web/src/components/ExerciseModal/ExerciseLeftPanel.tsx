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
  type ListCollection,
} from "@chakra-ui/react";
import { SchoolLevelValues } from "@homework-bound/shared";

type Props = {
  categoryCollection: ListCollection<{ label: string; value: string }>;
  tagCollection: ListCollection<{ label: string; value: string }>;
  category: string;
  setCategory: (v: string) => void;
  tags: string[];
  setTags: (v: string[]) => void;
  selected: string[];
  setSelected: (v: string[]) => void;
  minLevel: number | null;
  setMinLevel: (v: number | null) => void;
  maxLevel: number | null;
  setMaxLevel: (v: number | null) => void;
  prompt: string;
  setPrompt: (v: string) => void;
  context: string;
  setContext: (v: string) => void;
};

export default function ExerciseLeftPanel({
  categoryCollection,
  tagCollection,
  category,
  setCategory,
  tags,
  setTags,
  selected,
  setSelected,
  minLevel,
  setMinLevel,
  maxLevel,
  setMaxLevel,
  prompt,
  setPrompt,
  context,
  setContext,
}: Props) {
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
      {/* Details: category, tags, school level */}
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
                  value={[category]}
                  onValueChange={(details) => {
                    setCategory(details.value[0]);
                    setTags([]);
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
                    key={category}
                    collection={tagCollection}
                    value={selected}
                    onValueChange={(details) => setSelected(details.value)}
                    multiple
                    flex={1}
                    disabled={!category}
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
                      setTags([...new Set([...tags, ...selected])]);
                      setSelected([]);
                    }}
                  >
                    Add
                  </Button>
                </HStack>
                <TagsInput.Root
                  value={tags}
                  onValueChange={(details) => setTags(details.value)}
                  mt={2}
                  w="full"
                >
                  <TagsInput.Control borderWidth={0} p={0}>
                    {tags.length === 0 && (
                      <Text fontSize="sm" color="gray.400">
                        No tags selected
                      </Text>
                    )}
                    <TagsInput.Items />
                  </TagsInput.Control>
                </TagsInput.Root>
              </Field.Root>

              <Field.Root>
                <Field.Label>School Level</Field.Label>
                <Stack w="full">
                  <HStack justify="space-between">
                    <Text fontSize="sm">
                      {SchoolLevelValues[minLevel ?? 2]}
                    </Text>
                    <Text fontSize="sm">
                      {SchoolLevelValues[maxLevel ?? 4]}
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
                    <Slider.Marks marks={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]} />
                  </Slider.Root>
                </Stack>
              </Field.Root>
            </Stack>
          </Accordion.ItemContent>
        </Accordion.Item>
      </Accordion.Root>

      {/* Prompt + Context */}
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
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
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
                value={context}
                onChange={(e) => setContext(e.target.value)}
                rows={12}
              />
            </Stack>
          </Accordion.ItemContent>
        </Accordion.Item>
      </Accordion.Root>
    </Stack>
  );
}
