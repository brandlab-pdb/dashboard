/* ══ AUTH ══ */
const SESSION_KEY = 'bl_access_versiona';
const LOGIN_FILE  = 'index.html';
if (sessionStorage.getItem(SESSION_KEY) !== 'ok') {
  window.location.href = LOGIN_FILE;
}
function logout() {
  sessionStorage.removeItem(SESSION_KEY);
  window.location.href = LOGIN_FILE;
}

/* ══ AUTH ══ */
const SESSION_KEY = 'bl_access_versiona';   // debe coincidir con index.html
const LOGIN_FILE  = 'index.html';
if (sessionStorage.getItem(SESSION_KEY) !== 'ok') {
  window.location.href = LOGIN_FILE;
}
function logout() {
  sessionStorage.removeItem(SESSION_KEY);
  window.location.href = LOGIN_FILE;
}

/* ══ AUTH ══ */
const SESSION_KEY = 'bl_access_versiona';
const LOGIN_FILE  = 'index.html';
if (sessionStorage.getItem(SESSION_KEY) !== 'ok') {
  window.location.href = LOGIN_FILE;
}
function logout() {
  sessionStorage.removeItem(SESSION_KEY);
  window.location.href = LOGIN_FILE;
}

/* ══════════════════════════════════════════════════════
   CONSTANTES
══════════════════════════════════════════════════════ */
const STORAGE_KEY = 'versiona_pm_v5';
const WIP_LIMIT = 5;
const MODEL = 'claude-sonnet-4-20250514';
const STATE_NEXT = {pending:'inprogress',inprogress:'blocked',blocked:'done',done:'pending'};
const STATE_ICONS = {pending:'○',inprogress:'◑',blocked:'⊘',done:'✓'};
const STATUS_CLR = {green:'var(--green)',yellow:'var(--yellow)',red:'var(--red)'};
const PRIO_CLR = {high:'var(--red)',med:'var(--yellow)',low:'var(--green)'};

