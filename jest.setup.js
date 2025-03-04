// Importar las utilidades de testing para DOM
import "@testing-library/jest-dom";

// Mock para ResizeObserver que no está disponible en jsdom
global.ResizeObserver = class ResizeObserver {
  constructor(callback) {
    this.callback = callback;
  }
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Suprimir mensajes de consola durante las pruebas
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;
const originalConsoleLog = console.log;

console.error = (...args) => {
  if (
    /Warning.*not wrapped in act/i.test(args[0]) ||
    /Warning: ReactDOM.render is no longer supported/i.test(args[0])
  ) {
    return;
  }
  originalConsoleError(...args);
};

console.warn = (...args) => {
  if (/Warning: ReactDOM.render is no longer supported/i.test(args[0])) {
    return;
  }
  originalConsoleWarn(...args);
};

console.log = (...args) => {
  // Permitir logs críticos pero suprimir logs de desarrollo
  if (process.env.NODE_ENV === "test" && !process.env.DEBUG) {
    return;
  }
  originalConsoleLog(...args);
};
