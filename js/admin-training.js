(() => {
  'use strict';
  const endpoint=window.UNITE_CONFIG?.APPS_SCRIPT_URL;
  const panel=document.getElementById('trainingPanel');
  const content=document.getElementById('contentPanel');
  const status=document.getElementById('trainingStatus');
  const rowsHost=document.getElementById('trainingRows');
  const titleInput=document.getElementById('trainingWeekTitle');
  const dateInput=document.getElementById('trainingNewDate');
  const saveButton=document.getElementById('saveTraining');
  const password=document.getElementById('adminPassword');
  const sheetId='13syUfCyNPcvKcQI8xi5or_Uq-CbYoCbzfuiuPOwYs1o';
  const sessions=['Sáng','Chiều'];
  const tags=['','Bắt buộc cho Newbie','Bắt buộc','Mở rộng','Tùy chọn'];
  let rows=[],revision='',loaded=false,dirty=false,sequence=0;

  function message(value,type=''){
    status.textContent=value;
    status.className='status'+(type?' '+type:'');
  }
  function dateParts(value){
    const match=/^(\d{4})-(\d{2})-(\d{2})$/.exec(value||'');
    if(!match) return null;
    const date=new Date(Number(match[1]),Number(match[2])-1,Number(match[3]),12);
    return date.getFullYear()===Number(match[1])&&date.getMonth()===Number(match[2])-1&&date.getDate()===Number(match[3])?date:null;
  }
  function displayDay(value){
    const date=dateParts(value);
    if(!date) return 'Chọn ngày';
    const names=['Chủ Nhật','Thứ 2','Thứ 3','Thứ 4','Thứ 5','Thứ 6','Thứ 7'];
    return `${names[date.getDay()]} · ${String(date.getDate()).padStart(2,'0')}/${String(date.getMonth()+1).padStart(2,'0')}/${date.getFullYear()}`;
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
    const rows=[];let row=[],cell='',quoted=false;
    for(let i=0;i<text.length;i++){
      const c=text[i];
      if(quoted){if(c==='"'&&text[i+1]==='"'){cell+='"';i++;}else if(c==='"')quoted=false;else cell+=c;}
      else if(c==='"')quoted=true;
      else if(c===','){row.push(cell);cell='';}
      else if(c==='\r'||c==='\n'){if(c==='\r'&&text[i+1]==='\n')i++;row.push(cell);rows.push(row);row=[];cell='';}
      else cell+=c;
    }
    if(cell||row.length){row.push(cell);rows.push(row);}
    return rows;
  }
  function csvDate(value){
    const text=String(value||'').trim();
    if(dateParts(text))return text;
    const match=/^(\d{1,2})\/(\d{1,2})(?:\/(\d{4}))?$/.exec(text);
    if(!match)return '';
    const iso=`${match[3]||new Date().getFullYear()}-${String(match[2]).padStart(2,'0')}-${String(match[1]).padStart(2,'0')}`;
    return dateParts(iso)?iso:'';
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
  function labelInput(label,value,kind,onInput,options){
    const wrapper=document.createElement('label');wrapper.textContent=label;
    const input=document.createElement(kind==='select'?'select':'input');
    if(kind!=='select')input.type=kind;
    if(kind==='select'){
      options.forEach(option=>{const el=document.createElement('option');el.value=option;el.textContent=option||'Không phân loại';input.appendChild(el);});
      if(value&&!options.includes(value)){const el=document.createElement('option');el.value=value;el.textContent=value;input.appendChild(el);}
    }
    input.value=value||'';
    if(kind==='text')input.maxLength=250;
    input.addEventListener(kind==='date'||kind==='select'?'change':'input',()=>onInput(input.value));
    wrapper.appendChild(input);return wrapper;
  }
  function render(){
    sortRows();rowsHost.replaceChildren();
    if(!rows.length){const empty=document.createElement('p');empty.className='training-empty-admin';empty.textContent='Chưa có buổi Training. Chọn ngày và bấm “Thêm ngày” để bắt đầu.';rowsHost.appendChild(empty);return;}
    rows.forEach(row=>{
      const card=document.createElement('article');card.className='training-row';
      const head=document.createElement('div');head.className='training-row-head';
      const heading=document.createElement('strong');heading.textContent=`${displayDay(row.date)} · ${row.session||'Chọn buổi'}`;
      const remove=document.createElement('button');remove.type='button';remove.className='training-row-remove';remove.textContent='Xóa buổi';
      remove.addEventListener('click',()=>{rows=rows.filter(item=>item.id!==row.id);dirty=true;render();message('Đã xóa khỏi bản nháp. Bấm “Lưu lịch Training” để áp dụng.');});
      head.append(heading,remove);card.appendChild(head);
      if(row.sourceDate&&!row.date){const warning=document.createElement('p');warning.className='training-row-warning';warning.textContent=`Ngày trong Sheet chưa hợp lệ: ${row.sourceDate}. Hãy chọn lại ngày.`;card.appendChild(warning);}
      const grid=document.createElement('div');grid.className='training-row-grid';
      grid.append(
        labelInput('Ngày',row.date,'date',value=>{row.date=value;row.sourceDate='';dirty=true;render();}),
        labelInput('Buổi',row.session,'select',value=>{row.session=value;dirty=true;heading.textContent=`${displayDay(row.date)} · ${row.session}`;},sessions),
        labelInput('Chủ đề',row.title,'text',value=>{row.title=value;dirty=true;}),
        labelInput('Thời gian & địa điểm',row.time,'text',value=>{row.time=value;dirty=true;}),
        labelInput('Phân loại',row.tag,'select',value=>{row.tag=value;dirty=true;},tags)
      );
      card.appendChild(grid);rowsHost.appendChild(card);
    });
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
    revision=data.revision||'';loaded=true;dirty=false;render();
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
  document.getElementById('addTrainingDay').addEventListener('click',()=>{
    if(!dateParts(dateInput.value)){message('Chọn ngày bằng ô lịch trước khi thêm.','error');dateInput.focus();return;}
    const date=dateInput.value;
    const missing=sessions.filter(session=>!rows.some(row=>row.date===date&&row.session===session));
    if(!missing.length){message('Ngày này đã có đủ buổi Sáng và Chiều.');return;}
    missing.forEach(session=>rows.push({id:++sequence,date,sourceDate:'',session,title:'',time:'',tag:''}));
    dirty=true;render();message(`Đã thêm ${missing.join(' và ')} ngày ${displayDay(date)}. Nhập chủ đề rồi lưu.`);
  });
  document.getElementById('saveTraining').addEventListener('click',save);
})();
