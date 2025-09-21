"use client";

import React, { useState, useEffect } from 'react';
import { JsonTable } from '@/lib/table-system';
import { useDataProcessing, useTableState, useTableExport } from '@/lib/table-system';

interface PokemonData extends Record<string, unknown> {
  name: string;
  id: number;
  height: number;
  weight: number;
  types: string[];
  abilities: string[];
  stats: Record<string, number>;
  sprites: {
    front_default: string;
  };
}

export default function TestPokemonTablePage() {
  const [pokemonData, setPokemonData] = useState<PokemonData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Usar nuestros hooks del sistema de tabla
  const {
    isProcessing,
    processedData,
    error: processingError,
    stats,
  } = useDataProcessing({
    rawData: pokemonData,
    onProcessingStart: () => console.log('🔄 Starting data processing...'),
    onProcessingEnd: (data, grouped) => console.log('✅ Data processed:', { data, grouped }),
    onError: (err) => console.error('❌ Processing error:', err),
  });

  const { state: tableState, setSorting, setColumnFilters, setGlobalFilter } = useTableState({
    initialState: {
      pagination: { pageIndex: 0, pageSize: 20 }
    }
  });

  const { exportAsJSON, exportAsCSV, isExporting } = useTableExport({
    data: pokemonData,
    onExportStart: () => console.log('📤 Starting export...'),
    onExportEnd: () => console.log('✅ Export completed!'),
    onExportError: (err) => console.error('❌ Export error:', err),
  });

  // Función para obtener datos de Pokémon
  const fetchPokemonData = async (limit: number = 20) => {
    setLoading(true);
    setError(null);

    try {
      console.log(`🔍 Fetching ${limit} Pokemon from API...`);

      const response = await fetch(`/api/pokemon?limit=${limit}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.statusText}`);
      }

      const data = await response.json();

      console.log('📦 Pokemon data received:', data);

      // Transformar los datos para que sean más fáciles de procesar
      const transformedData = data.map((pokemon: any) => ({
        name: pokemon.name,
        id: pokemon.id,
        height: pokemon.height,
        weight: pokemon.weight,
        types: pokemon.types || [],
        abilities: pokemon.abilities || [],
        stats: pokemon.stats || {},
        sprites: pokemon.sprites || { front_default: '' },
        // Añadir campos planos para mejor visualización
        type_primary: pokemon.types?.[0] || 'unknown',
        type_secondary: pokemon.types?.[1] || '',
        ability_primary: pokemon.abilities?.[0] || 'unknown',
        hp: pokemon.stats?.hp || 0,
        attack: pokemon.stats?.attack || 0,
        defense: pokemon.stats?.defense || 0,
        speed: pokemon.stats?.speed || 0,
        image_url: pokemon.sprites?.front_default || '',
      }));

      setPokemonData(transformedData);
      console.log('✅ Pokemon data transformed and set:', transformedData);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('❌ Error fetching Pokemon:', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos iniciales
  useEffect(() => {
    fetchPokemonData(10); // Empezar con 10 Pokemon
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-white shadow rounded-lg">
          {/* Header */}
          <div className="border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  🧪 Test: Pokémon Table with Atomic System
                </h1>
                <p className="text-gray-600 mt-1">
                  Verificando el nuevo sistema de tabla con datos reales de la API de Pokémon
                </p>
              </div>

              {/* Stats */}
              <div className="text-right">
                <div className="text-sm text-gray-500">
                  {stats.hasData ? (
                    <>
                      <div>Total Items: {stats.totalItems}</div>
                      <div>Root Items: {stats.rootItems}</div>
                      <div>Groups: {stats.groups}</div>
                    </>
                  ) : (
                    <div>No data loaded</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="border-b border-gray-200 px-6 py-4">
            <div className="flex flex-wrap items-center gap-4">
              {/* Load buttons */}
              <button
                onClick={() => fetchPokemonData(5)}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                Load 5 Pokémon
              </button>

              <button
                onClick={() => fetchPokemonData(20)}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                Load 20 Pokémon
              </button>

              <button
                onClick={() => fetchPokemonData(50)}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                Load 50 Pokémon
              </button>

              {/* Export buttons */}
              <div className="ml-auto flex gap-2">
                <button
                  onClick={() => exportAsJSON('pokemon-data')}
                  disabled={isExporting || !pokemonData.length}
                  className="px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50"
                >
                  Export JSON
                </button>

                <button
                  onClick={() => exportAsCSV('pokemon-data')}
                  disabled={isExporting || !pokemonData.length}
                  className="px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50"
                >
                  Export CSV
                </button>
              </div>
            </div>
          </div>

          {/* Status indicators */}
          <div className="px-6 py-4">
            <div className="flex gap-4 text-sm">
              <div className={`flex items-center gap-2 ${loading ? 'text-blue-600' : 'text-gray-500'}`}>
                <div className={`w-2 h-2 rounded-full ${loading ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                API Loading: {loading ? 'Active' : 'Idle'}
              </div>

              <div className={`flex items-center gap-2 ${isProcessing ? 'text-yellow-600' : 'text-gray-500'}`}>
                <div className={`w-2 h-2 rounded-full ${isProcessing ? 'bg-yellow-500' : 'bg-gray-300'}`}></div>
                Data Processing: {isProcessing ? 'Active' : 'Idle'}
              </div>

              <div className={`flex items-center gap-2 ${isExporting ? 'text-green-600' : 'text-gray-500'}`}>
                <div className={`w-2 h-2 rounded-full ${isExporting ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                Export: {isExporting ? 'Active' : 'Idle'}
              </div>
            </div>
          </div>

          {/* Error handling */}
          {(error || processingError) && (
            <div className="mx-6 mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-800">
                <span className="text-red-500">❌</span>
                <span className="font-medium">Error:</span>
              </div>
              <p className="text-red-700 mt-1">
                {error || processingError?.message}
              </p>
            </div>
          )}

          {/* Table */}
          <div className="px-6 pb-6">
            {pokemonData.length > 0 ? (
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <JsonTable
                  data={pokemonData}
                  initialSorting={tableState.sorting}
                  onSortingChange={setSorting}
                  initialColumnFilters={tableState.columnFilters}
                  onColumnFiltersChange={setColumnFilters}
                  initialGlobalFilter={tableState.globalFilter}
                  onGlobalFilterChange={setGlobalFilter}
                  className="w-full"
                />
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <div className="text-4xl mb-4">🔍</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Pokémon data loaded
                </h3>
                <p className="text-gray-600 mb-4">
                  Click one of the "Load Pokémon" buttons above to start testing the table system
                </p>
              </div>
            )}
          </div>

          {/* Debug info */}
          {pokemonData.length > 0 && (
            <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
              <details className="cursor-pointer">
                <summary className="font-medium text-gray-700">🔍 Debug Information</summary>
                <div className="mt-4 space-y-2 text-sm">
                  <div><strong>Raw Data Count:</strong> {pokemonData.length}</div>
                  <div><strong>Processed Items:</strong> {stats.totalItems}</div>
                  <div><strong>Processing Status:</strong> {isProcessing ? 'Processing...' : 'Complete'}</div>
                  <div><strong>Table State:</strong> {JSON.stringify(tableState, null, 2)}</div>
                </div>
              </details>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}