# AssignFlow Frontend

Next.js 16 web application for the **AssignFlow** Assignment & Submission Management System.

**Live app:** [https://assignflow-bd.vercel.app/](https://assignflow-bd.vercel.app/)  
**Repository:** [https://github.com/tarek-codes/assignflow](https://github.com/tarek-codes/assignflow)

## Tech Stack

- **Framework:** Next.js 16 (App Router) & React 19
- **Language:** TypeScript
- **Styling:** Tailwind CSS & Lucide Icons
- **State:** React Context (Auth, Language, Theme)
- **HTTP Client:** Axios with JWT token refresh

## Getting Started

### Prerequisites

- Node.js 20+

### Setup

```bash
cd frontend
npm install
```

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5196/api
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npx tsc --noEmit` | TypeScript type check |

## Project Structure

```
frontend/src/
├── app/           # Next.js App Router pages & layouts
├── components/    # Shared UI, layout, and common components
├── context/       # Auth, Language & Theme contexts
├── features/      # Feature modules (Admin, Teacher, Student, etc.)
├── services/      # API client services
├── types/         # TypeScript interfaces
└── utils/         # Helpers and formatting utilities
```

## Deployment

Deployed on **Vercel** with root directory set to `frontend`.

Production environment variable:

```env
NEXT_PUBLIC_API_URL=https://assignflow-api-tq42.onrender.com/api
```

See the root [DEPLOY.md](../DEPLOY.md) for full deployment instructions.