/* ══ SEED DATA ══ */
const SEED = {
  lastUpdated: new Date().toISOString(),
  mode:'dark',
  top3:['Activar campañas SG + seguimiento Andrés','Cerrar propuesta JLFC $5k/mes','Flyers Osos Flag (Try Out + Únete)'],
  clients:[
    {id:'sg',name:'SG Arquitectura Arte',type:'membresía',plan:'Chispa $5k',status:'yellow',tasks:[
      {id:'sg1',text:'Editar video Cimientos Casa RS',who:'EK',state:'pending',priority:'high',revisions:0,blockedSince:null},
      {id:'sg2',text:'Editar video Dron Casa RS',who:'EK',state:'pending',priority:'high',revisions:0,blockedSince:null},
      {id:'sg3',text:'Propuesta web HTML/CSS + Hostinger',who:'Diego',state:'pending',priority:'med',revisions:0,blockedSince:null},
      {id:'sg4',text:'Activar campañas — seguimiento Andrés',who:'Artur',state:'pending',priority:'high',revisions:0,blockedSince:null},
      {id:'sg5',text:'Montar formulario para cliente',who:'Diego',state:'pending',priority:'med',revisions:0,blockedSince:null},
      {id:'sg6',text:'Agendar sesión de la semana',who:'Artur',state:'pending',priority:'med',revisions:0,blockedSince:null},
      {id:'sg7',text:'Video de IA',who:'EK',state:'pending',priority:'low',revisions:0,blockedSince:null},
    ]},
    {id:'micaela',name:'Micaela',type:'membresía',plan:'Membresía',status:'yellow',tasks:[
      {id:'mi1',text:'Live — Video y Flyer',who:'EK',state:'pending',priority:'high',revisions:0,blockedSince:null},
      {id:'mi2',text:'Editar fotografías sesión',who:'EK',state:'pending',priority:'med',revisions:0,blockedSince:null},
      {id:'mi3',text:'Seguimiento post-sesión Día de las Madres',who:'Artur',state:'pending',priority:'med',revisions:0,blockedSince:null},
    ]},
    {id:'mxtravel',name:'MX Travel',type:'membresía',plan:'Membresía',status:'yellow',tasks:[
      {id:'mx1',text:'4to video — cierre de proyecto',who:'EK',state:'pending',priority:'high',revisions:0,blockedSince:null},
      {id:'mx2',text:'Avanzar contenido general',who:'Artur',state:'pending',priority:'med',revisions:0,blockedSince:null},
    ]},
    {id:'chula',name:'La Chula de Barrio',type:'membresía',plan:'Membresía',status:'red',tasks:[
      {id:'ch1',text:'Agendar sesión de contenido (llevan tiempo posponiendo)',who:'Artur',state:'pending',priority:'high',revisions:0,blockedSince:null},
      {id:'ch2',text:'Videos trends (2)',who:'Diego',state:'pending',priority:'med',revisions:0,blockedSince:null},
      {id:'ch3',text:'Seguimiento campaña activa',who:'Artur',state:'pending',priority:'med',revisions:0,blockedSince:null},
    ]},
    {id:'altavia',name:'Plaza Altavia',type:'proyecto',plan:'Proyecto',status:'yellow',tasks:[
      {id:'al1',text:'Video general promo',who:'EK',state:'pending',priority:'high',revisions:0,blockedSince:null},
      {id:'al2',text:'Reactivar stories de negocios',who:'EK',state:'blocked',priority:'high',revisions:0,blockedSince:new Date(Date.now()-4*86400000).toISOString()},
      {id:'al3',text:'Comunicación — Diego Oseguera',who:'Artur',state:'pending',priority:'med',revisions:0,blockedSince:null},
    ]},
    {id:'ososbasquet',name:'Osos Basquetbol',type:'proyecto',plan:'Proyecto',status:'red',tasks:[
      {id:'ob1',text:'Flyer Convocatoria Basquet',who:'EK',state:'pending',priority:'high',revisions:0,blockedSince:null},
      {id:'ob2',text:'Comunicación general con cuenta',who:'Artur',state:'pending',priority:'med',revisions:0,blockedSince:null},
      {id:'ob3',text:'Cuadrar siguientes sesiones',who:'Artur',state:'pending',priority:'med',revisions:0,blockedSince:null},
    ]},
    {id:'ososflag',name:'Osos Flag',type:'proyecto',plan:'Proyecto',status:'red',tasks:[
      {id:'of1',text:'Flyer Try Out Flag',who:'EK',state:'pending',priority:'high',revisions:0,blockedSince:null},
      {id:'of2',text:'Modificar flyer Logros',who:'EK',state:'pending',priority:'high',revisions:0,blockedSince:null},
      {id:'of3',text:'Modificar flyer Únete a Osos',who:'EK',state:'pending',priority:'high',revisions:0,blockedSince:null},
      {id:'of4',text:'3 flyers nuevos — propósito Únete',who:'EK',state:'pending',priority:'high',revisions:0,blockedSince:null},
    ]},
    {id:'gaby',name:'Gaby Mar y Tierra',type:'proyecto',plan:'Proyecto',status:'yellow',tasks:[
      {id:'gb1',text:'Videos locación Karola (General + Eleva tu outfit)',who:'Diego',state:'pending',priority:'med',revisions:0,blockedSince:null},
      {id:'gb2',text:'Pedir audio a Gaby',who:'Diego',state:'pending',priority:'med',revisions:0,blockedSince:null},
      {id:'gb3',text:'Coordinar tomas con Javier',who:'Diego',state:'pending',priority:'low',revisions:0,blockedSince:null},
    ]},
    {id:'evolve',name:'Evolve Compact',type:'proyecto',plan:'Campañas',status:'yellow',tasks:[
      {id:'ev1',text:'Arrancar campañas — programar y pujar contenido',who:'EK',state:'inprogress',priority:'high',revisions:0,blockedSince:null},
      {id:'ev2',text:'Monitorear resultados de campaña activa',who:'Artur',state:'pending',priority:'med',revisions:0,blockedSince:null},
    ]},
    {id:'jlfc',name:'JLFC / AO',type:'proyecto',plan:'Propuesta $5k/mes',status:'yellow',tasks:[
      {id:'jl1',text:'Cerrar propuesta recurrente $5k/mes',who:'Artur',state:'pending',priority:'high',revisions:0,blockedSince:null},
      {id:'jl2',text:'Videos e imágenes para promoción',who:'Diego',state:'pending',priority:'med',revisions:0,blockedSince:null},
    ]},
    {id:'jessy',name:'Jessy',type:'prospecto',plan:'Propuesta',status:'yellow',tasks:[
      {id:'js1',text:'Elaborar y enviar propuesta',who:'Artur',state:'pending',priority:'med',revisions:0,blockedSince:null},
    ]},
    {id:'editora',name:'Editora de Café',type:'proyecto',plan:'Proyecto',status:'yellow',tasks:[
      {id:'ed1',text:'Editar video Centro Editora',who:'Artur',state:'inprogress',priority:'med',revisions:0,blockedSince:null},
    ]},
    {id:'nura',name:'Nura',type:'proyecto',plan:'Proyecto',status:'yellow',tasks:[
      {id:'nu1',text:'Editar material Nura',who:'Artur',state:'pending',priority:'med',revisions:0,blockedSince:null},
    ]},
    {id:'admin',name:'Admin / General',type:'admin',plan:'Interno',status:'red',tasks:[
      {id:'ad1',text:'Seguimiento cobros y pagos pendientes',who:'Artur',state:'pending',priority:'high',revisions:0,blockedSince:null},
      {id:'ad2',text:'Crear y entregar reportes pendientes',who:'Artur',state:'pending',priority:'high',revisions:0,blockedSince:null},
      {id:'ad3',text:'Seguimiento Andy Rosas — Gold Padel Open',who:'Artur',state:'pending',priority:'med',revisions:0,blockedSince:null},
    ]},
  ]
};

