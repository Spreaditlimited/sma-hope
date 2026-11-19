import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";

function browser(saved = "", route = "/book") {
  const writes = [], scripts = [], listeners = new Map();
  const jar = new Map(saved.split("; ").filter(Boolean).map((entry) => entry.split("=")));
  const document = {
    get cookie() { return [...jar].map(([k,v]) => `${k}=${v}`).join("; "); },
    set cookie(value) {
      writes.push(value); const [entry] = value.split(";"); const [name, contents] = entry.split("=");
      if (value.includes("Max-Age=0")) jar.delete(name); else jar.set(name, contents);
    },
    head: { appendChild(script) { scripts.push(script); } },
    createElement() { return { remove() {} }; },
  };
  const window = {
    location: new URL(`https://www.smahope.org${route}`),
    dispatchEvent(event) { listeners.get(event.type)?.forEach((f) => f(event)); },
    addEventListener(type, callback) { listeners.set(type, [...(listeners.get(type) ?? []), callback]); },
  };
  const cache = {};
  function load(name) {
    if (cache[name]) return cache[name];
    const exports = {}; cache[name] = exports;
    const source = fs.readFileSync(`src/lib/${name}.ts`, "utf8");
    const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
    vm.runInNewContext(code, { exports, window, document, URL, Event, require: (id) => load(id.replace("./", "")) });
    return exports;
  }
  const consent = load("cookie-consent"), pixel = load("meta-pixel");
  const events = () => (window.fbq?.queue ?? []).filter(([command]) => command === "trackSingle");
  function navigate(path) { window.location = new URL(`https://www.smahope.org${path}`); pixel.syncMetaPixel(window.location.pathname); }
  return { window, document, scripts, writes, consent, pixel, events, navigate };
}

test("no Meta SDK request or event before consent, on rejection, or with legacy generic acceptance", () => {
  for (const cookie of ["", "smahope_cookie_consent_v2=declined", "smahope_cookie_consent=accepted", "smahope_cookie_consent_v2=unexpected"]) {
    const b=browser(cookie);b.navigate("/book");assert.equal(b.scripts.length,0);assert.equal(b.events().length,0);
  }
});
test("legacy rejection is respected, while the new advertising choice is versioned", () => {
  const b=browser("smahope_cookie_consent=declined");assert.equal(b.consent.readCookieConsent(),"declined");
  b.consent.saveCookieConsent("accepted");assert.equal(b.consent.readCookieConsent(),"accepted");
  assert.match(b.writes.at(-1),/smahope_cookie_consent_v2=accepted.*SameSite=Lax; Secure/);
});
test("consent loads SDK once, disables automatic events, initializes the correct ID and tracks after load", () => {
  const b=browser();b.consent.saveCookieConsent("accepted");b.navigate("/book");b.navigate("/book");
  assert.equal(b.scripts.length,1);assert.equal(b.events().length,0);
  assert.equal(b.scripts[0].src,"https://connect.facebook.net/en_US/fbevents.js");
  assert.equal(b.window.fbq.disablePushState,true);
  assert.deepEqual(Array.from(b.window.fbq.queue[0]),["consent","revoke"]);
  assert.deepEqual(Array.from(b.window.fbq.queue[1]),["set","autoConfig",false,"627907282665147"]);
  assert.deepEqual(Array.from(b.window.fbq.queue[2]),["init","627907282665147"]);
  b.scripts[0].onload();b.navigate("/book");assert.equal(b.events().length,1);
  b.navigate("/blog");assert.equal(b.events().length,2);
  b.navigate("/book");assert.equal(b.events().length,3);
  assert.deepEqual(Array.from(b.events()[0]),["trackSingle","627907282665147","PageView"]);
});
test("private and contact/checkout pages never load or send the pixel", () => {
  for (const route of ["/account","/account/login","/admin","/admin/users","/api/orders","/contact","/order-book","/order-book/success"]) {
    const b=browser("smahope_cookie_consent_v2=accepted",route);b.navigate(route);assert.equal(b.scripts.length,0);assert.equal(b.events().length,0);
  }
});
test("sensitive query parameters are excluded but a normal campaign landing page works", () => {
  for (const route of ["/book?email=name%40example.com","/book?resetToken=secret","/book?session_id=secret","/book?code=secret"]) {
    const b=browser("smahope_cookie_consent_v2=accepted");b.navigate(route);assert.equal(b.scripts.length,0);
  }
  const b=browser("smahope_cookie_consent_v2=accepted");b.navigate("/book?utm_source=facebook&fbclid=example");assert.equal(b.scripts.length,1);
});
test("slow SDK load rechecks the real route and consent, so it cannot flush a page view on a private page", () => {
  const b=browser("smahope_cookie_consent_v2=accepted");b.navigate("/book");
  b.window.location=new URL("https://www.smahope.org/account/reset-password?token=secret");
  b.scripts[0].onload();assert.equal(b.events().length,0);
  b.navigate("/account/reset-password");assert.equal(b.events().length,0);
  b.navigate("/book");assert.equal(b.events().length,1);
  b.consent.saveCookieConsent("declined");b.pixel.syncMetaPixel("/book");b.navigate("/blog");assert.equal(b.events().length,1);
  assert.ok(b.writes.some((value)=>value.startsWith("_fbp=; Max-Age=0")));
});
test("withdrawal before SDK load prevents a queued page view; re-acceptance works without duplicate SDK/init", () => {
  const b=browser("smahope_cookie_consent_v2=accepted");b.navigate("/book");
  b.consent.saveCookieConsent("declined");b.pixel.syncMetaPixel("/book");b.scripts[0].onload();assert.equal(b.events().length,0);
  b.consent.saveCookieConsent("accepted");b.pixel.syncMetaPixel("/book");assert.equal(b.events().length,1);assert.equal(b.scripts.length,1);
});
test("a blocked SDK can retry without breaking the site or initializing twice", () => {
  const b=browser("smahope_cookie_consent_v2=accepted");b.navigate("/book");b.scripts[0].onerror();
  b.navigate("/blog");assert.equal(b.scripts.length,2);b.scripts[1].onload();assert.equal(b.events().length,1);
  assert.equal(b.window.fbq.queue.filter(([command])=>command==="init").length,1);
});
test("cookie storage restrictions do not break choices or permit tracking without a choice", () => {
  const b=browser();Object.defineProperty(b.document,"cookie",{get(){throw Error("Blocked");},set(){throw Error("Blocked");}});
  assert.doesNotThrow(()=>b.navigate("/book"));assert.equal(b.scripts.length,0);
  assert.doesNotThrow(()=>b.consent.saveCookieConsent("accepted"));b.pixel.syncMetaPixel("/book");b.scripts[0].onload();assert.equal(b.events().length,1);
  assert.doesNotThrow(()=>b.consent.saveCookieConsent("declined"));assert.doesNotThrow(()=>b.pixel.syncMetaPixel("/book"));b.navigate("/blog");assert.equal(b.events().length,1);
});
