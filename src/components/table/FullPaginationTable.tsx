"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  getFilteredRowModel,
  ColumnFiltersState,
  VisibilityState,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown, EyeOff } from "lucide-react";
import { useState } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { TablePagination } from "./TablePagination";
import { TableToolbar } from "./TableToolbar";
import { Button } from "../ui/button";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  filterColumn?: string;
  facetedFilters?: {
    column: string;
    title: string;
    options: {
      label: string;
      value: string;
      icon?: React.ComponentType<{ className?: string }>;
    }[];
  }[];
  hasCheckbox?: boolean;
}

export function FullPaginationTable<TData, TValue>({
  columns,
  data,
  filterColumn,
  facetedFilters,
  hasCheckbox = false,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const visibleColumns = hasCheckbox
    ? columns
    : columns.filter((col) => col.id !== "select");

  const table = useReactTable({
    data,
    columns: visibleColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
      sorting: [
        {
          id: "created_at",
          desc: true,
        },
      ],
    },
  });

  return (
    <div className="flex h-full flex-col">
      <TableToolbar
        table={table}
        filterColumn={filterColumn}
        facetedFilters={facetedFilters}
      />
      <div className="border rounded-md mt-4">
        <div className="min-h-[400px] max-h-[600px] overflow-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className="border-b"
                >
                  {headerGroup.headers.map((header, index) => {
                    if (header.id === "select" && !hasCheckbox) {
                      return null;
                    }

                    return (
                      <TableHead
                        key={header.id}
                        className={`${
                          index ===
                          (hasCheckbox
                            ? headerGroup.headers.length - 1
                            : headerGroup.headers.length - 1)
                            ? "text-end"
                            : ""
                        }  text-gray-900 pl-4 rounded-md dark:text-white`}
                      >
                        {header.isPlaceholder ? null : (
                          <>
                            {header.id === "select" ? (
                              flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )
                            ) : (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="-ml-3 h-8 data-[state=open]:bg-accent"
                                  >
                                    <span>
                                      {flexRender(
                                        header.column.columnDef.header,
                                        header.getContext()
                                      )}
                                    </span>
                                    {index !==
                                      (hasCheckbox
                                        ? headerGroup.headers.length - 1
                                        : headerGroup.headers.length - 1) && (
                                      <ArrowUpDown className="ml-2 size-4" />
                                    )}
                                  </Button>
                                </DropdownMenuTrigger>
                                {index !==
                                  (hasCheckbox
                                    ? headerGroup.headers.length - 1
                                    : headerGroup.headers.length - 1) && (
                                  <DropdownMenuContent align="start">
                                    <DropdownMenuItem
                                      onClick={() =>
                                        header.column.toggleSorting(false)
                                      }
                                    >
                                      <ArrowUp className="mr-2 size-4" />
                                      Asc
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() =>
                                        header.column.toggleSorting(true)
                                      }
                                    >
                                      <ArrowDown className="mr-2 size-4" />
                                      Desc
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      onClick={() =>
                                        header.column.toggleVisibility(false)
                                      }
                                    >
                                      <EyeOff className="mr-2 size-4" />
                                      Hide
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                )}
                              </DropdownMenu>
                            )}
                          </>
                        )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows?.map((row) => (
                  <TableRow
                    key={row.id}
                    className="border-b"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={visibleColumns.length}
                    className="h-24 border-b border text-center"
                  >
                    No results found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      <div className="shrink-0">
        <TablePagination table={table} />
      </div>
    </div>
  );
}
