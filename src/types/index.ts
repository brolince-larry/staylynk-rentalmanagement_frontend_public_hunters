// ─── Matches PublicListingResource exactly ───────────────────────────────────

export interface ListingPricing {
  min: number;
  max: number;
  currency: string;
  display: string;
}

export interface ListingLocation {
  city: string;
  county: string | null;
  neighbourhood: string | null;
  address: string | null;
  property_name: string | null;
  country: string;
  coordinates: { lat: number; lng: number } | null;
  google_maps_url: string | null;
}

export interface ListingFeatures {
  water: boolean;
  internet: boolean;
  parking: boolean;
  security_level: 'low' | 'standard' | 'high' | 'gated' | null;
  family_friendly: boolean;
  student_friendly: boolean;
  quiet: boolean;
  pets_allowed: boolean;
}

export interface ListingTrust {
  property_rating: number;
  landlord_rating: number;
  review_count: number;
  verification_status: 'unverified' | 'verified' | 'trusted';
  is_verified: boolean;
  is_trusted: boolean;
}

export interface ListingVisibility {
  is_featured: boolean;
  is_boosted: boolean;
  is_available: boolean;
  published_at: string | null;
  published_ago: string | null;
}

export type MediaType =
  | 'property_image'
  | 'room_image'
  | 'unit_image'
  | 'organization_logo'
  | 'profile_photo'
  | 'tenant_profile_photo'
  | 'worker_profile_photo'
  | 'admin_profile_photo'
  | 'public_listing_image'
  | 'property_video'
  | 'public_listing_video'
  | 'maintenance_evidence'
  | 'verification_document'
  | 'ownership_document'
  | 'lease_agreement'
  | 'payment_receipt'
  | 'private_document';

export type MediaEntityType =
  | 'property'
  | 'room'
  | 'unit'
  | 'organization'
  | 'user'
  | 'tenant'
  | 'worker'
  | 'admin'
  | 'maintenance'
  | 'verification'
  | 'lease'
  | 'payment';

export type MediaStatus = 'pending' | 'processing' | 'ready' | 'failed';

export interface OptimizedMediaUrls {
  thumbnail?: string | null;
  small?: string | null;
  medium?: string | null;
  large?: string | null;
  fullscreen?: string | null;
}

export interface MediaItem {
  uuid: string;
  media_type: MediaType;
  entity_type?: MediaEntityType;
  entity_id?: string | number;
  optimized_urls: OptimizedMediaUrls;
  blur_hash?: string | null;
  dominant_color?: string | null;
  alt_text?: string | null;
  status?: MediaStatus;
  sort_order?: number;
  is_cover?: boolean;
  is_public?: boolean;
}

export interface PublicListingVideo {
  id: string; // UUID
  video_url: string;
  thumbnail_url: string | null;
  duration: number;
  sort_order: number;
  is_featured: boolean;
  delivery?: {
    preload: 'none' | 'metadata' | 'auto';
    loading: 'lazy' | 'eager';
    plays_inline: boolean;
  };
}

export interface ListingMedia {
  cover: string | MediaItem | null;
  gallery: Array<string | MediaItem>;
  videos?: PublicListingVideo[];
}

export interface PublicVacantRoom {
  id: string;
  room_number: string;
  display_name: string;
  room_type: string;
  floor: string | null;
  block: string | null;
  pricing: {
    monthly_rent: number;
    security_deposit: number;
    currency: 'KES';
  };
  capacity: number;
  available_beds: number;
  pending_bookings_count?: number;
  amenities: string[];
  media: {
    cover: string | null;
    gallery: string[];
  };
}

export interface NearbyItem {
  type: string;
  name: string;
  distance_km: number;
}

export interface ListingContact {
  phone?: string | null;
  whatsapp?: string | null;
  email?: string | null;
}

export interface BookRoomRequest {
  room_uuid: string;
  name: string;
  email: string;
  phone: string;
  move_in_date: string;
  message?: string;
}

export interface BookRoomResponse {
  booking_reference: string;
}

export interface ListingUnits {
  available: number;
  total: number;
  rooms?: PublicVacantRoom[];
}

