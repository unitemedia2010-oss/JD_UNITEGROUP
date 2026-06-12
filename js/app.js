const $=(s,r=document)=>r.querySelector(s); const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const APP_STATE={themePref:localStorage.getItem('uniteThemePref')||(window.UNITE_CONFIG?.THEME_MODE||'system'),map:null,markers:new Map(),userLayer:null,branches:[],baseLayers:{light:null,dark:null}};
function formatVND(v){return new Intl.NumberFormat('vi-VN',{style:'currency',currency:'VND',maximumFractionDigits:0}).format(v)}
function escapeHtml(v){return String(v??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;')}
function activeTheme(){if(APP_STATE.themePref==='system'){return window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'} return APP_STATE.themePref||'light'}
function applyTheme(){const theme=activeTheme(); document.documentElement.setAttribute('data-theme', theme); const label=$('#themeLabel'), icon=$('#themeIcon'); if(label&&icon){ if(APP_STATE.themePref==='system'){label.textContent='Auto'; icon.textContent='◐'} else if(APP_STATE.themePref==='dark'){label.textContent='Tối'; icon.textContent='●'} else {label.textContent='Sáng'; icon.textContent='☀'} } updateMapTheme();}
function initTheme(){applyTheme(); window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change',()=>{if(APP_STATE.themePref==='system') applyTheme()}); $('#themeToggle')?.addEventListener('click',()=>{const order=['system','light','dark']; APP_STATE.themePref=order[(order.indexOf(APP_STATE.themePref)+1)%order.length]; localStorage.setItem('uniteThemePref', APP_STATE.themePref); applyTheme();});}
function initBrand(){
  const logo=$('#brandLogo');
  if(logo){logo.src=window.UNITE_CONFIG?.LOGO_URL||'';}

  const watermark=$('#bgWatermark');
  if(watermark){
    watermark.src=window.UNITE_CONFIG?.MARKER_URL || window.UNITE_CONFIG?.LOGO_URL || '';
  }
}
function initScrollProgress(){const bar=$('#scrollProgress'); window.addEventListener('scroll',()=>{const max=document.documentElement.scrollHeight-window.innerHeight; bar.style.width=`${max>0?(window.scrollY/max)*100:0}%`;},{passive:true})}
function initQuiz(){
  const buttons=$$('#quizOptions button');
  const result=$('#quizResult');
  buttons.forEach(btn=>btn.addEventListener('click',()=>{
    btn.classList.toggle('active');
    const score=buttons.filter(b=>b.classList.contains('active')).length;
    if(score>=4){
      result.innerHTML=`<b>Bạn rất phù hợp với vị trí này.</b><span>Bạn có nhiều điểm phù hợp với môi trường tư vấn tại Unite Group: thích giao tiếp, có tinh thần chủ động, mong muốn tăng thu nhập và sẵn sàng học hỏi từ thực tế.</span>`;
    }else if(score===3){
      result.innerHTML=`<b>Bạn khá phù hợp.</b><span>Tại Unite Group, ứng viên sẽ được đào tạo bài bản từ nền tảng, từng bước làm quen với công việc và phát triển kỹ năng thực tế.</span>`;
    }else{
      result.innerHTML=`<b>Chọn ít nhất 3 mục để xem mức độ phù hợp.</b><span>Tại Unite Group, ứng viên sẽ được đào tạo bài bản từ nền tảng, từng bước làm quen với công việc và phát triển kỹ năng thực tế. Chúng tôi đánh giá cao tinh thần chủ động, thái độ cầu tiến và sự sẵn sàng học hỏi trong quá trình đồng hành cùng đội ngũ.</span>`;
    }
  }))
}
function initIncome(){const deal=$('#dealRange'), avg=$('#avgRange'), dVal=$('#dealValue'), aVal=$('#avgValue'), out=$('#incomeOutput'); if(!deal||!avg) return; const update=()=>{const deals=Number(deal.value), av=Number(avg.value), rate=.5, bonus=deals>=10?2000000:deals>=5?1000000:0; dVal.textContent=deals; aVal.textContent=formatVND(av); out.textContent=formatVND(Math.round(deals*av*rate+bonus));}; deal.addEventListener('input',update); avg.addEventListener('input',update); update();}
function pointFeatures(){return (window.UNITE_BRANCHES_GEOJSON?.features||[]).filter(f=>f.geometry?.type==='Point')}
function asBranch(feature){const [lng,lat]=feature.geometry.coordinates; const p=feature.properties||{}; return {id:p.id||`${lat}-${lng}`, name:p.name||'Unite Branch', lat, lng, coordsText:p.coordsText||`${lat.toFixed(6)}, ${lng.toFixed(6)}`, address:p.address||'', note:p.note||'', isHQ:!!p.isHQ, googleMaps:p.googleMaps||`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, directions:p.directions||`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`, image:p.image||''}}
function popupHtml(b){
  const addressLine = b.address ? escapeHtml(b.address) : 'Đang cập nhật địa chỉ';
  return `<div class="popup-title">${escapeHtml(b.name)}</div>
    <div class="popup-note">${addressLine}</div>
    <div class="popup-actions">
      <a href="${b.directions}" target="_blank" rel="noopener">Chỉ đường</a>
      <a class="secondary" href="${b.googleMaps}" target="_blank" rel="noopener">Mở Maps</a>
    </div>`;
}
function updateSelectedBranch(branch, distance=null){
  const box=$('#selectedBranch');
  if(!box) return;

  if(branch){
    const addressText = branch.address ? escapeHtml(branch.address) : 'Đang cập nhật địa chỉ';
    box.innerHTML=`<span>${distance!=null?`Gần bạn khoảng ${distance.toFixed(1)} km`:'Đang chọn'}</span>
      <strong>${escapeHtml(branch.name)}</strong>
      <small>${addressText}</small>`;
  } else {
    box.innerHTML=`<span>Đang chọn</span><strong>Toàn bộ chi nhánh</strong><small>Bấm vào marker hoặc card bên trái để xem chi tiết.</small>`;
  }

  $$('.branch-card').forEach(card=>card.classList.toggle('active', card.dataset.branchId===branch?.id));
}
function renderBranchList(branches, userPosition=null){
  const list=$('#branchList');
  if(!list) return;

  const sorted=[...branches].map(branch=>({
    branch,
    km:userPosition?distanceKm(userPosition.lat,userPosition.lng,branch.lat,branch.lng):null
  })).sort((a,b)=>{
    if(a.km==null||b.km==null) return (b.branch.isHQ?1:0)-(a.branch.isHQ?1:0);
    return a.km-b.km;
  });

  list.innerHTML=sorted.map(({branch,km})=>`<article class="branch-card ${branch.isHQ?'active-hq':''}" data-branch-id="${escapeHtml(branch.id)}">
    <h4>${escapeHtml(branch.name)}</h4>
    ${km!=null?`<span class="coord">Cách bạn khoảng ${km.toFixed(1)} km</span>`:''}
    <p>${branch.address?escapeHtml(branch.address):'Đang cập nhật địa chỉ'}</p>
    <div class="branch-links">
      <a href="${branch.directions}" target="_blank" rel="noopener">Chỉ đường</a>
      <a class="secondary" href="${branch.googleMaps}" target="_blank" rel="noopener">Maps</a>
    </div>
  </article>`).join('');

  $$('.branch-card',list).forEach(card=>card.addEventListener('click',(e)=>{
    if(e.target.closest('a')) return;
    const b=branches.find(x=>x.id===card.dataset.branchId);
    if(b) focusBranch(b);
  }));
}
function distanceKm(lat1,lon1,lat2,lon2){const R=6371; const dLat=(lat2-lat1)*Math.PI/180, dLon=(lon2-lon1)*Math.PI/180; const a=Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2; return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));}
function makeMarkerIcon(isHQ=false){const cls=isHQ?'hq':'default'; const size=isHQ?44:32; return L.divIcon({className:'', html:`<div class="marker-wrap ${cls}"><img src="${window.UNITE_CONFIG?.MARKER_URL||''}" alt="marker"></div>`, iconSize:[size,size], iconAnchor:[size/2,size/2], popupAnchor:[0,-size/2]});}
function updateMapTheme(){if(!APP_STATE.map||!APP_STATE.baseLayers.light||!APP_STATE.baseLayers.dark) return; const theme=activeTheme(); const light=APP_STATE.baseLayers.light, dark=APP_STATE.baseLayers.dark; if(theme==='dark'){if(APP_STATE.map.hasLayer(light)) APP_STATE.map.removeLayer(light); if(!APP_STATE.map.hasLayer(dark)) dark.addTo(APP_STATE.map);} else {if(APP_STATE.map.hasLayer(dark)) APP_STATE.map.removeLayer(dark); if(!APP_STATE.map.hasLayer(light)) light.addTo(APP_STATE.map);} }
function focusBranch(branch){updateSelectedBranch(branch); if(APP_STATE.map){APP_STATE.map.flyTo([branch.lat,branch.lng], branch.isHQ?15:14, {duration:.65}); APP_STATE.markers.get(branch.id)?.openPopup();}}
function initBranches(){const branches=pointFeatures().map(asBranch); APP_STATE.branches=branches; renderBranchList(branches); const mapEl=$('#uniteMap'); if(!window.L||!mapEl||!branches.length) return; const map=L.map(mapEl,{scrollWheelZoom:false,zoomControl:true,attributionControl:false}); APP_STATE.map=map; const light=L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',{subdomains:'abcd',maxZoom:20}); const dark=L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',{subdomains:'abcd',maxZoom:20}); APP_STATE.baseLayers={light,dark}; updateMapTheme(); L.control.attribution({prefix:false}).addAttribution('© OpenStreetMap © CARTO').addTo(map); const group=L.featureGroup(); branches.forEach(branch=>{const marker=L.marker([branch.lat,branch.lng], {icon:makeMarkerIcon(branch.isHQ)}).bindPopup(popupHtml(branch)).on('click',()=>updateSelectedBranch(branch)); marker.addTo(group); APP_STATE.markers.set(branch.id, marker);}); group.addTo(map); const poly=(window.UNITE_BRANCHES_GEOJSON?.features||[]).filter(f=>f.geometry?.type==='Polygon'); if(poly.length){L.geoJSON({type:'FeatureCollection',features:poly},{style:{color:'#d6b300',weight:1.2,opacity:.65,fillColor:'#ffe45b',fillOpacity:.06}}).addTo(map);} map.fitBounds(group.getBounds(),{padding:[34,34]}); setTimeout(()=>map.invalidateSize(),250); $('#fitMap')?.addEventListener('click',()=>{map.fitBounds(group.getBounds(),{padding:[34,34]}); updateSelectedBranch(null);}); $('#locateNearest')?.addEventListener('click',()=>{const btn=$('#locateNearest'); if(!navigator.geolocation){alert('Trình duyệt chưa hỗ trợ định vị. Ứng viên vẫn có thể bấm Chỉ đường ở từng chi nhánh.'); return;} btn.textContent='Đang định vị...'; navigator.geolocation.getCurrentPosition(pos=>{const user={lat:pos.coords.latitude,lng:pos.coords.longitude}; renderBranchList(branches,user); const nearest=[...branches].sort((a,b)=>distanceKm(user.lat,user.lng,a.lat,a.lng)-distanceKm(user.lat,user.lng,b.lat,b.lng))[0]; if(APP_STATE.userLayer) APP_STATE.userLayer.remove(); APP_STATE.userLayer=L.marker([user.lat,user.lng],{icon:L.divIcon({className:'',html:'<div class="user-marker"></div>',iconSize:[18,18],iconAnchor:[9,9]})}).addTo(map).bindPopup('Vị trí hiện tại của bạn'); const km=distanceKm(user.lat,user.lng,nearest.lat,nearest.lng); updateSelectedBranch(nearest,km); focusBranch(nearest); btn.textContent='Gợi ý gần tôi';},()=>{btn.textContent='Gợi ý gần tôi'; alert('Không lấy được vị trí. Cần cho phép quyền định vị trên trình duyệt, hoặc bấm Chỉ đường từng chi nhánh.');},{enableHighAccuracy:true,timeout:10000,maximumAge:120000});});}
function renderGallery(items){const gallery=$('#cultureGallery'); if(!gallery) return; const data=(items&&items.length?items:window.UNITE_CONFIG?.LOCAL_GALLERY||[]).filter(Boolean); gallery.innerHTML=data.map((item,idx)=>`<article><div class="gallery-photo" style="${item.image?`background-image:linear-gradient(135deg,rgba(255,215,0,.16),rgba(0,0,0,.05)),url('${escapeHtml(item.image)}')`:''}"></div><div class="gallery-body"><h3>${escapeHtml(item.title||`Hình ảnh ${idx+1}`)}</h3><p>${escapeHtml(item.caption||'Khoảnh khắc văn hóa Unite Group.')}</p></div></article>`).join('')}
async function loadSheetData(){const url=window.UNITE_CONFIG?.APPS_SCRIPT_URL; if(!url){renderGallery(); return;} try{const res=await fetch(`${url}?action=getData`); const payload=await res.json(); if(payload?.ok&&Array.isArray(payload.gallery)&&payload.gallery.length) renderGallery(payload.gallery); else renderGallery();}catch(err){console.warn(err); renderGallery();}}







function showSubmitToast(type='loading', title='Đang gửi hồ sơ', message='Hệ thống đang chuyển thông tin đến bộ phận tuyển dụng Unite Group.'){
  const toast=document.getElementById('submitToast');
  const titleEl=document.getElementById('toastTitle');
  const msgEl=document.getElementById('toastMessage');

  if(!toast) return;

  toast.classList.remove('success');
  if(type === 'success') toast.classList.add('success');

  if(titleEl) titleEl.textContent = title;
  if(msgEl) msgEl.textContent = message;

  toast.classList.add('show');
  toast.setAttribute('aria-hidden','false');
}

function hideSubmitToast(delay=1200){
  const toast=document.getElementById('submitToast');
  if(!toast) return;

  window.setTimeout(()=>{
    toast.classList.remove('show','success');
    toast.setAttribute('aria-hidden','true');
  }, delay);
}


function safeStoreCandidate(key, data){
  try{
    const slim = {...(data || {})};
    delete slim.cvFile;
    delete slim.userAgent;

    // Chỉ lưu thông tin nhẹ để tránh lỗi quota localStorage khi ứng viên có upload CV.
    localStorage.setItem(key, JSON.stringify({
      name: slim.name || '',
      phone: slim.phone || '',
      position: slim.position || '',
      submittedAt: slim.submittedAt || new Date().toISOString(),
      hasCvFile: !!(data && data.cvFile)
    }));
  }catch(storageError){
    console.warn('Skip localStorage cache:', storageError);
  }
}

function readFileAsBase64(file){
  return new Promise((resolve, reject)=>{
    if(!file){
      resolve(null);
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if(file.size > maxSize){
      reject(new Error('File CV vượt quá 5MB. Vui lòng chọn file nhẹ hơn để gửi nhanh hơn.'));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || '');
      const base64 = result.includes(',') ? result.split(',')[1] : result;
      resolve({
        name:file.name,
        type:file.type || 'application/octet-stream',
        size:file.size,
        data:base64
      });
    };
    reader.onerror = () => reject(new Error('Không đọc được file CV.'));
    reader.readAsDataURL(file);
  });
}

function initApplyForm(){
  const form=$('#applyForm'), note=$('#formNote');
  if(!form) return;

  form.addEventListener('submit', async e=>{
    e.preventDefault();

    const submitBtn = form.querySelector('button[type="submit"]');
    if(submitBtn) submitBtn.disabled = true;

    const data=Object.fromEntries(new FormData(form).entries());
    data.position=window.UNITE_CONFIG?.DEFAULT_POSITION||'Nhân viên Kinh doanh';
    data.source=window.UNITE_CONFIG?.DEFAULT_SOURCE||'career-jd-unitegroup';
    data.submittedAt=new Date().toISOString();
    data.userAgent=navigator.userAgent;

    const fileInput = $('#cvFile', form);
    const selectedFile = fileInput?.files?.[0];

    const msg=[
      `Vị trí: ${data.position}`,
      `Họ tên: ${data.name||''}`,
      `SĐT/Zalo: ${data.phone||''}`,
      `Năm sinh: ${data.birthyear||''}`,
      `Khu vực: ${data.area||''}`,
      `Hình thức: ${data.type||''}`,
      `Link Facebook/Portfolio: ${data.profile||''}`,
      `CV: ${selectedFile ? selectedFile.name : 'Không đính kèm'}`
    ].join('\n');

    const url=window.UNITE_CONFIG?.APPS_SCRIPT_URL;

    if(url){
      note.textContent = selectedFile ? 'Đang tải CV và gửi hồ sơ...' : 'Đang gửi hồ sơ ứng tuyển...';
      showSubmitToast(
        'loading',
        selectedFile ? 'Đang tải CV' : 'Đang gửi hồ sơ',
        selectedFile ? 'File CV đang được gửi đến bộ phận tuyển dụng Unite Group.' : 'Hệ thống đang chuyển thông tin đến bộ phận tuyển dụng Unite Group.'
      );

      try{
        const cvFile = await readFileAsBase64(selectedFile);
        if(cvFile) data.cvFile = cvFile;

        await fetch(url,{
          method:'POST',
          mode:'no-cors',
          headers:{'Content-Type':'text/plain;charset=utf-8'},
          body:JSON.stringify({action:'apply', data})
        });

        note.textContent='Đã gửi hồ sơ. Bộ phận tuyển dụng Unite Group sẽ liên hệ bạn sớm nhất.';
        showSubmitToast('success','Đã gửi thông tin thành công','Cảm ơn bạn đã ứng tuyển. Unite Group sẽ liên hệ trong thời gian sớm nhất.');
        hideSubmitToast(1650);

        safeStoreCandidate('uniteCandidateLastSubmit', data);
        form.reset();
        if(submitBtn) submitBtn.disabled = false;
        return;
      }catch(err){
        console.warn('Submit error:', err);
        note.textContent=err.message || 'Chưa gửi được hồ sơ. Vui lòng thử lại sau hoặc liên hệ bộ phận tuyển dụng.';
        showSubmitToast('loading','Chưa gửi được hồ sơ', note.textContent);
        hideSubmitToast(1900);
      }
    }else{
      note.textContent='Hệ thống ứng tuyển chưa được kích hoạt. Vui lòng liên hệ bộ phận tuyển dụng Unite Group.';
      showSubmitToast('loading','Chưa kích hoạt hệ thống','Vui lòng liên hệ bộ phận tuyển dụng Unite Group.');
      hideSubmitToast(1600);
    }

    safeStoreCandidate('uniteCandidateDraft', data);
    if(submitBtn) submitBtn.disabled = false;
  });
}
function wrapText(ctx,text,x,y,maxWidth,lineHeight,maxLines=4){const words=text.split(' '); let line='', lines=0; for(let n=0;n<words.length;n++){const test=line+words[n]+' '; if(ctx.measureText(test).width>maxWidth && n>0){ctx.fillText(line,x,y); line=words[n]+' '; y+=lineHeight; lines++; if(lines>=maxLines-1) break;} else line=test;} ctx.fillText(line.trim(),x,y)}
function roundRect(ctx,x,y,w,h,r,fill,stroke){ctx.beginPath(); ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y); ctx.quadraticCurveTo(x+w,y,x+w,y+r); ctx.lineTo(x+w,y+h-r); ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h); ctx.lineTo(x+r,y+h); ctx.quadraticCurveTo(x,y+h,x,y+h-r); ctx.lineTo(x,y+r); ctx.quadraticCurveTo(x,y,x+r,y); ctx.closePath(); if(fill) ctx.fill(); if(stroke) ctx.stroke();}
function initPosterDownload(){const btn=$('#downloadPoster'), canvas=$('#posterCanvas'); if(!btn||!canvas) return; const ctx=canvas.getContext('2d'); btn.addEventListener('click',()=>{const w=canvas.width,h=canvas.height,dark=activeTheme()==='dark'; const bg=ctx.createLinearGradient(0,0,w,h); bg.addColorStop(0,dark?'#0E0E10':'#FFFDF5'); bg.addColorStop(.56,dark?'#191919':'#FFF8D8'); bg.addColorStop(1,dark?'#0E0E10':'#FFFFFF'); ctx.fillStyle=bg; ctx.fillRect(0,0,w,h); const orb=ctx.createRadialGradient(840,160,20,840,160,430); orb.addColorStop(0,'rgba(255,215,0,.48)'); orb.addColorStop(1,'rgba(255,215,0,0)'); ctx.fillStyle=orb; ctx.fillRect(0,0,w,h); ctx.fillStyle='#FFD700'; ctx.font='900 42px Be Vietnam Pro, Arial'; ctx.fillText('UNITE GROUP CAREER',76,110); ctx.fillStyle=dark?'#FFFDF5':'#111111'; ctx.font='900 92px Be Vietnam Pro, Arial'; wrapText(ctx,'NHÂN VIÊN KINH DOANH',76,250,860,102,2); ctx.fillStyle='#FFD700'; ctx.font='800 44px Be Vietnam Pro, Arial'; ctx.fillText('Bất động sản cho thuê',76,450); ctx.fillStyle=dark?'#C9BD8B':'#6B5E3A'; ctx.font='500 32px Be Vietnam Pro, Arial'; wrapText(ctx,'Không yêu cầu kinh nghiệm • Đào tạo 1:1 • Thu nhập theo năng lực • Full-time/Part-time',76,530,900,46,3); let y=690; [['Bạn sẽ làm gì?','Đăng bài, tư vấn nhu cầu, hỗ trợ xem phòng, cọc/hợp đồng và chăm sóc sau thuê.'],['Lộ trình','30 ngày làm quen • 60 ngày thực chiến • 90 ngày bứt tốc kết quả.'],['Ứng tuyển','Để lại thông tin để HR Unite Group liên hệ và tư vấn chi nhánh phù hợp.']].forEach(([title,body])=>{ctx.fillStyle=dark?'rgba(255,255,255,.07)':'rgba(255,255,255,.80)'; roundRect(ctx,76,y,928,150,28,true,false); ctx.strokeStyle='rgba(255,215,0,.35)'; ctx.lineWidth=2; roundRect(ctx,76,y,928,150,28,false,true); ctx.fillStyle='#FFD700'; ctx.font='900 32px Be Vietnam Pro, Arial'; ctx.fillText(title,110,y+52); ctx.fillStyle=dark?'#FFFDF5':'#111111'; ctx.font='500 26px Be Vietnam Pro, Arial'; wrapText(ctx,body,110,y+96,835,36,2); y+=180;}); ctx.fillStyle='#FFD700'; roundRect(ctx,76,1220,360,72,36,true,false); ctx.fillStyle='#111111'; ctx.font='900 28px Be Vietnam Pro, Arial'; ctx.fillText('ỨNG TUYỂN NGAY',122,1267); ctx.fillStyle=dark?'#C9BD8B':'#6B5E3A'; ctx.font='600 24px Be Vietnam Pro, Arial'; ctx.fillText('unitegroup.vn/career • HR Unite Group',470,1265); const link=document.createElement('a'); link.download='unitegroup-career-jd-poster-4x5.png'; link.href=canvas.toDataURL('image/png'); link.click();});}

function initFloatingDock(){
  const dock = document.querySelector('.desktop-floating-menu');
  if(!dock) return;

  const update = () => {
    const trigger = Math.min(window.innerHeight * 0.45, 520);
    const shouldShow = window.scrollY > trigger;
    dock.classList.toggle('show', shouldShow);
  };

  update();
  window.addEventListener('scroll', update, {passive:true});
}


document.addEventListener('DOMContentLoaded',()=>{initTheme(); initBrand(); initScrollProgress(); initQuiz(); initIncome(); initBranches(); loadSheetData(); initApplyForm();});


/* Candidate V14 - reliable floating dock trigger */
(function(){
  function bindFloatingDockV14(){
    const dock = document.querySelector('.desktop-floating-menu');
    if(!dock) return;

    const update = () => {
      // Hiện sớm sau khi lướt khỏi phần đầu một chút, không cần đợi quá sâu.
      const shouldShow = window.scrollY > 140;
      dock.classList.toggle('show', shouldShow);
    };

    update();
    window.addEventListener('scroll', update, {passive:true});
    window.addEventListener('resize', update, {passive:true});
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', bindFloatingDockV14);
  }else{
    bindFloatingDockV14();
  }
})();


/* Candidate V21 - page intro and scroll reveal */
function initPageMotion(){
  const intro = document.getElementById('pageIntro');

  window.setTimeout(()=>{
    document.body.classList.remove('is-loading');
    document.body.classList.add('motion-ready');
    if(intro){
      intro.classList.add('hide');
      window.setTimeout(()=>intro.remove(), 700);
    }
  }, 520);
}

function initScrollReveal(){
  const selector = [
    '.section-title',
    '.value-grid',
    '.quiz-card',
    '.timeline',
    '.income-card',
    '.career-journey',
    '.gallery',
    '.map-shell',
    '.faq-list',
    '.apply-card',
    '.hero-card'
  ].join(',');

  document.querySelectorAll(selector).forEach(el=>{
    el.classList.add('reveal-item');
  });

  document.querySelectorAll('.value-grid,.timeline,.gallery,.branch-list,.faq-list,.journey-track,.role-picks-grid,.quiz-options').forEach(el=>{
    el.classList.add('reveal-stagger');
  });

  if(!('IntersectionObserver' in window)){
    document.querySelectorAll('.reveal-item,.reveal-stagger').forEach(el=>el.classList.add('in-view'));
    return;
  }

  const observer = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, {
    root:null,
    threshold:0.12,
    rootMargin:'0px 0px -10% 0px'
  });

  document.querySelectorAll('.reveal-item,.reveal-stagger').forEach(el=>observer.observe(el));
}

(function(){
  const startMotion = () => {
    initPageMotion();
    initScrollReveal();
  };

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', startMotion);
  }else{
    startMotion();
  }
})();


/* Candidate V22 - Gold Shader Animation
   Static HTML/CSS/JS version adapted from the React Three.js shader idea.
   Gold is the dominant color for Unite Group. */
function initGoldShader(){
  const container = document.getElementById('goldShader');
  if(!container || !window.THREE) return;

  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduceMotion) return;

  let renderer, scene, camera, material, mesh, animationId;
  let isVisible = true;

  try{
    const vertexShader = `
      void main(){
        gl_Position = vec4(position, 1.0);
      }
    `;

    const fragmentShader = `
      #define TWO_PI 6.2831853072
      precision highp float;

      uniform vec2 resolution;
      uniform float time;
      uniform float isDark;

      mat2 rot(float a){
        float s = sin(a);
        float c = cos(a);
        return mat2(c, -s, s, c);
      }

      void main(void){
        vec2 uv = (gl_FragCoord.xy * 2.0 - resolution.xy) / min(resolution.x, resolution.y);
        uv *= 1.05;
        uv *= rot(0.28);

        float t = time * 0.045;
        float lineWidth = 0.0032;

        float rings = 0.0;
        float glow = 0.0;

        for(int i = 0; i < 7; i++){
          float fi = float(i);
          vec2 p = uv;
          p.x += sin(t * 1.4 + fi * 0.72) * 0.18;
          p.y += cos(t * 1.1 + fi * 0.43) * 0.12;

          float wave = fract(t + fi * 0.075) * 4.2;
          float d = abs(wave - length(p) + mod(p.x + p.y, 0.22));
          rings += lineWidth * (fi + 1.0) / max(d, 0.012);

          float beam = abs(sin((p.x + p.y) * 5.0 + t * 6.0 + fi));
          glow += smoothstep(0.98, 0.25, beam) * 0.018;
        }

        float vignette = smoothstep(1.65, 0.18, length(uv));
        float intensity = clamp((rings * 0.26 + glow) * vignette, 0.0, 1.0);

        vec3 deepGold = vec3(0.66, 0.47, 0.02);
        vec3 gold = vec3(1.00, 0.78, 0.05);
        vec3 softGold = vec3(1.00, 0.90, 0.42);

        vec3 color = mix(deepGold, gold, intensity);
        color = mix(color, softGold, smoothstep(0.45, 1.0, intensity));

        float alpha = intensity * mix(0.32, 0.62, isDark);
        gl_FragColor = vec4(color, alpha);
      }
    `;

    camera = new THREE.Camera();
    camera.position.z = 1;
    scene = new THREE.Scene();

    const geometry = new THREE.PlaneGeometry(2, 2);

    material = new THREE.ShaderMaterial({
      uniforms:{
        time:{ value:1.0 },
        resolution:{ value:new THREE.Vector2(1, 1) },
        isDark:{ value:document.documentElement.dataset.theme === 'dark' ? 1.0 : 0.0 }
      },
      vertexShader,
      fragmentShader,
      transparent:true,
      depthWrite:false,
      depthTest:false
    });

    mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    renderer = new THREE.WebGLRenderer({
      antialias:true,
      alpha:true,
      powerPreference:'high-performance'
    });

    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
    container.appendChild(renderer.domElement);

    const resize = () => {
      const rect = container.getBoundingClientRect();
      const parentRect = container.parentElement ? container.parentElement.getBoundingClientRect() : rect;
      const width = Math.max(1, Math.floor(rect.width || parentRect.width || window.innerWidth));
      const height = Math.max(1, Math.floor(rect.height || parentRect.height || window.innerHeight));
      renderer.setSize(width, height, false);
      material.uniforms.resolution.value.set(
        renderer.domElement.width,
        renderer.domElement.height
      );
    };

    const updateTheme = () => {
      if(material){
        material.uniforms.isDark.value = document.documentElement.dataset.theme === 'dark' ? 1.0 : 0.0;
      }
    };

    const animate = () => {
      if(!isVisible){
        animationId = requestAnimationFrame(animate);
        return;
      }
      material.uniforms.time.value += 0.055;
      renderer.render(scene, camera);
      animationId = requestAnimationFrame(animate);
    };

    resize();
    updateTheme();
    animate();

    window.addEventListener('resize', resize, {passive:true});
    document.addEventListener('visibilitychange', () => {
      isVisible = !document.hidden;
    });

    const themeObserver = new MutationObserver(updateTheme);
    themeObserver.observe(document.documentElement, {attributes:true, attributeFilter:['data-theme']});

    window.addEventListener('beforeunload', () => {
      try{
        cancelAnimationFrame(animationId);
        themeObserver.disconnect();
        window.removeEventListener('resize', resize);
        if(renderer && renderer.domElement && renderer.domElement.parentNode){
          renderer.domElement.parentNode.removeChild(renderer.domElement);
        }
        geometry.dispose();
        material.dispose();
        renderer.dispose();
      }catch(e){}
    });
  }catch(error){
    console.warn('Gold shader disabled:', error);
    container.classList.add('shader-fallback');
  }
}

(function(){
  const startGoldShader = () => initGoldShader();
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', startGoldShader);
  }else{
    startGoldShader();
  }
})();
