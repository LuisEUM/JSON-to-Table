import type { ColumnDef } from "@tanstack/react-table";
import { TypeBadge } from "../components/type-badge";
import { ArrayCell } from "../components/array-cell";
import {
  groupColumns,
  type ProcessedItem,
  type GroupedColumns,
  type ProcessedRow,
} from "../data-processor";

const createColumnDef = (item: ProcessedItem): ColumnDef<ProcessedRow> => ({
  id: item.id,
  accessorFn: (row) => row[item.id],
  header: () => (
    <div className='flex flex-col gap-1'>
      <span>{item.path[item.path.length - 1]}</span>
      <TypeBadge type={item.type} />
    </div>
  ),
  cell: ({ row }) => {
    const value = row.getValue(item.id) as ProcessedItem;
    if (value?.type === "array") {
      return <ArrayCell items={value.items || []} />;
    }
    return <span className='font-mono'>{String(value?.value)}</span>;
  },
});

/**
 * Recorre un grupo y genera un único ColumnDef
 * con subcolumnas para sus items y para sus hijos (subgrupos).
 */
const processGroup = (group: GroupedColumns): ColumnDef<ProcessedRow>[] => {
  // 1) Creamos las columnas de los items (propiedades directas)
  const itemColumns = group.items?.map(createColumnDef) || [];

  // 2) Procesamos hijos recursivamente
  const childColumns = (group.children || []).flatMap(processGroup);

  // 3) Unificamos ambos en un solo "ColumnDef" que representa este grupo
  const allColumns = [...itemColumns, ...childColumns];

  if (!allColumns.length) {
    return [];
  }

  return [
    {
      id: group.id,
      header: group.header,
      columns: allColumns,
      meta: { level: group.level },
    },
  ];
};

export const columns = (data: ProcessedItem[]): ColumnDef<ProcessedRow>[] => {
  const { rootItems, groups } = groupColumns(data);

  // 1) Columnas para los campos que no pertenecen a ningún objeto
  const rootColumns = rootItems.map(createColumnDef);

  // 2) Columnas agrupadas para cada objeto top-level
  const groupedColumns = groups.flatMap(processGroup);

  // 3) Combinamos ambas
  return [...rootColumns, ...groupedColumns];
};
