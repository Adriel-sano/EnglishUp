import express from "express";
import path from "path";
import crypto from "crypto";
import fs from "fs";
import { fileURLToPath } from "url";

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;
const DB = path.join(__dirname, "data", "users.json");

fs.mkdirSync(path.dirname(DB), { recursive: true });
if (!fs.existsSync(DB)) fs.writeFileSync(DB, "{}");

app.use(express.json({limit:"1mb"}));
app.use(express.static(path.join(__dirname, "public")));

function readDB(){ return JSON.parse(fs.readFileSync(DB,"utf8") || "{}"); }
function writeDB(db){ fs.writeFileSync(DB, JSON.stringify(db,null,2)); }
function hash(p){ return crypto.createHash("sha256").update(String(p)).digest("hex"); }
function token(){ return crypto.randomBytes(32).toString("hex"); }
function auth(req){
  const t=(req.headers.authorization||"").replace("Bearer ","");
  const db=readDB();
  for(const [email,u] of Object.entries(db)) if(u.token===t) return {email,u,db};
  return null;
}

app.get("/api/health", (_req,res)=>res.json({ok:true,product:"EnglishUp",sync:true}));

app.post("/api/auth/register",(req,res)=>{
  const {email,password}=req.body||{};
  if(!email||!password) return res.status(400).json({error:"Email and password are required"});
  const e=String(email).trim().toLowerCase();
  if(password.length<6) return res.status(400).json({error:"Password must have at least 6 characters"});
  const db=readDB();
  if(db[e]) return res.status(409).json({error:"Account already exists"});
  db[e]={password:hash(password),token:token(),state:null};
  writeDB(db);
  res.json({token:db[e].token,email:e,state:null});
});

app.post("/api/auth/login",(req,res)=>{
  const {email,password}=req.body||{};
  const e=String(email||"").trim().toLowerCase(), db=readDB();
  if(!db[e]||db[e].password!==hash(password)) return res.status(401).json({error:"Invalid email or password"});
  db[e].token=token(); writeDB(db);
  res.json({token:db[e].token,email:e,state:db[e].state});
});

app.get("/api/sync",(req,res)=>{
  const a=auth(req); if(!a) return res.status(401).json({error:"Unauthorized"});
  res.json({email:a.email,state:a.u.state});
});

app.put("/api/sync",(req,res)=>{
  const a=auth(req); if(!a) return res.status(401).json({error:"Unauthorized"});
  if(!req.body?.state) return res.status(400).json({error:"State required"});
  a.u.state=req.body.state; a.db[a.email]=a.u; writeDB(a.db);
  res.json({ok:true,syncedAt:new Date().toISOString()});
});

/* AI tutor server boundary. Replace the fallback below with your chosen provider. */
app.post("/api/tutor",(req,res)=>{
  const {message="",level="B1"}=req.body||{};
  if(!String(message).trim()) return res.status(400).json({error:"Message required"});
  const replies={
    A1:"Nice! Let's keep it simple. Tell me one thing you did today.",
    A2:"Good job. Can you add one more detail using the past tense?",
    B1:"That makes sense. Can you explain why you felt that way?",
    B2:"Interesting. Can you give me an example from your own experience?",
    C1:"Good point. Now try expressing the same idea in a more natural, conversational way.",
    C2:"Excellent. Let's explore the nuance of that idea and compare two possible phrasings."
  };
  res.json({reply:replies[level]||replies.B1,localFallback:true});
});

app.get("*",(_req,res)=>res.sendFile(path.join(__dirname,"public","index.html")));
app.listen(PORT,()=>console.log(`EnglishUp: http://localhost:${PORT}`));