/* ══════════════════════════════════════════════════════
   STATE
══════════════════════════════════════════════════════ */
let state = null;
let activeClientId = null;
let aiPreviewData = null;
let briefingData = null;
let copiedWho = '';
let editTop3Mode = false;

function daysSince(iso){ return !iso?0:Math.floor((Date.now()-new Date(iso).getTime())/86400000); }

function migrate(d){
  return {
    ...d,
    mode:d.mode||'dark',
    top3:d.top3||['','',''],
    clients:d.clients.map(c=>({...c,tasks:c.tasks.map(t=>({revisions:0,blockedSince:null,priority:'med',...t}))}))
  };
}

/* ══ PERSISTENCE ══ */
let saveTimer = null;
function persist(){
  try{localStorage.setItem(STORAGE_KEY,JSON.stringify({...state,lastUpdated:new Date().toISOString()}));
  document.getElementById('save-ind').textContent='guardado ✓';
  setTimeout(()=>{if(document.getElementById('save-ind'))document.getElementById('save-ind').textContent='sync ●';},1500);
  }catch(e){}
}
function update(newState){ state=newState; persist(); renderAll(); }

/* ══ LOAD ══ */
function load(){
  try{
    const raw=localStorage.getItem(STORAGE_KEY);
    if(raw){state=migrate(JSON.parse(raw));}
    else{state=SEED;}
  }catch{state=SEED;}
  activeClientId=state.clients[0]?.id;
  document.documentElement.setAttribute('data-theme',state.mode);
  loadApiKey();
  renderAll();
}

/* ══ HELPERS ══ */
function getClient(id){ return state.clients.find(c=>c.id===id); }
function allTasks(){ return state.clients.flatMap(c=>c.tasks); }
function wipOf(who){ return state.clients.reduce((a,c)=>a+c.tasks.filter(t=>t.who===who&&t.state!=='done').length,0); }
function blockedAll(){ return state.clients.flatMap(c=>c.tasks.filter(t=>t.state==='blocked').map(t=>({...t,cname:c.name,cid:c.id}))).sort((a,b)=>daysSince(b.blockedSince)-daysSince(a.blockedSince)); }

function whoTag(who){ return `<span class="who-tag who-${who}">${who}</span>`; }
function prioTag(p){ const map={high:'Alta',med:'Media',low:'Baja'}; return `<span class="prio-tag prio-${p}-tag">${map[p]||p}</span>`; }

/* ══════════════════════════════════════════════════════
   RENDER ALL
══════════════════════════════════════════════════════ */
function renderAll(){
  renderKpiStrip();
  renderWipBar();
  renderTop3();
  renderClientSidebar();
  renderClientPanel();
  renderEquipo();
  renderBloqueados();
  updateBlockedBadge();
  updateAiSubmitBtn();
}

