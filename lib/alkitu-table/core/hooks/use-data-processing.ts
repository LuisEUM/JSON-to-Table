"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { processData, groupColumns, type ProcessedItem, type GroupedColumns } from "../utils/data-processor";

export interface GroupedData {
  rootItems: ProcessedItem[];
  groups: GroupedColumns[];
}

export interface UseDataProcessingProps {
  rawData: Record<string, unknown>[];
  onProcessingStart?: () => void;
  onProcessingEnd?: (processedData: ProcessedItem[], groupedData: GroupedData) => void;
  onError?: (error: Error) => void;
}

export interface ProcessingState {
  isProcessing: boolean;
  error: Error | null;
  processedData: ProcessedItem[];
  groupedData: GroupedData;
  rowCount: number;
}

export function useDataProcessing({
  rawData,
  onProcessingStart,
  onProcessingEnd,
  onError
}: UseDataProcessingProps) {
  const [state, setState] = useState<ProcessingState>({
    isProcessing: false,
    error: null,
    processedData: [],
    groupedData: { rootItems: [], groups: [] },
    rowCount: 0,
  });

  // Use refs to avoid recreating callbacks on every render
  const callbacksRef = useRef({
    onProcessingStart,
    onProcessingEnd,
    onError
  });

  // Update refs when callbacks change
  useEffect(() => {
    callbacksRef.current = {
      onProcessingStart,
      onProcessingEnd,
      onError
    };
  });

  const processDataAsync = useCallback(async (data: Record<string, unknown>[]) => {
    if (!data || data.length === 0) {
      setState({
        isProcessing: false,
        error: null,
        processedData: [],
        groupedData: { rootItems: [], groups: [] },
        rowCount: 0,
      });
      return;
    }

    setState(prev => ({ ...prev, isProcessing: true, error: null }));
    callbacksRef.current.onProcessingStart?.();

    try {
      // Use setTimeout to yield to the browser and show loading state
      await new Promise(resolve => setTimeout(resolve, 0));

      // Process each item in the array
      const allProcessedItems: ProcessedItem[] = [];
      for (const item of data) {
        const processedItems = processData(item);
        allProcessedItems.push(...processedItems);
      }

      // Group the processed data
      const groupedData = groupColumns(allProcessedItems);

      const newState = {
        isProcessing: false,
        error: null,
        processedData: allProcessedItems,
        groupedData,
        rowCount: allProcessedItems.length,
      };

      setState(newState);
      callbacksRef.current.onProcessingEnd?.(allProcessedItems, groupedData);
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      setState(prev => ({
        ...prev,
        isProcessing: false,
        error: errorObj,
      }));
      callbacksRef.current.onError?.(errorObj);
    }
  }, []);

  // Process data when rawData changes
  useEffect(() => {
    processDataAsync(rawData);
  }, [rawData, processDataAsync]);

  const reprocessData = useCallback(() => {
    processDataAsync(rawData);
  }, [rawData, processDataAsync]);

  const clearData = useCallback(() => {
    setState({
      isProcessing: false,
      error: null,
      processedData: [],
      groupedData: { rootItems: [], groups: [] },
      rowCount: 0,
    });
  }, []);

  // Memoized derived data
  const stats = useMemo(() => ({
    totalRows: state.rowCount,
    totalItems: state.processedData.length,
    rootItems: state.groupedData.rootItems.length,
    groups: state.groupedData.groups.length,
    hasData: state.rowCount > 0,
    isEmpty: state.rowCount === 0 && !state.isProcessing,
  }), [state]);

  return {
    ...state,
    stats,
    reprocessData,
    clearData,
  };
}