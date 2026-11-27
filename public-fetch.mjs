// Fetching public sources without leaking connections.
//
// Node 24's fetch left the connection of a redirect response open with its unread body (seen on
// 2026-11-28: docs.modelstudio.console.alibabacloud.com answered a 307 with a 911 KB body). One
// connection per refresh piled up for 40 days, held about 640 MB of kernel TCP buffers and slowed
// every upload to the server. So redirects are followed here, and the body of every response that
// is not read to the end is cancelled, which closes its connection.

export const MAX_RESPONSE_BYTES = 8_000_000;
export const REQUEST_TIMEOUT_MS = 10_000;
export const MAX_REDIRECTS = 5;

async function discard(response) {
  try {
    await response.body?.cancel();
  } catch {
    // the connection is gone already
  }
}

// fetchPublic fetches url and follows up to MAX_REDIRECTS redirects itself. It returns the final
// response and the URL it came from.
export async function fetchPublic(url, init, fetchImpl = fetch) {
  let current = url;
  for (let hop = 0; ; hop++) {
    const response = await fetchImpl(current, { ...init, redirect: "manual" });
    const location = response.headers.get("location");
    if (response.status < 300 || response.status > 399 || !location) return { response, url: current };
    await discard(response);
    if (hop === MAX_REDIRECTS) throw new Error(`more than ${MAX_REDIRECTS} redirects from ${url}`);
    current = new URL(location, current).href;
  }
}

// readBoundedBody reads a body up to MAX_RESPONSE_BYTES. A body that is too long, or a read that
// fails, cancels the rest so the connection is closed.
export async function readBoundedBody(response) {
  const reader = response.body?.getReader();
  if (!reader) return new Uint8Array(await response.arrayBuffer());
  const chunks = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_RESPONSE_BYTES) throw new Error(`response exceeded ${MAX_RESPONSE_BYTES} bytes`);
      chunks.push(value);
    }
  } catch (error) {
    await reader.cancel().catch(() => {});
    throw error;
  }
  const body = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return body;
}