/* ══ KPI STRIP ══ */
function renderKpiStrip(){
  const tasks=allTasks();
  const activas=tasks.filter(t=>t.state!=='done').length;
  const blocked=tasks.filter(t=>t.state==='blocked').length;
  const done=tasks.filter(t=>t.state==='done').length;
  const rojo=state.clients.filter(c=>c.status==='red').length;
  document.getElementById('ks-activas').textContent=activas;
  const kb=document.getElementById('ks-blocked');
  kb.textContent=blocked;kb.style.color=blocked>0?'var(--red)':'var(--muted)';
  document.getElementById('ks-done').textContent=done;
  const kr=document.getElementById('ks-rojo');
  kr.textContent=rojo;kr.style.color=rojo>0?'var(--red)':'var(--muted)';
}

/* ══ WIP BAR ══ */
function renderWipBar(){
  const bar=document.getElementById('wip-bar');
  bar.innerHTML=['EK','Artur','Diego'].map(w=>{
    const n=wipOf(w),over=n>=WIP_LIMIT;
    return `<span style="color:var(--muted2)">${w}</span> <span style="color:${over?'var(--red)':n>3?'var(--yellow)':'var(--green)'};font-weight:${over?700:600}">${n}${over?'⚠':''}</span>`;
  }).join('<span style="color:var(--border2);margin:0 4px">|</span>');
}

/* ══ TOP 3 ══ */
function renderTop3(){
  if(editTop3Mode)return;
  const disp=document.getElementById('top3-display');
  disp.innerHTML=state.top3.map((item,i)=>
    `<span class="t3-pill ${!item?'empty':''}">${item?`${i+1}. ${item}`:`— prioridad ${i+1}`}</span>`
  ).join('');
}

function startEditTop3(){
  editTop3Mode=true;
  document.getElementById('t3-edit-btn').style.display='none';
  document.getElementById('top3-display').innerHTML='';
  const row=document.getElementById('top3-edit-row');
  row.style.display='flex';row.style.gap='6px';row.style.alignItems='center';row.style.flexWrap='wrap';
  row.innerHTML=state.top3.map((v,i)=>
    `<input class="t3-in" value="${v}" id="t3in-${i}" placeholder="Prioridad ${i+1}">`
  ).join('')+`<button class="t3-save" onclick="saveTop3()">guardar</button><button class="t3-cancel" onclick="cancelTop3()">cancelar</button>`;
}

function saveTop3(){
  const vals=[0,1,2].map(i=>document.getElementById('t3in-'+i)?.value||'');
  update({...state,top3:vals});
  editTop3Mode=false;
  document.getElementById('t3-edit-btn').style.display='';
  document.getElementById('top3-edit-row').style.display='none';
  renderTop3();
}
function cancelTop3(){
  editTop3Mode=false;
  document.getElementById('t3-edit-btn').style.display='';
  document.getElementById('top3-edit-row').style.display='none';
  renderTop3();
}

/* ══ CLIENT SIDEBAR ══ */
function renderClientSidebar(){
  const sb=document.getElementById('client-sidebar');
  const groups=['membresía','proyecto','prospecto','admin'];
  sb.innerHTML=groups.map(type=>{
    const group=state.clients.filter(c=>c.type===type);
    if(!group.length)return'';
    return`<div class="cs-group-lbl">${type}</div>`+group.map(c=>{
      const pend=c.tasks.filter(t=>t.state!=='done').length;
      const block=c.tasks.filter(t=>t.state==='blocked').length;
      const isActive=c.id===activeClientId;
      return`<button class="cs-btn ${isActive?'active':''}" onclick="setActiveClient('${c.id}')" style="border-left-color:${isActive?STATUS_CLR[c.status]:'transparent'}">
        <div class="cs-btn-info">
          <div class="cs-btn-name">${c.name}</div>
          <div class="cs-btn-meta">
            ${pend?`<span class="cs-pend-cnt">${pend}</span>`:''}
            ${block?`<span class="cs-block-cnt">⊘${block}</span>`:''}
          </div>
        </div>
        <div class="cs-status-dot" style="background:${STATUS_CLR[c.status]}"></div>
      </button>`;
    }).join('');
  }).join('');
}

/* ══ CLIENT PANEL ══ */
function setActiveClient(id){ activeClientId=id; renderClientSidebar(); renderClientPanel(); }

