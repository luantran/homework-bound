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
import type { Exercise } from "@homework-bound/shared";

export default function Exercises() {
  const { data, isLoading } = useQuery({
    queryKey: ["exercises"],
    queryFn: () => apiFetch<Exercise[]>("/exercises"),
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
        <Heading size="lg">Exercises</Heading>
        <Button colorPalette="blue">New Exercise</Button>
      </Stack>
      <Table.Root>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>Category</Table.ColumnHeader>
            <Table.ColumnHeader>Context</Table.ColumnHeader>
            <Table.ColumnHeader># of Questions</Table.ColumnHeader>
            <Table.ColumnHeader>Actions</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {data?.map((exercise) => (
            <Table.Row key={exercise.id}>
              <Table.Cell>
                <Badge>{exercise.category}</Badge>
              </Table.Cell>
              <Table.Cell>{exercise.context ?? "—"}</Table.Cell>
              <Table.Cell>{exercise.questions.length}</Table.Cell>
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
