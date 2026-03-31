import type { FilterOption } from "./filter-types";

export interface ObjectProperty {
  key: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  frequency: number;
  sampleValues: unknown[];
}

export interface ObjectSchema {
  properties: Record<string, ObjectProperty>;
  isHomogeneous: boolean;
  commonStructure: string[];
  totalSamples: number;
}

export type FilterStrategy = {
  type: 'object-property' | 'hierarchical' | 'enum' | 'generic';
  schema?: ObjectSchema;
  levels?: string[];
  values?: string[];
}

export class DataPatternAnalyzer {
  private static HOMOGENEITY_THRESHOLD = 0.8;
  private static MAX_SAMPLE_SIZE = 100;

  static analyzeColumn(values: FilterOption[]): FilterStrategy {
    const sample = values.slice(0, this.MAX_SAMPLE_SIZE);
    
    // First check if we have objects or arrays of objects
    const objectSamples = sample.filter(option => 
      typeof option.original === 'object' && 
      option.original !== null &&
      !Array.isArray(option.original)
    );

    const arrayObjectSamples = sample.filter(option => 
      Array.isArray(option.original) &&
      option.original.length > 0 &&
      typeof option.original[0] === 'object' &&
      option.original[0] !== null
    );

    // Analyze direct objects
    if (objectSamples.length > 0) {
      const schema = this.analyzeObjectStructure(objectSamples.map(s => s.original));
      if (schema.isHomogeneous) {
        return {
          type: 'object-property',
          schema
        };
      }
    }

    // Analyze arrays of objects
    if (arrayObjectSamples.length > 0) {
      const flatObjects = arrayObjectSamples.flatMap(sample => 
        Array.isArray(sample.original) ? sample.original : []
      );
      const schema = this.analyzeObjectStructure(flatObjects);
      if (schema.isHomogeneous) {
        return {
          type: 'object-property',
          schema
        };
      }
    }

    // Check if it's enum-like (limited set of values)
    if (this.isEnumLike(sample)) {
      return {
        type: 'enum',
        values: sample.map(s => String(s.value))
      };
    }

    // Fallback to generic
    return {
      type: 'generic'
    };
  }

  private static analyzeObjectStructure(objects: unknown[]): ObjectSchema {
    const propertyStats = new Map<string, ObjectProperty>();
    const structures = new Map<string, number>();
    
    objects.forEach(obj => {
      if (typeof obj !== 'object' || obj === null) return;
      
      const keys = Object.keys(obj);
      const structureKey = keys.sort().join(',');
      structures.set(structureKey, (structures.get(structureKey) || 0) + 1);
      
      keys.forEach(key => {
        const value = (obj as Record<string, unknown>)[key];
        const valueType = this.getValueType(value);
        
        if (!propertyStats.has(key)) {
          propertyStats.set(key, {
            key,
            type: valueType,
            frequency: 0,
            sampleValues: []
          });
        }
        
        const stat = propertyStats.get(key)!;
        stat.frequency++;
        
        // Keep only a few sample values
        if (stat.sampleValues.length < 5) {
          stat.sampleValues.push(value);
        }
      });
    });

    // Find the most common structure
    const mostCommonStructure = Array.from(structures.entries())
      .sort((a, b) => b[1] - a[1])[0];
    
    const totalSamples = objects.length;
    const isHomogeneous = mostCommonStructure 
      ? (mostCommonStructure[1] / totalSamples) >= this.HOMOGENEITY_THRESHOLD
      : false;

    return {
      properties: Object.fromEntries(propertyStats),
      isHomogeneous,
      commonStructure: mostCommonStructure ? mostCommonStructure[0].split(',') : [],
      totalSamples
    };
  }

  private static getValueType(value: unknown): ObjectProperty['type'] {
    if (value === null || value === undefined) return 'string';
    if (Array.isArray(value)) return 'array';
    if (typeof value === 'object') return 'object';
    if (typeof value === 'number') return 'number';
    if (typeof value === 'boolean') return 'boolean';
    return 'string';
  }

  private static isEnumLike(sample: FilterOption[]): boolean {
    const uniqueValues = new Set(sample.map(s => String(s.value)));
    return uniqueValues.size <= 20 && uniqueValues.size < sample.length * 0.5;
  }

  // Extract filterable properties from an object with enhanced array handling
  static extractFilterableProperties(obj: unknown): Array<{path: string, value: unknown, type: string}> {
    const properties: Array<{path: string, value: unknown, type: string}> = [];
    
    const extract = (current: unknown, path: string = '') => {
      if (typeof current === 'object' && current !== null && !Array.isArray(current)) {
        Object.entries(current).forEach(([key, value]) => {
          const currentPath = path ? `${path}.${key}` : key;
          
          if (Array.isArray(value)) {
            // For arrays, add the array itself as a property and extract from items
            properties.push({
              path: currentPath,
              value: value,
              type: 'array'
            });
            
            // Also extract properties from array items if they're objects
            const sampleItems = value.slice(0, 10); // Analyze first 10 items
            const arrayItemProperties = new Set<string>();
            
            sampleItems.forEach(item => {
              if (typeof item === 'object' && item !== null) {
                Object.keys(item).forEach(itemKey => {
                  arrayItemProperties.add(itemKey);
                });
              }
            });
            
            // Create virtual properties for common array item properties
            arrayItemProperties.forEach(itemKey => {
              const itemValues = sampleItems
                .filter(item => typeof item === 'object' && item !== null)
                .map(item => (item as Record<string, unknown>)[itemKey])
                .filter(val => val !== null && val !== undefined);
              
              if (itemValues.length > 0) {
                properties.push({
                  path: `${currentPath}.${itemKey}`,
                  value: itemValues,
                  type: 'array_property'
                });
              }
            });
            
          } else if (typeof value === 'object' && value !== null) {
            // Recurse into nested objects
            extract(value, currentPath);
          } else {
            // Add as filterable property
            properties.push({
              path: currentPath,
              value: value,
              type: this.getValueType(value)
            });
          }
        });
      } else if (Array.isArray(current)) {
        // For root arrays, extract properties from items
        const sampleItems = current.slice(0, 10);
        const commonProperties = new Set<string>();
        
        sampleItems.forEach(item => {
          if (typeof item === 'object' && item !== null) {
            Object.keys(item).forEach(key => {
              commonProperties.add(key);
            });
          }
        });
        
        commonProperties.forEach(propKey => {
          const values = sampleItems
            .filter(item => typeof item === 'object' && item !== null)
            .map(item => (item as Record<string, unknown>)[propKey])
            .filter(val => val !== null && val !== undefined);
          
          if (values.length > 0) {
            properties.push({
              path: propKey,
              value: values,
              type: 'array_property'
            });
          }
        });
      }
    };

    extract(obj);
    return properties;
  }
}