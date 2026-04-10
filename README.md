# Orthodox Saint Mary Church School

Web application for the Eritrean Saint Mary Orthodox Church School.

## Tech Stack

- **Vite** + **React** + **TypeScript**
- **React Router** v7 — client-side routing
- **TanStack React Query** — server state management
- **Tailwind CSS** v4 — utility-first styling (via @tailwindcss/vite)
- **Lucide React** — icon library

## Project Structure

```
src/
├── main.tsx              # Entry point with BrowserRouter
├── App.tsx               # Route definitions
├── index.css             # Tailwind CSS import
└── pages/
    ├── HomePage.tsx      # Main landing page
    ├── About.tsx         # About page (placeholder)
    ├── Contact.tsx       # Contact page (placeholder)
    ├── enroll/
    │   ├── Student.tsx   # Student enrollment (placeholder)
    │   ├── Teacher.tsx   # Teacher enrollment (placeholder)
    │   └── Parent.tsx    # Parent registration (placeholder)
    └── auth/
        ├── SignIn.tsx    # Sign in (placeholder)
        └── SignUp.tsx    # Sign up (placeholder)
```

## Design System

| Color   | Hex       | Usage               |
|---------|-----------|---------------------|
| Navy    | `#1E3A5F` | Primary, headers    |
| Gold    | `#C9A84C` | Accent, highlights  |
| Red     | `#8B2332` | Alerts, emphasis    |
| Cream   | `#FAFAF5` | Backgrounds         |

## Getting Started

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Routes

| Path               | Page                  |
|--------------------|-----------------------|
| `/`                | Homepage              |
| `/about`           | About                 |
| `/contact`         | Contact               |
| `/enroll/student`  | Student Enrollment    |
| `/enroll/teacher`  | Teacher Enrollment    |
| `/enroll/parent`   | Parent Registration   |
| `/auth/signin`     | Sign In               |
| `/auth/signup`     | Sign Up               |