export interface Listing {
  id: string;       // UUID — never integer
  slug: string;
  title: string;
  description: string | null;
  house_types: string[];
  pricing: ListingPricing;
  units: ListingUnits;
  specs: {
    bedrooms:  { min: number; max: number };
    bathrooms: { min: number; max: number };
  };
  location:   ListingLocation;
  features:   ListingFeatures;
  amenities:  string[];
  nearby:     NearbyItem[] | Record<string, number>;
  contact?:   ListingContact;
  media:      ListingMedia;
  trust:      ListingTrust;
  visibility: ListingVisibility;
}

// ─── Map marker (/listings/map) ───────────────────────────────────────────────
export interface MapMarker {
  id: string;
  slug: string;
  title: string;
  lat: number;
  lng: number;
  price: { min: number; max: number };
  house_types: string[];
  bedrooms: number;
  cover_image: string | null;
  is_featured: boolean;
  is_verified: boolean;
  google_maps_url: string | null;
}

// ─── Category (from facets.categories) ───────────────────────────────────────
export interface Category {
  type: string;
  label: string;
  icon: string;
  count: number;
}

// ─── Facets (/listings/facets) ────────────────────────────────────────────────
export interface Facets {
  cities: Record<string, number>;
  house_types: Record<string, number>;
  categories: Category[];
  price_ranges: { min: number; max: number; avg: number };
  bedroom_counts: Record<string, number>;
  amenities: Record<string, number>;
  total: number;
}

// ─── Home (/listings/home) ────────────────────────────────────────────────────
export interface HomeData {
  hero: { headline: string; subheadline: string; default_city: string };
  stats: { total_listings: number; verified_listings: number; featured_listings: number };
  trust_badges: { label: string; description: string }[];
  categories: Category[];
  featured: Listing[];
  testimonials: { name: string; role: string; rating: number; quote: string }[];
  owner_cta: { title: string; benefits: string[] };
}

// ─── Filters — match backend field names + UI aliases ────────────────────────
export interface SearchFilters {
  // UI aliases (normalised server-side via normaliseUiAliases)
  location?:     string;
  property_type?: string;
  min_price?:    number;
  max_price?:    number;
  // Canonical backend fields
  city?:             string;
  search?:           string;
  house_type?:       string;
  budget_min?:       number;
  budget_max?:       number;
  bedrooms?:         number;
  bathrooms?:        number;
  amenities?:        string[];
  water_available?:  boolean;
  internet_available?: boolean;
  parking_available?: boolean;
  family_friendly?:  boolean;
  student_friendly?: boolean;
  quiet_environment?: boolean;
  pets_allowed?:     boolean;
  security_level?:   string;
  verified_only?:    boolean;
  latitude?:         number;
  longitude?:        number;
  radius_km?:        number;
  sort?:             'smart' | 'price_asc' | 'price_desc' | 'newest' | 'rating' | 'type_date';
  per_page?:         number;
  page?:             number;
}

// ─── API wrappers ─────────────────────────────────────────────────────────────
export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
    sort?: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// ─── Public AI assistant ─────────────────────────────────────────────────────
export interface AiChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AiSessionResponse {
  session_token: string;
  role: 'public_hunter' | 'tenant' | string;
  expires_at: string;
}

export interface AiChatRequest {
  message: string;
  session_token?: string;
  history?: AiChatMessage[];
}

export type AIChatRole = 'superadmin' | 'admin' | 'manager' | 'tenant' | 'public_hunter';
export type AIChatSource = 'rules' | 'ollama_conversation' | 'ollama_fallback' | 'cache';
export type AIConfidenceBand = 'high' | 'medium' | 'low';
export type AIModerationAction = 'redirect' | 'warning' | 'temporary_mute' | 'session_suspension';

export interface AIRuntimeMeta {
  blocked?: boolean;
  moderation?: {
    action?: AIModerationAction;
    severity?: number | string;
    violation_type?: string;
    mute_seconds?: number;
    muted_until?: string;
  };
  domain?: {
    allowed?: boolean;
    reason?: 'out_of_domain' | 'blocked_topic' | string;
  };
  confidence?: number;
  confidence_band?: AIConfidenceBand;
  map_url?: string | null;
  safety?: {
    model_circuit_open?: boolean;
    fallback_model_disabled?: boolean;
    [key: string]: unknown;
  };
}

export interface AIContextAction {
  label?: string;
  title?: string;
  type?: 'download' | 'pdf_download' | 'queued_task' | 'link' | 'button' | string;
  url?: string;
  href?: string;
  method?: string;
  task_id?: string;
  action?: string;
  disabled?: boolean;
}

