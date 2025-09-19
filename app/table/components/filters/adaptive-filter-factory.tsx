"use client";

import { DataPatternAnalyzer, type FilterStrategy } from "./pattern-analyzer";
import type { FilterComponentProps } from "./filter-types";
import { StringFilter } from "./string-filter";
import { ObjectPropertyFilter } from "./object-property-filter";
import { useMemo } from "react";

interface AdaptiveFilterProps extends FilterComponentProps {
  forceFilterType?: 'string' | 'object-property' | 'auto';
}

export function AdaptiveFilter({
  forceFilterType = 'auto',
  ...props
}: AdaptiveFilterProps) {
  const strategy = useMemo(() => {
    if (forceFilterType !== 'auto') {
      return { type: forceFilterType as FilterStrategy['type'] };
    }
    return DataPatternAnalyzer.analyzeColumn(props.uniqueValues);
  }, [props.uniqueValues, forceFilterType]);

  // Log the detected strategy for debugging
  console.log(`🔍 Adaptive Filter Strategy for ${props.columnId}:`, {
    type: strategy.type,
    isHomogeneous: strategy.schema?.isHomogeneous,
    properties: strategy.schema ? Object.keys(strategy.schema.properties) : [],
    totalSamples: strategy.schema?.totalSamples
  });

  // Render the appropriate filter based on strategy
  switch (strategy.type) {
    case 'object-property':
      return <ObjectPropertyFilter {...props} />;
    
    case 'enum':
    case 'hierarchical':
    case 'generic':
    default:
      return <StringFilter {...props} />;
  }
}

// Utility to determine if a column should use adaptive filtering
export function shouldUseAdaptiveFilter(uniqueValues: FilterComponentProps['uniqueValues']): boolean {
  if (uniqueValues.length === 0) return false;
  
  // Check if we have any objects or arrays that could benefit from property filtering
  const hasObjects = uniqueValues.some(option => 
    typeof option.original === 'object' && 
    option.original !== null &&
    !Array.isArray(option.original)
  );

  const hasArraysOfObjects = uniqueValues.some(option => 
    Array.isArray(option.original) &&
    option.original.length > 0 &&
    typeof option.original[0] === 'object' &&
    option.original[0] !== null
  );

  return hasObjects || hasArraysOfObjects;
}

// Enhanced filter factory that can be used across the app
export class FilterFactory {
  static createFilter(
    props: FilterComponentProps,
    options?: {
      forceType?: 'string' | 'object-property' | 'auto';
      useAdaptive?: boolean;
    }
  ) {
    const { forceType = 'auto', useAdaptive = true } = options || {};
    
    if (!useAdaptive || forceType === 'string') {
      return <StringFilter {...props} />;
    }
    
    if (forceType === 'object-property') {
      return <ObjectPropertyFilter {...props} />;
    }
    
    // Auto-detect and use adaptive filtering
    if (shouldUseAdaptiveFilter(props.uniqueValues)) {
      return <AdaptiveFilter {...props} forceFilterType={forceType} />;
    }
    
    // Fallback to string filter
    return <StringFilter {...props} />;
  }

  static getFilterMetadata(uniqueValues: FilterComponentProps['uniqueValues']) {
    const strategy = DataPatternAnalyzer.analyzeColumn(uniqueValues);
    
    return {
      strategy: strategy.type,
      isHomogeneous: strategy.schema?.isHomogeneous || false,
      propertyCount: strategy.schema ? Object.keys(strategy.schema.properties).length : 0,
      sampleSize: strategy.schema?.totalSamples || uniqueValues.length,
      shouldUseAdaptive: shouldUseAdaptiveFilter(uniqueValues)
    };
  }
}