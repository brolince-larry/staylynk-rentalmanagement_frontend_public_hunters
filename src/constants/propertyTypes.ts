export const PROPERTY_TYPE_OPTIONS = [
  { label: 'All Types', value: '' },
  { label: 'Apartments', value: 'apartment' },
  { label: 'Bedsitters', value: 'bedsitter' },
  { label: 'Houses', value: 'house' },
  { label: 'Rooms', value: 'room' },
  { label: 'Single Rooms', value: 'single_room' },
  { label: 'Double Rooms', value: 'double_room' },
  { label: 'Short Let', value: 'short_let' },
  { label: 'Studios', value: 'studio' },
  { label: 'Maisonettes', value: 'maisonette' },
  { label: 'Bungalows', value: 'bungalow' },
  { label: 'Townhouses', value: 'townhouse' },
  { label: 'Villas', value: 'villa' },
] as const;

export const PROPERTY_CATEGORY_OPTIONS = PROPERTY_TYPE_OPTIONS.filter(option => option.value);
