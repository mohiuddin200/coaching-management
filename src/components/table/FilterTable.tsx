/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Search, X } from "lucide-react";
import { useState, useRef, ChangeEvent } from "react";

import { FullPaginationTable } from "./FullPaginationTable";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

interface TableData {
  [key: string]: any;
}

interface FilterTableProps {
  data: TableData[];
  columns: any[];
  filterColumn?: string;
}

const FilterTable = ({
  data,
  columns,
  filterColumn = "title",
}: FilterTableProps) => {
  const [filteredData, setFilteredData] = useState(data);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(event.target.value);
    const filtered = data.filter((item) =>
      item[filterColumn]?.toLowerCase().includes(query)
    );
    setFilteredData(filtered);
  };

  const clearSearch = () => {
    if (searchInputRef.current) {
      searchInputRef.current.value = "";
      setSearchQuery("");
      setFilteredData(data);
    }
  };

  return (
    <>
      <div className="flex w-full items-center justify-between pb-4">
        <div className="relative flex w-[600px] flex-row items-center">
          <Search className="absolute left-3 top-2 size-5 text-gray-400" />
          <Input
            ref={searchInputRef}
            className="px-10 text-sm sm:text-sm"
            placeholder="Titel, Message"
            onChange={handleSearch}
          />
          {searchQuery && (
            <Button
              className="absolute right-3 top-2"
              onClick={clearSearch}
              aria-label="Clear search"
            >
              <X className="text-gray-400 hover:text-gray-600" />
            </Button>
          )}
        </div>
      </div>
      <div className="h-full">
        <FullPaginationTable columns={columns} data={filteredData} />
      </div>
    </>
  );
};

export default FilterTable;
