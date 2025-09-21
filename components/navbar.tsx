"use client";

import Link from "next/link";
import { UserNav } from "./user-nav";
import { ModeToggle } from "./mode-toggle";
import { File } from "lucide-react";

export function Navbar() {
  return (
    <div className='border-b'>
      <div className='w-full max-w-7xl mx-auto'>
        <div className='flex h-16 items-center px-6 container mx-auto'>
          <Link href='/' className='flex items-center space-x-2'>
            <File className='h-6 w-6' />
            <span className='font-bold'>JSON-to-Table</span>
          </Link>

          <div className='ml-auto flex items-center space-x-4'>
            <ModeToggle />
            <UserNav />
          </div>
        </div>
      </div>
    </div>
  );
}
