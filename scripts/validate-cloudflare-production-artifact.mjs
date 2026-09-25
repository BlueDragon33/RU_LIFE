import fs from "node:fs";
import path from "node:path";

const root=process.cwd();
const redirectPath=path.join(root,".wrangler","deploy","config.json");
const required=(name)=>{const v=String(process.env[name]??"").trim(); if(!v) throw new Error(`${name} is required.`); return v;};
const prod=required("RU_LIFE_PRODUCTION_D1_DATABASE_ID").toLowerCase();
const preview=required("RU_LIFE_PREVIEW_D1_DATABASE_ID").toLowerCase();
if(prod===preview) throw new Error("Production D1 must differ from Preview D1.");
const redirect=JSON.parse(fs.readFileSync(redirectPath,"utf8"));
const generatedPath=path.resolve(path.dirname(redirectPath),redirect.configPath);
const generated=JSON.parse(fs.readFileSync(generatedPath,"utf8"));
if(generated.name!=="ru-life") throw new Error(`Unexpected Worker name: ${generated.name}`);
const db=(generated.d1_databases??[]).find((x)=>x.binding==="DB");
if(!db || db.database_name!=="ru-life-production-db" || String(db.database_id).toLowerCase()!==prod) throw new Error("Production D1 binding mismatch.");
if(generated.vars?.RU_LIFE_DEPLOYMENT_CHANNEL!=="cloudflare-production") throw new Error("Production channel mismatch.");
if(!/^[A-Za-z0-9._-]{7,80}$/.test(String(generated.vars?.RU_LIFE_BUILD_REVISION??""))) throw new Error("Missing production revision.");
console.log("RU_LIFE production artifact PASS.");
