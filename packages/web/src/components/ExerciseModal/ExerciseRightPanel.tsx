import { Stack, Accordion } from "@chakra-ui/react";

export default function ExerciseLeftPanel() {
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
            {/* Step 3: question list goes here */}
          </Accordion.ItemContent>
        </Accordion.Item>
      </Accordion.Root>
    </Stack>
  );
}
