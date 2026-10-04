const KEY="englishup-state-v1";
const defaultState={
  onboarded:false,level:"B1",xp:1840,streak:6,words:842,minutes:1260,mastery:78,
  goal:"Conversação",daily:20,immersion:false,tab:"home",lessonStep:0,
  skills:{Vocabulary:82,Listening:68,Speaking:61,Grammar:76,Reading:84,Writing:72},
  errors:["since / for","do / make","worked vs work","in / on / at"],
  review:[
    {word:"actually",status:"now",meaning:"na verdade",example:"I actually like this movie."},
    {word:"reliable",status:"soon",meaning:"confiável",example:"She's very reliable."},
    {word:"figure out",status:"soon",meaning:"descobrir / entender",example:"I'll figure it out."}
  ],
  history:[]
};
let state=JSON.parse(localStorage.getItem(KEY)||"null")||structuredClone(defaultState);
let account=JSON.parse(localStorage.getItem("englishup-account")||"null");
const API_BASE="";
function saveAccount(){localStorage.setItem("englishup-account",JSON.stringify(account));}
async function cloud(path,opts={}){
  const headers={"Content-Type":"application/json",...(opts.headers||{})};
  if(account?.token) headers.Authorization="Bearer "+account.token;
  const r=await fetch(API_BASE+path,{...opts,headers});
  const d=await r.json().catch(()=>({}));
  if(!r.ok) throw new Error(d.error||"Network error");
  return d;
}
let syncTimer=null;
async function syncCloud(){
  if(!account?.token)return;
  clearTimeout(syncTimer);
  syncTimer=setTimeout(async()=>{
    try{await cloud("/api/sync",{method:"PUT",body:JSON.stringify({state})});}catch(e){console.warn("Sync failed",e)}
  },350);
}
async function pullCloud(){
  if(!account?.token)return;
  try{
    const d=await cloud("/api/sync");
    if(d.state){state=d.state;save();}
  }catch(e){console.warn("Cloud load failed",e)}
}
const oldSave=save;
save=()=>{oldSave();syncCloud();};
const save=()=>localStorage.setItem(KEY,JSON.stringify(state));
const app=document.querySelector("#app");

