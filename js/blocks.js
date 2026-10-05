(() => {
  'use strict';
  const definitions = [
    {key:'highlights',label:'Điểm nổi bật',selector:'.hero-highlights',item:':scope > span',fields:[['text','Nội dung','',true]]},
    {key:'roles',label:'Vị trí tuyển dụng',selector:'.role-list',item:':scope > span',fields:[['text','Tên vị trí','',true]]},
    {key:'facts',label:'Thông tin nhanh',selector:'.hero-facts',item:':scope > div',fields:[['label','Nhãn','span'],['value','Nội dung','strong']]},
    {key:'metrics',label:'Chỉ số nổi bật',selector:'.hero-metrics',item:':scope > div',fields:[['value','Dòng lớn','b'],['label','Dòng nhỏ','span']]},
    {key:'values',label:'Các thẻ lý do 01–04',selector:'.value-grid',item:':scope > article',fields:[['number','Số thứ tự','span'],['title','Tiêu đề','h3'],['description','Mô tả','p']]},
    {key:'quiz',label:'Câu hỏi tự đánh giá',selector:'#quizOptions',item:':scope > button',fields:[['text','Câu hỏi','']]},
    {key:'tasks',label:'Các bước công việc',selector:'.timeline',item:':scope > article',fields:[['number','Số thứ tự','time'],['title','Tiêu đề','h3'],['description','Mô tả','p']]},
    {key:'journey',label:'Các nấc lộ trình',selector:'.journey-track',item:':scope > .journey-step',fields:[['number','Số thứ tự','em'],['title','Tên vai trò','strong']]},
    {key:'faq',label:'Câu hỏi thường gặp',selector:'.faq-list',item:':scope > details',fields:[['question','Câu hỏi','summary'],['answer','Câu trả lời','p']]},
    {key:'office',label:'Điểm nổi bật văn phòng',selector:'.office-highlights',item:':scope > span',fields:[['text','Nội dung','']]},
    {key:'areas',label:'Lựa chọn khu vực',selector:'select[name="area"]',item:':scope > option',fields:[['text','Khu vực','']]},
    {key:'types',label:'Lựa chọn hình thức',selector:'select[name="type"]',item:':scope > option',fields:[['text','Hình thức','']]}
  ];
  const byKey=Object.fromEntries(definitions.map(def=>[def.key,def]));
  const contentKey=key=>'blocks_'+key;
  const ownText=el=>[...el.childNodes].filter(node=>node.nodeType===3).map(node=>node.textContent).join(' ').trim();
  const child=(doc,tag,text,className)=>{
    const el=doc.createElement(tag);
    el.textContent=String(text??'');
    if(className) el.className=className;
    return el;
  };
  function container(doc,key){return doc.querySelector('[data-cms-blocks="'+key+'"]');}
  function extract(doc,key){
    const def=byKey[key],root=container(doc,key);
    if(!def||!root) return [];
    return [...root.querySelectorAll(def.item)].map(el=>{
      const row={};
      def.fields.forEach(([name,,selector,direct])=>{
        const target=selector?el.querySelector(selector):el;
        row[name]=target?(direct?ownText(target):target.textContent.trim()):'';
      });
      return row;
    });
  }
  function parse(value,key){
    try{
      const rows=JSON.parse(value);
      const fields=byKey[key]?.fields.map(field=>field[0])||[];
      if(!Array.isArray(rows)||rows.length>20) return null;
      if(!rows.every(row=>row&&typeof row==='object'&&fields.every(field=>typeof row[field]==='string'&&row[field].length<=500))) return null;
      return rows;
    }catch(_){return null;}
  }
  function makeItem(doc,key,row,index){
    let el;
    const add=(parent,tag,value,className)=>parent.appendChild(child(doc,tag,value,className));
    if(key==='highlights'){
      el=doc.createElement('span');const icon=add(el,'i','✓');icon.setAttribute('aria-hidden','true');el.appendChild(doc.createTextNode(row.text));
    }else if(key==='roles'){
      el=doc.createElement('span');if(index===0) el.className='active';add(el,'i','');el.appendChild(doc.createTextNode(row.text));
    }else if(key==='facts'){
      el=doc.createElement('div');add(el,'span',row.label);add(el,'strong',row.value);
    }else if(key==='metrics'){
      el=doc.createElement('div');add(el,'b',row.value);add(el,'span',row.label);
    }else if(key==='values'){
      el=doc.createElement('article');el.className='value-card';add(el,'span',row.number);add(el,'h3',row.title);add(el,'p',row.description);
    }else if(key==='quiz'){
      el=child(doc,'button',row.text);el.type='button';
    }else if(key==='tasks'){
      el=doc.createElement('article');add(el,'time',row.number);const box=doc.createElement('div');add(box,'h3',row.title);add(box,'p',row.description);el.appendChild(box);
    }else if(key==='journey'){
      el=doc.createElement('div');el.className='journey-step level-'+Math.min(index+1,5);add(el,'em',row.number);add(el,'strong',row.title);
    }else if(key==='faq'){
      el=doc.createElement('details');add(el,'summary',row.question);add(el,'p',row.answer);
    }else if(key==='office'){
      el=child(doc,'span',row.text);
    }else if(key==='areas'||key==='types'){
      el=child(doc,'option',row.text);
    }
    el.dataset.blockItem=String(index);
    return el;
  }
  function decorate(doc,key){
    const def=byKey[key],root=container(doc,key);
    if(!def||!root) return;
    [...root.querySelectorAll(def.item)].forEach((el,index)=>el.dataset.blockItem=String(index));
  }
  function render(doc,key,items){
    const root=container(doc,key);
    if(!root||!byKey[key]) return;
    root.replaceChildren();
    items.forEach((row,index)=>{
      root.appendChild(makeItem(doc,key,row,index));
      if(key==='journey'&&index<items.length-1){const arrow=child(doc,'div','↗','journey-arrow');arrow.setAttribute('aria-hidden','true');root.appendChild(arrow);}
    });
    if(key==='journey'){
      root.classList.toggle('cms-flexible',items.length>5);
      root.style.gridTemplateColumns=items.length>5?'':items.map((_,index)=>index?'auto 1fr':'1fr').join(' ');
    }
    if(key==='roles'){
      const count=doc.querySelector('.role-summary-head > span');
      if(count) count.textContent=String(items.length).padStart(2,'0')+' vị trí';
    }
  }
  function applySaved(doc,values){
    definitions.forEach(def=>{
      const raw=values?.[contentKey(def.key)];
      if(!raw){decorate(doc,def.key);return;}
      const rows=parse(raw,def.key);
      if(rows) render(doc,def.key,rows);
      else decorate(doc,def.key);
    });
  }
  function blank(key,index){
    const row={};
    byKey[key].fields.forEach(([name])=>row[name]=name==='number'?String(index+1).padStart(2,'0'):'');
    return row;
  }
  window.UNITE_BLOCKS={definitions,byKey,contentKey,container,extract,parse,decorate,render,applySaved,blank};
})();
