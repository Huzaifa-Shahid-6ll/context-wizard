/**
 * Example: Enhanced Prompt History using DataTable component
 * Demonstrates how to use the new DataTable with sorting, filtering, and pagination
 */

"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type PromptItem = {
  _id: string;
  userId: string;
  type: string;
  title: string;
  content: string;
  context?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  createdAt: number;
};

interface PromptHistoryDataTableProps {
  data: PromptItem[];
  onDelete?: (id: string) => void;
  onCopy?: (content: string) => void;
  onView?: (item: PromptItem) => void;
}

export function PromptHistoryDataTable({
  data,
  onDelete,
  onCopy,
  onView,
}: PromptHistoryDataTableProps) {
  const columns: ColumnDef<PromptItem>[] = React.useMemo(
    () => [
      {
        accessorKey: "type",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              Type
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          return (
            <Badge variant="secondary" className="capitalize">
              {row.getValue("type")}
            </Badge>
          );
        },
      },
      {
        accessorKey: "title",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              Title
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          const title = row.getValue("title") as string;
          return <div className="font-medium">{title || "Untitled"}</div>;
        },
      },
      {
        accessorKey: "createdAt",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              Created
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          const date = new Date(row.getValue("createdAt"));
          return <div className="whitespace-nowrap">{date.toLocaleString()}</div>;
        },
      },
      {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
          const prompt = row.original;

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => {
                    if (onCopy) {
                      onCopy(prompt.content);
                    } else {
                      navigator.clipboard.writeText(prompt.content).catch(() => {});
                    }
                  }}
                >
                  Copy content
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    if (onView) {
                      onView(prompt);
                    }
                  }}
                >
                  View details
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    const blob = new Blob([prompt.content], { type: "text/plain;charset=utf-8" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `${prompt.title || "prompt"}.txt`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                >
                  Download as .txt
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    const blob = new Blob([prompt.content], { type: "text/markdown;charset=utf-8" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `${prompt.title || "prompt"}.md`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                >
                  Download as .md
                </DropdownMenuItem>
                {onDelete && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onDelete(prompt._id)}
                      className="text-destructive"
                    >
                      Delete
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [onDelete, onCopy, onView]
  );

  return (
    <DataTable
      columns={columns}
      data={data}
      searchKey="title"
      searchPlaceholder="Search prompts..."
      enableColumnVisibility={true}
      enablePagination={true}
      pageSize={20}
    />
  );
}