const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function nav(){
 return `<aside class="sidebar"><div class="brand">English<span>Up</span></div><div class="nav">
 ${["home:⌂ Home","learn:▣ Learn","practice:◉ Practice","review:↻ Review","profile:◯ Profile"].map(x=>{let [k,t]=x.split(":");return `<button class="${state.tab===k?"active":""}" data-tab="${k}">${t}</button>`}).join("")}</div>
 <div style="position:absolute;bottom:24px;left:16px;right:16px"><div class="card"><div class="label">IMMERSION</div><div class="row" style="margin-top:8px"><b>${state.immersion?"ON":"OFF"}</b><button class="btn" data-action="toggle-immersion">${state.immersion?"Disable":"Enable"}</button></div></div></div></aside>
 <nav class="mobile-nav">${["home:⌂","learn:▣","practice:◉","review:↻","profile:◯"].map(x=>{let [k,t]=x.split(":");return `<button class="${state.tab===k?"active":""}" data-tab="${k}">${t}<br>${k}</button>`}).join("")}</nav>`;
}
function shell(content,title,sub=""){
 return `<div class="app">${nav()}<main class="main"><div class="top"><div><div class="eyebrow">EnglishUp</div><div class="title">${title}</div><div class="subtitle">${sub}</div></div><div class="row"><button class="btn" data-action="quick">Quick practice</button><button class="btn" data-action="account">☁️ ${account?"Account":"Sign in"}</button></div></div>${content}</main></div>`;
}
function home(){
 const skills=Object.entries(state.skills).map(([k,v])=>`<div class="stack"><div class="row"><span>${k}</span><b>${v}%</b></div><div class="bar"><i style="width:${v}%"></i></div></div>`).join("");
 return shell(`<section class="card hero"><div class="eyebrow">YOUR ENGLISH</div><div class="row" style="align-items:flex-end"><div><div class="metric">${state.level} — ${levelName(state.level)}</div><div class="progress" style="width:min(600px,80vw);margin:14px 0"><i style="width:${state.mastery}%"></i></div><span class="muted">${state.mastery}% overall mastery</span></div><button class="btn primary" data-action="start-lesson">Start today's lesson →</button></div></section>
 <div class="grid g4" style="margin-top:16px">${metric("🔥","Streak",state.streak+" days")} ${metric("⚡","XP",state.xp.toLocaleString())} ${metric("◈","Words",state.words)} ${metric("◷","Study time",Math.round(state.minutes/60)+"h")}</div>
 <div class="grid g2" style="margin-top:16px"><div class="card"><div class="row"><h3>Today's training</h3><span class="pill">${state.daily} min</span></div><div class="stack" style="margin-top:12px">${lesson("🎧","Listening","Train real-world comprehension",5)}${lesson("🗣️","Speaking","Conversation with your tutor",5)}${lesson("🧠","Vocabulary","Smart review",5)}${lesson("✍️","Writing","Produce, don't just recognize",5)}</div></div>
 <div class="card"><div class="row"><h3>Skill profile</h3><span class="pill">Adaptive</span></div><div class="stack" style="margin-top:14px">${skills}</div></div></div>
 <div class="card" style="margin-top:16px"><div class="row"><div><h3>What EnglishUp noticed</h3><p class="muted">Your vocabulary is stronger than your speaking. Today's plan increases speaking practice and revisits your recurring grammar errors.</p></div><button class="btn" data-tab="review">Open Review Center</button></div></div>`);
}
function metric(i,l,v){return `<div class="card"><div class="label">${i} ${l}</div><div class="metric">${v}</div></div>`}
function lesson(i,t,d,m){return `<div class="lesson"><div class="icon">${i}</div><div style="flex:1"><b>${t}</b><div class="small muted">${d}</div></div><span class="pill">${m} min</span></div>`}
function levelName(l){return ({A1:"Beginner",A2:"Elementary",B1:"Intermediate",B2:"Upper-intermediate",C1:"Advanced",C2:"Mastery"})[l]}

