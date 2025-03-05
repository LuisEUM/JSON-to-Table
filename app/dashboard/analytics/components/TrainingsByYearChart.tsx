"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TrainingsByYearChartProps {
  data: {
    year: string;
    completed: number;
    inProgress: number;
    pending: number;
  }[];
  title?: string;
}

export default function TrainingsByYearChart({
  data,
  title = "Formaciones por Año",
}: TrainingsByYearChartProps) {
  return (
    <Card className='w-full'>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='h-[400px]'>
          <ResponsiveContainer width='100%' height='100%'>
            <BarChart
              data={data}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis dataKey='year' />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar
                dataKey='completed'
                name='Completados'
                stackId='a'
                fill='#4ade80'
              />
              <Bar
                dataKey='inProgress'
                name='En Progreso'
                stackId='a'
                fill='#60a5fa'
              />
              <Bar
                dataKey='pending'
                name='Pendientes'
                stackId='a'
                fill='#f87171'
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
