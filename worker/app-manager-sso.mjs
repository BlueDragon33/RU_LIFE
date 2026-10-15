/** App-Manage v2 browser SSO client. Opt-in in managed mode ONLY.
 * Never bypass RU_LIFE's independent device gate or local-first mode.
 */
const ISSUER="https://application-management.boiech-ai.workers.dev";
const CLIENT="ru-life";
const FLOW="__Host-ru-life_sso_flow";
const SESSION="__Host-ru-life_sso_session";
const encoder=new TextEncoder();
const now=()=>Math.floor(Date.now()/1000);
const b64=a=>btoa(String.fromCharCode(...a)).replaceAll("+","-").replaceAll("/","_").replace(/=+$/,"");
const ub64=s=>Uint8Array.from(atob(s.replaceAll("-","+").replaceAll("_","/")),c=>c.charCodeAt(0));
const rand=n=>crypto.getRandomValues(new Uint8Array(n));
const safeHeaders={"cache-control":"no-store, private","referrer-policy":"no-referrer","x-content-type-options":"nosniff"};
const jsonError=(error,status=403)=>Response.json({ok:false,error},{status,headers:safeHeaders});
const cookie=(req,name)=>{
 const a=(req.headers.get("cookie")||"").split(";");
 for(const x of a){const p=x.trim().indexOf("=");if(p>=0&&x.trim().slice(0,p)===name)return x.trim().slice(p+1)}
 return "";
};
const setCookie=(res,name,value,age)=>res.headers.append("set-cookie",
 name+"="+value+"; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age="+age);
async function key(secret){return crypto.subtle.importKey("raw",encoder.encode(secret),{name:"HMAC",hash:"SHA-256"},false,["sign","verify"])}
async function sign(payload,secret){return b64(new Uint8Array(await crypto.subtle.sign("HMAC",await key(secret),encoder.encode("ru-life-app-manage-sso:"+payload))))}
async function seal(obj,secret){
 const payload=b64(encoder.encode(JSON.stringify(obj)));
 return "v1."+payload+"."+await sign(payload,secret);
}
async function unseal(s,secret,kind,maxAge){
 if(!s||s.length>1700)return null;
 const a=s.split(".");
 if(a.length!==3||a[0]!=="v1"||!/^[A-Za-z0-9_-]{16,1300}$/.test(a[1])||!/^[A-Za-z0-9_-]{43}$/.test(a[2]))return null;
 try{
  if(!await crypto.subtle.verify("HMAC",await key(secret),ub64(a[2]),encoder.encode("ru-life-app-manage-sso:"+a[1])))return null;
  const v=JSON.parse(new TextDecoder().decode(ub64(a[1])));
  if(v.kind!==kind||!Number.isSafeInteger(v.exp)||v.exp<=now()||v.exp>now()+maxAge)return null;
  if(kind==="flow")return Object.keys(v).length===4&&/^[A-Za-z0-9_-]{43}$/.test(v.verifier)&&/^[A-Za-z0-9_-]{32}$/.test(v.state)?v:null;
  return Object.keys(v).length===5&&v.aud===CLIENT&&v.issuer===ISSUER&&
   typeof v.sub==="string"&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.sub)?v:null;
 }catch{return null}
}
export const managedSsoEnabled=env=>env.RU_LIFE_SSO_ENABLED==="true"&&env.RU_LIFE_ACCESS_MODE==="managed";
function config(req,env){
 if(!managedSsoEnabled(env))return null;
 const callback=env.RU_LIFE_SSO_CALLBACK_URL,secret=env.RU_LIFE_SSO_SESSION_KEY;
 if(typeof callback!=="string"||typeof secret!=="string"||secret.length<32)return null;
 const url=new URL(req.url);
 return url.protocol==="https:"&&callback===url.origin+"/__sso/callback"?{callback,secret}:null;
}
export async function hasManagedSsoSession(request,env){
 if(!managedSsoEnabled(env))return true;
 const c=config(request,env);
 return !!c&&!!await unseal(cookie(request,SESSION),c.secret,"session",600);
}
export const requiresManagedBrowserSso = pathname =>
 pathname==="/" || pathname==="/app" || pathname.startsWith("/app/");
