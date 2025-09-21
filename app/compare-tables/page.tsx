"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CompareTablesPage() {
  const [pokemonCount, setPokemonCount] = useState(0);

  useEffect(() => {
    // Simular obtener el conteo de Pokémon disponibles
    const fetchCount = async () => {
      try {
        const response = await fetch('/api/pokemon?limit=1');
        if (response.ok) {
          setPokemonCount(150); // Aproximación para la demo
        }
      } catch (error) {
        console.error('Error fetching Pokemon count:', error);
      }
    };

    fetchCount();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-8 text-white">
            <h1 className="text-3xl font-bold mb-2">🚀 Sistema de Tabla: Comparación</h1>
            <p className="text-blue-100">
              Comparar el rendimiento y funcionalidad entre el sistema anterior y el nuevo sistema atómico
            </p>
          </div>

          {/* Comparison Grid */}
          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-8">

              {/* New Atomic System */}
              <div className="border border-green-200 rounded-lg p-6 bg-green-50">
                <div className="flex items-center mb-4">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                  <h2 className="text-xl font-semibold text-green-800">Nuevo Sistema Atómico</h2>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-green-700">
                    <span className="mr-2">✅</span>
                    <span>Componentes reutilizables (atoms, molecules, organisms)</span>
                  </div>
                  <div className="flex items-center text-green-700">
                    <span className="mr-2">✅</span>
                    <span>Hooks especializados para gestión de estado</span>
                  </div>
                  <div className="flex items-center text-green-700">
                    <span className="mr-2">✅</span>
                    <span>TypeScript completamente tipado</span>
                  </div>
                  <div className="flex items-center text-green-700">
                    <span className="mr-2">✅</span>
                    <span>Procesamiento asíncrono de datos</span>
                  </div>
                  <div className="flex items-center text-green-700">
                    <span className="mr-2">✅</span>
                    <span>Exportación múltiple (JSON, CSV, XLSX)</span>
                  </div>
                  <div className="flex items-center text-green-700">
                    <span className="mr-2">✅</span>
                    <span>Manejo avanzado de filtros y ordenamiento</span>
                  </div>
                </div>

                <Link
                  href="/test-pokemon-table"
                  className="block w-full bg-green-600 text-white text-center py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  🧪 Probar Nuevo Sistema
                </Link>

                <div className="mt-4 text-sm text-green-600">
                  <strong>Ubicación:</strong> <code>/lib/table-system/</code>
                </div>
              </div>

              {/* Original System */}
              <div className="border border-blue-200 rounded-lg p-6 bg-blue-50">
                <div className="flex items-center mb-4">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                  <h2 className="text-xl font-semibold text-blue-800">Sistema Original</h2>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-blue-700">
                    <span className="mr-2">📊</span>
                    <span>JsonTable monolítico</span>
                  </div>
                  <div className="flex items-center text-blue-700">
                    <span className="mr-2">🔧</span>
                    <span>Configuración centralizada</span>
                  </div>
                  <div className="flex items-center text-blue-700">
                    <span className="mr-2">📈</span>
                    <span>Funcionalidad probada y estable</span>
                  </div>
                  <div className="flex items-center text-blue-700">
                    <span className="mr-2">🎯</span>
                    <span>Enfoque directo sin abstracciones</span>
                  </div>
                  <div className="flex items-center text-blue-700">
                    <span className="mr-2">⚡</span>
                    <span>Menor overhead inicial</span>
                  </div>
                  <div className="flex items-center text-blue-700">
                    <span className="mr-2">📝</span>
                    <span>Documentación establecida</span>
                  </div>
                </div>

                <Link
                  href="/table"
                  className="block w-full bg-blue-600 text-white text-center py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  📊 Probar Sistema Original
                </Link>

                <div className="mt-4 text-sm text-blue-600">
                  <strong>Ubicación:</strong> <code>/app/table/</code>
                </div>
              </div>
            </div>

            {/* Comparison Table */}
            <div className="mt-12">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">📊 Comparación Detallada</h3>

              <div className="overflow-x-auto">
                <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left font-medium text-gray-900">Característica</th>
                      <th className="px-6 py-3 text-center font-medium text-green-700">Nuevo Sistema</th>
                      <th className="px-6 py-3 text-center font-medium text-blue-700">Sistema Original</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 font-medium">Arquitectura</td>
                      <td className="px-6 py-4 text-center text-green-600">Atómica (Scalable)</td>
                      <td className="px-6 py-4 text-center text-blue-600">Monolítica</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 font-medium">Reutilización</td>
                      <td className="px-6 py-4 text-center text-green-600">Alta ✅</td>
                      <td className="px-6 py-4 text-center text-blue-600">Media</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 font-medium">TypeScript</td>
                      <td className="px-6 py-4 text-center text-green-600">100% Tipado ✅</td>
                      <td className="px-6 py-4 text-center text-blue-600">Parcial</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 font-medium">Hooks Especializados</td>
                      <td className="px-6 py-4 text-center text-green-600">5 Hooks ✅</td>
                      <td className="px-6 py-4 text-center text-blue-600">Básicos</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 font-medium">Exportación</td>
                      <td className="px-6 py-4 text-center text-green-600">JSON/CSV/XLSX ✅</td>
                      <td className="px-6 py-4 text-center text-blue-600">JSON/CSV</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 font-medium">Mantenibilidad</td>
                      <td className="px-6 py-4 text-center text-green-600">Muy Alta ✅</td>
                      <td className="px-6 py-4 text-center text-blue-600">Media</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 font-medium">Curva de Aprendizaje</td>
                      <td className="px-6 py-4 text-center text-yellow-600">Media</td>
                      <td className="px-6 py-4 text-center text-green-600">Baja ✅</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 font-medium">Performance</td>
                      <td className="px-6 py-4 text-center text-green-600">Optimizada ✅</td>
                      <td className="px-6 py-4 text-center text-blue-600">Buena</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Test Data Info */}
            <div className="mt-8 p-6 bg-gray-100 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-3">🧪 Datos de Prueba Disponibles</h4>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div className="bg-white p-4 rounded border">
                  <div className="font-medium text-gray-700">API Pokémon</div>
                  <div className="text-gray-600 mt-1">~{pokemonCount} Pokémon disponibles</div>
                  <div className="text-gray-500 text-xs mt-2">Datos complejos con arrays y objetos anidados</div>
                </div>
                <div className="bg-white p-4 rounded border">
                  <div className="font-medium text-gray-700">Campos Múltiples</div>
                  <div className="text-gray-600 mt-1">15+ campos por registro</div>
                  <div className="text-gray-500 text-xs mt-2">Types, abilities, stats, sprites</div>
                </div>
                <div className="bg-white p-4 rounded border">
                  <div className="font-medium text-gray-700">Tipos de Datos</div>
                  <div className="text-gray-600 mt-1">String, Number, Array, Object</div>
                  <div className="text-gray-500 text-xs mt-2">Perfecto para testing completo</div>
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <div className="mt-8 text-center">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">
                🚀 ¡Listo para probar!
              </h4>
              <div className="flex gap-4 justify-center">
                <Link
                  href="/test-pokemon-table"
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Probar Nuevo Sistema Atómico
                </Link>
                <Link
                  href="/table"
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Comparar con Sistema Original
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}