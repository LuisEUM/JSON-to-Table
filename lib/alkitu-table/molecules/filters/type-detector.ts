/**
 * Type Detector - Reutilizable logic from FilterFactory for detecting column types
 * This centralizes the type detection logic so it can be reused across filters
 */

import type { FilterOption } from "./filter-types";
import type { ProcessedItem } from "../../core";
import { logger } from "../../core/services/logging-service";

export type DetectedColumnType =
  | "realArray"
  | "stringWithSeparators"
  | "mixedContent"
  | "pureString"
  | "pureNumber"
  | "pureDate"
  | "pureBoolean";

export interface TypeDetectionResult {
  primaryType: DetectedColumnType;
  confidence: number;
  metadata: {
    arrayCount: number;
    stringCount: number;
    numberCount: number;
    dateCount: number;
    booleanCount: number;
    totalSamples: number;
    detectedSeparator?: string;
    hasComplexObjects?: boolean;
  };
}

export interface SeparatorDetectionResult {
  separator: string;
  confidence: number;
  occurrences: number;
}

/**
 * Enhanced type detector that follows FilterFactory logic
 */
export class ColumnTypeDetector {
  private static readonly SAMPLE_SIZE = 50; // Increased for better detection
  private static readonly SEPARATORS = [
    ",",
    ";",
    "|",
    " - ",
    " / ",
    "\t",
    "\n",
  ];

  /**
   * Main detection method - analyzes uniqueValues like FilterFactory does
   */
  static detectColumnType(uniqueValues: FilterOption[]): TypeDetectionResult {
    const samples = uniqueValues.slice(0, this.SAMPLE_SIZE);

    logger.debug("ColumnTypeDetector analyzing:", {
      totalValues: uniqueValues.length,
      sampleSize: samples.length,
    });

    // Initialize counters
    let arrayCount = 0;
    let stringCount = 0;
    let numberCount = 0;
    let dateCount = 0;
    let booleanCount = 0;
    let hasComplexObjects = false;

    // Analyze each sample (following FilterFactory pattern)
    samples.forEach((option) => {
      const processedItem = option.original as ProcessedItem;
      const value = processedItem?.value;

      if (Array.isArray(value)) {
        arrayCount++;

        // Check if array contains objects (like FilterFactory does)
        if (value.length > 0) {
          const hasObjects = value.some(
            (item) =>
              typeof item === "object" &&
              item !== null &&
              !Array.isArray(item) &&
              !(item instanceof Date)
          );
          if (hasObjects) {
            hasComplexObjects = true;
          }
        }
      } else if (typeof value === "string") {
        stringCount++;

        // Check if it looks like a date
        if (this.looksLikeDate(value)) {
          dateCount++;
        }
      } else if (typeof value === "number") {
        numberCount++;
      } else if (typeof value === "boolean") {
        booleanCount++;
      }
    });

    const totalSamples = samples.length;
    const metadata: TypeDetectionResult["metadata"] = {
      arrayCount,
      stringCount,
      numberCount,
      dateCount,
      booleanCount,
      totalSamples,
      hasComplexObjects,
    };

    // Determine primary type based on FilterFactory logic - Enhanced
    let primaryType: DetectedColumnType;
    let confidence: number;

    if (arrayCount > totalSamples * 0.5) {
      primaryType = "realArray";
      confidence = arrayCount / totalSamples;
    } else if (stringCount > 0) {
      // Check if strings contain separators
      const stringValues = samples
        .filter(
          (option) =>
            typeof (option.original as ProcessedItem)?.value === "string"
        )
        .map((option) => (option.original as ProcessedItem).value as string)
        .filter((s) => s && s.trim() !== ""); // Filter out empty strings

      const separatorResult = this.detectSeparators(stringValues);

      // More nuanced detection for mixed content
      const hasMultipleTypes =
        [arrayCount, numberCount, dateCount, booleanCount].filter(
          (count) => count > 0
        ).length > 1;
      const hasSignificantNonStringTypes =
        numberCount + dateCount + booleanCount > totalSamples * 0.15;

      // Check if we have diverse string content that suggests mixed use
      const nonEmptyStrings = stringValues.filter((s) => s.trim() !== "");
      const hasVariedStringContent =
        nonEmptyStrings.length > 0 &&
        (hasMultipleTypes ||
          hasSignificantNonStringTypes ||
          (dateCount > 0 && stringCount > dateCount)); // Mix of dates and other strings

      if (hasVariedStringContent) {
        primaryType = "mixedContent";
        confidence = 0.8; // High confidence for mixed content
        if (separatorResult.confidence > 0.1) {
          metadata.detectedSeparator = separatorResult.separator;
        }
      } else if (
        separatorResult.confidence > 0.25 &&
        separatorResult.occurrences > 1
      ) {
        // Only classify as stringWithSeparators if there's strong evidence
        primaryType = "stringWithSeparators";
        metadata.detectedSeparator = separatorResult.separator;
        confidence = stringCount / totalSamples;
      } else {
        primaryType = "pureString";
        confidence = stringCount / totalSamples;
      }
    } else if (numberCount > totalSamples * 0.7) {
      primaryType = "pureNumber";
      confidence = numberCount / totalSamples;
    } else if (dateCount > totalSamples * 0.7) {
      primaryType = "pureDate";
      confidence = dateCount / totalSamples;
    } else if (booleanCount > totalSamples * 0.7) {
      primaryType = "pureBoolean";
      confidence = booleanCount / totalSamples;
    } else {
      primaryType = "mixedContent";
      confidence = 0.6; // Medium confidence for truly mixed content
    }

    const result: TypeDetectionResult = {
      primaryType,
      confidence,
      metadata,
    };

    logger.debug("Type detection result:", result);
    return result;
  }

