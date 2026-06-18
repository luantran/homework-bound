import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch, deleteExercise } from "../lib/api";
import {
  Table,
  Badge,
  Heading,
  Stack,
  Button,
  Spinner,
  Center,
  HStack,
  Text,
  List,
  Link,
} from "@chakra-ui/react";
import { getObjectTag, type Exercise } from "@homework-bound/shared";
import ExerciseModal from "../components/ExerciseModal";
import DeleteDialog from "../components/DeleteDialog";
import { useState } from "react";

const toShortLevel = (level: number) =>
  level <= 6 ? `P${level}` : `S${level - 6}`;

const formatLevel = (min?: number | null, max?: number | null) => {
  if (!min) return "—";
  return max ? `${toShortLevel(min)}-${toShortLevel(max)}` : toShortLevel(min);
};

export default function Exercises() {
  const { data, isLoading } = useQuery({
    queryKey: ["exercises"],
    queryFn: () => apiFetch<Exercise[]>("/exercises"),
  });

  const [openExercise, setOpenExercise] = useState(false);
  const [editExercise, setEditExercise] = useState<Exercise | undefined>(
    undefined,
  );
  const [deleteTarget, setDeleteTarget] = useState<Exercise | undefined>(
    undefined,
  );

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (id: string) => deleteExercise(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exercises"] });
      setDeleteTarget(undefined);
    },
  });

  if (isLoading)
    return (
      <Center h="200px">
        <Spinner />
      </Center>
    );

  const deleteDescription = deleteTarget ? (
    <Stack gap={2}>
      <Text>This will:</Text>
      <List.Root ps={4}>
        <List.Item>
          Remove it from{" "}
          {deleteTarget.worksheets_exercises.length > 0 ? (
            <>
              {deleteTarget.worksheets_exercises.map((we, i) => (
                <span key={we.worksheet.id}>
                  {i > 0 && ", "}
                  <Link color="blue.500" textDecoration="underline" href="#">
                    {getObjectTag(we.worksheet)}
                  </Link>
                </span>
              ))}
            </>
          ) : (
            "no worksheets"
          )}
        </List.Item>
        <List.Item>Delete all its questions</List.Item>
      </List.Root>
      <Text fontSize="sm" color="gray.500">
        This cannot be undone.
      </Text>
    </Stack>
  ) : null;

  return (
    <Stack gap={4}>
      <Stack direction="row" justify="space-between" align="center">
        <Heading size="lg">Exercises</Heading>
        <Button
          colorPalette="blue"
          onClick={() => {
            setEditExercise(undefined);
            setOpenExercise(true);
          }}
        >
          New Exercise
        </Button>
      </Stack>
      <Table.Root>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>#</Table.ColumnHeader>
            <Table.ColumnHeader>Category</Table.ColumnHeader>
            <Table.ColumnHeader>Tags</Table.ColumnHeader>
            <Table.ColumnHeader>Prompt</Table.ColumnHeader>
            <Table.ColumnHeader>Context</Table.ColumnHeader>
            <Table.ColumnHeader>Level</Table.ColumnHeader>
            <Table.ColumnHeader># Questions</Table.ColumnHeader>
            <Table.ColumnHeader>Appears in</Table.ColumnHeader>
            <Table.ColumnHeader>Actions</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {data?.map((exercise) => (
            <Table.Row key={exercise.id}>
              <Table.Cell>{exercise.exercise_number}</Table.Cell>
              <Table.Cell>
                <Badge>{exercise.category}</Badge>
              </Table.Cell>
              <Table.Cell maxW="160px">
                <HStack gap={1} flexWrap="wrap">
                  {exercise.tags?.map((tag) => (
                    <Badge key={tag}>{tag.split(".").at(-1)}</Badge>
                  ))}
                </HStack>
              </Table.Cell>
              <Table.Cell>{exercise.prompt ?? "—"}</Table.Cell>
              <Table.Cell>{exercise.context ?? "—"}</Table.Cell>
              <Table.Cell>
                {formatLevel(exercise.min_level, exercise.max_level)}
              </Table.Cell>
              <Table.Cell textAlign="center">
                {exercise.questions.length}
              </Table.Cell>
              <Table.Cell>
                {exercise.worksheets_exercises.length} worksheets
              </Table.Cell>
              <Table.Cell>
                <Stack direction="row" gap={2}>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditExercise(exercise);
                      setOpenExercise(true);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    colorPalette="red"
                    onClick={() => setDeleteTarget(exercise)}
                  >
                    Delete
                  </Button>
                </Stack>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>

      <DeleteDialog
        isOpen={Boolean(deleteTarget)}
        isLoading={mutation.isPending}
        title="Delete Exercise"
        description={deleteDescription}
        onClose={() => setDeleteTarget(undefined)}
        onConfirm={() => deleteTarget && mutation.mutate(deleteTarget.id)}
      />

      <ExerciseModal
        isOpen={openExercise}
        onClose={() => {
          setOpenExercise(false);
          setEditExercise(undefined);
        }}
        exercise={editExercise}
      />
    </Stack>
  );
}
