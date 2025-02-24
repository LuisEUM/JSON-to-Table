export const getTypeColor = (type: string): string => {
  const colors: { [key: string]: string } = {
    string: "bg-green-200",
    número: "bg-blue-200",
    boolean: "bg-purple-200",
    fecha: "bg-pink-200",
    null: "bg-red-200",
    undefined: "bg-gray-200",
    objeto: "bg-yellow-100",
    array: "bg-orange-200",
  };
  return colors[type] || "bg-gray-200";
};

export const getTypeLabel = (type: string): string => {
  const labels: { [key: string]: string } = {
    string: "Texto",
    número: "Número",
    boolean: "Booleano",
    fecha: "Fecha",
    array: "Lista",
    objeto: "Objeto",
    null: "Nulo",
    undefined: "Indefinido",
    referencia: "Referencia",
  };
  return labels[type] || type;
};
