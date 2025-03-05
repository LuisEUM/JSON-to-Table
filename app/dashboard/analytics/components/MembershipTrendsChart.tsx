"use client";

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MembershipTrendsChartProps {
  data: {
    date: string;
    active: number;
    expiringSoon: number;
    inactive: number;
  }[];
  title?: string;
}

export default function MembershipTrendsChart({
  data,
  title = "Tendencia de Membresías",
}: MembershipTrendsChartProps) {
  return (
    <Card className='w-full'>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='h-[400px]'>
          <ResponsiveContainer width='100%' height='100%'>
            <LineChart
              data={data}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis dataKey='date' />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type='monotone'
                dataKey='active'
                stroke='#4ade80'
                name='Activas'
                strokeWidth={2}
                activeDot={{ r: 8 }}
              />
              <Line
                type='monotone'
                dataKey='expiringSoon'
                stroke='#facc15'
                name='Por Expirar'
                strokeWidth={2}
              />
              <Line
                type='monotone'
                dataKey='inactive'
                stroke='#f87171'
                name='Inactivas'
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
