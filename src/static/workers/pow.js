async function V(q) {
  let F = BigInt(q.nonce), z = 0;
  const { challenge: L, difficulty: M, timestamp: O } = q, Q = "0".repeat(M), G = new TextEncoder(), w = G.encode(`${O}:${L}`), B = new Uint8Array(w.length + 21); B.set(w);
  while (!0) {
    const I = F.toString(), J = G.encode(I); B.set(J, w.length);
    const U = await crypto.subtle.digest("SHA-256", B.subarray(0, w.length + J.length)), K = Array.from(new Uint8Array(U)).map((E) => E.toString(16).padStart(2, "0")).join("");
    if (K.startsWith(Q)) return btoa(JSON.stringify({ ...q, nonce: I, hash: K }));
    if ((F++, z++, z % 1e4 === 0)) self.postMessage({ type: "hashrate", hashesComputed: z }), await new Promise((E) => setTimeout(E, 0));
  }
}
self.addEventListener("message", async (q) => self.postMessage({ type: "result", base64Result: await V(q.data) }));
