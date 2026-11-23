/*DATA-END*/(()=>{const BL=/^(zzz)$/i,st={};D.forEach(d=>{d.ddx=d.ddx.filter(x=>!/^(normal variant|pregnancy|medication side effects|infection|trauma)( \u2014 |$)/i.test(x))});Object.assign(ALI,{'anxiety':'gad','anxiety disorder':'gad','foreign body':'fbairway','foreign body aspiration':'fbairway','acoustic neuroma':'vestschwannoma','pharyngitis':'pharyngitis','distal radius fracture':'colles','colles fracture':'colles','earwax':'cerumen','placenta praevia':'praevia','spontaneous abortion':'miscarriage','abortion':'inducedab','intersex':'intersex','gender dysphoria':'genderinc','postpartum haemorrhage':'pph','preterm labour':'pretermlabour','epidermoid cyst':'sebcyst',"athlete's heart":'athleteheart','goodpasture syndrome':'goodpasture','urethritis (sti)':'urethritis','ekbom syndrome':'rls'}),sl=s=>s.toLowerCase().replace(/[^a-z0-9]+/g,'');D.slice().forEach(d=>d.ddx.forEach(x=>{const q=x.split(' — '),n=q[0].trim();if(!n||BL.test(n)||findD(n))return;const k=sl(n);(st[k]=st[k]||{n,sys:d.sys,p:[]}).p.push([d.id,q[1]||''])}));Object.entries(st).forEach(([k,s])=>{const o=get(s.p[0][0]),id='x_'+k;INV[id]=[[o.org],[]];D.push({id,n:s.n,alt:'',sys:s.sys,org:o.org,sens:'General',ov:s.n+' is a distinct condition that clinicians need to tell apart from '+s.p.map(p=>get(p[0]).n).join(', ')+'. The comparison below summarises how it differs; its full clinical profile is still being written.',et:[],rf:[],sy:[],sg:[],inv:[],dx:'',ddx:[],tx:[],cx:[],pg:'',rel:s.p.map(p=>[p[0],'Differential']),ev:{},ref:[],lean:1,stub:1,p:s.p})})})();
D.sort((a,b)=>RARE.includes(a.id)-RARE.includes(b.id));
function libR(f,fresh){const L=$('#lib');if(!L)return;f=f||'All';$('#chips').innerHTML=['All',...new Set(D.map(d=>d.sys)),'Rare'].map(s=>`<button class='${s==f?'on':''}' onclick="libR('${s}',1)">${s}</button>`).join('');const l=D.filter(d=>f=='All'||(f=='Rare'?RARE.includes(d.id):d.sys==f));$('#lc').textContent='('+l.length+')';L.innerHTML=l.map(d=>`<div class='card dz ${fresh?'in':''}' onclick="go('d/${d.id}')"><h3>${dic(d)} ${d.n}${RARE.includes(d.id)?" <span class='badge'>Rare</span>":''}</h3><span class='note'>${d.sys}</span><br>${d.ov}</div>`).join('');if(!fresh)obs()}
$('#dice2').innerHTML=I('dice')+' Random disease';$('#hb').innerHTML=I('library');$('#dt').innerHTML=I('chev');$('#dice2').onclick=rnd;$('#dt').onclick=()=>$('#dr').classList.toggle('open');$('#lq').oninput=DA.debounce(renderL,150);
let orgT=0;
// DNA
const cv=$('#dna'),cx=cv.getContext('2d');let t=0;
function size(){cv.width=innerWidth;cv.height=innerHeight}size();addEventListener('resize',DA.debounce(size,160));
function dna(){cx.clearRect(0,0,cv.width,cv.height);if(BGK!='dna'){drawBG();t+=S.rm?0:.012;DA.motion.frame(dna,30,{pauseOnReduced:true});return}const c1=TH[S.th][0],c2=TH[S.th][1];
 [.2,.8].forEach(fx=>{const x0=cv.width*fx;cx.globalAlpha=.16;for(let y=0;y<cv.height;y+=14){const a=y/90+t,x1=x0+Math.sin(a)*34,x2=x0-Math.sin(a)*34;cx.strokeStyle=c2;cx.beginPath();cx.moveTo(x1,y);cx.lineTo(x2,y);cx.stroke();cx.fillStyle=c1;cx.beginPath();cx.arc(x1,y,3,0,7);cx.fill();cx.fillStyle=c2;cx.beginPath();cx.arc(x2,y,3,0,7);cx.fill()}});
 t+=S.rm?0:.012;DA.motion.frame(dna,30,{pauseOnReduced:true})}

