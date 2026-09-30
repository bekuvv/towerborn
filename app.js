const tg=window.Telegram?.WebApp; if(tg){tg.ready();tg.expand();}

const state={
 screen:"home", playerHp:500, enemyHp:350, energy:40, combo:0, guard:false, steel:false,
 busy:false, enemyIntent:"HEAVY STRIKE", round:1, gold:128
};
const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];

function showScreen(id){
  state.screen=id;
  $$(".screen").forEach(x=>x.classList.toggle("active",x.id===id));
  window.scrollTo(0,0);
  if(id==="combat") resetCombat();
}
$$("[data-screen]").forEach(b=>b.addEventListener("click",()=>showScreen(b.dataset.screen)));

function updateBars(){
 $("#playerHp").textContent=Math.max(0,state.playerHp);
 $("#enemyHp").textContent=Math.max(0,state.enemyHp);
 $("#playerHpBar").style.width=Math.max(0,state.playerHp/500*100)+"%";
 $("#enemyHpBar").style.width=Math.max(0,state.enemyHp/350*100)+"%";
 $("#energy").textContent=state.energy;
 $("#energyBar").style.width=state.energy+"%";
 $("#combo").textContent=state.combo;
}

function resetCombat(){
 state.playerHp=500;state.enemyHp=350;state.energy=40;state.combo=0;state.guard=false;state.steel=false;state.busy=false;state.round=1;
 $("#intent").innerHTML="HEAVY STRIKE <span>!</span>";
 $("#roundText").textContent="READY"; updateBars(); enableActions(true);
}

function enableActions(on){$$(".action").forEach(b=>b.disabled=!on);}

function message(t){
 const el=$("#battleMessage");el.textContent=t;el.classList.add("show");
 clearTimeout(message.t);message.t=setTimeout(()=>el.classList.remove("show"),650);
}
function fx(type){
 const layer=$("#fxLayer");layer.innerHTML="";
 const e=document.createElement("div");e.className=type==="slash"?"slash":"";
 if(type==="slash") layer.appendChild(e);
 const target=type==="slash"?$(".enemy-art"):$(".player-art");
 target.classList.remove("hit","shake");void target.offsetWidth;target.classList.add(type==="slash"?"hit":"shake");
}

function chooseAction(action){
 if(state.busy || state.playerHp<=0 || state.enemyHp<=0) return;
 state.busy=true;enableActions(false);
 $("#roundText").textContent="YOUR MOVE";
 const countdown=$("#countdown");countdown.classList.remove("hidden");countdown.textContent="0.5";
 let n=5;
 const tick=setInterval(()=>{n--;countdown.textContent=(n/10).toFixed(1);if(n<=0){clearInterval(tick);countdown.classList.add("hidden");performPlayer(action)}},100);
}
function performPlayer(action){
 let dmg=0;
 if(action==="attack"){dmg=55;state.energy=Math.min(100,state.energy+10);fx("slash");message("STRIKE · "+dmg+" DAMAGE");}
 if(action==="block"){state.guard=true;state.energy=Math.min(100,state.energy+15);message("GUARD READY");}
 if(action==="ability1"){
   if(state.energy<25){message("NOT ENOUGH RAGE");state.busy=false;enableActions(true);return}
   state.energy-=25;dmg=90;fx("slash");message("SUNDER · "+dmg+" DAMAGE");
 }
 if(action==="ability2"){
   if(state.energy<30){message("NOT ENOUGH RAGE");state.busy=false;enableActions(true);return}
   state.energy-=30;state.steel=true;message("STEEL WILL · GUARD");
 }
 if(dmg){state.enemyHp-=dmg;state.combo++;}
 updateBars();
 if(state.enemyHp<=0){winCombat();return}
 setTimeout(enemyTurn,430);
}

function enemyTurn(){
 $("#roundText").textContent="ENEMY MOVE";
 const intents=["QUICK STRIKE","HEAVY STRIKE","QUICK STRIKE","FEINT"];
 const intent=intents[Math.floor(Math.random()*intents.length)];
 let dmg=intent==="HEAVY STRIKE"?82:intent==="FEINT"?38:50;
 if(state.guard||state.steel){dmg=Math.floor(dmg*(state.steel?.35:.25));state.guard=false;state.steel=false;message("BLOCKED · "+dmg+" DAMAGE");}
 else {message("HIT · "+dmg+" DAMAGE");fx("player");}
 state.playerHp-=dmg;
 state.energy=Math.max(0,state.energy);
 state.round++;
 updateBars();
 if(state.playerHp<=0){loseCombat();return}
 $("#intent").innerHTML=intent+' <span>!</span>';
 state.busy=false;enableActions(true);$("#roundText").textContent="YOUR MOVE";
}

function winCombat(){
 state.busy=true;enableActions(false);$("#roundText").textContent="VICTORY";
 state.gold+=25;$("#gold").textContent=state.gold;
 message("GUARDIAN DEFEATED");
 setTimeout(()=>showScreen("reward"),900);
}
function loseCombat(){
 state.busy=true;enableActions(false);$("#roundText").textContent="FALLEN";
 message("THE TOWER CLAIMS YOU");
 setTimeout(()=>showScreen("map"),1100);
}

$$(".action").forEach(b=>{
 b.addEventListener("click",()=>chooseAction(b.dataset.action));
});
document.addEventListener("keydown",e=>{
 if(state.screen!=="combat")return;
 if(e.repeat)return;
 if(e.code==="KeyE")chooseAction("ability1");
 if(e.code==="KeyR")chooseAction("ability2");
 if(e.code==="Space")chooseAction("block");
});
updateBars();
