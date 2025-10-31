"use client";

import { Table } from "@tanstack/react-table";
import { X } from "lucide-react";

import { DataTableFacetedFilter } from "@/components/table/TableFactedFilter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface TableToolbarProps<TData> {
  table: Table<TData>;
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
}

export function TableToolbar<TData>({
  table,
  filterColumn,
  facetedFilters = [],
}: TableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        {filterColumn && table.getColumn(filterColumn) && (
          <Input
            placeholder="Search..."
            value={
              (table.getColumn(filterColumn)?.getFilterValue() as string) ?? ""
            }
            onChange={(event) =>
              table.getColumn(filterColumn)?.setFilterValue(event.target.value)
            }
            className="h-8 w-[150px] dark:border dark:border-gray-500 dark:bg-transparent lg:w-[250px] "
          />
        )}

        {Array.isArray(facetedFilters) &&
          facetedFilters.map((filter) => {
            const column = table.getColumn(filter.column);
            if (!column) {
              console.warn(`Column ${filter.column} not found in table`);
              return null;
            }

            return (
              <DataTableFacetedFilter
                key={filter.column}
                column={column}
                title={filter.title}
                options={filter.options}
              />
            );
          })}

        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <X className="ml-2 size-4" />
          </Button>
        )}
      </div>
      {/* <TableViewOptions table={table} /> */}
    </div>
  );
}
