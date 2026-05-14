## Getting Started

Install dependencies:

```bash

npm install

```

Start the development server:

```bash

npm run dev

```

Open your browser and navigate to:

`http://localhost:3000`

The app will automatically reload when files are changed.

---

# Understanding the Project Structure

This project uses the **Next.js App Router** structure.

Example:

```txt

src/app/admin/dashboard/page.tsx

```

This automatically becomes:

```txt

http://localhost:3000/admin/dashboard

```

In Next.js:

- Folders inside `src/app` define routes

- `page.tsx` defines the page shown for a route

- Nested folders create nested URLs automatically

---

# File & Folder Standards

## Pages

All pages should use the filename:

```txt

page.tsx

```

Example:

```txt

src/app/admin/dashboard/page.tsx

```

---

# Component Structure

## Internal Components

Store internal project components here:

```txt

src/components/{foldername}

```

Example:

```txt

src/components/shared/locationbutton.tsx

```

---

## External / Shared UI Components

Store reusable UI library wrappers or imported UI components here:

```txt

src/components/UI/*

```

---

## Feature Components

Create feature-specific components beneath:

```txt

driver/

admin/

```

Example:

```txt

src/components/admin/

src/components/driver/

```

---

## Shared Components

Reusable components shared across multiple areas should be placed beneath:

```txt

shared/

```

Example:

```txt

src/components/shared/

```

---

# Using Components

Pages inside `src/app/*` should import and use components.

Example:

```tsx

import LocationButton from "@/components/shared/locationbutton";

```

---

# Import Standards

## External Imports

External libraries come from `node_modules`.

Example:

```tsx

import {

  APIProvider,

  Map,

  AdvancedMarker,

  Pin,

  InfoWindow,

} from "@vis.gl/react-google-maps";

```

Notice the brackets **{ }** which indicates that its an import from an external library.

---

## Internal Imports

Internal project imports use the `@/` alias.

Example:

```tsx

import LocationButton from "@/components/shared/locationbutton";

```

This is cleaner and easier to maintain than relative imports like:

```tsx

../../../components/shared/locationbutton

```

---

# Understanding React Components

React applications are built from components.

A component is simply a reusable UI function.

Example:

```tsx

export default function WelcomeCard() {

  return <div>Hello World</div>;

}

```

This component can now be reused anywhere in the app.

---

# Understanding JSX

React uses JSX.

JSX looks like HTML but works inside TypeScript/JavaScript.

Example:

```tsx

return <h1>Hello</h1>;

```

JSX allows dynamic rendering:

```tsx

const username = "John";

return <h1>Hello {username}</h1>;

```

---

# Understanding Props

Props are values passed into components.

Example:

```tsx

type UserCardProps = {

  name: string;

};

export default function UserCard({ name }: UserCardProps) {

  return <div>{name}</div>;

}

```

Usage:

```tsx

<UserCard name="Alice" />

```

Props make components reusable.

---

# Understanding State

State allows components to store changing data.

Example:

```tsx

"use client";

import { useState } from "react";

export default function Counter() {

  const [count, setCount] = useState(0);

  return (

    <button onClick={() => setCount(count + 1)}>

      {count}

    </button>

  );

}

```

---

# Important: Server Components vs Client Components

Next.js App Router uses **Server Components by default**.

This means components render on the server unless marked otherwise.

To use browser features like:

- `useState`

- `useEffect`

- button interactions

- browser APIs

You must add:

```tsx

"use client";

```

At the top of the file.

Example:

```tsx

"use client";

import { useState } from "react";

```

---

# Recommended Development Practices

## Keep Components Small

Avoid very large page files.

Instead:

- Split UI into smaller reusable components

- Move repeated code into shared components

---

## Keep Business Logic Separate

Avoid placing large amounts of logic directly inside pages.

Move reusable logic into:

```txt

src/lib/

src/services/

src/utils/

```

---

## Naming Standards

Use:

- PascalCase for components

- camelCase for variables/functions

Examples:

```txt

UserCard.tsx

LocationButton.tsx

```

Variables:

```ts

const userName = "John";

```

---

# UI Libraries

## shadcn/ui

A modern component system built on Tailwind CSS.

Official site:

https://ui.shadcn.com

---

## HeroUI

A React UI component library.

Official site:

https://heroui.com

---

## React Bits

Reusable animated React components.

Official site:

https://reactbits.dev

---

# Styling

This project uses Tailwind CSS.

Example:

```tsx

<div className="flex items-center justify-center p-4">

  Content

</div>

```

Common Tailwind patterns:

| Class | Meaning |

|---|---|

| `flex` | Enable flexbox |

| `p-4` | Padding |

| `m-4` | Margin |

| `text-center` | Center text |

| `bg-blue-500` | Background color |

| `rounded-xl` | Rounded corners |

---

# Recommended Folder Example

```txt

src/

├── app/

│   ├── admin/

│   │   └── dashboard/

│   │       └── page.tsx

│   └── driver/

│       └── page.tsx

│

├── components/

│   ├── UI/

│   ├── admin/

│   ├── driver/

│   └── shared/

│

├── lib/

├── services/

├── utils/

```

---

# Summary

Key things to remember:

- `src/app` controls routing

- `page.tsx` creates pages

- Components should be reusable

- Use shared components when possible

- Use `"use client"` only when needed

- Prefer clean folder organization

- Keep pages simple and move reusable logic into components/services