import { Heading, Stack, Card, Text, Spinner } from "@chakra-ui/react";
import { apiFetch } from "../lib/api";
import type { Exercise, Question, Worksheet } from "@homework-bound/shared";
import { useQuery } from "@tanstack/react-query";

export default function Home() {
  // TODO: add your three useQuery calls here
  const { data: questions, isLoading: questionsLoading } = useQuery({
    queryKey: ["questions"],
    queryFn: () => apiFetch<Question[]>("/questions"),
  });

  const { data: exercises, isLoading: exercisesLoading } = useQuery({
    queryKey: ["exercises"],
    queryFn: () => apiFetch<Exercise[]>("/exercises"),
  });

  const { data: worksheets, isLoading: worksheetsLoading } = useQuery({
    queryKey: ["worksheets"],
    queryFn: () => apiFetch<Worksheet[]>("/worksheets"),
  });

  return (
    <Stack gap={6}>
      <Heading size="lg">Dashboard</Heading>
      <Stack direction="row" gap={4}>
        <Card.Root flex={1}>
          <Card.Body>
            <Text fontSize="sm" color="gray.500">
              Questions
            </Text>
            {questionsLoading ? (
              <Spinner />
            ) : (
              <Text fontSize="3xl" fontWeight="bold">
                {questions?.length ?? 0}
              </Text>
            )}
          </Card.Body>
        </Card.Root>
        <Card.Root flex={1}>
          <Card.Body>
            <Text fontSize="sm" color="gray.500">
              Exercises
            </Text>
            {exercisesLoading ? (
              <Spinner />
            ) : (
              <Text fontSize="3xl" fontWeight="bold">
                {exercises?.length ?? 0}
              </Text>
            )}
          </Card.Body>
        </Card.Root>
        <Card.Root flex={1}>
          <Card.Body>
            <Text fontSize="sm" color="gray.500">
              Worksheets
            </Text>
            {worksheetsLoading ? (
              <Spinner />
            ) : (
              <Text fontSize="3xl" fontWeight="bold">
                {worksheets?.length ?? 0}
              </Text>
            )}
          </Card.Body>
        </Card.Root>
      </Stack>
    </Stack>
  );
}
