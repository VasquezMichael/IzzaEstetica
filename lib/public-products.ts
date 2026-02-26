export type HomeCategory = "cream" | "oil" | "serum"

export type ShopCategory =
  | "serums"
  | "hidratantes"
  | "limpiadores"
  | "aceites"
  | "mascaras"
  | "tonicos"
  | "otros"

export type PublicProduct = {
  _id: string
  slug: string
  name: string
  description: string
  price: number
  originalPrice: number | null
  image: string
  badge: string | null
  category: string
  sizes: string[]
  details: string
  howToUse: string
  ingredients: string
  delivery: string
}

function includesSome(value: string, keywords: string[]) {
  return keywords.some((keyword) => value.includes(keyword))
}

export function toHomeCategory(rawCategory: string): HomeCategory {
  const category = rawCategory.toLowerCase()
  if (includesSome(category, ["serum", "sera", "suero"])) return "serum"
  if (includesSome(category, ["oil", "aceite"])) return "oil"
  return "cream"
}

export function toShopCategory(rawCategory: string): ShopCategory {
  const category = rawCategory.toLowerCase()

  if (includesSome(category, ["serum", "sera", "suero"])) return "serums"
  if (includesSome(category, ["moist", "hidrat", "cream", "crema"])) return "hidratantes"
  if (includesSome(category, ["clean", "limpi", "cleanser"])) return "limpiadores"
  if (includesSome(category, ["oil", "aceite"])) return "aceites"
  if (includesSome(category, ["mask", "masc"])) return "mascaras"
  if (includesSome(category, ["toner", "tonic", "tonico"])) return "tonicos"

  return "otros"
}
