async function J(q) {
  let z = BigInt(q.nonce), G = 0;
  const { challenge: Z, difficulty: L, timestamp: _ } = q, $ = "0".repeat(L), M = new TextEncoder(), E = M.encode(`${_}:${Z}`), I = new Uint8Array(E.length + 21);
  I.set(E);
  const Q = new Uint8Array(32), U = "0123456789abcdef", F = new Uint8Array(64);
  while (!0) {
    const V = z.toString(), X = M.encode(V);
    if (
      (I.set(X, E.length),
      await crypto.subtle.digest("SHA-256", I.subarray(0, E.length + X.length)).then((K) => {
        Q.set(new Uint8Array(K));
        for (let w = 0; w < 32; w++) {
          const Y = Q[w];
          (F[w * 2] = U.charCodeAt(Y >> 4)), (F[w * 2 + 1] = U.charCodeAt(Y & 15));
        }
      }),
      String.fromCharCode.apply(null, F.subarray(0, L)) === $)
    )
      return btoa(JSON.stringify({ ...q, nonce: V, hash: String.fromCharCode.apply(null, F) }));
    if ((z++, G++, G % 1e4 === 0)) self.postMessage({ type: "hashrate", hashesComputed: G }), await new Promise((K) => setTimeout(K, 0));
  }
}
self.addEventListener("message", async (q) => {
  const z = await J(q.data);
  self.postMessage({ type: "result", base64Result: z });
});
