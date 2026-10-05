(() => {
  'use strict';
  const sheetId='13syUfCyNPcvKcQI8xi5or_Uq-CbYoCbzfuiuPOwYs1o';
  const endpoint=window.UNITE_CONFIG?.APPS_SCRIPT_URL;
  const pageFiles={index:'index.html','nha-nguyen-can':'nha-nguyen-can.html',tpa:'tpa.html'};
  const frame=document.getElementById('preview');
  const status=document.getElementById('adminStatus');
  const password=document.getElementById('adminPassword');
  const saveButton=document.getElementById('saveButton');
  const cancelButton=document.getElementById('cancelButton');
  const editorText=document.getElementById('editorText');
  const fieldSearch=document.getElementById('fieldSearch');
  const fieldList=document.getElementById('fieldList');
  let page='index',cms={},active=null,activeHost=null,editMode='',original='',textSpacing=null,previewDoc=null;

  function setStatus(message,type=''){
    status.textContent=message;
    status.className='status'+(type?' '+type:'');
  }
  function parseCsv(text){
    const rows=[];let row=[],cell='',quoted=false;
    for(let i=0;i<text.length;i++){
      const c=text[i];
      if(quoted){
        if(c==='"'&&text[i+1]==='"'){cell+='"';i++;}
        else if(c==='"') quoted=false;
        else cell+=c;
      }else if(c==='"') quoted=true;
      else if(c===','){row.push(cell);cell='';}
      else if(c==='\r'||c==='\n'){
        if(c==='\r'&&text[i+1]==='\n') i++;
        row.push(cell);rows.push(row);row=[];cell='';
      }else cell+=c;
    }
    if(cell||row.length){row.push(cell);rows.push(row);}
    return rows;
  }
  function cleanHtml(value){
    const t=document.createElement('template');
    t.innerHTML=String(value??'').replace(/\\n/g,'<br>');
    const allowed=new Set(['BR','STRONG','EM','SPAN']);
    const clean=node=>{
      for(const child of [...node.childNodes]){
        if(child.nodeType===8){child.remove();continue;}
        if(child.nodeType!==1) continue;
        if(['SCRIPT','STYLE','IFRAME','SVG','MATH'].includes(child.tagName)){child.remove();continue;}
        if(!allowed.has(child.tagName)){child.replaceWith(document.createTextNode(child.textContent||''));continue;}
        clean(child);
        const className=child.tagName==='SPAN'&&child.classList.contains('title-soft')?'title-soft':
          child.tagName==='SPAN'&&(child.classList.contains('title-area')||/font-size:\s*0\.4em/i.test(child.getAttribute('style')||''))?'title-area':'';
        for(const attr of [...child.attributes]) child.removeAttribute(attr.name);
        if(className) child.className=className;
      }
    };
    clean(t.content);
    return t.innerHTML;
  }
  async function readCms(){
    const url='https://docs.google.com/spreadsheets/d/'+sheetId+'/gviz/tq?tqx=out:csv&sheet=Web_Content&_='+Date.now();
    const response=await fetch(url,{cache:'no-store'});
    if(!response.ok) throw new Error('Không đọc được Web_Content. Kiểm tra quyền xuất bản Sheet.');
    const rows=parseCsv(await response.text()),data={};
    for(const row of rows.slice(1)){
      const name=row[0]?.trim(),key=row[1]?.trim(),value=row[2];
      if(name&&key&&value){(data[name]??={})[key]=value;}
    }
    cms=data;
    return data;
  }
  function applyCms(doc){
    doc.querySelectorAll('[data-cms]').forEach(el=>{
      const key=el.getAttribute('data-cms');
      const value=cms[page]?.[key]??cms.global?.[key];
      if(!value) return;
      if(el.dataset.cmsTarget==='text'){
        const node=[...el.childNodes].find(child=>child.nodeType===Node.TEXT_NODE&&child.textContent.trim());
        if(node){
          const text=node.textContent;
          node.textContent=text.match(/^\s*/)[0]+value+text.match(/\s*$/)[0];
        }
      }else if(el.dataset.cmsTarget==='placeholder') el.placeholder=value;
      else if(el.tagName==='OPTION') el.textContent=value;
      else el.innerHTML=cleanHtml(value);
    });
  }
  function renderFieldList(){
    if(!previewDoc) return;
    const query=fieldSearch.value.trim().toLocaleLowerCase('vi');
    fieldList.replaceChildren();
    let count=0;
    previewDoc.querySelectorAll('[data-cms]').forEach(el=>{
      const label=(el.dataset.cmsTarget==='placeholder'?`Ví dụ nhập: ${el.placeholder}`:el.dataset.cmsTarget==='text'
        ?[...el.childNodes].filter(node=>node.nodeType===Node.TEXT_NODE).map(node=>node.textContent).join(' ')
        :el.textContent).trim().replace(/\s+/g,' ');
      if(!label) return;
      if(query&&!`${label} ${el.dataset.cms}`.toLocaleLowerCase('vi').includes(query)) return;
      const button=document.createElement('button');
      button.type='button';
      button.textContent=label.length>76?label.slice(0,76)+'…':label;
      button.title=label;
      button.addEventListener('click',()=>{
        if(activeHost&&activeHost!==el){setStatus('Hãy lưu hoặc hủy đoạn chữ đang sửa trước.','error');return;}
        el.closest('details')?.setAttribute('open','');
        (el.tagName==='OPTION'?el.closest('select'):el).scrollIntoView({behavior:'smooth',block:'center'});
        selectField(el);
      });
      fieldList.appendChild(button);
      count++;
    });
    document.getElementById('fieldCount').textContent=`${count} vị trí`;
  }
  function leaveEdit(restore){
    if(!activeHost) return;
    if(editMode==='text'){
      const value=restore?original:active.textContent;
      active.replaceWith(previewDoc.createTextNode(textSpacing[0]+value+textSpacing[1]));
    }else if(editMode==='option'||editMode==='placeholder'||editMode==='hidden'){
      if(restore){
        if(editMode==='placeholder') activeHost.placeholder=original;
        else activeHost.textContent=original;
      }
    }else{
      if(restore) activeHost.innerHTML=original;
      activeHost.removeAttribute('contenteditable');
    }
    activeHost.classList.remove('admin-editing');
    active=null;activeHost=null;editMode='';original='';textSpacing=null;
    editorText.hidden=true;
    document.getElementById('fieldTitle').textContent='Chọn một đoạn chữ';
    document.getElementById('fieldHelp').textContent='Bấm vào chữ có viền khi rê chuột ở bản xem trước. Con trỏ sẽ xuất hiện ngay trên chữ để bạn sửa.';
    document.getElementById('fieldMeta').hidden=true;
    saveButton.disabled=true;cancelButton.disabled=true;
    renderFieldList();
  }
  function selectField(el){
    if(activeHost&&activeHost!==el){setStatus('Hãy lưu hoặc hủy đoạn chữ đang sửa trước.','error');return;}
    if(activeHost===el) return;
    activeHost=el;
    if(el.dataset.cmsTarget==='text'){
      const node=[...el.childNodes].find(child=>child.nodeType===Node.TEXT_NODE&&child.textContent.trim());
      if(!node){activeHost=null;return;}
      const text=node.textContent;
      const prefix=text.match(/^\s*/)[0],suffix=text.match(/\s*$/)[0];
      original=text.slice(prefix.length,text.length-suffix.length);
      textSpacing=[prefix,suffix];
      active=previewDoc.createElement('span');
      active.className='admin-text-fragment';
      active.textContent=original;
      node.replaceWith(active);
      active.setAttribute('contenteditable','true');
      editMode='text';
    }else if(el.tagName==='OPTION'||el.dataset.cmsTarget==='placeholder'||el.closest('[hidden]')){
      active=el;original=el.dataset.cmsTarget==='placeholder'?el.placeholder:el.textContent;
      editMode=el.dataset.cmsTarget==='placeholder'?'placeholder':el.tagName==='OPTION'?'option':'hidden';
      editorText.hidden=false;
      editorText.value=original;
    }else{
      active=el;original=el.innerHTML;editMode='html';
      el.setAttribute('contenteditable','true');
    }
    el.classList.add('admin-editing');
    document.getElementById('fieldTitle').textContent='Đang sửa trên trang';
    document.getElementById('fieldHelp').textContent=['option','placeholder','hidden'].includes(editMode)
      ?'Sửa nội dung trong ô bên dưới rồi bấm “Lưu nội dung”.'
      :'Gõ trực tiếp vào chữ đang được tô viền. Bấm “Lưu nội dung” khi xong.';
    document.getElementById('fieldKey').textContent=el.dataset.cms;
    document.getElementById('fieldMeta').hidden=false;
    saveButton.disabled=false;cancelButton.disabled=false;
    if(['option','placeholder','hidden'].includes(editMode)) editorText.focus(); else active.focus();
    setStatus('Đang sửa '+el.dataset.cms+'.');
  }
  function setupPreview(){
    const doc=frame.contentDocument;
    if(!doc){setStatus('Không truy cập được bản xem trước. Hãy mở admin trên cùng tên miền với web.','error');return;}
    if(doc===previewDoc){applyCms(doc);return;}
    previewDoc=doc;
    doc.body.classList.remove('is-loading');
    const style=doc.createElement('style');
    style.textContent=[
      '.page-intro,.submit-toast,.mobile-cta,.desktop-floating-menu{display:none!important}',
      '*,*::before,*::after{animation:none!important;transition:none!important}',
      '.reveal,.reveal-item,.reveal-stagger > *,.hero .eyebrow,.hero-title .title-line,.hero-lead,.hero-badges span,.hero-actions .btn,.hero-card{opacity:1!important;visibility:visible!important;transform:none!important;filter:none!important}',
      '[data-cms]{cursor:text!important;outline:2px solid transparent;outline-offset:5px}',
      '[data-cms]:hover{outline-color:#4f9e48!important;background:rgba(201,239,160,.2)!important}',
      '[data-cms].admin-editing{outline:3px solid #357a3e!important;background:rgba(201,239,160,.28)!important}',
      '.admin-text-fragment{outline:2px solid #357a3e!important;min-width:1ch;display:inline!important}'
    ].join('\n');
    doc.head.appendChild(style);
    const logoUrls={
      index:window.UNITE_CONFIG?.LOGO_URL,
      'nha-nguyen-can':'https://techbytruong.wordpress.com/wp-content/uploads/2026/06/ucr.png',
      tpa:'img/logo-tpa.png'
    };
    const logo=doc.getElementById('brandLogo');
    if(logo&&logoUrls[page]) logo.src=logoUrls[page];
    applyCms(doc);
    doc.querySelectorAll('details').forEach(item=>item.open=true);
    doc.addEventListener('click',event=>{
      const el=event.target.closest?.('[data-cms]');
      if(active&&active.contains(event.target)) return;
      event.preventDefault();
      event.stopPropagation();
      if(el) selectField(el);
    },true);
    doc.addEventListener('submit',event=>event.preventDefault(),true);
    renderFieldList();
    setStatus('Bản xem trước đã sẵn sàng. Rê chuột lên chữ để chọn.');
  }
  function changePage(next){
    if(!pageFiles[next]) return;
    leaveEdit(true);
    page=next;
    document.querySelectorAll('[data-page]').forEach(button=>button.classList.toggle('active',button.dataset.page===page));
    document.getElementById('publicLink').href=pageFiles[page];
    setStatus('Đang tải trang '+page+'…');
    frame.src=pageFiles[page];
  }
  async function save(){
    if(!activeHost||!endpoint) return;
    const key=activeHost.dataset.cms;
    const value=['option','placeholder','hidden'].includes(editMode)?editorText.value.trim():
      editMode==='text'?active.textContent.trim():cleanHtml(active.innerHTML).trim();
    if(!value){setStatus('Nội dung không được để trống.','error');return;}
    if(value===(editMode==='html'?cleanHtml(original).trim():original.trim())){leaveEdit(false);setStatus('Nội dung chưa thay đổi.');return;}
    if(!password.value){setStatus('Nhập mật khẩu quản trị trước khi lưu.','error');password.focus();return;}
    saveButton.disabled=true;
    setStatus('Đang lưu và kiểm tra dữ liệu trên Sheet…');
    try{
      await fetch(endpoint,{
        method:'POST',mode:'no-cors',cache:'no-store',
        headers:{'Content-Type':'text/plain;charset=utf-8'},
        body:JSON.stringify({action:'cmsSave',page,key,value,password:password.value})
      });
      let verified=false;
      for(let attempt=0;attempt<8;attempt++){
        await new Promise(resolve=>setTimeout(resolve,850));
        try{await readCms();}catch(_){continue;}
        if((editMode==='html'?cleanHtml(cms[page]?.[key]??''):cms[page]?.[key])===value){verified=true;break;}
      }
      if(!verified){
        setStatus('Chưa xác nhận được nội dung đã lưu. Kiểm tra mật khẩu, phiên bản Apps Script và tab Web_Content.','error');
        saveButton.disabled=false;
        return;
      }
      if(editMode==='option') activeHost.textContent=value;
      else if(editMode==='placeholder') activeHost.placeholder=value;
      else if(editMode==='hidden') activeHost.textContent=value;
      else if(editMode==='text') active.textContent=value;
      else active.innerHTML=value;
      leaveEdit(false);
      setStatus('Đã lưu và xác nhận nội dung trong Web_Content. Tải lại trang công khai để xem.','success');
    }catch(error){
      setStatus('Không gửi được thay đổi: '+error.message,'error');
      saveButton.disabled=false;
    }
  }
  frame.addEventListener('load',setupPreview);
  document.querySelectorAll('[data-page]').forEach(button=>button.addEventListener('click',()=>changePage(button.dataset.page)));
  document.querySelectorAll('[data-size]').forEach(button=>button.addEventListener('click',()=>{
    const phone=button.dataset.size==='phone';
    document.getElementById('previewWrap').classList.toggle('phone',phone);
    document.querySelectorAll('[data-size]').forEach(item=>item.classList.toggle('active',item===button));
  }));
  saveButton.addEventListener('click',save);
  cancelButton.addEventListener('click',()=>{leaveEdit(true);setStatus('Đã hủy thay đổi chưa lưu.');});
  fieldSearch.addEventListener('input',renderFieldList);
  readCms().then(()=>{if(frame.contentDocument?.readyState==='complete') setupPreview();else setStatus('Đang tải bản xem trước…');})
    .catch(error=>setStatus(error.message+' Bản xem trước vẫn có thể mở.','error'));
})();
