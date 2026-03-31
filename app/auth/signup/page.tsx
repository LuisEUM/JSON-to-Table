"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { Button } from "@/components/primitives/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/primitives/ui/form";
import { Input } from "@/components/primitives/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/primitives/ui/card";
import { Loader2 } from "lucide-react";

// Esquema de validación con Zod
const formSchema = z
  .object({
    name: z.string().min(2, {
      message: "El nombre debe tener al menos 2 caracteres",
    }),
    email: z.string().email({
      message: "Por favor ingresa un email válido",
    }),
    password: z.string().min(8, {
      message: "La contraseña debe tener al menos 8 caracteres",
    }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export default function SignUpPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Inicializar react-hook-form con validación de zod
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Manejar el envío del formulario
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);

      // Registrar al usuario
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          password: values.password,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error al registrar el usuario");
      }

      // Mostrar notificación de éxito
      toast.success("¡Registro exitoso!", {
        description: "Tu cuenta ha sido creada. Ahora puedes iniciar sesión.",
      });

      // Iniciar sesión automáticamente
      const result = await signIn("credentials", {
        redirect: false,
        email: values.email,
        password: values.password,
      });

      if (result?.error) {
        // Si hay error al iniciar sesión, redirigir a la página de login
        router.push("/auth/signin");
      } else {
        // Redirigir a la página principal
        router.push("/");
      }
    } catch (error) {
      console.error("Error de registro:", error);
      toast.error("Error al registrarse", {
        description:
          error instanceof Error ? error.message : "Ha ocurrido un error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='flex justify-center items-center min-h-screen p-4'>
      <Card className='w-full max-w-md'>
        <CardHeader>
          <CardTitle className='text-2xl'>Crear una cuenta</CardTitle>
          <CardDescription>Ingresa tus datos para registrarte</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Tu nombre completo'
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type='email'
                        placeholder='tu@email.com'
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='password'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contraseña</FormLabel>
                    <FormControl>
                      <Input
                        type='password'
                        placeholder='********'
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='confirmPassword'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmar Contraseña</FormLabel>
                    <FormControl>
                      <Input
                        type='password'
                        placeholder='********'
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type='submit' className='w-full' disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Registrando...
                  </>
                ) : (
                  "Registrarse"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className='flex flex-col space-y-4'>
          <div className='text-sm text-muted-foreground text-center'>
            Al registrarte, aceptas nuestros términos y condiciones.
          </div>
          <div className='text-center text-sm'>
            ¿Ya tienes una cuenta?{" "}
            <Link href='/auth/signin' className='text-primary hover:underline'>
              Iniciar sesión
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
