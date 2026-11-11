const NET={'Shared risk factors':'#fbbf24','Shared symptoms':'#22d3ee','Complication':'#f87171','Differential':'#a78bfa'};
const colorOf=t=>Object.keys(NET).find(k=>t.startsWith(k))?NET[Object.keys(NET).find(k=>t.startsWith(k))]:'#94a3b8';
const TH=[['#22d3ee','#a78bfa'],['#a78bfa','#f472b6'],['#4ade80','#22d3ee'],['#fbbf24','#fb7185'],['#fb7185','#fbbf24'],['#60a5fa','#34d399'],['#f87171','#c084fc'],['#cbd5e1','#64748b'],['#2dd4bf','#818cf8'],['#f472b6','#22d3ee']];
let S={h:[],b:[],th:0,ts:100,sy:0,fb:[],md:'dark',dna:1,gl:1,rm:0,bg:'dna'};
const SK=(()=>{try{return localStorage.getItem('daSess')?'da_u_'+localStorage.getItem('daSess'):'da'}catch(e){return 'da'}})();
try{
 const raw=localStorage.getItem(SK);
 if(raw&&raw.length<=DA.MAX_STORED_BYTES)Object.assign(S,DA.validateState(JSON.parse(raw)));
 else if(raw)console.warn('Disease Atlas: ignored oversized saved state ('+raw.length+' bytes).');
}catch(e){}
const save=()=>{try{localStorage.setItem(SK,JSON.stringify(S))}catch(e){}};
const $=s=>document.querySelector(s);let GM=null,GL=-1;const get=id=>{if(GL!==D.length){GM=new Map(D.map(d=>[String(d.id),d]));GL=D.length}return GM.get(String(id))||D.find(d=>d.id==id)};
function applyS(){if(!TH[S.th])S.th=0;const r=document.documentElement.style;S.md=S.mu||(matchMedia('(prefers-color-scheme: light)').matches?'light':'dark');const lt=S.md=='light',f=c=>lt?`color-mix(in srgb,${c} 60%,#000)`:c;document.documentElement.dataset.mode=S.md;r.setProperty('--ac',f(TH[S.th][0]));r.setProperty('--ac2',f(TH[S.th][1]));$('#mb').innerHTML=I(lt?'moon':'sun');$('#bg').value=S.bg;$('#rnd').checked=S.rnd!==0;$('#bgf').checked=S.bgf!==0;$('#dn').checked=!!S.dna;$('#gl').checked=!!S.gl;$('#rm').checked=!!S.rm;{const g=$('#gz');if(g)g.checked=!!S.gz&&!!S.uid}cv.style.display=S.dna?'':'none';document.querySelectorAll('.glow').forEach(g=>g.style.display=S.gl?'':'none');document.documentElement.classList.toggle('rm',!!S.rm);r.setProperty('--s1',S.sy?TH[S.th][0]:'#ef4444');r.setProperty('--s2',S.sy?TH[S.th][1]:'#3b82f6');document.documentElement.style.fontSize=S.ts+'%';thUp();$('#ts').value=S.ts;$('#tv').textContent=S.ts+'%';$('#sy').checked=!!S.sy}
