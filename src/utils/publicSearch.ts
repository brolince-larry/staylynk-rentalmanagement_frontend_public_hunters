import type { SearchFilters } from '../types';

const AREA_KEYWORDS = [
  'westlands',
  'kilimani',
  'lavington',
  'upperhill',
  'runda',
  'karen',
  'roysambu',
  'kasarani',
  'ruaka',
  'thika road',
  'juja',
  'langata',
  'south b',
  'south c',
  'kileleshwa',
  'parklands',
  'ngong',
  'kitengela',
  'syokimau',
];

const TYPE_KEYWORDS: Array<[string, string]> = [
  ['bedsitter', 'bedsitter'],
  ['studio', 'studio'],
  ['apartment', 'apartment'],
  ['flat', 'apartment'],
  ['maisonette', 'maisonette'],
  ['bungalow', 'bungalow'],
  ['townhouse', 'townhouse'],
  ['villa', 'villa'],
  ['single room', 'single_room'],
  ['double room', 'double_room'],
  ['room', 'room'],
  ['house', 'house'],
];

export function parseNaturalLanguageSearch(input: string): SearchFilters {
  const text = input.toLowerCase();
  const filters: SearchFilters = {
    search: input.trim() || undefined,
    sort: 'smart',
  };

  const underMatch = text.match(/(?:under|below|less than|max|maximum)\s*(?:ksh|kes|k)?\s*([\d,.]+)\s*(k)?/i);
  const plainBudget = text.match(/([\d,.]+)\s*(k)\b/i);
  const budgetMatch = underMatch ?? plainBudget;
  if (budgetMatch) {
    const raw = Number(budgetMatch[1].replace(/[,.]/g, ''));
    const amount = budgetMatch[2] || raw < 1000 ? raw * 1000 : raw;
    if (Number.isFinite(amount)) {
      filters.budget_max = amount;
      filters.max_price = amount;
    }
  }

  const bedroomMatch = text.match(/(\d+)\s*(?:bed|bedroom|br)/i);
  if (bedroomMatch) filters.bedrooms = Number(bedroomMatch[1]);

  const area = AREA_KEYWORDS.find(item => text.includes(item));
  if (area) {
    filters.city = area.replace(/\b\w/g, letter => letter.toUpperCase());
    filters.location = filters.city;
  }

  const type = TYPE_KEYWORDS.find(([keyword]) => text.includes(keyword));
  if (type) filters.house_type = type[1];

  if (text.includes('family') || text.includes('school') || text.includes('children')) {
    filters.family_friendly = true;
  }
  if (text.includes('student') || text.includes('university') || text.includes('campus')) {
    filters.student_friendly = true;
  }
  if (text.includes('pet')) filters.pets_allowed = true;
  if (text.includes('parking')) filters.parking_available = true;
  if (text.includes('wifi') || text.includes('internet')) filters.internet_available = true;
  if (text.includes('safe') || text.includes('secure') || text.includes('security')) {
    filters.security_level = 'high';
    filters.verified_only = true;
  }

  return filters;
}

export function buildAssistantReply(input: string) {
  const text = input.toLowerCase();
  if (text.includes('cheap') || text.includes('affordable') || text.includes('under')) {
    return 'I tightened the budget and sorted for strong value. Look for verified listings with real-time vacancy before booking.';
  }
  if (text.includes('family') || text.includes('school') || text.includes('safe')) {
    return 'I prioritized family-friendly, safer neighborhoods and verified homes near daily essentials.';
  }
  if (text.includes('pet')) {
    return 'I filtered toward pet-friendly places. When you open a listing, confirm building rules before scheduling.';
  }
  if (text.includes('university') || text.includes('student')) {
    return 'I focused on student-friendly homes near campus routes, with internet and commute convenience in mind.';
  }
  return 'I translated that into smart filters. You can refine by area, price, amenities, or map radius from the results page.';
}
