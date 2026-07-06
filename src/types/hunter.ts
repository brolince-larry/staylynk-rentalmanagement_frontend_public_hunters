export type HunterStage =
  | 'NEED_LOCATION'
  | 'TOWN_DISAMBIGUATION'
  | 'NEED_BUDGET'
  | 'NEED_TYPE'
  | 'TYPE_SELECTION'
  | 'SEARCHING'
  | 'RESULTS_SHOWN'
  | 'PROPERTY_LIST'
  | 'PROPERTY_DETAIL'
  | 'BOOKING_DATE'
  | 'BOOKING_CONTACT'
  | 'BOOKING_CONFIRM';

export type HunterActionType =
  | 'property_actions'
  | 'open_url'
  | 'date_input'
  | 'booking_confirm'
  | 'submit_booking'
  | 'town_options'
  | 'type_options'
  | 'property_list'
  | 'view_amenities_map'
  | 'view_listing_pricing'
  | 'view_safety_map'
  | 'explore_neighbourhood'
  | 'enquire_availability'
  | 'compare_listings'
  | 'view_listing_verification'
  | 'view_property_map'
  | 'view_directions'
  | 'view_street_view';

export interface HunterPropertyAction {
  type: 'book' | 'whatsapp' | 'maps' | 'back';
  label: string;
  slug?: string;
  url?: string;
  action?: string;
}

export interface HunterActionIntent {
  type: HunterActionType;
  label?: string;
  requires_confirmation?: boolean;
  confirm_message?: string;
  // new-style handlers: generic payload
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: Record<string, any>;
  // legacy specific fields kept for backwards compat
  actions?: HunterPropertyAction[];
  url?: string;
  min_date?: string;
  max_date?: string;
  booking_slug?: string;
  booking_date?: string;
  hunter_name?: string;
  hunter_email?: string;
  hunter_phone?: string;
  endpoint?: string;
  method?: string;
  success_message?: string;
}

export interface HunterListing {
  uuid?: string | null;
  slug: string;
  title: string;
  city: string;
  county: string | null;
  neighbourhood: string | null;
  rent_min: number;
  rent_max: number;
  currency: string;
  house_type: string;
  bedrooms_min: number;
  available_units: number;
  cover_image: string | null;
  water_available: boolean;
  internet_available: boolean;
  parking_available: boolean;
  security_level: string | null;
  property_rating: number | null;
  verification_status: string;
  latitude: number | null;
  longitude: number | null;
  maps_url: string | null;
  match_score: number;
  match_label: string;
  distance_km: number | null;
}

export interface HunterAvailableRoom {
  uuid: string;
  room_number: string;
  monthly_rent: number;
  status: string;
}

export interface HunterPropertyVideo {
  url: string;
  thumbnail: string | null;
  title: string | null;
}

export interface HunterProperty {
  slug: string;
  title: string;
  description: string;
  city: string;
  county: string | null;
  neighbourhood: string;
  address_display: string;
  rent_min: number;
  rent_max: number;
  currency: string;
  house_type: string;
  bedrooms_min: number;
  bedrooms_max: number;
  bathrooms_min: number;
  available_units: number;
  cover_image: string | null;
  gallery: string[];
  amenities: string[];
  nearby_places: Record<string, number>;
  water_available: boolean;
  internet_available: boolean;
  parking_available: boolean;
  security_level: string;
  is_family_friendly: boolean;
  is_student_friendly: boolean;
  pets_allowed: boolean;
  property_rating: number | null;
  landlord_rating: number | null;
  review_count: number;
  verification_status: string;
  latitude: number | null;
  longitude: number | null;
  maps_url: string | null;
  whatsapp_url: string | null;
  videos: HunterPropertyVideo[];
  available_rooms: HunterAvailableRoom[];
}

export interface HunterPagination {
  page: number;
  per_page: number;
  total: number;
  has_more: boolean;
}

export interface HunterSearchInfo {
  city: string;
  area: string | null;
  expanded: boolean;
  expanded_to: string | null;
}

export interface HunterChatData {
  session_token: string;
  stage?: HunterStage;
  message: string;
  suggestions?: string[] | null;
  action_intent?: HunterActionIntent | null;
  listings?: HunterMatchResult[] | null;
  property?: HunterProperty | null;
  pagination?: HunterPagination | null;
  search_info?: HunterSearchInfo | null;
  media?: import('./index').AIMediaItem[] | null;
  matches?: HunterMatchResult[] | null;
  visuals?: AIVisual[] | null;
  confidence?: number | null;
  response_type?: string | null;
  cards?: Record<string, unknown> | null;
}

export interface HunterSessionData {
  session_token: string;
  stage: HunterStage;
  preferences: Record<string, unknown>;
  greeting?: string;
  suggestions?: string[];
}

export interface HunterBookPayload {
  session_token: string;
  slug: string;
  move_in_date: string;
  name: string;
  email: string;
  phone: string;
  room_uuid?: string;
  message?: string;
}

export interface HunterBookResponse {
  reference: string;
  room: string;
  move_in_date: string;
  expires_at: string;
}

// ─── AI Matching ─────────────────────────────────────────────────────────────

export interface HunterMatchRoom {
  id: string;
  title: string;
  room_number?: string;
  status?: string;
  property_name?: string;
  slug?: string;
  monthly_rent: number;
  rent_max?: number;
  currency?: string;
  bedrooms?: number;
  area?: string;
  city?: string;
  cover_image?: string | null;
  amenities?: string[];
  available_from?: string | null;
  verification_status?: string;
  available_units?: number;
  house_type?: string;
  latitude?: number | null;
  longitude?: number | null;
  maps_url?: string | null;
}

export interface HunterMatchResult {
  room: HunterMatchRoom;
  score: number;
  match_label?: string;
  distance_km?: number | null;
}

// ─── Visuals (formerly "charts") ─────────────────────────────────────────────
export interface AIVisual {
  kind: 'donut' | 'bar' | 'line' | 'pie';
  title: string;
  labels: string[];
  values: number[];
  colors?: string[];
}

export interface HunterMatchData {
  matches: HunterMatchResult[];
  text: string;
  visuals: AIVisual[];
  confidence: number;
}

export interface HunterCompareData {
  rooms: HunterMatchRoom[];
  visuals: AIVisual[];
}

// ─── UI message shape ─────────────────────────────────────────────────────────
export interface HunterMapData {
  type: 'town' | 'property' | 'area';
  place: string;
  maps_url: string;
  embed_url?: string | null;
  label?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

export interface HunterMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  stage?: HunterStage;
  suggestions?: string[];
  actionIntent?: HunterActionIntent | null;
  listings?: HunterMatchResult[] | null;
  property?: HunterProperty | null;
  pagination?: HunterPagination | null;
  searchInfo?: HunterSearchInfo | null;
  media?: import('./index').AIMediaItem[] | null;
  matches?: HunterMatchResult[] | null;
  visuals?: AIVisual[] | null;
  confidenceScore?: number | null;
  isLoading?: boolean;
  fullyRevealed?: boolean;
  responseType?: string | null;
  cards?: Record<string, unknown> | null;
  mapData?: HunterMapData | null;
}
