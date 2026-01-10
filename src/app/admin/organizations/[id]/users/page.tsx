"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Loader2, Shield, ShieldCheck, User } from "lucide-react";
import { toast } from "sonner";
import { ROLE_NAMES, ROLE_DESCRIPTIONS } from "@/lib/permissions/config";

interface OrganizationUser {
  id: string;
  userId: string;
  role: string;
  canInvite: boolean;
  isActive: boolean;
  user: {
    email: string;
    teacherProfile?: {
      firstName: string;
      lastName: string;
    };
  };
}

interface Organization {
  id: string;
  name: string;
}

export default function OrganizationUsersPage() {
  const params = useParams();
  const router = useRouter();
  const organizationId = params.id as string;

  const [organization, setOrganization] = useState<Organization | null>(null);
  const [users, setUsers] = useState<OrganizationUser[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch organization details
      const orgResponse = await fetch(`/api/admin/organizations/${organizationId}/details`);
      if (!orgResponse.ok) {
        throw new Error("Failed to fetch organization");
      }
      const orgData = await orgResponse.json();
      setOrganization(orgData);

      // Fetch users
      const usersResponse = await fetch(`/api/admin/organizations/${organizationId}/users`);
      if (!usersResponse.ok) {
        throw new Error("Failed to fetch users");
      }
      const usersData = await usersResponse.json();
      setUsers(usersData);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load organization users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizationId]);

  const handleRoleChange = async (userOrgId: string, newRole: string) => {
    try {
      const response = await fetch(
        `/api/admin/organizations/${organizationId}/users/${userOrgId}/role`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role: newRole }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update role");
      }

      toast.success("User role updated successfully");
      fetchData();
    } catch (error) {
      console.error("Error updating role:", error);
      toast.error("Failed to update user role");
    }
  };

  const handleToggleInvitePermission = async (
    userOrgId: string,
    currentStatus: boolean
  ) => {
    try {
      const response = await fetch(
        `/api/admin/organizations/${organizationId}/users/${userOrgId}/invite-permission`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ canInvite: !currentStatus }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update invite permission");
      }

      toast.success("Invite permission updated successfully");
      fetchData();
    } catch (error) {
      console.error("Error updating invite permission:", error);
      toast.error("Failed to update invite permission");
    }
  };

  const handleToggleActive = async (userOrgId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(
        `/api/admin/organizations/${organizationId}/users/${userOrgId}/toggle-active`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isActive: !currentStatus }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update user status");
      }

      toast.success(`User ${!currentStatus ? "activated" : "deactivated"}`);
      fetchData();
    } catch (error) {
      console.error("Error toggling user status:", error);
      toast.error("Failed to update user status");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/admin/organizations")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">
            {organization?.name} - Users
          </h1>
          <p className="text-muted-foreground">
            Manage user roles and permissions
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Organization Users ({users.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="text-center py-12">
              <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No users yet</h3>
              <p className="text-muted-foreground">
                Users will appear here once they are invited to the organization
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Can Invite</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((userOrg) => (
                  <TableRow key={userOrg.id}>
                    <TableCell className="font-medium">
                      {userOrg.user.teacherProfile
                        ? `${userOrg.user.teacherProfile.firstName} ${userOrg.user.teacherProfile.lastName}`
                        : "N/A"}
                    </TableCell>
                    <TableCell>{userOrg.user.email}</TableCell>
                    <TableCell>
                      <Select
                        value={userOrg.role}
                        onValueChange={(value) =>
                          handleRoleChange(userOrg.id, value)
                        }
                      >
                        <SelectTrigger className="w-[200px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="OrganizationAdmin">
                            <div className="flex items-center gap-2">
                              <ShieldCheck className="h-4 w-4" />
                              <span>{ROLE_NAMES.OrganizationAdmin}</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="FinanceManager">
                            <div className="flex items-center gap-2">
                              <Shield className="h-4 w-4" />
                              <span>{ROLE_NAMES.FinanceManager}</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="AcademicCoordinator">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              <span>{ROLE_NAMES.AcademicCoordinator}</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleToggleInvitePermission(userOrg.id, userOrg.canInvite)
                        }
                      >
                        {userOrg.canInvite ? "Revoke" : "Grant"}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Badge variant={userOrg.isActive ? "default" : "secondary"}>
                        {userOrg.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant={userOrg.isActive ? "destructive" : "default"}
                        size="sm"
                        onClick={() =>
                          handleToggleActive(userOrg.id, userOrg.isActive)
                        }
                      >
                        {userOrg.isActive ? "Deactivate" : "Activate"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Role Descriptions */}
      <Card>
        <CardHeader>
          <CardTitle>Role Descriptions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <h4 className="font-semibold mb-1">
              {ROLE_NAMES.OrganizationAdmin}
            </h4>
            <p className="text-sm text-muted-foreground">
              {ROLE_DESCRIPTIONS.OrganizationAdmin}
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-1">
              {ROLE_NAMES.FinanceManager}
            </h4>
            <p className="text-sm text-muted-foreground">
              {ROLE_DESCRIPTIONS.FinanceManager}
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-1">
              {ROLE_NAMES.AcademicCoordinator}
            </h4>
            <p className="text-sm text-muted-foreground">
              {ROLE_DESCRIPTIONS.AcademicCoordinator}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