function renderClientPanel(){
  const panel=document.getElementById('client-panel');
  const c=getClient(activeClientId);
  if(!c){panel.innerHTML='<div style="padding:24px;color:var(--muted)">Selecciona un cliente</div>';return;}
  const done=c.tasks.filter(t=>t.state==='done').length;
  const pct=c.tasks.length?Math.round(done/c.tasks.length*100):0;
  panel.innerHTML=`
    <div class="cp-header">
      <div>
        <div class="cp-title-row">
          <button class="cp-status-btn" style="background:${STATUS_CLR[c.status]};box-shadow:0 0 8px ${STATUS_CLR[c.status]}88" onclick="cycleStatus('${c.id}')" title="Cambiar estado"></button>
          <div class="cp-name">${c.name}</div>
        </div>
        <div class="cp-tags"><span class="cp-tag">${c.type}</span><span class="cp-tag">${c.plan}</span></div>
      </div>
      <div class="cp-progress"><strong>${done}</strong>/${c.tasks.length}<div style="font-size:9px;color:var(--muted);margin-top:1px">completadas</div></div>
    </div>
    <div class="progress-bar"><div class="progress-fill" style="width:${pct}%;background:${STATUS_CLR[c.status]}"></div></div>
    <div id="cp-tasks-list">${c.tasks.length?c.tasks.map(t=>cpTaskHTML(c.id,t)).join(''):'<div class="no-tasks">Sin tareas. Usa ✦ IA para agregar rápido.</div>'}</div>
    <div class="add-task-row">
      <input class="add-in" id="cp-add-in" placeholder="Añadir tarea…" onkeydown="if(event.key==='Enter')cpAddTask('${c.id}')">
      <select class="add-sel" id="cp-add-who"><option>EK</option><option>Artur</option><option>Diego</option></select>
      <button class="add-btn" onclick="cpAddTask('${c.id}')">+</button>
    </div>`;
}

function cpTaskHTML(cid,task){
  const stateCls=task.state==='done'?'st-done':task.state==='inprogress'?'st-inprogress':task.state==='blocked'?'st-blocked':'';
  const prioCls=task.state==='done'?'':`prio-${task.priority}`;
  const days=task.state==='blocked'?daysSince(task.blockedSince):0;
  const revOver=(task.revisions||0)>=2;
  return`<div class="cp-task ${stateCls} ${prioCls}">
    <button class="state-btn s-${task.state}" onclick="cycleState('${cid}','${task.id}')" title="Avanzar estado">${STATE_ICONS[task.state]}</button>
    <div class="cp-task-body">
      <div class="cp-task-text">${task.text}</div>
      ${days>0?`<div class="blocked-days" style="color:${days>=3?'var(--red)':'var(--yellow)'}">⏱ ${days}d esperando${days>=3?' · follow-up hoy':''}</div>`:''}
      ${revOver?`<div style="font-size:9px;color:var(--red);font-weight:600;margin-top:2px">⚠ ${task.revisions} rev · escalar a llamada</div>`:''}
      <div class="cp-task-meta">${whoTag(task.who)}${prioTag(task.priority)}</div>
    </div>
    <button class="rev-btn ${revOver?'over':''}" onclick="bumpRev('${cid}','${task.id}')" title="Contar revisión">rev ${task.revisions||0}</button>
  </div>`;
}

/* ══ EQUIPO ══ */
function renderEquipo(){
  const grid=document.getElementById('team-pm-grid');
  grid.innerHTML=['EK','Artur','Diego'].map(who=>{
    const tasks=state.clients.flatMap(c=>c.tasks.filter(t=>t.who===who).map(t=>({...t,cname:c.name,cid:c.id,cstatus:c.status})));
    const active=tasks.filter(t=>t.state!=='done');
    const done=tasks.filter(t=>t.state==='done');
    const n=active.length,over=n>=WIP_LIMIT;
    const clsCnt=over?'over':n>3?'warn':'ok';
    const colMap={EK:'var(--blue)',Artur:'var(--purple)',Diego:'var(--pink)'};
    return`<div class="team-pm-card" style="border-top:3px solid ${colMap[who]}">
      <div class="tpm-header">
        <div><div class="tpm-name">${who}</div><div class="tpm-role">${n} activas · ${done.length} listas${over?' · ⚠ WIP':''}</div></div>
        <div class="tpm-count ${clsCnt}">${n}</div>
      </div>
      ${over?`<div class="wip-warn">⚠ WIP elevado. Priorizar antes de agregar más.</div>`:''}
      ${active.map(t2=>{
        const days=t2.state==='blocked'?daysSince(t2.blockedSince):0;
        const tptCls=t2.state==='blocked'?'tpt-blocked':t2.state==='inprogress'?'tpt-ip':'';
        return`<div class="tpm-task ${tptCls}" onclick="cycleState('${t2.cid}','${t2.id}');renderEquipo()">
          <div class="tpm-task-text">${STATE_ICONS[t2.state]} ${t2.text}</div>
          <div class="tpm-task-sub"><span>${t2.cname}</span>${t2.state==='blocked'?`<span style="color:var(--red);font-weight:600">⊘ ${days}d</span>`:''}</div>
        </div>`;
      }).join('')}
      ${done.length?`<div class="tpm-done-section">${done.slice(0,4).map(t2=>`<div class="tpm-done-task" onclick="cycleState('${t2.cid}','${t2.id}');renderEquipo()"><div class="tpm-done-task-text">${t2.text}</div></div>`).join('')}</div>`:''}
    </div>`;
  }).join('');
}

