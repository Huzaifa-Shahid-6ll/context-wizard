# Data Table Component Usage Guide

**Status:** ✅ Ready to Use  
**Last Updated:** $(date)

---

## Overview

The `DataTable` component provides an enhanced table experience with:
- ✅ Column sorting
- ✅ Global search/filtering
- ✅ Column visibility toggle
- ✅ Pagination
- ✅ Row selection
- ✅ Built on TanStack Table (React Table v8)

---

## Installation

The following packages are required (already installed):
- `@tanstack/react-table` - Core table functionality
- `shadcn/ui` components (Table, Button, Input, DropdownMenu)

---

## Basic Usage

```tsx
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

const columns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "role",
    header: "Role",
  },
];

function UsersTable() {
  const data: User[] = [
    { id: "1", name: "John Doe", email: "john@example.com", role: "Admin" },
    { id: "2", name: "Jane Smith", email: "jane@example.com", role: "User" },
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
      searchKey="name"
      searchPlaceholder="Search users..."
    />
  );
}
```

---

## Advanced Features

### Sortable Columns

```tsx
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";

const columns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
];
```

### Custom Cell Rendering

```tsx
const columns: ColumnDef<User>[] = [
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const role = row.getValue("role") as string;
      return (
        <Badge variant={role === "Admin" ? "default" : "secondary"}>
          {role}
        </Badge>
      );
    },
  },
];
```

### Actions Column

```tsx
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";

const columns: ColumnDef<User>[] = [
  // ... other columns
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const user = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleEdit(user)}>
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDelete(user)}>
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
```

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `columns` | `ColumnDef<TData, TValue>[]` | Required | Column definitions |
| `data` | `TData[]` | Required | Table data |
| `searchKey` | `string` | `undefined` | Key to search by (enables search) |
| `searchPlaceholder` | `string` | `"Search..."` | Search input placeholder |
| `enableColumnVisibility` | `boolean` | `true` | Show column visibility toggle |
| `enablePagination` | `boolean` | `true` | Enable pagination |
| `pageSize` | `number` | `10` | Items per page |

---

## Example: Prompt History

See `src/components/examples/PromptHistoryDataTable.tsx` for a complete example of using the DataTable component with:
- Sortable columns
- Custom cell rendering (Badges)
- Actions dropdown menu
- Search functionality

---

## Migration from Basic Table

### Before (Basic Table)
```tsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Email</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {data.map((item) => (
      <TableRow key={item.id}>
        <TableCell>{item.name}</TableCell>
        <TableCell>{item.email}</TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

### After (DataTable)
```tsx
const columns: ColumnDef<User>[] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "email", header: "Email" },
];

<DataTable columns={columns} data={data} searchKey="name" />
```

---

## Benefits

1. **Less Code**: No need to manually implement sorting, filtering, pagination
2. **Better UX**: Built-in search, column visibility, pagination controls
3. **Type-Safe**: Full TypeScript support with TanStack Table
4. **Flexible**: Easy to customize columns, cells, and actions
5. **Performant**: Virtual scrolling support (can be added if needed)

---

## Next Steps

1. Replace existing tables in:
   - `src/app/dashboard/prompt-history/page.tsx` (list view)
   - `src/app/dashboard/admin/feedback/page.tsx`
   - Any other data-heavy pages

2. Add more features as needed:
   - Row selection with bulk actions
   - Export functionality
   - Column resizing
   - Virtual scrolling for large datasets

