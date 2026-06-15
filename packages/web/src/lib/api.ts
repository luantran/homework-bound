import type { CreateExercise, Exercise } from "@homework-bound/shared";

const BASE_URL = "http://localhost:3000";

export async function apiFetch<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  console.log(`API Request: ${path}`, options);
  const res = await fetch(`${BASE_URL}${path}`, options);
  if (!res.ok) throw new Error(await res.text());
  if (res.status === 204) return null as T;
  return res.json();
}

export async function createExercise(data: CreateExercise): Promise<Exercise> {
  return apiFetch<Exercise>("/exercises", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
}

export async function updateExercise(
  id: string,
  data: CreateExercise,
): Promise<Exercise> {
  return apiFetch<Exercise>(`/exercises/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
}

export async function deleteExercise(id: string): Promise<void> {
  await apiFetch(`/exercises/${id}`, {
    method: "DELETE",
  });
}
