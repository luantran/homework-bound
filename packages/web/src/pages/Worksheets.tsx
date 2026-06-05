import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../lib/api";
import {
  Table,
  Heading,
  Stack,
  Button,
  Spinner,
  Center,
} from "@chakra-ui/react";
import type { Worksheet } from "@homework-bound/shared";

export default function Worksheets() {
  const { data, isLoading } = useQuery({
    queryKey: ["worksheets"],
    queryFn: () => apiFetch<Worksheet[]>("/worksheets"),
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
        <Heading size="lg">Worksheets</Heading>
        <Button colorPalette="blue">New Worksheet</Button>
      </Stack>
      <Table.Root>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>Title</Table.ColumnHeader>
            <Table.ColumnHeader>Description</Table.ColumnHeader>
            <Table.ColumnHeader># of Exercises</Table.ColumnHeader>
            <Table.ColumnHeader>Actions</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {data?.map((worksheet) => (
            <Table.Row key={worksheet.id}>
              <Table.Cell>{worksheet.title ?? "—"}</Table.Cell>
              <Table.Cell>{worksheet.description ?? "—"}</Table.Cell>
              <Table.Cell>{worksheet.exercises.length}</Table.Cell>
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