const lessonItems=[
 {type:"learn",title:"At the Restaurant",text:"Today you'll practice ordering naturally.",word:"reservation",def:"a booking made in advance",example:"I'd like to make a reservation for two."},
 {type:"choice",q:"Which sentence sounds natural when ordering?",opts:["I want one coffee.","I'd like a coffee, please.","Give coffee to me.","I have coffee, now."],ans:1},
 {type:"listen",text:"Listen: “Hi, I'd like to make a reservation for two at seven.”",q:"What is the speaker doing?",opts:["Making a reservation","Ordering dessert","Paying the bill","Leaving the restaurant"],ans:0},
 {type:"write",q:"You are at a restaurant. Write one sentence asking for a table for two."},
 {type:"speak",q:"Say this naturally: “I'd like to make a reservation for two.”"},
 {type:"review",text:"Great work. One useful pattern: “I'd like to…” is polite and extremely common in real conversations."}
];
function learn(){
 const s=lessonItems[state.lessonStep]||lessonItems[0];
 let body="";
 if(s.type==="learn") body=`<div class="card center"><div class="big">🍽️</div><h2>${s.title}</h2><p class="muted">${s.text}</p><div class="card" style="text-align:left;max-width:600px;margin:20px auto"><span class="tag">Vocabulary</span><h2>${s.word}</h2><p>${s.def}</p><p class="muted">“${s.example}”</p><button class="btn" data-action="speak-text" data-text="${esc(s.example)}">🔊 Hear it</button></div><button class="btn primary" data-action="next-lesson">Continue →</button></div>`;
 if(s.type==="choice"||s.type==="listen") body=`<div class="card"><span class="tag">${s.type==="listen"?"Listening":"Grammar in context"}</span><h2>${s.q}</h2>${s.type==="listen"?`<button class="btn" data-action="speak-text" data-text="${esc(s.text.replace("Listen: ",""))}">🔊 Play audio</button>`:""}<div class="stack" style="margin-top:18px">${s.opts.map((o,i)=>`<button class="choice" data-choice="${i}" data-answer="${s.ans}">${o}</button>`).join("")}</div><div id="feedback" class="small" style="margin-top:12px"></div></div>`;
 if(s.type==="write") body=`<div class="card"><span class="tag">Writing</span><h2>${s.q}</h2><textarea id="writeAnswer" rows="5" placeholder="Write in English..."></textarea><div class="row" style="margin-top:12px"><span class="muted small">EnglishUp will look for grammar and naturalness.</span><button class="btn primary" data-action="check-writing">Check answer</button></div><div id="writeFeedback" style="margin-top:15px"></div></div>`;
 if(s.type==="speak") body=`<div class="card center"><span class="tag">Speaking</span><h2>${s.q}</h2><button class="btn" data-action="speak-text" data-text="I'd like to make a reservation for two.">🔊 Hear model</button><div style="height:15px"></div><button class="btn primary" data-action="record">🎙️ Hold to speak</button><p id="speechResult" class="muted"></p><div id="speechFeedback"></div></div>`;
 if(s.type==="review") body=`<div class="card center"><div class="big">✓</div><h2>Session complete</h2><p class="muted">You produced English, trained listening and learned a real conversational pattern.</p><div class="grid g3" style="text-align:left;margin:20px 0">${metric("⚡","XP","+120")} ${metric("🧠","Mastery","+2%")} ${metric("🔥","Streak",state.streak+" days")}</div><button class="btn primary" data-action="finish-lesson">Back to dashboard</button></div>`;
 return shell(`<div class="row"><div class="pill">Lesson ${state.lessonStep+1} / ${lessonItems.length}</div><span class="muted small">At the Restaurant · ${state.level}</span></div><div class="progress" style="margin:12px 0 18px"><i style="width:${((state.lessonStep+1)/lessonItems.length)*100}%"></i></div>${body}`,"Today's lesson","A short adaptive session focused on production and real English.");
}
function practice(){
 return shell(`<div class="grid g2"><div class="card"><span class="tag">AI tutor</span><h2>Talk like it's real life.</h2><p class="muted">Choose a situation. EnglishUp adapts vocabulary, grammar and difficulty to your level.</p><div class="grid g2">${["Restaurant","Job interview","Travel","Gym","Casual chat","Gaming"].map(x=>`<button class="btn" data-scenario="${x}">${x}</button>`).join("")}</div></div>
 <div class="card"><div class="chat" id="chat"><div class="bubble ai">Hey! How was your day?</div></div><div class="row" style="margin-top:10px"><input id="chatInput" placeholder="${state.immersion?"Reply in English…":"Type your answer in English…"}"><button class="btn primary" data-action="send-chat">Send</button></div></div></div>`,
 "Practice","Conversation, pronunciation and real-world production.");
}
function review(){
 return shell(`<div class="grid g2"><div class="card"><div class="row"><h2>Review Center</h2><span class="pill">Spaced repetition</span></div><div class="stack" style="margin-top:14px">${state.review.map((r,i)=>`<div class="lesson"><div class="icon">${r.status==="now"?"🔥":r.status==="soon"?"🟡":"🟢"}</div><div style="flex:1"><b>${r.word}</b><div class="small muted">${r.meaning}</div><div class="small">${r.example}</div></div><button class="btn" data-review="${i}">Review</button></div>`).join("")}</div></div>
 <div class="card"><span class="tag">Your recurring errors</span><h2>Things EnglishUp is watching</h2><ul class="list">${state.errors.map(e=>`<li>${e}</li>`).join("")}</ul><button class="btn primary" data-action="error-drill">Practice my errors</button></div></div>`,"Review Center","EnglishUp schedules what you need, not random words.");
}
function profile(){
 return shell(`<div class="grid g3">${metric("◎","CEFR",state.level)}${metric("⚡","XP",state.xp.toLocaleString())}${metric("◷","Hours",Math.round(state.minutes/60))}${metric("◈","Words",state.words)}${metric("🔥","Days",state.streak)}${metric("◌","Mastery",state.mastery+"%")}</div>
 <div class="grid g2" style="margin-top:16px"><div class="card"><h2>Skill growth</h2><div class="stack">${Object.entries(state.skills).map(([k,v])=>`<div><div class="row"><span>${k}</span><b>${v}%</b></div><div class="progress"><i style="width:${v}%"></i></div></div>`).join("")}</div></div>
 <div class="card"><h2>Preferences</h2><div class="stack"><label class="small muted">Daily target<select id="dailySelect" style="width:100%;padding:13px;background:#091522;color:white;border:1px solid var(--line);border-radius:12px"><option ${state.daily==10?"selected":""}>10</option><option ${state.daily==20?"selected":""}>20</option><option ${state.daily==30?"selected":""}>30</option><option ${state.daily==60?"selected":""}>60</option></select></label><label class="small muted">Goal<input value="${esc(state.goal)}" id="goalInput"></label><button class="btn primary" data-action="save-profile">Save preferences</button><button class="btn danger" data-action="reset">Reset local demo data</button></div></div></div>`,"Profile","Your learning history, strengths and settings.");
}
function onboarding(){
 return `<div style="min-height:100vh;display:grid;place-items:center;padding:20px"><div class="card" style="max-width:780px;width:100%"><div class="brand" style="padding-left:0">English<span>Up</span></div><div class="eyebrow">YOUR PERSONAL ENGLISH TUTOR</div><h1 style="font-size:42px;letter-spacing:-2px">Learn English for real life.</h1><p class="subtitle">EnglishUp builds a personal learning plan from your goals, level and recurring mistakes.</p><div class="grid g2" style="margin-top:24px"><div><label class="small muted">What is your main goal?</label><select id="onGoal" style="width:100%;padding:14px;background:#091522;color:white;border:1px solid var(--line);border-radius:13px"><option>Conversação</option><option>Trabalho</option><option>Viagem</option><option>Filmes e séries</option><option>Jogos</option><option>Morar fora</option></select></div><div><label class="small muted">Daily time</label><select id="onDaily" style="width:100%;padding:14px;background:#091522;color:white;border:1px solid var(--line);border-radius:13px"><option>10</option><option selected>20</option><option>30</option><option>60</option></select></div></div><h3 style="margin-top:28px">Quick placement test</h3><p class="muted">5 questions estimate your CEFR level. A production task follows in your first lesson.</p><div id="placement"></div><button class="btn primary" data-action="start-onboarding">Start placement test →</button></div></div>`;
}
const test=[
 ["Choose the correct sentence:",["She go to work every day.","She goes to work every day.","She going to work every day."],1],
 ["What does “I’ve been working here for two years” mean?",["I worked here two years ago.","I started two years ago and still work here.","I will work here for two years."],1],
 ["Complete: “If I ___ more time, I would travel more.”",["have","had","will have"],1],
 ["Which is most natural?",["I made a mistake.","I did a mistake.","I created a mistake."],0],
 ["What does “I’m gonna head home” mean?",["I am going to go home.","I am going to call home.","I am going to build a home."],0]
];
let testIndex=0, testScore=0;

