(() => {
  'use strict';
  /* Tu chon kich thuoc chu de moi dong tieu de vua trong khung, tranh chu bi cat.
     - Do lai chieu rong tu nhien cua dong chu (noi dung sau khi CMS gan).
     - Giam dan font-size cho den khi vua khung, hoac xuong kich thuoc toi thieu.
     - Neu van tran, cho phep xuong dong thay vi cat chu.
     - Tu chay lai khi doi kich thuoc cua so, doi theme, doi noi dung CMS. */
  const MIN_PX=20;
  const SELECTORS=[
    '.hero-title .title-line',
    '.title-line',
    '.tpa-page h1 span',
    '[data-fit-text]'
  ].join(',');
  let bases=new WeakMap();

  function baseSize(el){
    if(bases.has(el)) return bases.get(el);
    const raw=parseFloat(getComputedStyle(el).fontSize)||32;
    bases.set(el,raw);
    return raw;
  }
  function reset(el){
    /* luon doc lai co chu goc tu CSS, bo qua gia tri inline da tu co truoc do,
       neu khong thi chu se bi giu o kich thuoc nho sau khi sua lai noi dung */
    el.style.fontSize='';
    el.classList.remove('fit-wrapped');
    bases.delete(el);
    const base=parseFloat(getComputedStyle(el).fontSize)||32;
    el.style.fontSize=base+'px';
    return base;
  }
  function fits(el,avail){
    return el.scrollWidth<=avail+1;
  }
  function fitLine(el){
    if(!el.isConnected) return;
    const parent=el.parentElement;
    if(!parent||!parent.clientWidth) return;
    const base=reset(el);
    /* chu phai vua ca trong khong cha va con nam trong man hinh */
    const view=document.documentElement.clientWidth;
    const left=el.getBoundingClientRect().left;
    const avail=Math.max(120,Math.min(parent.clientWidth,view-left-14));
    let size=base;
    let guard=0;
    while(!fits(el,avail)&&size>MIN_PX&&guard<120){
      size=Math.max(MIN_PX,size-1);
      el.style.fontSize=size+'px';
      guard++;
    }
    if(!fits(el,avail)&&/\s/.test(el.textContent||'')){
      el.classList.add('fit-wrapped');
    }
  }
  function targets(){
    const list=[...document.querySelectorAll(SELECTORS)];
    return list.filter(el=>!list.some(other=>other!==el&&other.contains(el)));
  }
  function fitAll(){
    bases=new WeakMap();
    targets().forEach(fitLine);
  }
  let frame=0;
  let fallback=0;
  let settle=[];
  function schedule(){
    /* chay lai them vai lan de bat truong hop font hay noi dung CMS vua gan xong */
    settle.forEach(clearTimeout);
    settle=[setTimeout(fitAll,120),setTimeout(fitAll,420),setTimeout(fitAll,1200)];
    if(frame||fallback) return;
    frame=requestAnimationFrame(()=>{frame=0;fitAll();});
    /* tab phu co the khong chay requestAnimationFrame, nen co them timer du phong */
    fallback=setTimeout(()=>{fallback=0;if(frame){cancelAnimationFrame(frame);frame=0;}fitAll();},80);
  }
  window.addEventListener('resize',schedule,{passive:true});
  window.addEventListener('unite:content-updated',schedule);
  window.addEventListener('unite:resize-chrome',schedule);
  if(document.fonts?.ready) document.fonts.ready.then(schedule).catch(()=>{});
  if('ResizeObserver' in window){
    let first=true;
    const observer=new ResizeObserver(()=>{if(first){first=false;return;}schedule();});
    observer.observe(document.body);
  }
  document.addEventListener('DOMContentLoaded',schedule);
  if(document.readyState!=='loading') schedule();
  window.UNITE_TEXT_FIT={fitAll,fitLine,schedule};
})();