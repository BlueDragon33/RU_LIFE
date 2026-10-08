import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import test from "node:test";

test("entitlement decisions are deterministic and do not mutate grants", () => {
  const snippet = `
    import { evaluateEntitlement } from "./lib/content-intelligence/entitlement.ts";
    const open={schemaVersion:1,resourceId:"ru-life:pack:russia-starter",access:"open"};
    const gated={schemaVersion:1,resourceId:"ru-life:pack:future-pack",access:"gated"};
    const valid={schemaVersion:1,resourceId:gated.resourceId,subjectId:"student-1",expiresAt:"2027-01-01T00:00:00Z",revoked:false};
    const cases=[
      evaluateEntitlement(open,"",[], "2026-10-08T00:00:00Z").allowed,
      evaluateEntitlement(gated,"student-1",[], "2026-10-08T00:00:00Z").allowed,
      evaluateEntitlement(gated,"student-1",[valid], "2026-10-08T00:00:00Z").allowed,
      evaluateEntitlement(gated,"student-2",[valid], "2026-10-08T00:00:00Z").allowed,
      evaluateEntitlement(gated,"student-1",[valid], "2027-01-01T00:00:00Z").allowed,
      evaluateEntitlement(gated,"student-1",[{...valid,revoked:true}], "2026-10-08T00:00:00Z").allowed,
      evaluateEntitlement(gated,"student-1",[{...valid,expiresAt:"invalid"}], "2026-10-08T00:00:00Z").allowed,
    ];
    if(JSON.stringify(cases)!==JSON.stringify([true,false,true,false,false,false,false])) throw new Error(JSON.stringify(cases));
  `;
  const child=spawnSync(process.execPath,["--experimental-strip-types","--input-type=module","-e",snippet],{encoding:"utf8",cwd:new URL("../",import.meta.url)});
  assert.equal(child.status,0,child.stderr || child.stdout);
});