/* ══ BLOQUEADOS ══ */
function renderBloqueados(){
  const list=document.getElementById('blocked-list');
  const bl=blockedAll();
  if(!bl.length){list.innerHTML='<div class="no-blocked">Sin bloqueos activos 🙌</div>';return;}
  list.innerHTML=bl.map(tb=>{
    const days=daysSince(tb.blockedSince),urgent=days>=3;
    return`<div class="blocked-card ${urgent?'urgent':''}">
      <div class="blocked-days-num">
        <div class="bdn-val ${urgent?'urgent':'warn'}">${days}</div>
        <div class="bdn-lbl">DÍAS</div>
      </div>
      <div class="blocked-body">
        <div class="blocked-text">${tb.text}</div>
        <div class="blocked-meta">
          <span class="blocked-client">${tb.cname}</span>
          ${whoTag(tb.who)}
          ${urgent?`<span class="urgent-badge">URGENTE · follow-up hoy</span>`:''}
        </div>
      </div>
      <button class="unblock-btn" onclick="cycleState('${tb.cid}','${tb.id}');renderBloqueados();renderKpiStrip();updateBlockedBadge()">desbloquear →</button>
    </div>`;
  }).join('');
}

function updateBlockedBadge(){
  const n=blockedAll().length;
  const badge=document.getElementById('badge-blocked');
  badge.innerHTML=n>0?`<span style="position:absolute;top:1px;right:3px;font-size:7px;color:var(--red);font-weight:700">${n}</span>`:'';
}

/* ══ STATE MUTATIONS ══ */
function cycleState(cid,tid){
  const newClients=state.clients.map(c=>c.id!==cid?c:{...c,tasks:c.tasks.map(t=>{
    if(t.id!==tid)return t;
    const next=STATE_NEXT[t.state];
    return{...t,state:next,blockedSince:next==='blocked'?new Date().toISOString():null};
  })});
  update({...state,clients:newClients});
}

function bumpRev(cid,tid){
  const newClients=state.clients.map(c=>c.id!==cid?c:{...c,tasks:c.tasks.map(t=>t.id!==tid?t:{...t,revisions:(t.revisions||0)+1})});
  update({...state,clients:newClients});
}

function cycleStatus(cid){
  const cy={green:'yellow',yellow:'red',red:'green'};
  const newClients=state.clients.map(c=>c.id!==cid?c:{...c,status:cy[c.status]});
  update({...state,clients:newClients});
}

function cpAddTask(cid){
  const inp=document.getElementById('cp-add-in');
  const who=document.getElementById('cp-add-who')?.value||'EK';
  const text=inp?.value?.trim();
  if(!text)return;
  const newClients=state.clients.map(c=>c.id!==cid?c:{...c,tasks:[...c.tasks,{id:'t'+Date.now(),text,who,state:'pending',priority:'med',revisions:0,blockedSince:null}]});
  update({...state,clients:newClients});
}

/* ══ VIEW SWITCHING ══ */
function showView(name){
  document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
  document.querySelectorAll('.ntab').forEach(b=>b.classList.remove('active'));
  document.getElementById('v-'+name)?.classList.add('active');
  document.querySelector(`[data-view="${name}"]`)?.classList.add('active');
  if(name==='clientes'){renderClientSidebar();renderClientPanel();}
  if(name==='equipo')renderEquipo();
  if(name==='bloqueados')renderBloqueados();
}

/* ══ DARK/LIGHT MODE ══ */
function toggleMode(){
  const m=state.mode==='dark'?'light':'dark';
  document.documentElement.setAttribute('data-theme',m);
  update({...state,mode:m});
}

