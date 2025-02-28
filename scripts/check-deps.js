#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Leer package.json para obtener las dependencias instaladas
const packageJson = JSON.parse(fs.readFileSync("./package.json", "utf8"));
const dependencies = {
  ...packageJson.dependencies,
  ...packageJson.devDependencies,
};

// Patrón para encontrar imports en archivos JS/TS
const importRegex =
  /import\s+?(?:(?:(?:[\w*\s{},]*)\s+from\s+?)|)(?:(?:"(.*?)")|(?:'(.*?)'))[\s]*?(?:;|$|)/g;

// Extensiones a buscar
const extensions = [".js", ".jsx", ".ts", ".tsx"];

// Función para encontrar todos los archivos con ciertas extensiones
function findFiles(dir, extensions, filesArray = []) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (
      stat.isDirectory() &&
      file !== "node_modules" &&
      file !== ".git" &&
      file !== ".next"
    ) {
      findFiles(filePath, extensions, filesArray);
    } else if (extensions.includes(path.extname(file))) {
      filesArray.push(filePath);
    }
  });

  return filesArray;
}

// Función principal
function checkDependencies() {
  console.log("🔍 Buscando importaciones no declaradas en package.json...");

  const files = findFiles(".", extensions);
  const importedPackages = new Set();
  const missingPackages = new Set();

  // Buscar imports en cada archivo
  files.forEach((file) => {
    const content = fs.readFileSync(file, "utf8");
    let match;

    while ((match = importRegex.exec(content)) !== null) {
      const importPath = match[1] || match[2];

      // Solo nos interesan los paquetes de npm (no rutas locales ni imports con @/)
      if (
        importPath &&
        !importPath.startsWith(".") &&
        !importPath.startsWith("/") &&
        !importPath.startsWith("@/")
      ) {
        // Extraer nombre del paquete (primer segmento)
        const packageName = importPath.startsWith("@")
          ? importPath.split("/").slice(0, 2).join("/")
          : importPath.split("/")[0];

        importedPackages.add(packageName);

        // Verificar si está en package.json
        if (!dependencies[packageName]) {
          missingPackages.add(packageName);
        }
      }
    }
  });

  // Mostrar resultados
  if (missingPackages.size > 0) {
    console.log(
      "\n❌ Se encontraron paquetes importados pero no declarados en package.json:"
    );
    missingPackages.forEach((pkg) => console.log(`  - ${pkg}`));
    console.log("\nComando para instalar todos los paquetes faltantes:");
    console.log(`npm install ${[...missingPackages].join(" ")}`);
    return false;
  } else {
    console.log(
      "✅ Todas las importaciones están correctamente declaradas en package.json"
    );
    return true;
  }
}

// Ejecutar función principal
const result = checkDependencies();
if (!result) {
  process.exit(1);
}
