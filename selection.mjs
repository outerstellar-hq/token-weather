const PUBLIC_QUOTA_FIELDS = new Set(["rpm", "rps", "tpm", "tps", "concurrency"]);

export function hasActivePublicQuota(provider) {
  if (provider?.publicEvidence?.quota === true) return true;
  if (Number.isFinite(provider?.capacity?.guaranteedTpm)) return true;
  return Object.entries(provider?.rateLimits || {}).some(([field, value]) => PUBLIC_QUOTA_FIELDS.has(field) && Number.isFinite(value));
}

export function defaultActiveProviderId(providers) {
  return providers.find(hasActivePublicQuota)?.id || null;
}