/* ══ API KEY ══ */
function loadApiKey(){
  const key=localStorage.getItem('versiona_api_key')||'';
  const inp=document.getElementById('api-key-in');
  if(inp)inp.value=key;
  updateKeyStatus();
}
function saveApiKey(){
  const val=document.getElementById('api-key-in')?.value?.trim();
  if(val)localStorage.setItem('versiona_api_key',val);
  updateKeyStatus();
}
function updateKeyStatus(){
  const key=document.getElementById('api-key-in')?.value?.trim()||localStorage.getItem('versiona_api_key')||'';
  const el=document.getElementById('api-key-status');
  if(el){el.textContent=key?'⬤ configurada':'⬤ no configurada';el.className='api-key-status '+(key?'set':'unset');}
  updateAiSubmitBtn();
}
function getApiKey(){return localStorage.getItem('versiona_api_key')||'';}

function updateAiSubmitBtn(){
  const btn=document.getElementById('ai-submit-btn');
  if(!btn)return;
  const key=getApiKey();
  const has=!!key;
  btn.className='ai-submit '+(has?'ready':'disabled');
  btn.textContent=has?'Extraer tareas →':'Configura tu API key primero';
}

/* ══ AI EXTRACTION ══ */
async function callClaude(messages,system){
  const key=getApiKey();
  if(!key)throw new Error('Sin API key');
  const res=await fetch('https://api.anthropic.com/v1/messages',{
    method:'POST',
    headers:{'Content-Type':'application/json','x-api-key':key,'anthropic-version':'2023-06-01'},
    body:JSON.stringify({model:MODEL,max_tokens:1000,system,messages})
  });
  const data=await res.json();
  if(data.error)throw new Error(data.error.message);
  return data.content?.find(b=>b.type==='text')?.text||'';
}

async function handleExtract(){
  const key=getApiKey();
  if(!key){showError('Configura tu API key primero.');return;}
  const msg=document.getElementById('ai-textarea')?.value?.trim();
  if(!msg)return;
  const btn=document.getElementById('ai-submit-btn');
  btn.textContent='Analizando…';btn.className='ai-submit disabled';
  hideError();hidePreview();
  try{
    const cl=state.clients.map(c=>`${c.name}→${c.id}`).join(', ');
    const system=`Eres PM de Versiona, estudio creativo en México. Extrae tareas de mensajes informales.\nClientes: ${cl}\nResponde SOLO JSON array sin backticks:\n[{"text":"tarea corta","who":"EK|Artur|Diego","clientId":"id o admin","priority":"high|med|low"}]\nReglas: EK=producción/diseño/video, Artur=estrategia/propuestas/clientes, Diego=PM/edición. Si no hay cliente claro usa "admin". Extrae TODAS las tareas mencionadas.`;
    const raw=await callClaude([{role:'user',content:msg}],system);
    const tasks=JSON.parse(raw.replace(/```json|```/g,'').trim());
    if(!tasks.length){showError('No encontré tareas. Intenta con más detalle.');return;}
    aiPreviewData=tasks;
    showPreview(tasks);
  }catch(e){showError('Error: '+e.message);}
  btn.textContent='Extraer tareas →';btn.className='ai-submit ready';
}

function showPreview(tasks){
  const prev=document.getElementById('ai-preview');
  document.getElementById('aip-count').textContent=`${tasks.length} tarea${tasks.length!==1?'s':''} detectada${tasks.length!==1?'s':''}`;
  document.getElementById('aip-tasks').innerHTML=tasks.map(t=>{
    const cname=state.clients.find(c=>c.id===t.clientId)?.name||'Admin';
    return`<div class="aip-task">
      <div><div class="aip-task-text">${t.text}</div><div class="aip-task-client">${cname} · ${t.who}</div></div>
      ${prioTag(t.priority)}
    </div>`;
  }).join('');
  prev.style.display='block';
}

function confirmAI(){
  if(!aiPreviewData?.length)return;
  const clients=[...state.clients];
  aiPreviewData.forEach(t=>{
    const idx=clients.findIndex(c=>c.id===t.clientId);
    const tgt=idx>=0?idx:clients.findIndex(c=>c.id==='admin');
    if(tgt<0)return;
    clients[tgt]={...clients[tgt],tasks:[...clients[tgt].tasks,{id:'ai'+Date.now()+Math.random().toString(36).slice(2,5),text:t.text,who:t.who,state:'pending',priority:t.priority||'med',revisions:0,blockedSince:null}]};
  });
  update({...state,clients});
  document.getElementById('ai-textarea').value='';
  aiPreviewData=null;
  hidePreview();
  showView('clientes');
}