export interface AIComparisonTable {
  title?: string;
  columns: string[];
  rows: Array<Record<string, unknown>>;
}

export interface AiChatResponseData {
  session_token?: string;
  role?: AIChatRole | string;
  reply?: string;
  answer?: string;
  message?: string;
  response?: string;
  thinking?: string | string[];
  filters?: SearchFilters;
  suggestions?: string[];
  context?: {
    intent?: AiSearchIntent;
    properties?: AiPropertyResult[];
    suggestions?: string[];
    map_url?: string | null;
    action?: {
      action?: string;
      confidence?: number;
      requires_model_fallback?: boolean;
      conversational?: boolean;
    };
    actions?: AIContextAction[];
    tables?: AIComparisonTable[];
    retrieval?: {
      tables?: AIComparisonTable[];
    };
    metrics?: Record<string, number>;
    records?: Record<string, unknown[]>;
    capabilities?: string[];
    conversation_model_used?: boolean;
    fallback_model_used?: boolean;
  };
  meta?: {
    action?: string;
    intent_confidence?: number;
    lightweight?: boolean;
    source?: AIChatSource;
    presentation?: {
      typing: boolean;
      typing_mode: 'word';
      typing_speed_ms: number;
      thinking_orb: boolean;
    };
    actions?: AIContextAction[];
  } & AIRuntimeMeta;
}

export type AiChatResponse = AiChatResponseData;

export type AIChatResponse = {
  success: boolean;
  data: {
    session_token: string;
    role: AIChatRole;
    message: string;
    context: {
      intent?: AiSearchIntent;
      properties?: AiPropertyResult[];
      suggestions?: string[];
      map_url?: string | null;
      confidence_score?: number;
      action?: {
        action: string;
        confidence: number;
        requires_model_fallback: boolean;
        conversational?: boolean;
      };
      actions?: AIContextAction[];
      tables?: AIComparisonTable[];
      retrieval?: {
        tables?: AIComparisonTable[];
      };
      metrics?: Record<string, number>;
      records?: Record<string, unknown[]>;
      capabilities?: string[];
      conversation_model_used?: boolean;
      fallback_model_used?: boolean;
    };
    meta: {
      action: string;
      intent_confidence: number;
      lightweight: boolean;
      source?: AIChatSource;
      presentation?: {
        typing: boolean;
        typing_mode: 'word';
        typing_speed_ms: number;
        thinking_orb: boolean;
      };
      actions?: AIContextAction[];
    } & AIRuntimeMeta;
  };
};

export interface AiPropertyResult {
  uuid: string;
  slug: string;
  title: string;
  description?: string | null;
  rent_min?: number | null;
  rent_max?: number | null;
  currency?: string;
  city?: string | null;
  neighbourhood?: string | null;
  county?: string | null;
  house_types?: string[];
  bedrooms_min?: number | null;
  bedrooms_max?: number | null;
  amenities?: string[];
  parking_available?: boolean;
  internet_available?: boolean;
  is_family_friendly?: boolean;
  is_student_friendly?: boolean;
  cover_image?: string | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
  map_url?: string | null;
  similarity_score?: number;
  tour_videos?: Array<{ url: string; thumbnail_url?: string | null }>;
  whatsapp_number?: string | null;
  available_units?: number | null;
}

export interface AiSearchIntent {
  type?: string;
  budget_min?: number | null;
  budget_max?: number | null;
  locations?: string[];
  counties?: string[];
  property_types?: string[];
  amenities?: string[];
  nearby?: string[];
  environment?: string[];
  price_sensitivity?: string | null;
  style?: string | null;
  map_query?: string | null;
  bedrooms?: number | null;
  audience?: string | null;
  sort?: string;
}

export interface AiSearchRequest {
  query: string;
  session_token: string;
}

export interface AiSearchResponse {
  session_token?: string;
  intent?: AiSearchIntent;
  properties?: AiPropertyResult[];
  suggestions?: string[];
  confidence_score?: number;
  confidence?: number;
  cache_hit?: boolean;
  message?: string;
  context?: {
    intent?: AiSearchIntent;
    properties?: AiPropertyResult[];
    suggestions?: string[];
    map_url?: string | null;
    actions?: AIContextAction[];
    tables?: AIComparisonTable[];
  };
  meta?: AIRuntimeMeta;
}

