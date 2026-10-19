/* Studio UI implementation: display-only binding. No simulation or input mutation. */
const studioUi = (() => {
  const strings = {
    title:'白眉老头', subtitle:'忍者雨', inkSeal:'墨', start:'入 江 湖', retry:'再 战 一 回',
    killUnit:'斩', life:'性 命', charge:'踏空蓄势', ultimate:'双按·绝杀',
    touchHint:'轻点左右半屏踏空 · 近敌自动出剑', tutorial:'同时按住左右半屏',
    resultCaption:'此 回 江 湖', next:'距「{rank}」还差 {n} 斩', highest:'已达最高称号',
    tier:['一重','二重','三重','四重'], ready:'绝杀就绪', lifeLabel:'生命 {n} / 3'
  };
  const ranks=[[0,'无名老叟'],[10,'略懂拳脚'],[25,'江湖老手'],[50,'白眉剑客'],[100,'一代宗师'],[200,'剑气纵横'],[350,'天下无双'],[500,'陆地剑仙'],[1000,'万剑归宗']];
  const ids=['dockKills','dockReady','dockFill','dockProgress','statusDock','studioLives','studioTier','studioRankToast','studioResult','studioResultRank','studioResultKills','studioResultNext'];
  const els=Object.fromEntries(ids.map(id=>[id,document.getElementById(id)]));
  const lives=[...els.studioLives.children];
  const cache={}; let rankIndex=0, lastCount=0, toastUntil=0, priorDead=false;
  const text=(id,value)=>{const s=String(value);if(cache[id]!==s){els[id].textContent=s;cache[id]=s}};
  const format=(key,params)=>Object.entries(params).reduce((s,[k,v])=>s.replace('{'+k+'}',v),strings[key]);
  document.querySelectorAll('[data-ui-text]').forEach(el=>{el.textContent=strings[el.dataset.uiText]||''});
  document.getElementById('studioRetry').addEventListener('click',()=>document.dispatchEvent(new CustomEvent('studio-command',{detail:{type:'retry'}})));
  function sync(state,now=performance.now()){
    const {count,kicks,hp,tier,ultReady,dead,intro}=state;
    const active=intro==='play'||intro==='tutorial';
    text('dockKills',count);text('studioTier',strings.tier[Math.max(0,Math.min(3,tier-1))]);
    text('dockProgress',ultReady?strings.ready:`${Math.min(12,kicks)} / 12`);
    const width=`${Math.min(100,kicks/12*100)}%`;
    if(cache.width!==width){els.dockFill.style.width=width;cache.width=width}
    if(cache.hp!==hp){lives.forEach((el,i)=>el.classList.toggle('lost',i>=hp));els.studioLives.setAttribute('aria-label',format('lifeLabel',{n:hp}));cache.hp=hp}
    if(cache.ready!==ultReady){els.statusDock.classList.toggle('ready',ultReady);els.dockReady.style.display=ultReady?'block':'none';cache.ready=ultReady}
    let idx=0;for(let i=1;i<ranks.length;i++)if(count>=ranks[i][0])idx=i;
    if(count<lastCount||intro==='title'){rankIndex=idx;toastUntil=0}
    if(idx>rankIndex&&intro==='play'&&!dead){text('studioRankToast',ranks[idx][1]);toastUntil=now+2400}
    rankIndex=idx;lastCount=count;
    els.studioRankToast.classList.toggle('visible',active&&!dead&&now<toastUntil);
    const showResult=dead&&intro==='play';els.studioResult.hidden=!showResult;
    if(showResult){text('studioResultRank',ranks[idx][1]);text('studioResultKills',count);text('studioResultNext',idx+1<ranks.length?format('next',{rank:ranks[idx+1][1],n:ranks[idx+1][0]-count}):strings.highest)}
    if(showResult&&!priorDead){document.getElementById('studioRetry').focus({preventScroll:true})}
    priorDead=showResult;
  }
  return Object.freeze({sync,strings,ranks});
})();
