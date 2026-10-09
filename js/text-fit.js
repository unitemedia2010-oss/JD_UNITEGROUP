(() => {
  'use strict';
  /* Tu chon kich thuoc chu cho tung dong tieu de de chu luon vua khung, khong bao gio bi cat.
     - Do chieu rong chu that bang Range (do chinh xac hon scrollWidth, co ca pho chu nhoi ra ngoai).
     - Giam dan font-size cho den khi vua khong cha va vua man hinh.
     - Xuong toi kich thuoc toi thieu thi cho phep xuong dong thay vi cat chu.
     - Chay lai nhieu lan sau khi font / noi dung CMS nap xong, va moi khi doi kich thuoc cua so. */
  const MIN_PX=20;
  const GUTTER=18;
  const SELECTORS=[
    '.hero-title .title-line',
    '.title-line',
    '.tpa-page h1 span',
    '[data-fit-text]'
  ].join(',');
  const range=document.createRange();

  function textWidth(el){
    range.selectNodeContents(el);
    const rects=[...range.getClientRects()].filter(r=>r.height>1&&r.width>0);
    /* thay vi cong don tat ca dong se lam chu bi co qua nho,
lay do rong cua dong dai nhat - do la thu co quyet dinh */
    return rects.reduce((max,r)=>Math.max(max,r.width),0);
  }
  function fits(el,avail){
    return textWidth(el)<=avail+0.5;
  }
  function reset(el){
    /* doc lai co chu goc tu CSS, bo qua gia tri inline da tu co truoc do,
       neu khong thi chu se bi kieu o kich thuoc nho sau khi sua lai noi dung */
    el.style.fontSize='';
    el.classList.remove('fit-wrapped');
    const base=parseFloat(getComputedStyle(el).fontSize)||32;
    el.style.fontSize=base+'px';
    return base;
  }
  function fitLine(el){
    if(!el.isConnected||!el.textContent.trim()) return;
    const parent=el.parentElement;
    if(!parent||!parent.clientWidth) return;
    const base=reset(el);
    const view=document.documentElement.clientWidth||window.innerWidth;
    const left=el.getBoundingClientRect().left;
    const avail=Math.max(140,Math.min(parent.clientWidth,view-left-GUTTER));
    /* giu o co chu de doc duoc, khong co xuong qua nho; thua se xuong dong thay vi cat */
    const floor=Math.max(MIN_PX,Math.round(base*0.55));
    let size=base;
    let guard=0;
    while(!fits(el,avail)&&size>floor&&guard<160){
      size=Math.max(floor,size-1);
      el.style.fontSize=size+'px';
      guard++;
    }
    if(!fits(el,avail)&&/\s/.test(el.textContent||'')){
      el.classList.add('fit-wrapped');
      let guard2=0;
      while(!fits(el,avail)&&size>MIN_PX&&guard2<160){
        size=Math.max(MIN_PX,size-1);
        el.style.fontSize=size+'px';
        guard2++;
      }
    }
  }
  function targets(){
    const list=[...document.querySelectorAll(SELECTORS)];
    return list.filter(el=>!list.some(other=>other!==el&&other.contains(el)));
  }
  function fitAll(){
    targets().forEach(fitLine);
  }
  let frame=0;
  let fallback=0;
  let settle=[];
  function schedule(){
    /* chay lai them vai lan: font web, anh, va noi dung CMS thuong vien xong sau */
    settle.forEach(clearTimeout);
    settle=[setTimeout(fitAll,120),setTimeout(fitAll,450),setTimeout(fitAll,1200),setTimeout(fitAll,2600)];
    if(frame||fallback) return;
    frame=requestAnimationFrame(()=>{frame=0;fitAll();});
    /* tab phu co the khong chay requestAnimationFrame, nen co them timer du phong */
    fallback=setTimeout(()=>{fallback=0;if(frame){cancelAnimationFrame(frame);frame=0;}fitAll();},80);
  }
  window.addEventListener('resize',schedule,{passive:true});
  window.addEventListener('orientationchange',schedule,{passive:true});
  window.addEventListener('unite:content-updated',schedule);
  window.addEventListener('unite:resize-chrome',schedule);
  window.addEventListener('load',schedule,{once:true});
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