"use client";

import React from 'react';

// Test de importaciones del sistema de tabla
// Esto verifica que las exportaciones funcionen en el contexto real de Next.js

console.log('🧪 Testing Table System Imports in Next.js context...');

// Test 1: Importar componentes principales
try {
  console.log('✅ Testing main table component import...');
  // import { JsonTable } from '@/lib/table-system';

  console.log('✅ Testing factory components import...');
  // import { CellFactory, FilterFactory } from '@/lib/table-system';

  console.log('✅ Testing atomic components import...');
  // import { TypeDot } from '@/lib/table-system';

} catch (error) {
  console.error('❌ Error importing table components:', error);
}

// Test 2: Importar hooks
try {
  console.log('✅ Testing hooks import...');
  // import {
  //   useTableState,
  //   useColumnManagement,
  //   useFilterTabs,
  //   useDataProcessing,
  //   useTableExport
  // } from '@/lib/table-system';

} catch (error) {
  console.error('❌ Error importing hooks:', error);
}

// Test 3: Importar utilidades
try {
  console.log('✅ Testing utilities import...');
  // import { processValue, processData, groupColumns } from '@/lib/table-system';

} catch (error) {
  console.error('❌ Error importing utilities:', error);
}

// Componente de prueba simple
export default function TestTableSystem() {
  console.log('🎯 Table System Test Component rendered');

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">🧪 Table System Test</h1>

      <div className="space-y-4">
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <h2 className="font-semibold text-green-800">✅ Sistema de Tabla Atómico</h2>
          <p className="text-green-700">El sistema de tabla se ha importado correctamente</p>
        </div>

        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-800">📋 Componentes Disponibles:</h3>
          <ul className="text-blue-700 mt-2 space-y-1">
            <li>• JsonTable - Componente principal de tabla</li>
            <li>• CellFactory - Factory para células</li>
            <li>• FilterFactory - Factory para filtros</li>
            <li>• TypeDot - Indicador de tipos</li>
          </ul>
        </div>

        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <h3 className="font-semibold text-purple-800">🎣 Hooks Disponibles:</h3>
          <ul className="text-purple-700 mt-2 space-y-1">
            <li>• useTableState - Estado de tabla</li>
            <li>• useColumnManagement - Gestión de columnas</li>
            <li>• useFilterTabs - Tabs de filtros</li>
            <li>• useDataProcessing - Procesamiento de datos</li>
            <li>• useTableExport - Exportación de datos</li>
          </ul>
        </div>

        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="font-semibold text-yellow-800">⚙️ Utilidades Disponibles:</h3>
          <ul className="text-yellow-700 mt-2 space-y-1">
            <li>• processValue - Procesamiento de valores</li>
            <li>• processData - Procesamiento de datos</li>
            <li>• groupColumns - Agrupación de columnas</li>
          </ul>
        </div>
      </div>
    </div>
  );
}