  /**
   * Detect separators in string values
   */
  static detectSeparators(stringValues: string[]): SeparatorDetectionResult {
    if (stringValues.length === 0) {
      return { separator: "none", confidence: 0, occurrences: 0 };
    }

    const separatorCounts = this.SEPARATORS.map((sep) => ({
      separator: sep,
      count: stringValues.filter((s) => s.includes(sep)).length,
      avgOccurrences:
        stringValues.reduce((acc, s) => {
          const matches = (
            s.match(
              new RegExp(sep.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")
            ) || []
          ).length;
          return acc + matches;
        }, 0) / stringValues.length,
    }));

    // Sort by count and average occurrences
    const bestSeparator = separatorCounts
      .filter((sc) => sc.count > 0)
      .sort((a, b) => {
        const scoreA = a.count * a.avgOccurrences;
        const scoreB = b.count * b.avgOccurrences;
        return scoreB - scoreA;
      })[0];

    if (!bestSeparator) {
      return { separator: "none", confidence: 0, occurrences: 0 };
    }

    const confidence = bestSeparator.count / stringValues.length;

    logger.debug("Separator detection:", {
      stringValues: stringValues.length,
      separatorCounts,
      selected: bestSeparator,
      confidence,
    });

    return {
      separator: bestSeparator.separator,
      confidence,
      occurrences: bestSeparator.count,
    };
  }

  /**
   * Check if a string looks like a date (following FilterFactory patterns)
   */
  private static looksLikeDate(value: string): boolean {
    if (!value || typeof value !== "string") return false;

    const datePatterns = [
      /^\d{1,2}[-\/\.]\d{1,2}[-\/\.]\d{4}$/, // DD/MM/YYYY, DD-MM-YYYY, DD.MM.YYYY
      /^\d{4}[-\/\.]\d{1,2}[-\/\.]\d{1,2}$/, // YYYY/MM/DD, YYYY-MM-DD, YYYY.MM.DD
      /^\d{1,2}\s+[A-Za-z]{3,}\s+\d{4}$/, // DD Month YYYY
    ];

    if (!datePatterns.some((pattern) => pattern.test(value.trim()))) {
      return false;
    }

    // Try to parse and validate
    try {
      const testDate = new Date(value);
      return (
        !isNaN(testDate.getTime()) &&
        testDate.getFullYear() >= 1900 &&
        testDate.getFullYear() <= 2100
      );
    } catch {
      return false;
    }
  }

  /**
   * Get recommended filter component based on detection result
   */
  static getRecommendedFilter(result: TypeDetectionResult): {
    primary: string;
    fallback?: string;
    useMultiFilter?: boolean;
  } {
    // For AtomicPrimitiveArrayFilter context, we always recommend using embedded components
    // The AtomicPrimitiveArrayFilter itself acts as a smart container

    switch (result.primaryType) {
      case "realArray":
        return {
          primary: "EmbeddedArrayFilter",
          useMultiFilter: result.metadata.hasComplexObjects,
        };

      case "stringWithSeparators":
        return {
          primary: "EmbeddedStringFilter",
          fallback: "AtomicPrimitiveArrayFilter",
        };

      case "mixedContent":
        return {
          primary: "AtomicPrimitiveArrayFilter",
          useMultiFilter: true,
        };

      case "pureString":
        // Even pure strings benefit from the enhanced AtomicPrimitiveArrayFilter
        // unless they're truly simple
        if (result.confidence > 0.95 && result.metadata.stringCount < 10) {
          return { primary: "EmbeddedStringFilter" };
        }
        return {
          primary: "AtomicPrimitiveArrayFilter",
          fallback: "EmbeddedStringFilter",
        };

      case "pureNumber":
        return { primary: "EmbeddedNumberFilter" };

      case "pureDate":
        return { primary: "EmbeddedDateFilter" };

      case "pureBoolean":
        return { primary: "EmbeddedStringFilter" };

      default:
        return {
          primary: "AtomicPrimitiveArrayFilter",
          useMultiFilter: true,
        };
    }
  }

  /**
   * Convert separator string to SeparatorType (for compatibility with existing filters)
   */
  static mapSeparatorToType(separator: string): string {
    const mapping: Record<string, string> = {
      ",": "comma",
      ";": "semicolon",
      "|": "pipe",
      " - ": "dash",
      " / ": "slash",
      "\t": "tab",
      "\n": "newline",
      none: "none",
    };
    return mapping[separator] || "none";
  }
}

/**
 * Utility functions for working with detection results
 */
export const TypeDetectionUtils = {
  /**
   * Check if a column should use the atomic primitive array filter
   */
  shouldUseAtomicFilter(result: TypeDetectionResult): boolean {
    return (
      result.primaryType === "mixedContent" ||
      (result.primaryType === "stringWithSeparators" && result.confidence < 0.9)
    );
  },

  /**
   * Get configuration for the atomic filter based on detection
   */
  getAtomicFilterConfig(result: TypeDetectionResult) {
    return {
      autoDetectedSeparator: result.metadata.detectedSeparator || "none",
      primaryType: result.primaryType,
      confidence: result.confidence,
      shouldShowArrayControls: result.metadata.arrayCount > 0,
      shouldShowStringControls: result.metadata.stringCount > 0,
      shouldShowNumberControls: result.metadata.numberCount > 0,
      shouldShowDateControls: result.metadata.dateCount > 0,
    };
  },
};
