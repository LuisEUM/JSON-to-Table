"use client";

import Link from "next/link";
import { UserNav } from "./user-nav";
import { ModeToggle } from "./mode-toggle";
import { File, LineChart } from "lucide-react";

export function Navbar() {
  return (
    <div className='border-b'>
      <div className='flex h-16 items-center px-4 container'>
        <Link href='/' className='flex items-center space-x-2'>
          <File className='h-6 w-6' />
          <span className='font-bold'>JSON-to-Table</span>
        </Link>

        <nav className='mx-6 flex items-center space-x-4 lg:space-x-6'>
          <Link
            href='/'
            className='text-sm font-medium transition-colors hover:text-primary'
          >
            Tablas
          </Link>
          <Link
            href='/charts'
            className='text-sm font-medium text-muted-foreground transition-colors hover:text-primary flex items-center'
          >
            <LineChart className='h-4 w-4 mr-1' />
            Gráficos
          </Link>
        </nav>

        <div className='ml-auto flex items-center space-x-4'>
          <ModeToggle />
          <UserNav />
        </div>
      </div>
    </div>
  );
}
