"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { FullPaginationTable } from "@/components/table/FullPaginationTable";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, MoreHorizontal, Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { CreateFeeStructureDialog } from "@/components/finance/create-fee-structure-dialog";
import { toast } from "sonner";

interface FeeStructure {
  id: string;
  name: string;
  amount: number;
  frequency: string;
  academicYear: string;
  description: string | null;
  isActive: boolean;
  level: {
    id: string;
    name: string;
    levelNumber: number;
  } | null;
  createdAt: string;
}

export default function FeeStructuresPage() {
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingFeeStructure, setEditingFeeStructure] = useState<FeeStructure | undefined>();

  useEffect(() => {
    fetchFeeStructures();
  }, []);

  const fetchFeeStructures = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/finance/fee-structures");
      const data = await response.json();
      setFeeStructures(data.data || []);
    } catch (error) {
      console.error("Error fetching fee structures:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/finance/fee-structures/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete fee structure");
      }

      toast.success("Fee structure deleted successfully");
      fetchFeeStructures();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete fee structure"
      );
    }
  };

  const handleEdit = (feeStructure: FeeStructure) => {
    setEditingFeeStructure(feeStructure);
  };

  const handleEditComplete = () => {
    setEditingFeeStructure(undefined);
    fetchFeeStructures();
  };

  const columns: ColumnDef<FeeStructure>[] = [
    {
      accessorKey: "name",
      header: "Fee Structure Name",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("name")}</div>
      ),
    },
    {
      accessorKey: "level",
      header: "Level",
      cell: ({ row }) => {
        const level = row.original.level;
        return level ? (
          <Badge variant="secondary">{level.name}</Badge>
        ) : (
          <span className="text-muted-foreground">All Levels</span>
        );
      },
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => (
        <div className="font-semibold">
          {formatCurrency(row.getValue("amount"))}
        </div>
      ),
    },
    {
      accessorKey: "frequency",
      header: "Frequency",
      cell: ({ row }) => (
        <Badge variant="outline">{row.getValue("frequency")}</Badge>
      ),
    },
    {
      accessorKey: "academicYear",
      header: "Academic Year",
      cell: ({ row }) => <div>{row.getValue("academicYear")}</div>,
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => {
        const isActive = row.getValue("isActive");
        return (
          <Badge variant={isActive ? "default" : "secondary"}>
            {isActive ? "Active" : "Inactive"}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const feeStructure = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => handleEdit(feeStructure)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem
                    onSelect={(e) => e.preventDefault()}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action will deactivate the fee structure &quot;{feeStructure.name}&quot;.
                      You can reactivate it later by editing the status.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDelete(feeStructure.id)}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <DashboardLayout>
      <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Fee Structures
            </h1>
            <p className="text-muted-foreground">
              Manage fee structures for different levels and courses
            </p>
          </div>
          <CreateFeeStructureDialog onCreated={fetchFeeStructures}>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Fee Structure
            </Button>
          </CreateFeeStructureDialog>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-muted-foreground">Loading fee structures...</div>
          </div>
        ) : (
          <FullPaginationTable
            columns={columns}
            data={feeStructures}
            filterColumn="name"
          />
        )}

        {/* Edit Dialog */}
        {editingFeeStructure && (
          <CreateFeeStructureDialog
            editingFeeStructure={editingFeeStructure}
            onUpdated={handleEditComplete}
            open={!!editingFeeStructure}
            onOpenChange={(open) => !open && setEditingFeeStructure(undefined)}
          >
            <div />
          </CreateFeeStructureDialog>
        )}
      </div>
    </DashboardLayout>
  );
}
