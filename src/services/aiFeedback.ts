import { API_CONFIG } from '../config/api';

function feedbackUrl() {
  return `${API_CONFIG.API_V1}/ai/feedback`;
}

type FeedbackType = 'property_click' | 'thumbs_up' | 'thumbs_down' | 'suggestion_acted' | 'abandon';

interface FeedbackPayload {
  feedback_type: FeedbackType;
  query?: string;
  property_uuid?: string;
  value?: 'up' | 'down';
  session_token?: string | null;
  [key: string]: unknown;
}

function wrapPayload(p: FeedbackPayload) {
  const { session_token, ...rest } = p;
  return {
    context: { client_ref: 'public', role: 'public_hunter' },
    payload: rest,
    ...(session_token ? { session_token } : {}),
  };
}

export function postPublicPropertyFeedback(payload: FeedbackPayload) {
  void fetch(feedbackUrl(), {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify(wrapPayload(payload)),
  }).catch(() => undefined);
}

/** Convenience: fire-and-forget for property card clicks. */
export function sendPropertyClickFeedback(params: {
  property_uuid: string;
  query: string;
  session_token?: string | null;
}) {
  postPublicPropertyFeedback({
    feedback_type: 'property_click',
    property_uuid: params.property_uuid,
    query: params.query,
    value: 'up',
    session_token: params.session_token,
  });
}

/** Convenience: thumbs up / down on an assistant message. */
export function sendThumbsFeedback(params: {
  value: 'up' | 'down';
  query: string;
  session_token?: string | null;
  reason?: string;
  message_id?: string;
}) {
  postPublicPropertyFeedback({
    feedback_type: params.value === 'up' ? 'thumbs_up' : 'thumbs_down',
    query: params.query,
    value: params.value,
    session_token: params.session_token,
    reason: params.reason,
    message_id: params.message_id,
  });
}

/** Legacy wrapper — keeps existing call-sites compiling without changes. */
export function postAIFeedback(
  path: 'click' | 'thumbs' | 'suggestion-acted',
  payload: Record<string, unknown>,
) {
  if (path === 'click') {
    postPublicPropertyFeedback({
      feedback_type: 'property_click',
      query: String(payload.query ?? ''),
      property_uuid: payload.property_uuid as string | undefined,
      value: 'up',
      session_token: payload.session_token as string | undefined,
    });
  } else if (path === 'thumbs') {
    postPublicPropertyFeedback({
      feedback_type: payload.value === 'up' ? 'thumbs_up' : 'thumbs_down',
      query: String(payload.query ?? ''),
      value: payload.value as 'up' | 'down',
      session_token: payload.session_token as string | undefined,
      reason: payload.reason as string | undefined,
      message_id: payload.message_id as string | undefined,
    });
  } else if (path === 'suggestion-acted') {
    postPublicPropertyFeedback({
      feedback_type: 'suggestion_acted',
      query: String(payload.suggestion ?? payload.last_query ?? ''),
      session_token: payload.session_token as string | undefined,
    });
  }
}

export function sendAIAbandonFeedback(payload: Record<string, unknown>) {
  if (typeof navigator === 'undefined') return;
  const body = JSON.stringify(
    wrapPayload({ feedback_type: 'abandon', ...payload, session_token: payload.session_token as string }),
  );
  navigator.sendBeacon(feedbackUrl(), new Blob([body], { type: 'application/json' }));
}