function accountPage(){
 if(account) return shell(`<div class="grid g2">
  <div class="card"><span class="tag">Cloud sync</span><h2>Connected account</h2><p class="muted">${esc(account.email)}</p>
   <div class="lesson"><div class="icon">☁️</div><div><b>Your progress is synced</b><div class="small muted">Use the same account on the website or installed app.</div></div></div>
   <button class="btn danger" data-action="logout">Sign out</button>
  </div>
  <div class="card"><span class="tag">Cross-device</span><h2>Nothing gets lost</h2><p class="muted">Lessons, XP, streak, vocabulary, mistakes, goals and skill progress are stored in your account.</p>
   <button class="btn primary" data-action="force-sync">Sync now</button>
  </div></div>`,"Account","One account for the website and app.");
 return `<div style="min-height:100vh;display:grid;place-items:center;padding:20px"><div class="card" style="max-width:560px;width:100%">
  <div class="brand" style="padding-left:0">English<span>Up</span></div><div class="eyebrow">CLOUD ACCOUNT</div><h1>Keep your progress everywhere.</h1>
  <p class="muted">Create an account once. The browser site and installed app use the same cloud progress.</p>
  <div class="stack"><input id="authEmail" type="email" placeholder="Email"><input id="authPass" type="password" placeholder="Password (6+ characters)">
  <div class="row"><button class="btn primary" data-action="register">Create account</button><button class="btn" data-action="login">Sign in</button></div><div id="authMsg" class="small muted"></div></div>
 </div></div>`;
}
function render(){if(!state.onboarded){app.innerHTML=onboarding();return} let c=state.tab==="home"?home():state.tab==="learn"?learn():state.tab==="practice"?practice():state.tab==="review"?review():profile();app.innerHTML=c;bind();}
function bind(){
 document.querySelectorAll("[data-tab]").forEach(b=>b.onclick=()=>{state.tab=b.dataset.tab;save();render()});
 document.querySelectorAll("[data-action]").forEach(b=>b.onclick=()=>actions(b.dataset.action,b));
 document.querySelectorAll("[data-choice]").forEach(b=>b.onclick=()=>{const ok=+b.dataset.choice===+b.dataset.answer;b.classList.add(ok?"correct":"wrong");document.querySelector("#feedback").innerHTML=ok?"<span style='color:var(--success)'>Correct. Nice.</span>":"<span style='color:var(--danger)'>Not quite. Try to notice the pattern.</span>";if(ok){state.xp+=20;save();}});
 document.querySelectorAll("[data-scenario]").forEach(b=>b.onclick=()=>{document.querySelector("#chat").innerHTML+=`<div class="bubble ai">Great. Let's practice ${esc(b.dataset.scenario)}. Tell me about a recent experience.</div>`});
}
function actions(a,b){
 if(a==="account"){app.innerHTML=accountPage();bind();return}
 if(a==="register"){auth("register")}
 if(a==="login"){auth("login")}
 if(a==="logout"){account=null;saveAccount();render()}
 if(a==="force-sync"){pullCloud().then(render)}
 if(a==="toggle-immersion"){state.immersion=!state.immersion;save();render()}
 if(a==="quick"){state.tab="learn";state.lessonStep=0;save();render()}
 if(a==="start-lesson"){state.tab="learn";state.lessonStep=0;save();render()}
 if(a==="next-lesson"){state.lessonStep=Math.min(state.lessonStep+1,lessonItems.length-1);state.xp+=15;save();render()}
 if(a==="finish-lesson"){state.xp+=120;state.mastery=Math.min(100,state.mastery+2);state.minutes+=20;state.words+=4;state.skills.Speaking=Math.min(100,state.skills.Speaking+1);state.tab="home";save();render()}
 if(a==="speak-text"){speech(b.dataset.text)}
 if(a==="record"){record()}
 if(a==="check-writing"){checkWriting()}
 if(a==="send-chat"){sendChat()}
 if(a==="error-drill"){state.tab="learn";state.lessonStep=1;save();render()}
 if(a==="save-profile"){state.daily=+document.querySelector("#dailySelect").value;state.goal=document.querySelector("#goalInput").value||state.goal;save();render()}
 if(a==="reset"){localStorage.removeItem(KEY);location.reload()}
}
function speech(text){if("speechSynthesis"in window){const u=new SpeechSynthesisUtterance(text);u.lang="en-US";u.rate=.92;speechSynthesis.speak(u)}}
function record(){
 const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
 const out=document.querySelector("#speechResult");
 if(!SR){out.textContent="Speech recognition is not supported in this browser. Try Chrome/Edge on a secure connection.";return}
 const r=new SR();r.lang="en-US";r.interimResults=false;r.maxAlternatives=1;
 out.textContent="Listening…";r.start();r.onresult=e=>{const t=e.results[0][0].transcript;out.textContent=`You said: “${t}”`;document.querySelector("#speechFeedback").innerHTML=`<div class="card" style="margin-top:12px;text-align:left"><b>Pronunciation coach</b><p class="muted">Good attempt. In a full AI pronunciation model, this area can score individual phonemes, rhythm and intonation.</p></div>`;state.xp+=25;save()};r.onerror=()=>out.textContent="I couldn't capture that. Check microphone permission and try again."}