export interface AiRecommendationsRequest {
  query: string;
  session_token: string;
}

export interface AiRecommendationsResponse {
  session_token?: string;
  intent?: AiSearchIntent;
  recommendations?: AiPropertyResult[];
  confidence_score?: number;
  message?: string;
  context?: {
    intent?: AiSearchIntent;
    properties?: AiPropertyResult[];
    suggestions?: string[];
    map_url?: string | null;
    actions?: AIContextAction[];
    tables?: AIComparisonTable[];
  };
  meta?: AIRuntimeMeta;
}

export interface AiHistoryMessage {
  id: number;
  role: string;
  message_type: 'user' | 'assistant' | string;
  message: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface AiHistoryResponse {
  session_token: string;
  role: string;
  messages: AiHistoryMessage[];
}

// ─── AI media gallery ─────────────────────────────────────────────────────────

export interface AIMediaItem {
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
  alt?: string;
  property: string;
  cover?: boolean;
  featured?: boolean;
  duration?: string;
}

export interface AIActionIntent {
  type: 'view_media_gallery' | string;
  label: string;
  payload?: {
    property_name?: string;
    image_count?: number;
    video_count?: number;
    items?: AIMediaItem[];
    [key: string]: unknown;
  };
}

// ─── Public hunter: 3-step flow types ────────────────────────────────────────

/**
 * Parsed intent returned by /v1/chat.  `missing` tells the frontend which
 * fields (location | budget | house_type) the user still hasn't provided.
 */
export interface FuzzyIntent {
  action: string;
  original: string;
  normalized: string;
  location?: string | null;
  budget_min?: number | null;
  budget_max?: number | null;
  house_type?: string | null;
  amenities: string[];
  missing: string[];
  confidence: number;
}

export interface PublicChatData {
  session_token: string;
  role: string;
  message: string;
  confidence_score: number;
  session_expired?: boolean;
  context: {
    action: string;
    fuzzy_intent: FuzzyIntent;
    learning_used?: boolean;
  };
  suggestions?: string[];
  media?: AIMediaItem[];
  action_intent?: AIActionIntent;
  meta: { source: string } & AIRuntimeMeta;
  response_type?: string | null;
  cards?: Record<string, unknown> | null;
  map_data?: {
    lat?: number | null;
    lng?: number | null;
    zoom?: number;
    title?: string;
    address?: string;
    search_url?: string;
    directions_url?: string;
  } | null;
}

export interface PublicChatResponse {
  success: boolean;
  data: PublicChatData;
}

/** Shape passed to the AI /v1/search re-ranker. */
export interface RankableProperty {
  uuid: string;
  name: string;
  city: string;
  neighbourhood?: string;
  house_type?: string;
  monthly_rent: number;
  amenities?: string;
  score?: number;
}

export interface RankedProperty {
  uuid: string;
  name?: string;
  monthly_rent?: number;
  ai_rank_score: number;
  learning_applied?: boolean;
}

export interface PublicSearchData {
  intent: {
    type: string;
    query: string;
    fuzzy: {
      location?: string;
      house_type?: string;
      budget_max?: number;
      amenities: string[];
      confidence: number;
    };
  };
  properties: RankedProperty[];
  suggestions: string[];
  confidence_score: number;
  clarification_required: boolean;
  learning_applied: boolean;
  zero_results: boolean;
}

export interface PublicSearchResponse {
  success: boolean;
  data: PublicSearchData;
}

// ─── Compare bucket ───────────────────────────────────────────────────────────
export interface CompareBucketItem {
  bucket_id: string;
  listing: Listing;
  expires_at: string;
}

export interface CompareBucket {
  bucket_token?: string;
  count: number;
  max_items: number;
  expires_in_days: number;
  items: CompareBucketItem[];
}

// ─── Inquiry form ─────────────────────────────────────────────────────────────
export interface InquiryForm {
  name: string;
  email: string;
  phone?: string;
  message?: string;
  move_in_date?: string;
  budget?: number;
}

// ─── WebSocket events ─────────────────────────────────────────────────────────
export interface VacancyUpdatedEvent {
  id: string;  // UUID
  available_units: number;
  is_available: boolean;
  updated_at: string;
}
