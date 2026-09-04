const PUBLIC_QUOTA_FIELDS = new Set(["rpm", "rps", "tpm", "tps", "concurrency"]);
const PUBLISHED_SCHEDULE_STATES = new Set(["published_clock_window", "published_rolling_window", "published_calendar_reset"]);

export function hasActivePublicQuota(provider) {
  if (provider?.publicEvidence?.quota === true) return true;
  if (Number.isFinite(provider?.capacity?.guaranteedTpm)) return true;
  return Object.entries(provider?.rateLimits || {}).some(([field, value]) => PUBLIC_QUOTA_FIELDS.has(field) && Number.isFinite(value));
}

export function hasActiveForecastSignal(provider, schedule) {
  return hasActivePublicQuota(provider)
    || provider?.state === "watch"
    || provider?.state === "disrupted"
    || (provider?.state !== "healthy" && PUBLISHED_SCHEDULE_STATES.has(schedule?.public_schedule_status));
}

export function defaultActiveProviderId(providers) {
  return providers.find(hasActivePublicQuota)?.id || null;
}