function checkWriting(){
 const v=document.querySelector("#writeAnswer").value.trim();const box=document.querySelector("#writeFeedback");
 if(!v){box.innerHTML="<span style='color:var(--danger)'>Write something first.</span>";return}
 let natural=v;
 if(/i have \d+ years/i.test(v)) natural="I'm 24."; 
 box.innerHTML=`<div class="card"><span class="tag">Feedback</span><p><b>Grammar:</b> ${v.length>15?"Good start.":"Try adding a little more detail."}</p><p><b>More natural:</b> ${esc(natural)}</p><p class="muted">EnglishUp prioritizes meaning and fluency before tiny mistakes.</p></div>`;
 state.xp+=30;state.skills.Writing=Math.min(100,state.skills.Writing+1);save();
}
async function sendChat(){
 const input=document.querySelector("#chatInput"),chat=document.querySelector("#chat"),msg=input.value.trim();if(!msg)return;
 chat.innerHTML+=`<div class="bubble me">${esc(msg)}</div>`;input.value="";
 try{const r=await fetch("/api/tutor",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message:msg,level:state.level})});const d=await r.json();chat.innerHTML+=`<div class="bubble ai">${esc(d.reply)}</div>`}
 catch{chat.innerHTML+=`<div class="bubble ai">Nice. Tell me one more detail about that.</div>`}
 chat.scrollTop=chat.scrollHeight;state.xp+=10;save();
}

