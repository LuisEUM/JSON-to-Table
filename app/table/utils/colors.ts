export const getTypeColor = (type: string): string => {
  const colors: { [key: string]: string } = {
    string: "bg-green-200",
    "número entero": "bg-blue-200",
    "número decimal": "bg-blue-100",
    boolean: "bg-purple-200",
    fecha: "bg-pink-200",
    null: "bg-red-200",
    undefined: "bg-gray-200",
    objeto: "bg-yellow-100",
    array: "bg-orange-200",
  }
  return colors[type] || "bg-gray-200"
}

