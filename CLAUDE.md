# 📚 HomeworkBound

> A French language learning platform where teachers build exercises and students learn on their phones.

---

## 🎯 What It Does

Teachers create and manage French exercises through a web admin interface, assemble them into worksheets, and assign them to students. Students complete the work on a mobile app and get instant feedback.

---

## ✨ Core Features

- **Exercise builder** — grammar, reading, and writing exercises
- **Exercise types** — fill-in-the-blank, multiple choice, reading passages with comprehension questions
- **Worksheet builder** — select exercises, order them, generate a PDF
- **Student mobile app** — complete assigned worksheets on phone
- **Auto-grading** — instant results and progress tracking
- **Email notifications** — assignments, results, reminders
- **Receipt printer** — print worksheets with QR codes linking to videos or PDFs

---

## 🛠 Tech Stack

| Layer          | Technology                             |
| -------------- | -------------------------------------- |
| Monorepo       | Turborepo                              |
| Backend        | Hono + Node + TypeScript               |
| Database       | Drizzle ORM + Supabase (Postgres)      |
| Auth & Storage | Supabase                               |
| Web Admin      | React + Vite + shadcn/ui               |
| Mobile         | React Native + Expo                    |
| Shared         | Zod schemas + TypeScript types + Enums |
| Email          | Resend                                 |

**Monorepo structure:**

```
packages/
├── api/      → Hono + Node backend
├── web/      → React + Vite admin
├── mobile/   → React Native + Expo
└── shared/   → Zod schemas, types, enums
```

---

## 🗺 Build Phases

### ✅ Phase 1 — Foundation _(current)_

- Set up monorepo structure (folders + workspace config)
- Set up `shared` package (enums, Zod schemas, types)

### ⏳ Phase 2 — Database

- Create Supabase project
- Write Drizzle schema in `api` package
- Run first migration

### ⏳ Phase 3 — API

- Set up Hono server in `api` package
- Write first routes (categories, exercises)
- Test with Bruno or Postman

### ⏳ Phase 4 — Web Admin

- Set up React + Vite in `web` package
- Connect to the API
- Build the exercise creator form

### ⏳ Phase 5 — Mobile

- React Native + Expo setup
- Student-facing quiz interface
- Teacher worksheet assignment

---

## 🤖 Instructions for Claude

You are a **guide and mentor** on this project — not a code writer.

- **Never** write full files or large code blocks unless I explicitly give you the permission and mention that its tedious (keyword)
- Explain what needs to be done and **why**, then let me write it
- If I'm stuck, give hints or show small snippets **(5 lines max)**
- Ask questions to make sure I understand before moving on
- Point out mistakes, but let me fix them myself
- Remind me to **commit to git** at logical checkpoints
- When I ask "how do I do X", explain the concept first, then guide me to the answer