async function auth(mode){
 const email=document.querySelector("#authEmail")?.value.trim();
 const password=document.querySelector("#authPass")?.value;
 const msg=document.querySelector("#authMsg");
 if(!email||!password){if(msg)msg.textContent="Enter email and password.";return}
 try{
  const d=await cloud("/api/auth/"+mode,{method:"POST",body:JSON.stringify({email,password})});
  account={token:d.token,email:d.email};saveAccount();
  if(d.state){state=d.state;save();}
  else await cloud("/api/sync",{method:"PUT",body:JSON.stringify({state})});
  render();
 }catch(e){if(msg)msg.textContent=e.message}
}

function startPlacement(){
 const host=document.querySelector("#placement");
 if(testIndex>=test.length){state.level=["A1","A2","B1","B2","C1","C2"][Math.min(5,Math.max(0,Math.round(testScore/1.3)))];state.goal=document.querySelector("#onGoal").value;state.daily=+document.querySelector("#onDaily").value;state.onboarded=true;save();render();return}
 const [q,opts,ans]=test[testIndex];
 host.innerHTML=`<div class="card" style="margin:15px 0"><div class="tag">Question ${testIndex+1}/${test.length}</div><h3>${q}</h3><div class="stack">${opts.map((o,i)=>`<button class="choice" data-test="${i}" data-ans="${ans}">${o}</button>`).join("")}</div></div>`;
 host.querySelectorAll("[data-test]").forEach(x=>x.onclick=()=>{if(+x.dataset.test===+x.dataset.ans)testScore++;testIndex++;startPlacement()});
 document.querySelector("[data-action='start-onboarding']").textContent="Continue →";
}
document.addEventListener("click",e=>{if(e.target.dataset.action==="start-onboarding"){startPlacement()}});
if("serviceWorker"in navigator) navigator.serviceWorker.register("/sw.js").catch(()=>{});
render();
