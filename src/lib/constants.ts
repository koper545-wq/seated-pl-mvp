// Constants extracted from mock-data.ts
// These are UI-level constants, not database data

export const eventTypes = [
  { value: "all", label: "Wszystkie typy" },
  { value: "SUPPER_CLUB", label: "Supper Club" },
  { value: "CHEFS_TABLE", label: "Chef's Table" },
  { value: "POPUP", label: "Pop-up" },
  { value: "COOKING_CLASS", label: "Warsztaty" },
  { value: "WINE_TASTING", label: "Degustacje" },
  { value: "ACTIVE_FOOD", label: "Active + Food" },
  { value: "FARM_EXPERIENCE", label: "Farm Experience" },
  { value: "RESTAURANT_COLLAB", label: "Kolaboracja restauracyjna" },
  { value: "OTHER", label: "Inne" },
];

export const neighborhoods = [
  { value: "all", label: "Cały Wrocław" },
  { value: "Stare Miasto", label: "Stare Miasto" },
  { value: "Nadodrze", label: "Nadodrze" },
  { value: "Śródmieście", label: "Śródmieście" },
  { value: "Krzyki", label: "Krzyki" },
  { value: "Fabryczna", label: "Fabryczna" },
  { value: "Psie Pole", label: "Psie Pole" },
];

export const sortOptions = [
  { value: "date-asc", label: "Data (najwcześniej)" },
  { value: "date-desc", label: "Data (najpóźniej)" },
  { value: "price-asc", label: "Cena (rosnąco)" },
  { value: "price-desc", label: "Cena (malejąco)" },
  { value: "spots", label: "Dostępne miejsca" },
];

export const dietaryOptions = [
  { value: "vegetarian", label: "Wegetariańska" },
  { value: "vegan", label: "Wegańska" },
  { value: "gluten-free", label: "Bez glutenu" },
  { value: "lactose-free", label: "Bez laktozy" },
  { value: "nut-allergy", label: "Alergia na orzechy" },
  { value: "shellfish-allergy", label: "Alergia na owoce morza" },
  { value: "halal", label: "Halal" },
  { value: "kosher", label: "Koszerne" },
  { value: "other", label: "Inne (opisz poniżej)" },
];

export const bookingStatusLabels: Record<string, { label: string; color: string }> = {
  PENDING: { label: "Oczekuje", color: "bg-yellow-100 text-yellow-700" },
  APPROVED: { label: "Potwierdzona", color: "bg-green-100 text-green-700" },
  DECLINED: { label: "Odrzucona", color: "bg-red-100 text-red-700" },
  CANCELLED: { label: "Anulowana", color: "bg-gray-100 text-gray-700" },
  COMPLETED: { label: "Zakończona", color: "bg-blue-100 text-blue-700" },
  NO_SHOW: { label: "Nieobecny", color: "bg-orange-100 text-orange-700" },
};

export const eventStatusLabels: Record<string, { label: string; color: string }> = {
  DRAFT: { label: "Szkic", color: "bg-gray-100 text-gray-700" },
  PENDING_REVIEW: { label: "Do akceptacji", color: "bg-yellow-100 text-yellow-700" },
  PUBLISHED: { label: "Opublikowany", color: "bg-green-100 text-green-700" },
  CANCELLED: { label: "Anulowany", color: "bg-red-100 text-red-700" },
  COMPLETED: { label: "Zakończony", color: "bg-blue-100 text-blue-700" },
};

export const eventLanguages = [
  { value: "pl", label: "Polski", flag: "🇵🇱" },
  { value: "en", label: "English", flag: "🇬🇧" },
  { value: "de", label: "Deutsch", flag: "🇩🇪" },
  { value: "uk", label: "Українська", flag: "🇺🇦" },
  { value: "fr", label: "Français", flag: "🇫🇷" },
  { value: "es", label: "Español", flag: "🇪🇸" },
  { value: "it", label: "Italiano", flag: "🇮🇹" },
];

export const PLATFORM_COMMISSION_RATE = 0.15; // 15%