function discardAI(){aiPreviewData=null;hidePreview();}
function hidePreview(){document.getElementById('ai-preview').style.display='none';}
function showError(msg){const e=document.getElementById('ai-error');e.textContent=msg;e.style.display='block';}
function hideError(){document.getElementById('ai-error').style.display='none';}

/* ══ WHATSAPP BRIEFING ══ */
async function handleBriefing(){
  const key=getApiKey();
  if(!key){document.getElementById('wa-cards').innerHTML='<div style="color:var(--red);font-size:12px;padding:16px 0">Configura tu API key en ✦ IA primero.</div>';return;}
  const btn=document.getElementById('wa-gen-btn');
  btn.textContent='Generando…';btn.className='wa-gen-btn disabled';
  const byWho={};
  ['EK','Artur','Diego'].forEach(who=>{
    byWho[who]=state.clients.flatMap(c=>c.tasks.filter(t=>t.who===who&&t.state!=='done').map(t=>`• ${t.text} (${c.name})${t.state==='blocked'?' ⏸ esperando cliente':''}`)).join('\n')||'Sin pendientes';
  });
  const system=`Eres PM de Versiona. Genera mensajes WhatsApp por persona: cortos, directos, con personalidad. Usa emojis con criterio. Responde SOLO JSON sin backticks: {"EK":"msg","Artur":"msg","Diego":"msg"}`;
  try{
    const raw=await callClaude([{role:'user',content:`Tareas activas:\nEK:\n${byWho.EK}\n\nArtur:\n${byWho.Artur}\n\nDiego:\n${byWho.Diego}`}],system);
    briefingData=JSON.parse(raw.replace(/```json|```/g,'').trim());
    renderBriefing();
  }catch(e){document.getElementById('wa-cards').innerHTML=`<div style="color:var(--red);font-size:12px">Error: ${e.message}</div>`;}
  btn.textContent='Generar mensajes →';btn.className='wa-gen-btn ready';
}

function renderBriefing(){
  if(!briefingData)return;
  document.getElementById('wa-cards').innerHTML=['EK','Artur','Diego'].map(who=>{
    const n=wipOf(who);
    const colMap={EK:'var(--blue)',Artur:'var(--purple)',Diego:'var(--pink)'};
    return`<div class="wa-card">
      <div class="wa-card-header">
        <div class="wa-card-who">${whoTag(who)}<span class="wa-card-cnt">${n} tareas activas</span></div>
        <button class="wa-copy-btn ${copiedWho===who?'copied':''}" id="wcopy-${who}" onclick="copyBrief('${who}')">${copiedWho===who?'copiado ✓':'copiar'}</button>
      </div>
      <div class="wa-msg">${briefingData[who]||'—'}</div>
    </div>`;
  }).join('');
}

function copyBrief(who){
  navigator.clipboard.writeText(briefingData?.[who]||'');
  copiedWho=who;
  renderBriefing();
  setTimeout(()=>{copiedWho='';renderBriefing();},2000);
}

/* ══ LOGIN ══ */
const ACCESS_CODE = 'versiona2025';
const SESSION_KEY = 'versiona_auth';

function checkAuth(){
  if(sessionStorage.getItem(SESSION_KEY)!=='ok'){
    document.getElementById('login-overlay').classList.remove('hidden');
  } else {
    document.getElementById('login-overlay').classList.add('hidden');
  }
}

function attemptLogin(){
  const val = document.getElementById('lo-in').value.trim();
  const err = document.getElementById('lo-err');
  if(val === ACCESS_CODE){
    sessionStorage.setItem(SESSION_KEY,'ok');
    const overlay = document.getElementById('login-overlay');
    overlay.style.opacity='0';overlay.style.transition='opacity .3s';
    setTimeout(()=>overlay.classList.add('hidden'),300);
  } else {
    err.classList.add('show');
    document.getElementById('lo-in').value='';
    document.getElementById('lo-in').focus();
    document.querySelector('.lo-card').style.animation='shake .3s ease';
    setTimeout(()=>{document.querySelector('.lo-card').style.animation='';},350);
  }
}

/* ══ INIT ══ */
checkAuth();
load();