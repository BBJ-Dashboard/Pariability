'use strict';
const $=id=>document.getElementById(id);
const RED=new Set([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]);
const WHEEL=[0,32,15,19,4,21,2,25,17,34,6,27,13,36,11,30,8,23,10,5,24,16,33,1,20,14,31,9,22,18,29,7,28,12,35,3,26];
const VOISINS=new Set([22,18,29,7,28,12,35,3,26,0,32,15,19,4,21,2,25]);
const TIERS=new Set([27,13,36,11,30,8,23,10,5,24,16,33]);
const ORPHELINS=new Set([1,20,14,31,9,17,34,6]);
const safe=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pct=(v,n)=>n?`${(100*v/n).toFixed(1)} %`:'—';
const navButtons=[...document.querySelectorAll('[data-view]')];
navButtons.forEach(b=>b.addEventListener('click',()=>{navButtons.forEach(x=>x.classList.toggle('active',x===b));document.querySelectorAll('.view').forEach(v=>v.classList.toggle('active',v.id===b.dataset.view));}));
function stat(label,value,sub=''){return `<div class="stat"><small>${safe(label)}</small><b>${safe(value)}</b><small>${safe(sub)}</small></div>`}
// Sports: public API, no hardcoded credentials, no fabricated odds.
const API='https://www.thesportsdb.com/api/v1/json/3/';
let sportEvents=[];
function normalizedEvents(json){return (json.events||[]).filter(e=>e&&e.strHomeTeam&&e.strAwayTeam)}
async function fetchJson(url){const ctrl=new AbortController(),t=setTimeout(()=>ctrl.abort(),12000);try{const r=await fetch(url,{signal:ctrl.signal});if(!r.ok)throw Error('HTTP '+r.status);return await r.json()}finally{clearTimeout(t)}}
async function loadSports(){const league=$('league').value,mode=$('mode').value;$('sportStatus').textContent='Connexion au fournisseur sportif…';$('matches').innerHTML='';$('tickets').innerHTML='';$('sportStats').innerHTML='';$('loadSports').disabled=true;
try{const endpoint=mode==='next'?'eventsnextleague.php':'eventspastleague.php';const data=await fetchJson(`${API}${endpoint}?id=${encodeURIComponent(league)}`);sportEvents=normalizedEvents(data);if(!sportEvents.length){$('sportStatus').textContent='Aucun match disponible pour cette compétition et cette période dans la source publique.';return;}
$('sportStatus').textContent=`${sportEvents.length} événement(s) reçus depuis TheSportsDB. Horaires UTC affichés dans votre fuseau local.`;
$('sportStats').innerHTML=stat('Événements',sportEvents.length)+stat('Compétition', $('league').selectedOptions[0].textContent.split('·').pop().trim())+stat('Données','En ligne')+stat('Cotes','Non fournies');
$('matches').innerHTML=sportEvents.slice(0,30).map(e=>{const d=e.dateEvent?new Date(e.dateEvent+'T'+(e.strTime||'00:00:00').replace(/Z$/,'')+'Z'):null;const when=d&&!isNaN(d)?d.toLocaleString('fr-FR',{dateStyle:'medium',timeStyle:'short'}):'Date inconnue';const score=e.intHomeScore!==null&&e.intAwayScore!==null?` · ${safe(e.intHomeScore)}–${safe(e.intAwayScore)}`:'';return `<article class="match"><small>${safe(when)} · ${safe(e.strLeague||'')}</small><strong>${safe(e.strHomeTeam)} — ${safe(e.strAwayTeam)}</strong><small>${safe(e.strStatus||'Calendrier')}${score}</small></article>`}).join('');
renderTickets(mode,league);
}catch(e){$('sportStatus').textContent='Connexion impossible : '+(e.name==='AbortError'?'délai dépassé':e.message)+'. Vérifiez Internet, la disponibilité de l’API et réessayez.';}finally{$('loadSports').disabled=false}}
async function renderTickets(mode,league){const profiles=['Prudent','Équilibré','Ambitieux','Combiné'];$('tickets').innerHTML=profiles.map(p=>`<article class="ticket"><h4>${p}</h4><p>Analyse en cours des résultats historiques…</p></article>`).join('');
try{const data=await fetchJson(`${API}eventspastleague.php?id=${encodeURIComponent(league)}`);const history=normalizedEvents(data).filter(e=>e.intHomeScore!==null&&e.intAwayScore!==null&&Number.isFinite(+e.intHomeScore)&&Number.isFinite(+e.intAwayScore));const n=history.length;
const wins=history.filter(e=>+e.intHomeScore>+e.intAwayScore).length,draws=history.filter(e=>+e.intHomeScore===+e.intAwayScore).length,away=n-wins-draws;
const groups=[['Prudent',n?`Domicile ou nul : ${pct(wins+draws,n)}`:'Historique insuffisant'],['Équilibré',n?`Victoire domicile : ${pct(wins,n)}`:'Historique insuffisant'],['Ambitieux',n?`Victoire extérieur : ${pct(away,n)}`:'Historique insuffisant'],['Combiné',n?`Match nul : ${pct(draws,n)}`:'Historique insuffisant']];
$('tickets').innerHTML=groups.map(([p,v])=>`<article class="ticket"><h4>${p}</h4><p>${safe(v)}</p><small>${n} résultats de la ligue · fréquences historiques, non des pronostics de matchs individuels. Ticket non validé sans cotes.</small></article>`).join('');
}catch(e){$('tickets').innerHTML='<div class="notice">Historique sportif indisponible. Aucun ticket n’est calculé.</div>'}}
$('loadSports').addEventListener('click',loadSports);
function parseSequence(raw){const str=raw.trim();if(!str)return[];const tokens=str.split(/[\s,;]+/).filter(Boolean);if(tokens.length>500)throw Error('Limite de 500 tirages. Conservez les 500 derniers résultats.');const nums=tokens.map(x=>{if(!/^\d{1,2}$/.test(x))throw Error(`Valeur invalide : « ${x.slice(0,20)} ». Uniquement les entiers de 0 à 36.`);const n=Number(x);if(n>36)throw Error(`Numéro hors plage : ${n}`);return n});return nums}
let values=[];
function sync(){try{values=parseSequence($('sequence').value);$('rouletteError').textContent='';$('countBadge').textContent=`${values.length} / 500`;return true}catch(e){$('rouletteError').textContent=e.message;return false}}
$('sequence').addEventListener('input',()=>{if(sync())localStorage.setItem('pariability-roulette',values.join(', '))});
$('file').addEventListener('change',async e=>{const f=e.target.files[0];if(!f)return;if(f.size>100000){$('rouletteError').textContent='Fichier trop volumineux.';return}const text=await f.text();$('sequence').value=text;if(sync()){localStorage.setItem('pariability-roulette',values.join(', '));analyze()}e.target.value=''});
$('importBtn').addEventListener('click',()=>$('file').click());
$('clear').addEventListener('click',()=>{if(!confirm('Effacer l’historique enregistré sur cet appareil ?'))return;$('sequence').value='';localStorage.removeItem('pariability-roulette');$('analysisArea').hidden=true;sync()});
$('addNumber').addEventListener('click',()=>{const raw=prompt('Dernier numéro sorti (0 à 36) :');if(raw===null)return;if(!/^\d{1,2}$/.test(raw.trim())||+raw>36){$('rouletteError').textContent='Saisissez un numéro entier entre 0 et 36.';return}if(!sync())return;values=[...values,+raw].slice(-500);$('sequence').value=values.join(', ');localStorage.setItem('pariability-roulette',$('sequence').value);analyze()});
function zScore(k,n,p){const variance=n*p*(1-p);return variance>0?(k-n*p)/Math.sqrt(variance):0}
function bet(name,fn,p,payout){const k=windowValues.filter(fn).length,n=windowValues.length,z=zScore(k,n,p);return {name,k,n,p,z,net:k*payout-(n-k)}}
let windowValues=[];
function color(n){return n===0?'green':RED.has(n)?'red':'black'}
function renderBar(label,k,n,cls){return `<div class="barrow"><span>${safe(label)}</span><div class="bartrack"><div class="barfill ${cls}" style="width:${n?100*k/n:0}%"></div></div><b>${pct(k,n)}</b></div>`}
function analyze(){if(!sync()||!values.length){$('rouletteError').textContent=$('rouletteError').textContent||'Ajoutez au moins un tirage.';return}windowValues=values.slice(-Number($('window').value));const v=windowValues,n=v.length,last=values[values.length-1];$('analysisArea').hidden=false;
$('rouletteStats').innerHTML=stat('Tirages étudiés',n,`${values.length} enregistrés`)+stat('Dernier numéro',last,`Couleur : ${color(last)}`)+stat('Zéros observés',v.filter(x=>x===0).length,`Attendu : ${pct(1,37)}`)+stat('Numéros distincts',new Set(v).size,'Sur 37');
const bets=[bet('Rouge',x=>RED.has(x),18/37,1),bet('Noir',x=>x!==0&&!RED.has(x),18/37,1),bet('Pair',x=>x!==0&&x%2===0,18/37,1),bet('Impair',x=>x%2===1,18/37,1),bet('1–18',x=>x>=1&&x<=18,18/37,1),bet('19–36',x=>x>=19,18/37,1),...Array.from({length:3},(_,i)=>bet(`Douzaine ${i+1}`,x=>x>=i*12+1&&x<=(i+1)*12,12/37,2)),...Array.from({length:3},(_,i)=>bet(`Colonne ${i+1}`,x=>x>0&&(x-1)%3===i,12/37,2)),bet('Voisins du zéro (17)',x=>VOISINS.has(x),17/37,37/17-1),bet('Tiers du cylindre (12)',x=>TIERS.has(x),12/37,37/12-1),bet('Orphelins (8)',x=>ORPHELINS.has(x),8/37,37/8-1)];
// A descriptive ranking, not a forecast: no selection of the highest observed z as a 'next-bet' edge.
const ordered=[...bets].sort((a,b)=>b.z-a.z);$('ranking').innerHTML=ordered.map((b,i)=>`<tr class="${i===0?'best':''}"><td>${safe(b.name)}${i===0?' · écart observé max':''}</td><td>${pct(b.k,n)}</td><td>${pct(b.p*100,100)}</td><td>${b.z.toFixed(2)}</td><td>${b.net.toFixed(1)} u.</td></tr>`).join('');
$('colorBars').innerHTML=renderBar('Rouge',v.filter(x=>RED.has(x)).length,n,'red')+renderBar('Noir',v.filter(x=>x!==0&&!RED.has(x)).length,n,'black')+renderBar('Zéro',v.filter(x=>x===0).length,n,'green');
$('parityBars').innerHTML=renderBar('Pair',v.filter(x=>x!==0&&x%2===0).length,n,'')+renderBar('Impair',v.filter(x=>x%2===1).length,n,'')+renderBar('1–18',v.filter(x=>x>=1&&x<=18).length,n,'')+renderBar('19–36',v.filter(x=>x>=19).length,n,'');
const counts=Array.from({length:37},(_,x)=>({x,k:v.filter(y=>y===x).length,delay:v.lastIndexOf(x)<0?n:n-1-v.lastIndexOf(x)}));const numHtml=a=>a.map(o=>`<span class="num ${color(o.x)}"><b>${o.x}</b><small>${o.k!==undefined?o.k+' fois':o.delay+' tirages'}</small></span>`).join('');$('topNumbers').innerHTML=numHtml([...counts].sort((a,b)=>b.k-a.k||a.x-b.x).slice(0,10));$('lateNumbers').innerHTML=[...counts].sort((a,b)=>b.delay-a.delay||a.x-b.x).slice(0,10).map(o=>`<span class="num ${color(o.x)}"><b>${o.x}</b><small>${o.delay} tirages</small></span>`).join('');
$('zones').innerHTML=[['Voisins du zéro',VOISINS],['Tiers du cylindre',TIERS],['Orphelins',ORPHELINS]].map(([name,set])=>{const k=v.filter(x=>set.has(x)).length;return `<div class="zone"><strong>${name} · ${set.size} numéros</strong>${renderBar('Observé',k,n,'')}<small>Théorique : ${pct(set.size,37)} · z = ${zScore(k,n,set.size/37).toFixed(2)}</small></div>`}).join('');
const first=v.slice(0,Math.floor(n/2)),second=v.slice(Math.floor(n/2));const groups=[['Rouge',x=>RED.has(x)],['Noir',x=>x!==0&&!RED.has(x)],['Pair',x=>x!==0&&x%2===0],['Impair',x=>x%2===1],['Zéro',x=>x===0]];
$('stability').innerHTML=`<div class="tablewrap"><table><thead><tr><th>Choix</th><th>Première moitié</th><th>Deuxième moitié</th><th>Variation</th></tr></thead><tbody>${groups.map(([name,fn])=>{const a=first.filter(fn).length/Math.max(1,first.length),b=second.filter(fn).length/Math.max(1,second.length);return `<tr><td>${name}</td><td>${(100*a).toFixed(1)} %</td><td>${(100*b).toFixed(1)} %</td><td>${((b-a)*100).toFixed(1)} pts</td></tr>`}).join('')}</tbody></table></div>`;
}
$('analyze').addEventListener('click',analyze);$('window').addEventListener('change',()=>{if(values.length)analyze()});
try{$('sequence').value=localStorage.getItem('pariability-roulette')||'';if(sync()&&values.length)analyze()}catch(e){console.warn('Local storage unavailable',e)}
// Load the default competition on first visit; manual refresh remains available.
loadSports();
