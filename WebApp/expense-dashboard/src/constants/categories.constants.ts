export const CategoryType = {
  Regalo: "Regalo",
  Proyectos: "Proyectos",
  TapeoCerveza: "Tapeo/Cerveza",
  Social: "Social",
  Ropa: "Ropa",
  Pelado: "Pelado",
  Subscripciones: "Subscripciones",
  Imprevisto: "Imprevisto",
  Comida: "Comida",
  Viajes: "Viajes",
  Capricho: "Capricho",
  Gasolina: "Gasolina",
  Ingreso: "Ingreso",
  Transporte: "Transporte",
  Otros: "Otros",
} as const;

export type CategoryType = (typeof CategoryType)[keyof typeof CategoryType];
