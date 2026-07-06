let _cached: string | null = null;
let _promise: Promise<string> | null = null;

export function getDeviceFingerprint(): Promise<string> {
  if (_cached) return Promise.resolve(_cached);
  if (_promise) return _promise;

  _promise = (async () => {
    try {
      const raw = JSON.stringify({
        ua: navigator.userAgent,
        lang: navigator.language,
        screen: `${screen.width}x${screen.height}x${screen.colorDepth}`,
        tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
        platform: navigator.platform,
        cores: navigator.hardwareConcurrency,
      });
      const buf = await crypto.subtle.digest(
        'SHA-256',
        new TextEncoder().encode(raw),
      );
      _cached = Array.from(new Uint8Array(buf))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
    } catch {
      _cached = 'unknown';
    }
    return _cached!;
  })();

  return _promise;
}
