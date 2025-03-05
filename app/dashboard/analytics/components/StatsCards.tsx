"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  UserCheck,
  UserMinus,
  Calendar,
  Award,
  Clock,
} from "lucide-react";

interface StatsCardsProps {
  totalContacts: number;
  activeContacts: number;
  inactiveContacts: number;
  totalMemberships: number;
  totalTrainings: number;
  averageTenure: string;
}

export default function StatsCards({
  totalContacts,
  activeContacts,
  inactiveContacts,
  totalMemberships,
  totalTrainings,
  averageTenure,
}: StatsCardsProps) {
  return (
    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Total Contactos</CardTitle>
          <Users className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{totalContacts}</div>
          <p className='text-xs text-muted-foreground'>
            Contactos registrados en Holded
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>
            Contactos Activos
          </CardTitle>
          <UserCheck className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{activeContacts}</div>
          <p className='text-xs text-muted-foreground'>
            {((activeContacts / totalContacts) * 100).toFixed(1)}% del total
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>
            Contactos Inactivos
          </CardTitle>
          <UserMinus className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{inactiveContacts}</div>
          <p className='text-xs text-muted-foreground'>
            {((inactiveContacts / totalContacts) * 100).toFixed(1)}% del total
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>
            Total Membresías
          </CardTitle>
          <Award className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{totalMemberships}</div>
          <p className='text-xs text-muted-foreground'>
            Promedio de {(totalMemberships / totalContacts).toFixed(2)} por
            contacto
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>
            Total Formaciones
          </CardTitle>
          <Calendar className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{totalTrainings}</div>
          <p className='text-xs text-muted-foreground'>
            Promedio de {(totalTrainings / totalContacts).toFixed(2)} por
            contacto
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>
            Antigüedad Promedio
          </CardTitle>
          <Clock className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{averageTenure}</div>
          <p className='text-xs text-muted-foreground'>
            Tiempo promedio como cliente
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
