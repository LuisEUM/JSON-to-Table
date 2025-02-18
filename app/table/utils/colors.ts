export const getTypeColor = (type: string): string => {
  const colors: { [key: string]: { bg: string; text: string } } = {
    string: { bg: "bg-green-100", text: "text-green-800" },
    "número entero": { bg: "bg-blue-100", text: "text-blue-800" },
    "número decimal": { bg: "bg-blue-50", text: "text-blue-600" },
    boolean: { bg: "bg-purple-100", text: "text-purple-800" },
    fecha: { bg: "bg-pink-100", text: "text-pink-800" },
    null: { bg: "bg-red-100", text: "text-red-800" },
    undefined: { bg: "bg-gray-100", text: "text-gray-800" },
    objeto: { bg: "bg-yellow-100", text: "text-yellow-800" },
    array: { bg: "bg-orange-100", text: "text-orange-800" },
  }
  return `${colors[type]?.bg || "bg-gray-100"} ${colors[type]?.text || "text-gray-800"}`
}

