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
} from "@chakra-ui/react";
import { SchoolLevelValues, type Exercise } from "@homework-bound/shared";
import ExerciseModal from "../components/ExerciseModal";
import DeleteDialog from "../components/DeleteDialog";
import { useState } from "react";

const formatLevel = (min?: number | null, max?: number | null) => {
  if (!min) return "—";
  return max
    ? `${SchoolLevelValues[min]} - ${SchoolLevelValues[max]}`
    : SchoolLevelValues[min];
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
            <Table.ColumnHeader>Category</Table.ColumnHeader>
            <Table.ColumnHeader>Context</Table.ColumnHeader>
            <Table.ColumnHeader># of Questions</Table.ColumnHeader>
            <Table.ColumnHeader>Level</Table.ColumnHeader>
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
                {formatLevel(exercise.min_level, exercise.max_level)}
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
        description="Are you sure you want to delete this exercise? This will also remove all its questions and cannot be undone."
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
