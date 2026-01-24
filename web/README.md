# Tokiem Web

The frontend for **Tokiem**, a platform designed to capture and seal digital memories into physical vessels.

## 🚢 Features

- **Seal Memories**: Record video or audio messages and anchor them to a physical vessel (via `tagId`).
- **View Memories**: A clean, focused player for receiving and replaying gifted memories.
- **Minimalist Aesthetic**: Built with a warm, premium feel using Cormorant Garamond and Inter.
- **Direct Storage Upload**: Uses presigned URLs to upload media directly to storage for efficiency.

## 🛠 Tech Stack

- **Framework**: [React](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [Shadcn UI](https://ui.shadcn.com/)
- **Data Fetching**: [TanStack Query](https://tanstack.com/query/latest)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)

## 🚀 Getting Started

### 1. Prerequisites

Ensure you have [Bun](https://bun.sh/) (recommended) or Node.js installed.

### 2. Install Dependencies

```bash
bun install
# or
npm install
```

### 3. Setup Environment Variables

Create a `.env` file in the root:

```env
VITE_API_URL=http://localhost:3000
```

### 4. Run Development Server

```bash
bun dev
# or
npm run dev
```

The app will be available at `http://localhost:5173`.

## 📂 Project Structure

- `src/pages/`: Main application routes (`Seal.tsx`, `View.tsx`, `Index.tsx`).
- `src/hooks/`: Custom logic for media recording (`useMediaRecorder.ts`) and API interaction (`useVessel.ts`).
- `src/lib/api.ts`: Centralized API client.
- `src/components/ui/`: Reusable Shadcn UI components.

## 🔗 Related Repositories

- [Tokiem API](https://github.com/your-username/tokiem-api): The NestJS backend integrated with Supabase.