async function calculateHash(e, t, n) {
  let l = BigInt(0), a = 0, o = Date.now(), r = "0".repeat(e), $ = new TextEncoder(), s = $.encode(`${n}:${t}`), h = new Uint8Array(s.length + 21);
  h.set(s);
  let i = new Uint8Array(32), c = "0123456789abcdef", f = new Uint8Array(64);
  for (;;) {
    let w = l.toString(), g = $.encode(w);
    if ((h.set(g, s.length), await crypto.subtle.digest("SHA-256", h.subarray(0, s.length + g.length)).then((e) => {
      i.set(new Uint8Array(e));
      for (let t = 0; t < 32; t++) {
        let n = i[t];
        (f[2 * t] = c.charCodeAt(n >> 4)), (f[2 * t + 1] = c.charCodeAt(15 & n));
      }
    }), String.fromCharCode.apply(null, f.subarray(0, e)) === r)) {
      return console.log(btoa(JSON.stringify({ difficulty: e, challenge: t, timestamp: n, nonce: w, hash: String.fromCharCode.apply(null, f) })));
    }
    if ((l++, ++a % 1e4 == 0)) {
      let d = a / ((Date.now() - o) / 1e4);
      console.clear(), console.log(`Looking for a solution, please wait... (${Math.floor(d)} h/s)`), await new Promise((e) => setTimeout(e, 0));
    }
  }
}
