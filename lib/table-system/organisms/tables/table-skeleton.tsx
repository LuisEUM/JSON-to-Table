"use client";

import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface TableSkeletonProps {
  columnCount?: number;
  rowCount?: number;
}

export function TableSkeleton({
  columnCount = 5,
  rowCount = 10,
}: TableSkeletonProps) {
  return (
    <div className='w-full'>
      <div className='flex justify-between items-center mb-4'>
        <Skeleton className='h-10 w-[250px]' />
        <div className='flex gap-2'>
          <Skeleton className='h-10 w-[100px]' />
          <Skeleton className='h-10 w-[100px]' />
        </div>
      </div>

      <div className='rounded-md border mb-4'>
        <div
          className='overflow-auto'
          style={{
            height: "calc(100vh - 400px)",
            minHeight: "300px",
            maxHeight: "800px",
          }}
        >
          <Table>
            <TableHeader>
              <TableRow>
                {Array.from({ length: columnCount }).map((_, index) => (
                  <TableHead key={index}>
                    <Skeleton className='h-8 w-full' />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: rowCount }).map((_, rowIndex) => (
                <TableRow key={rowIndex}>
                  {Array.from({ length: columnCount }).map((_, cellIndex) => (
                    <TableCell key={cellIndex}>
                      <Skeleton className='h-6 w-full' />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className='flex justify-between items-center'>
        <Skeleton className='h-10 w-[200px]' />
        <Skeleton className='h-10 w-[300px]' />
      </div>
    </div>
  );
}
