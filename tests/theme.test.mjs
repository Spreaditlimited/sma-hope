import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";
const exports = {};
vm.runInNewContext(ts.transpileModule(fs.readFileSync("src/lib/theme.ts", "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText, { exports });
const { themeInitScript, resolveTheme } = exports;
function boot(saved, systemDark, blocked = false) {
  const root = { dataset: {} };
  vm.runInNewContext(themeInitScript, {
    document: { documentElement: root },
    localStorage: { getItem() { if (blocked) throw Error("Storage unavailable"); return saved; } },
    matchMedia: () => ({ matches: systemDark }),
  });
  return root.dataset;
}
test("saved appearance is applied before hydration and overrides device theme", () => {
  assert.equal(boot("dark", false).theme, "dark");
  assert.equal(boot("light", true).theme, "light");
});
test("system mode follows the device; invalid or blocked storage preserves light default", () => {
  assert.equal(boot("system", true).theme, "dark");
  assert.equal(boot("system", false).theme, "light");
  assert.equal(boot("unexpected", true).theme, "light");
  assert.equal(boot("dark", true, true).theme, "light");
  assert.equal(resolveTheme("system", true), "dark");
  assert.equal(resolveTheme("system", false), "light");
});
test("dark theme text and button pairs meet WCAG AA normal-text contrast", () => {
  const css = fs.readFileSync("src/app/theme.css", "utf8");
  const block = css.match(/:root\[data-theme="dark"\] \{([^}]+)\}/)[1];
  const tokens = Object.fromEntries([...block.matchAll(/(--[\w-]+):\s*(#[\da-f]{6})/g)].map(m => [m[1], m[2]]));
  const luminance = hex => hex.slice(1).match(/../g).map(v => parseInt(v,16)/255).map(v => v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);
  const contrast = (a,b) => { const x=luminance(a),y=luminance(b); return (Math.max(x,y)+.05)/(Math.min(x,y)+.05); };
  for (const fg of ["--text","--text-soft","--link","--danger-text","--warning-text"])
    for (const bg of ["--bg","--surface","--surface-muted","--surface-raised","--warm-surface"])
      assert.ok(contrast(tokens[fg],tokens[bg])>=4.5,`${fg} on ${bg}`);
  assert.ok(contrast("#ffffff",tokens["--primary"])>=4.5);
  assert.ok(contrast("#ffffff",tokens["--primary-strong"])>=4.5);
});
