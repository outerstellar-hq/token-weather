const origin = process.env.TOKEN_WEATHER_ORIGIN || "http://172.20.0.1:4173";
const response = await fetch(`${origin}/api/refresh`, { method: "POST" });
const payload = await response.json();
const events = Array.isArray(payload.events) ? payload.events : [];
const successful = events.filter((event) => event.status === "ok");
const errors = events.filter((event) => event.status === "error");

console.log(JSON.stringify({
  mode: payload.mode,
  generated_at: payload.generated_at,
  event_count: events.length,
  documentation: successful.filter((event) => event.event_type === "SOURCE_FETCH").length,
  statuses: successful.filter((event) => event.event_type === "PUBLIC_STATUS").length,
  statements: successful.filter((event) => event.event_type === "PUBLIC_ANNOUNCEMENTS").length,
  errors: errors.map((event) => ({ adapter_id: event.adapter_id, source_url: event.source_url, error: event.error }))
}));

if (!response.ok || errors.length) process.exitCode = 1;
