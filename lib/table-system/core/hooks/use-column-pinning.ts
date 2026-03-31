import React, { useCallback } from "react";
import type { Column } from "@tanstack/react-table";
import type { ProcessedRow } from "../utils/data-processor";
import { logger } from "../services/logging-service";

/**
 * Returns inline styles for a pinned (sticky) column in TanStack Table.
 */
export function getTanStackPinningStyles(
  column: Column<ProcessedRow>,
  isHeader = false
): React.CSSProperties {
  const isPinned = column.getIsPinned();

  return {
    position: isPinned ? "sticky" : "relative",
    left: isPinned === "left" ? column.getStart("left") : undefined,
    right: isPinned === "right" ? column.getStart("right") : undefined,
    top: isHeader ? 0 : undefined,
    zIndex: isPinned ? (isHeader ? 30 : 10) : 1,
    backgroundColor: "oklch(.985 0 0)",
  };
}

interface UseColumnPinningOptions {
  columnOrder: string[];
  originalColumnOrder: string[];
  useFixedColumn: boolean;
  fixedColumnId: string | null;
}

/**
 * Hook that manages column pinning order logic.
 *
 * Returns `getEffectiveColumnOrder` which computes the final column order
 * taking into account the pinned column (moved to the front) and the
 * "actions" column (always last).
 */
export function useColumnPinning(options: UseColumnPinningOptions) {
  const { columnOrder, originalColumnOrder, useFixedColumn, fixedColumnId } =
    options;

  const getEffectiveColumnOrder = useCallback(() => {
    const baseOrder =
      columnOrder.length > 0 ? columnOrder : originalColumnOrder;

    // Separar actions del resto (actions siempre va al final)
    const actionsIndex = baseOrder.indexOf("actions");
    const baseOrderWithoutActions = baseOrder.filter((id) => id !== "actions");
    const hasActions = actionsIndex !== -1;

    // Si no hay columna fija, usar el orden base (sin actions) + actions al final
    if (!useFixedColumn) {
      const result = hasActions
        ? [...baseOrderWithoutActions, "actions"]
        : baseOrderWithoutActions;
      logger.debug("No fixed column, using base order:", result);
      return result;
    }

    // Determinar qué columna está pintada
    const pinnedColumnId = fixedColumnId || "index";

    // Si la columna pintada no está en el orden base, agregarla al inicio
    if (!baseOrderWithoutActions.includes(pinnedColumnId)) {
      const result = hasActions
        ? [pinnedColumnId, ...baseOrderWithoutActions, "actions"]
        : [pinnedColumnId, ...baseOrderWithoutActions];
      logger.debug("Pinned column not in base order, adding:", {
        pinnedColumnId,
        baseOrder: baseOrderWithoutActions,
        result,
      });
      return result;
    }

    // Aplicar pinning: columna pintada al inicio, resto en su orden lógico, actions al final
    const otherColumns = baseOrderWithoutActions.filter(
      (id) => id !== pinnedColumnId
    );
    const result = hasActions
      ? [pinnedColumnId, ...otherColumns, "actions"]
      : [pinnedColumnId, ...otherColumns];

    logger.debug("Effective column order:", {
      baseOrder: baseOrderWithoutActions,
      pinnedColumnId,
      otherColumns,
      hasActions,
      result,
    });

    return result;
  }, [columnOrder, originalColumnOrder, useFixedColumn, fixedColumnId]);

  return { getEffectiveColumnOrder, getTanStackPinningStyles };
}

export type { UseColumnPinningOptions };
