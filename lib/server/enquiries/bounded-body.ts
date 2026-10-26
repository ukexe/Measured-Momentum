export type BoundedBodyResult =
  | {
      readonly ok: true;
      readonly text: string;
    }
  | {
      readonly ok: false;
      readonly reason: "invalid-encoding" | "too-large" | "unreadable";
    };

export async function readBoundedText(
  body: ReadableStream<Uint8Array> | null,
  maximumBytes: number,
): Promise<BoundedBodyResult> {
  if (!body) {
    return { ok: true, text: "" };
  }

  const reader = body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  try {
    while (true) {
      const result = await reader.read();
      if (result.done) {
        break;
      }

      totalBytes += result.value.byteLength;
      if (totalBytes > maximumBytes) {
        try {
          await reader.cancel();
        } catch {
          // The size decision is final even if the peer has already closed.
        }
        return { ok: false, reason: "too-large" };
      }

      chunks.push(result.value);
    }
  } catch {
    return { ok: false, reason: "unreadable" };
  } finally {
    reader.releaseLock();
  }

  const bytes = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }

  try {
    return {
      ok: true,
      text: new TextDecoder("utf-8", { fatal: true }).decode(bytes),
    };
  } catch {
    return { ok: false, reason: "invalid-encoding" };
  }
}
