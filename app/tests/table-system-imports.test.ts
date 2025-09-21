/**
 * Table System Import Tests
 *
 * This test file verifies that all main exports from the table-system library
 * can be imported correctly in a TypeScript/Next.js environment.
 */

describe('Table System Imports', () => {
  // Test 1: Check if files exist and can be required (basic import test)
  describe('File Existence and Basic Import Tests', () => {
    it('should be able to require main table-system index', () => {
      expect(() => {
        require('@/lib/table-system');
      }).not.toThrow();
    });

    it('should be able to require JsonTable component', () => {
      expect(() => {
        require('@/lib/table-system/organisms/tables/json-table');
      }).not.toThrow();
    });

    it('should be able to require CellFactory component', () => {
      expect(() => {
        require('@/lib/table-system/molecules/table-parts/cell-factory');
      }).not.toThrow();
    });

    it('should be able to require FilterFactory component', () => {
      expect(() => {
        require('@/lib/table-system/molecules/filters/filter-factory');
      }).not.toThrow();
    });

    it('should be able to require TypeDot component', () => {
      expect(() => {
        require('@/lib/table-system/atoms/indicators/TypeDot');
      }).not.toThrow();
    });
  });

  // Test 2: Main index exports structure
  describe('Main Index Export Structure', () => {
    let tableSystemModule: any;

    beforeAll(() => {
      tableSystemModule = require('@/lib/table-system');
    });

    it('should export JsonTable', () => {
      expect(tableSystemModule.JsonTable).toBeDefined();
      expect(typeof tableSystemModule.JsonTable).toBe('function');
    });

    it('should export CellFactory', () => {
      expect(tableSystemModule.CellFactory).toBeDefined();
      expect(typeof tableSystemModule.CellFactory).toBe('function');
    });

    it('should export FilterFactory', () => {
      expect(tableSystemModule.FilterFactory).toBeDefined();
      expect(typeof tableSystemModule.FilterFactory).toBe('function');
    });

    it('should export TypeDot', () => {
      expect(tableSystemModule.TypeDot).toBeDefined();
      expect(typeof tableSystemModule.TypeDot).toBe('function');
    });

    it('should export TableSystemJsonTable (legacy)', () => {
      expect(tableSystemModule.TableSystemJsonTable).toBeDefined();
      expect(typeof tableSystemModule.TableSystemJsonTable).toBe('function');
    });

    it('should have JsonTable and TableSystemJsonTable reference the same component', () => {
      expect(tableSystemModule.JsonTable).toBe(tableSystemModule.TableSystemJsonTable);
    });
  });

  // Test 3: Core hooks structure
  describe('Core Hooks Structure', () => {
    const hookFiles = [
      'use-table-state',
      'use-column-management',
      'use-filter-tabs',
      'use-data-processing',
      'use-table-export'
    ];

    hookFiles.forEach(hookFile => {
      it(`should be able to require ${hookFile}`, () => {
        expect(() => {
          require(`@/lib/table-system/core/hooks/${hookFile}`);
        }).not.toThrow();
      });
    });

    it('should be able to require core hooks index', () => {
      expect(() => {
        const hooksModule = require('@/lib/table-system/core/hooks');
        expect(hooksModule).toBeDefined();
        expect(typeof hooksModule).toBe('object');
      }).not.toThrow();
    });
  });

  // Test 4: Core utilities structure
  describe('Core Utilities Structure', () => {
    it('should be able to require core utils index', () => {
      expect(() => {
        const utilsModule = require('@/lib/table-system/core/utils');
        expect(utilsModule).toBeDefined();
        expect(typeof utilsModule).toBe('object');
      }).not.toThrow();
    });

    it('should export expected utility functions', () => {
      const utilsModule = require('@/lib/table-system/core/utils');

      const expectedFunctions = [
        'processValue',
        'processData',
        'groupColumns',
        'flattenObject',
        'isIdField',
        'inferColumnType',
        'analyzeColumnTypes'
      ];

      expectedFunctions.forEach(funcName => {
        expect(utilsModule[funcName]).toBeDefined();
        expect(typeof utilsModule[funcName]).toBe('function');
      });
    });

    it('should export TypeDetector and typeDetector', () => {
      const utilsModule = require('@/lib/table-system/core/utils');

      expect(utilsModule.TypeDetector).toBeDefined();
      expect(utilsModule.typeDetector).toBeDefined();
    });

    it('should export date utility functions', () => {
      const utilsModule = require('@/lib/table-system/core/utils');

      expect(utilsModule.isDateColumnName).toBeDefined();
      expect(utilsModule.isStrongDateColumn).toBeDefined();
      expect(utilsModule.cleanStringValue).toBeDefined();
      expect(utilsModule.formatDateString).toBeDefined();
      expect(utilsModule.toUTCDate).toBeDefined();
    });
  });

  // Test 5: Atomic design structure
  describe('Atomic Design Structure', () => {
    it('should be able to require atoms index', () => {
      expect(() => {
        require('@/lib/table-system/atoms');
      }).not.toThrow();
    });

    it('should be able to require molecules index', () => {
      expect(() => {
        require('@/lib/table-system/molecules');
      }).not.toThrow();
    });

    it('should be able to require organisms index', () => {
      expect(() => {
        require('@/lib/table-system/organisms');
      }).not.toThrow();
    });

    it('should be able to require core index', () => {
      expect(() => {
        require('@/lib/table-system/core');
      }).not.toThrow();
    });
  });

  // Test 6: Individual component imports
  describe('Individual Component Imports', () => {
    it('should export JsonTable from organisms/tables/json-table', () => {
      const module = require('@/lib/table-system/organisms/tables/json-table');
      expect(module.JsonTable).toBeDefined();
      expect(typeof module.JsonTable).toBe('function');
    });

    it('should export CellFactory from molecules/table-parts/cell-factory', () => {
      const module = require('@/lib/table-system/molecules/table-parts/cell-factory');
      expect(module.CellFactory).toBeDefined();
      expect(typeof module.CellFactory).toBe('function');
    });

    it('should export FilterFactory from molecules/filters/filter-factory', () => {
      const module = require('@/lib/table-system/molecules/filters/filter-factory');
      expect(module.FilterFactory).toBeDefined();
      expect(typeof module.FilterFactory).toBe('function');
    });

    it('should export TypeDot from atoms/indicators/TypeDot', () => {
      const module = require('@/lib/table-system/atoms/indicators/TypeDot');
      expect(module.TypeDot).toBeDefined();
      expect(typeof module.TypeDot).toBe('function');
    });
  });

  // Test 7: Consistency check
  describe('Export Consistency', () => {
    it('should have consistent exports between main index and individual components', () => {
      const mainModule = require('@/lib/table-system');
      const jsonTableModule = require('@/lib/table-system/organisms/tables/json-table');
      const cellFactoryModule = require('@/lib/table-system/molecules/table-parts/cell-factory');
      const filterFactoryModule = require('@/lib/table-system/molecules/filters/filter-factory');
      const typeDotModule = require('@/lib/table-system/atoms/indicators/TypeDot');

      // Check that the exports are the same
      expect(mainModule.JsonTable).toBe(jsonTableModule.JsonTable);
      expect(mainModule.CellFactory).toBe(cellFactoryModule.CellFactory);
      expect(mainModule.FilterFactory).toBe(filterFactoryModule.FilterFactory);
      expect(mainModule.TypeDot).toBe(typeDotModule.TypeDot);
    });
  });
});