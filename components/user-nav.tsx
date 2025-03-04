"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { User, LogOut, Settings, UserCog } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function UserNav() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    await signOut({ redirect: true, callbackUrl: "/" });
  };

  // Si el usuario no está autenticado, mostrar botón de inicio de sesión
  if (status === "unauthenticated" || !session) {
    return (
      <Button variant='outline' onClick={() => router.push("/auth/signin")}>
        <User className='mr-2 h-4 w-4' />
        Iniciar Sesión
      </Button>
    );
  }

  // Si está cargando o saliendo, mostrar botón de carga
  if ((status as string) === "loading" || isLoggingOut) {
    return (
      <Button variant='outline' disabled>
        <div className='h-4 w-4 mr-2 animate-spin rounded-full border-2 border-background border-t-foreground' />
        Cargando...
      </Button>
    );
  }

  // Obtener inicial del nombre para el avatar
  const getInitials = () => {
    if (!session.user.name) return "U";
    return session.user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Si está autenticado, mostrar dropdown con opciones
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' className='relative h-8 w-8 rounded-full'>
          <Avatar className='h-8 w-8'>
            <AvatarImage
              src={session.user.image || ""}
              alt={session.user.name || "Usuario"}
            />
            <AvatarFallback>{getInitials()}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-56' align='end' forceMount>
        <DropdownMenuLabel className='font-normal'>
          <div className='flex flex-col space-y-1'>
            <p className='text-sm font-medium leading-none'>
              {session.user.name}
            </p>
            <p className='text-xs leading-none text-muted-foreground'>
              {session.user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <User className='mr-2 h-4 w-4' />
            <span>Perfil</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings className='mr-2 h-4 w-4' />
            <span>Ajustes</span>
          </DropdownMenuItem>

          {/* Mostrar enlace al panel de administración solo si es admin o empleado */}
          {(session.user.role === "ADMIN" ||
            session.user.role === "EMPLOYEE") && (
            <DropdownMenuItem asChild>
              <Link href='/admin'>
                <UserCog className='mr-2 h-4 w-4' />
                <span>Panel de Administración</span>
              </Link>
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className='mr-2 h-4 w-4' />
          <span>Cerrar Sesión</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
