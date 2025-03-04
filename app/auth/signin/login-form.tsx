"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icons } from "@/app/components/ui/icons";

export default function LoginForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Credenciales inválidas");
        setIsLoading(false);
        return;
      }

      router.push("/");
      router.refresh();
    } catch  {
      setError("Ocurrió un error al iniciar sesión");
      setIsLoading(false);
    }
  }

  return (
    <div className='grid gap-6'>
      <form onSubmit={onSubmit}>
        <div className='grid gap-4'>
          <div className='grid gap-2'>
            <Label htmlFor='email'>Correo electrónico</Label>
            <Input
              id='email'
              placeholder='nombre@ejemplo.com'
              type='email'
              autoCapitalize='none'
              autoComplete='email'
              autoCorrect='off'
              disabled={isLoading}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className='grid gap-2'>
            <Label htmlFor='password'>Contraseña</Label>
            <Input
              id='password'
              placeholder='********'
              type='password'
              autoComplete='current-password'
              disabled={isLoading}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className='text-sm text-red-500'>{error}</p>}

          <Button type='submit' disabled={isLoading}>
            {isLoading ? (
              <>
                <Icons.Spinner className='mr-2 h-4 w-4 animate-spin' />
                Iniciando sesión...
              </>
            ) : (
              "Iniciar sesión"
            )}
          </Button>
        </div>
      </form>

      <div className='relative'>
        <div className='absolute inset-0 flex items-center'>
          <span className='w-full border-t' />
        </div>
        <div className='relative flex justify-center text-xs uppercase'>
          <span className='bg-background px-2 text-muted-foreground'>
            O continuar con
          </span>
        </div>
      </div>
    </div>
  );
}
