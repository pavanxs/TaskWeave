# NODIT Flow - Visual Automation Prototype

This project is a visually intuitive front-end prototype of an automation platform, similar to Zapier or Make.com. It's designed to demonstrate the concept of building workflows using NODIT MCP integrations, with a primary focus on showcasing the user experience and interface design for a hackathon.

## Hackathon Focus

This prototype is built for the [Wave Hacks hackathon](https://app.akindo.io/wave-hacks/JB29Nk61kfQpLPKr). Our core goal is to present a highly polished and understandable visual demonstration of how users would interact with and build automation workflows, emphasizing clarity and impressiveness of the visual prototype.

## Key Visual Features:

- **Visual Workflow Builder:** A central canvas using [React Flow](https://reactflow.dev/) for drag-and-drop workflow creation and visual data flow representation.
- **Service/Action Block Library:** A left-hand panel displaying categorized, draggable blocks (triggers, actions, logic).
- **Configurable Block Properties Panel:** A dynamic right-hand panel (or modal) for configuring selected blocks using Shadcn UI components.

## Technology Stack:

- **Frontend Framework:** Next.js
- **UI Library:** Shadcn UI (components from `/components/ui`)
- **CSS Framework:** Tailwind CSS, with custom variables and base styles defined in `globals.css`.
- **Workflow Visualization:** React Flow
- **Language:** TypeScript

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
