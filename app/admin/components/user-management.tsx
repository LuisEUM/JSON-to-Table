"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { UserRole } from "@prisma/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/primitives/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/primitives/ui/select";
import { Input } from "@/components/primitives/ui/input";
import { Button } from "@/components/primitives/ui/button";
import { Search, UserCog } from "lucide-react";

interface User {
  id: string;
  name: string | null;
  email: string | null;
  role: UserRole;
  createdAt: string;
}

interface UserManagementProps {
  canEditRoles: boolean;
}

export function UserManagement({ canEditRoles }: UserManagementProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (users.length > 0) {
      const filtered = users.filter(
        (user) =>
          user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, users]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/users");
      
      if (!response.ok) {
        throw new Error("No se pudieron cargar los usuarios");
      }
      
      const data = await response.json();
      setUsers(data);
      setFilteredUsers(data);
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
      toast.error("Error al cargar usuarios");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    if (!canEditRoles) {
      toast.error("No tienes permisos para cambiar roles");
      return;
    }
    
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: newRole }),
      });
      
      if (!response.ok) {
        throw new Error("No se pudo actualizar el rol");
      }
      
      // Actualizar el usuario en el estado local
      setUsers(
        users.map((user) =>
          user.id === userId ? { ...user, role: newRole } : user
        )
      );
      
      toast.success("Rol actualizado correctamente");
    } catch (error) {
      console.error("Error al actualizar rol:", error);
      toast.error("Error al actualizar rol");
    }
  };

  const getRoleBadgeClass = (role: UserRole) => {
    switch (role) {
      case "ADMIN":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "EMPLOYEE":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "CLIENT":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  };

  if (loading) {
    return <div>Cargando usuarios...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o email..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" onClick={fetchUsers}>
          Actualizar
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Fecha de Registro</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    {user.name || "Sin nombre"}
                  </TableCell>
                  <TableCell>{user.email || "Sin email"}</TableCell>
                  <TableCell>
                    {canEditRoles ? (
                      <Select
                        defaultValue={user.role}
                        onValueChange={(value: UserRole) =>
                          handleRoleChange(user.id, value)
                        }
                      >
                        <SelectTrigger
                          className={`w-[130px] h-7 text-xs ${getRoleBadgeClass(
                            user.role
                          )}`}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ADMIN">Administrador</SelectItem>
                          <SelectItem value="EMPLOYEE">Empleado</SelectItem>
                          <SelectItem value="CLIENT">Cliente</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${getRoleBadgeClass(
                          user.role
                        )}`}
                      >
                        {user.role === "ADMIN"
                          ? "Administrador"
                          : user.role === "EMPLOYEE"
                          ? "Empleado"
                          : "Cliente"}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>{formatDate(user.createdAt)}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4">
                  No se encontraron usuarios
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {!canEditRoles && (
        <div className="flex items-center justify-center mt-4 py-2 px-4 bg-yellow-50 text-yellow-800 rounded-md">
          <UserCog className="h-4 w-4 mr-2" />
          <p className="text-sm">
            Solo los administradores pueden cambiar los roles de los usuarios
          </p>
        </div>
      )}
    </div>
  );
} 