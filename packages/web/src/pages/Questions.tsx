import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../lib/api";
import {
  Table,
  Badge,
  Heading,
  Stack,
  Button,
  Spinner,
  Center,
} from "@chakra-ui/react";
import type { Question } from "@homework-bound/shared";

export default function Questions() {
  const { data, isLoading } = useQuery({
    queryKey: ["questions"],
    queryFn: () => apiFetch<Question[]>("/questions"),
  });

  if (isLoading)
    return (
      <Center h="200px">
        <Spinner />
      </Center>
    );

  return (
    <Stack gap={4}>
      <Stack direction="row" justify="space-between" align="center">
        <Heading size="lg">Questions</Heading>
        <Button colorPalette="blue">New Question</Button>
      </Stack>
      <Table.Root>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>Prompt</Table.ColumnHeader>
            <Table.ColumnHeader>Type</Table.ColumnHeader>
            <Table.ColumnHeader>Hint</Table.ColumnHeader>
            <Table.ColumnHeader>Actions</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {data?.map((q) => (
            <Table.Row key={q.id}>
              <Table.Cell>{q.prompt}</Table.Cell>
              <Table.Cell>
                <Badge>{q.type}</Badge>
              </Table.Cell>
              <Table.Cell>{q.hint ?? "—"}</Table.Cell>
              <Table.Cell>
                <Stack direction="row" gap={2}>
                  <Button size="sm" variant="outline">
                    Edit
                  </Button>
                  <Button size="sm" variant="outline" colorPalette="red">
                    Delete
                  </Button>
                </Stack>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Stack>
  );
}
