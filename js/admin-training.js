(() => {
  'use strict';
  const endpoint=window.UNITE_CONFIG?.APPS_SCRIPT_URL;
  const panel=document.getElementById('trainingPanel');
  const content=document.getElementById('contentPanel');
  const status=document.getElementById('trainingStatus');
  const calHost=document.getElementById('trainingCalendar');
  const titleInput=document.getElementById('trainingWeekTitle');
  const saveButton=document.getElementById('saveTraining');
  const password=document.getElementById('adminPassword');
  const weekLabel=document.getElementById('trainingWeekLabel');
  const sheetId='13syUfCyNPcvKcQI8xi5or_Uq-CbYoCbzfuiuPOwYs1o';
  const sessions=['Sáng','Chiều'];
  const tags=['','Bắt buộc cho Newbie','Bắt buộc','Mở rộng','Tùy chọn'];
  let rows=[],revision='',loaded=false,dirty=false,sequence=0,weekStart=null,editor=null;

  function message(value,type=''){
    status.textContent=value;
    status.className='status'+(type?' '+type:'');
  }
  function pad(n){return String(n).padStart(2,'0');}
  function dateParts(value){
    const match=/^(\d{4})-(\d{2})-(\d{2})$/.exec(value||'');
    if(!match) return null;
    const date=new Date(Number(match[1]),Number(match[2])-1,Number(match[3]),12);
    return date.getFullYear()===Number(match[1])&&date.getMonth()===Number(match[2])-1&&date.getDate()===Number(match[3])?date:null;
  }
  function iso(date){return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}`;}
  function mondayOf(date){const d=new Date(date.getFullYear(),date.getMonth(),date.getDate(),12);const shift=(d.getDay()+6)%7;d.setDate(d.getDate()-shift);return d;}
  function displayDay(value){
    const date=dateParts(value);
    if(!date) return 'Chọn ngày';
    const names=['Chủ Nhật','Thứ 2','Thứ 3','Thứ 4','Thứ 5','Thứ 6','Thứ 7'];
    return `${names[date.getDay()]} · ${pad(date.getDate())}/${pad(date.getMonth()+1)}/${date.getFullYear()}`;
  }
  function sortRows(){
    rows.sort((a,b)=>(a.date||'9999').localeCompare(b.date||'9999')||
      sessions.indexOf(a.session)-sessions.indexOf(b.session));
  }
  function jsonpTraining(){
    if(!endpoint) return Promise.reject(new Error('Chưa có URL Apps Script.'));
    return new Promise((resolve,reject)=>{
      const name='__uniteTraining_'+Math.random().toString(36).slice(2,14);
      const script=document.createElement('script');
      let finished=false;
      const cleanup=()=>{if(finished)return;finished=true;clearTimeout(timer);delete window[name];script.remove();};
      const timer=setTimeout(()=>{cleanup();reject(new Error('Apps Script chưa trả dữ liệu lịch.'));},10000);
      window[name]=result=>{cleanup();result?.ok?resolve(result):reject(new Error(result?.message||'Không đọc được lịch Training.'));};
      script.onerror=()=>{cleanup();reject(new Error('Không kết nối được Apps Script.'));};
      script.src=endpoint+'?action=trainingData&callback='+name+'&_='+Date.now();
      document.head.appendChild(script);
    });
  }
  function parseCsv(text){
    const out=[];let row=[],cell='',quoted=false;
    for(let i=0;i<text.length;i++){
      const c=text[i];
      if(quoted){if(c==='"'&&text[i+1]==='"'){cell+='"';i++;}else if(c==='"')quoted=false;else cell+=c;}
      else if(c==='"')quoted=true;
      else if(c===','){row.push(cell);cell='';}
      else if(c==='\r'||c==='\n'){if(c==='\r'&&text[i+1]==='\n')i++;row.push(cell);out.push(row);row=[];cell='';}
      else cell+=c;
    }
    if(cell||row.length){row.push(cell);out.push(row);}
    return out;
  }
  function csvDate(value){
    const text=String(value||'').trim();
    if(dateParts(text))return text;
    const match=/^(\d{1,2})\/(\d{1,2})(?:\/(\d{4}))?$/.exec(text);
    if(!match)return '';
    const candidate=`${match[3]||new Date().getFullYear()}-${pad(match[2])}-${pad(match[1])}`;
    return dateParts(candidate)?candidate:'';
  }
  async function fallbackCsv(){
    const url=`https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=Training&_=${Date.now()}`;
    const response=await fetch(url,{cache:'no-store'});
    if(!response.ok)throw new Error('Không đọc được sheet Training.');
    const csv=parseCsv(await response.text());
    return {ok:true,weekTitle:csv[0]?.[1]||'Lịch Training',revision:'',
      rows:csv.slice(1).filter(row=>row.some(cell=>String(cell||'').trim())).filter(row=>csvDate(row[0])||String(row[1]||'').trim()==='Sáng'||String(row[1]||'').trim()==='Chiều').map(row=>({
        date:csvDate(row[0]),sourceDate:String(row[0]||''),session:row[1]||'',
        title:row[2]||'',time:row[3]||'',tag:row[4]||''
      }))};
  }
  function closeEditor(){
    if(editor){editor.remove();editor=null;}
  }
  function openEditor(anchor,row){
    closeEditor();
    const box=document.createElement('div');box.className='cal-editor';
    const head=document.createElement('div');head.className='cal-editor-head';
    const title=document.createElement('strong');title.textContent=`${displayDay(row.date)} · ${row.session}`;
    const close=document.createElement('button');close.type='button';close.textContent='×';close.className='cal-editor-close';
    close.addEventListener('click',closeEditor);
    head.append(title,close);box.appendChild(head);
    const titleInput2=document.createElement('input');titleInput2.type='text';titleInput2.maxLength=250;titleInput2.placeholder='Chủ đề buổi Training';titleInput2.value=row.title||'';box.appendChild(titleInput2);
    const timeInput=document.createElement('input');timeInput.type='text';timeInput.maxLength=250;timeInput.placeholder='Thời gian & địa điểm (vd: 09:00 · Phòng họp A)';timeInput.value=row.time||'';box.appendChild(timeInput);
    const tagSelect=document.createElement('select');
    tags.forEach(tag=>{const opt=document.createElement('option');opt.value=tag;opt.textContent=tag||'Không phân loại';tagSelect.appendChild(opt);});
    if(row.tag&&!tags.includes(row.tag)){const opt=document.createElement('option');opt.value=row.tag;opt.textContent=row.tag;tagSelect.appendChild(opt);}
    tagSelect.value=row.tag||'';box.appendChild(tagSelect);
    const actions=document.createElement('div');actions.className='cal-editor-actions';
    const save=document.createElement('button');save.type='button';save.className='save';save.textContent='Xong';
    save.addEventListener('click',()=>{
      row.title=titleInput2.value.trim();row.time=timeInput.value.trim();row.tag=tagSelect.value;
      dirty=true;closeEditor();render();
      message('Đã cập nhật bản nháp. Bấm "Lưu lịch Training" để áp dụng.');
    });
    const remove=document.createElement('button');remove.type='button';remove.className='cancel cal-editor-delete';remove.textContent='Xóa buổi';
    remove.addEventListener('click',()=>{
      rows=rows.filter(item=>item.id!==row.id);dirty=true;closeEditor();render();
      message('Đã xóa khỏi bản nháp. Bấm "Lưu lịch Training" để áp dụng.');
    });
    actions.append(remove,save);box.appendChild(actions);
    anchor.appendChild(box);editor=box;
    titleInput2.focus();
  }
  function render(){
    closeEditor();
    if(!weekStart){const dated=rows.map(row=>row.date).filter(Boolean).sort();weekStart=mondayOf(dated.length?dateParts(dated[0]):new Date());}
    calHost.replaceChildren();
    const weekEnd=new Date(weekStart);weekEnd.setDate(weekEnd.getDate()+6);
    weekLabel.textContent=`${pad(weekStart.getDate())}/${pad(weekStart.getMonth()+1)} – ${pad(weekEnd.getDate())}/${pad(weekEnd.getMonth()+1)}/${weekEnd.getFullYear()}`;
    const dayNames=['CN','T2','T3','T4','T5','T6','T7'];
    const todayIso=iso(new Date());
    const grid=document.createElement('div');grid.className='cal-grid';
    for(let i=0;i<7;i++){
      const day=new Date(weekStart);day.setDate(day.getDate()+i);
      const col=document.createElement('div');col.className='cal-col';
      const head=document.createElement('div');head.className='cal-day-head'+(iso(day)===todayIso?' is-today':'');
      head.innerHTML=`<span>${dayNames[day.getDay()]}</span><b>${day.getDate()}</b>`;
      col.appendChild(head);
      sessions.forEach(session=>{
        const slot=document.createElement('div');slot.className='cal-slot';
        const row=rows.find(item=>item.date===iso(day)&&item.session===session);
        const tag=document.createElement('span');tag.className='cal-slot-label';tag.textContent=session==='Sáng'?'Buổi sáng':'Buổi chiều';
        slot.appendChild(tag);
        if(row){
          const ev=document.createElement('button');ev.type='button';ev.className='cal-event'+(row.tag==='Bắt buộc cho Newbie'||row.tag==='Bắt buộc'?' is-required':'');
          ev.innerHTML=`<b>${row.title||'(Chưa có chủ đề)'}</b><span>${row.time||''}</span>${row.tag?`<em>${row.tag}</em>`:''}`;
          ev.addEventListener('click',()=>openEditor(slot,row));
          slot.appendChild(ev);
          if(row.sourceDate&&!row.date){const warn=document.createElement('p');warn.className='cal-warn';warn.textContent=`Ngày lỗi: ${row.sourceDate}`;slot.appendChild(warn);}
        }else{
          const add=document.createElement('button');add.type='button';add.className='cal-add';add.textContent='+ Thêm buổi';
          add.addEventListener('click',()=>{
            const created={id:++sequence,date:iso(day),sourceDate:'',session,title:'',time:'',tag:''};
            rows.push(created);dirty=true;render();
            const colEl=calHost.querySelectorAll('.cal-col')[i];
            const slots=colEl.querySelectorAll('.cal-slot');
            openEditor(slots[sessions.indexOf(session)],created);
          });
          slot.appendChild(add);
        }
        col.appendChild(slot);
      });
      grid.appendChild(col);
    }
    calHost.appendChild(grid);
  }
  async function load(){
    if(dirty&&!window.confirm('Bỏ các thay đổi lịch chưa lưu và tải lại từ Sheet?'))return;
    message('Đang tải lịch Training…');
    let data,fromFallback=false;
    try{data=await jsonpTraining();}
    catch(error){
      try{data=await fallbackCsv();fromFallback=true;}
      catch(fallbackError){message(`${error.message} ${fallbackError.message}`,'error');return;}
    }
    titleInput.value=data.weekTitle||'Lịch Training';
    rows=(data.rows||[]).map(row=>({...row,id:++sequence}));
    revision=data.revision||'';loaded=true;dirty=false;
    const dated=rows.map(row=>row.date).filter(Boolean).sort();
    weekStart=mondayOf(dated.length?dateParts(dated[0]):new Date());
    render();
    saveButton.disabled=!revision;
    if(fromFallback)message('Đã đọc lịch từ Sheet. Chức năng lưu cần phiên bản Apps Script mới được triển khai.','error');
    else message(`Đã tải ${rows.length} buổi Training. ${rows.some(row=>!row.date)?'Có dòng cần chọn lại ngày.':''}`);
  }
  function normalized(){
    return rows.map(({date,session,title,time,tag})=>({date,session,title:title.trim(),time:time.trim(),tag:tag.trim()}))
      .sort((a,b)=>a.date.localeCompare(b.date)||sessions.indexOf(a.session)-sessions.indexOf(b.session));
  }
  async function save(){
    if(!loaded||!revision){message('Cần tải lịch từ Apps Script phiên bản mới trước khi lưu.','error');return;}
    if(!password.value){message('Nhập mật khẩu CMS ở đầu trang trước khi lưu.','error');password.focus();return;}
    const weekTitle=titleInput.value.trim();const values=normalized();
    if(!weekTitle){message('Nhập tiêu đề tuần.','error');titleInput.focus();return;}
    if(values.some(row=>!dateParts(row.date)||!sessions.includes(row.session)||!row.title)){
      message('Mỗi buổi cần ngày hợp lệ, Sáng/Chiều và chủ đề.','error');return;
    }
    if(values.some((row,index)=>index>0&&row.date===values[index-1].date&&row.session===values[index-1].session)){
      message('Một ngày chỉ được có một buổi Sáng và một buổi Chiều.','error');return;
    }
    if(values.length>100){message('Tối đa 100 buổi Training.','error');return;}
    saveButton.disabled=true;message('Đang lưu và đọc lại lịch để xác nhận…');
    try{
      await fetch(endpoint,{method:'POST',mode:'no-cors',cache:'no-store',headers:{'Content-Type':'text/plain;charset=utf-8'},
        body:JSON.stringify({action:'trainingSave',password:password.value,weekTitle,rows:values,revision})});
      let confirmed=null;
      for(let attempt=0;attempt<8;attempt++){
        await new Promise(resolve=>setTimeout(resolve,900));
        try{
          const data=await jsonpTraining();
          const actual=(data.rows||[]).map(({date,session,title,time,tag})=>({date,session,title,time,tag}))
            .sort((a,b)=>a.date.localeCompare(b.date)||sessions.indexOf(a.session)-sessions.indexOf(b.session));
          if(data.weekTitle===weekTitle&&JSON.stringify(actual)===JSON.stringify(values)){confirmed=data;break;}
          if(data.revision!==revision)break;
        }catch(_){/* retry */}
      }
      if(!confirmed){message('Chưa xác nhận được lịch đã lưu. Kiểm tra mật khẩu, tải lại lịch rồi thử lại.','error');return;}
      revision=confirmed.revision;rows=confirmed.rows.map(row=>({...row,id:++sequence}));dirty=false;render();
      message('Đã lưu và xác nhận lịch trong Sheet Training.','success');
    }catch(error){message('Không gửi được lịch: '+error.message,'error');}
    finally{saveButton.disabled=false;}
  }

  document.querySelectorAll('[data-mode]').forEach(button=>button.addEventListener('click',()=>{
    const training=button.dataset.mode==='training';
    panel.hidden=!training;content.hidden=training;
    document.querySelectorAll('[data-mode]').forEach(item=>item.classList.toggle('active',item===button));
    if(training&&!loaded)load();
  }));
  document.getElementById('reloadTraining').addEventListener('click',load);
  const shiftWeek=delta=>{if(!weekStart)weekStart=mondayOf(new Date());weekStart=new Date(weekStart.getFullYear(),weekStart.getMonth(),weekStart.getDate()+delta*7);render();};
  document.getElementById('trainingPrevWeek').addEventListener('click',()=>shiftWeek(-1));
  document.getElementById('trainingNextWeek').addEventListener('click',()=>shiftWeek(1));
  document.getElementById('trainingToday').addEventListener('click',()=>{weekStart=mondayOf(new Date());render();});
  saveButton.addEventListener('click',save);
})();