// homepage intro art: slide through every organ/system logo at 0.2 s, finish on the
// Disease Atlas logo, hold it for 3 s, then reshuffle and repeat.
let LOGO_ID=0;
function logoCycle(){
 const el=document.getElementById('ilog');if(!el)return;
 const id=++LOGO_ID,SITE=el.innerHTML;
 const KEYS=[...new Set([...Object.values(ORGLOGO||{}),...Object.keys(CATART||{}),...Object.values(SUBI||{})])]
   .filter(k=>k&&k!='site').filter(k=>{try{return CAS(k,210)!==''}catch(e){return 0}});
 const wait=(fn,ms)=>setTimeout(()=>{if(LOGO_ID===id&&document.getElementById('ilog'))fn()},ms);
 const show=h=>{el.innerHTML=h;if(el.animate)el.animate([{transform:'translateX(22px)',opacity:0},{transform:'none',opacity:1}],{duration:180,easing:'ease-out'})};
 let deck=[];
 const step=()=>{
  if(!deck.length){show(SITE);wait(()=>{deck=[...KEYS].sort(()=>Math.random()-.5);step()},3000);return}
  const k=deck.shift();
  show(CAS(k,ORGHUE[k]!=null?ORGHUE[k]:210));
  wait(step,200);
 };
 step();
}

// 3D immune/blood cells (SHAPES + sp/el/arc/limb/FIB are global consts from 17-organisms-3d.js)
Object.assign(SHAPES,{
 wbc:()=>({E:[sp(0,0,0,30),sp(-10,-2,3,13,1),sp(9,4,0,12,1),sp(0,12,-6,11,1),...FIB(12).map(p=>sp(p[0]*20,p[1]*20,p[2]*20,2.5,1))],L:[]}),
 antibody:()=>({E:[sp(0,6,0,7,1),...arc(6,i=>el(0,24-i*5,0,4.5,3,3,1)),...limb([0,2,0],[-17,-20,0],4,6,6,1),...limb([0,2,0],[17,-20,0],4,6,6,1),sp(-17,-22,0,7,1),sp(17,-22,0,7,1)],L:[]}),
 rbc:()=>({E:[...arc(18,i=>{const a=i*.35;return el(Math.cos(a)*18,Math.sin(a)*18,0,10,10,7)}),el(0,0,0,14,14,3)],L:[]}),
 platelet:()=>({E:[sp(0,0,0,10),sp(8,4,2,6,1),sp(-7,-3,-2,5,1)],L:[]})
});
function cell3B(d){const s=d.sys||'';
 if(s=='Immunology')return `<div class='o3'><h3>${I('microbe')} Immune cells (3D)</h3><div class='o3box'><canvas class='oc' data-k='h' data-t='wbc' width='420' height='280'></canvas></div><div class='o3box'><canvas class='oc' data-k='h' data-t='antibody' width='420' height='280'></canvas></div><p class='note'>White blood cell with its lobed nucleus, and an antibody: the cells and molecules behind immune reactions. Drag to rotate.</p></div>`;
 if(s=='Haematology')return `<div class='o3'><h3>${I('drop')} Blood cell (3D)</h3><div class='o3box'><canvas class='oc' data-k='h' data-t='rbc' width='420' height='280'></canvas></div><p class='note'>Red blood cell: the biconcave disc that carries oxygen. Drag to rotate.</p></div>`;
 return '';}

// cursor tooltip: hovering any logo/icon shows its name next to the cursor
(()=>{const tip=document.createElement('div');tip.id='logoTip';document.body.appendChild(tip);const name=el=>{let t=el.getAttribute('aria-label')||el.getAttribute('title')||el.dataset.tip;if(t)return t;const sw=el.closest('[title],[aria-label],[data-tip],[data-o],[data-org]');if(sw){t=sw.getAttribute('title')||sw.getAttribute('aria-label')||(ORGLOGO[sw.dataset.o]&&OL[sw.dataset.o])||(OL[sw.dataset.org]||sw.dataset.org);if(t)return t}const tt=el.querySelectorAll&&el.querySelectorAll('title').length>1?null:(el.querySelector('title')||el.closest('[data-k]')?.querySelector('title'));return tt?tt.textContent:''};document.addEventListener('mouseover',e=>{const hit=e.target.closest('svg,.ic,.catart,[data-tip],[data-o],[data-org]')||((e.target.querySelector&&e.target.querySelector('svg'))?e.target:null);if(!hit){tip.style.display='none';return}const n=name(hit)||(()=>{const p=e.target.closest&&e.target.closest('svg path');if(!p)return '';const t=p.querySelector('title');return (t&&t.textContent)||p.dataset.n||p.dataset.k||''})();if(!n){tip.style.display='none';return}tip.textContent=n;tip.style.display='block'});document.addEventListener('mousemove',e=>{if(tip.style.display!='block')return;tip.style.left=Math.min(e.clientX+14,innerWidth-tip.offsetWidth-6)+'px';tip.style.top=(e.clientY+18)+'px'})})();