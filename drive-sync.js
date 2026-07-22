/* Google Drive encrypted-vault sync for Family Finance.
   Uses the narrow https://www.googleapis.com/auth/drive.file scope.
   Only the encrypted local vault payload is uploaded; transaction plaintext is not sent to Drive.
*/
(() => {
  'use strict';
  const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.file';
  const VAULT_NAME = 'FamilyFinanceVault.enc.json';
  const META_KEY = 'fft_meta_v1';
  const DATA_KEY = 'fft_data_v1';
  const FILE_ID_KEY = 'fft_drive_file_id_v1';
  let accessToken = null;
  let tokenClient = null;

  function cfg() { return window.FAMILY_FINANCE_CONFIG || {}; }
  function status(msg, ok=false) {
    const el=document.getElementById('driveStatus'); if(el) el.textContent=msg;
    const badge=document.getElementById('driveBadge');
    if(badge){ badge.textContent=ok?'Connected':'Not connected'; badge.className='badge '+(ok?'good':''); }
  }
  function configured() {
    const id=cfg().googleClientId || '';
    return id && !id.startsWith('PASTE_');
  }
  function waitForGoogle(timeout=8000){
    return new Promise((resolve,reject)=>{
      const start=Date.now();
      const timer=setInterval(()=>{
        if(window.google?.accounts?.oauth2){ clearInterval(timer); resolve(); }
        else if(Date.now()-start>timeout){ clearInterval(timer); reject(new Error('Google Identity Services did not load.')); }
      },100);
    });
  }
  async function authorize(prompt='select_account') {
    if(!configured()) throw new Error('Google OAuth Client ID has not been configured yet.');
    await waitForGoogle();
    return new Promise((resolve,reject)=>{
      tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: cfg().googleClientId,
        scope: DRIVE_SCOPE,
        callback: (resp) => {
          if(resp.error){ reject(new Error(resp.error_description || resp.error)); return; }
          accessToken=resp.access_token; status('Google Drive connected for this session.',true); resolve(resp);
        },
        error_callback: (err) => reject(new Error(err?.type || 'Google authorization failed.'))
      });
      tokenClient.requestAccessToken({prompt});
    });
  }
  async function ensureToken(){ if(accessToken) return accessToken; await authorize('select_account'); return accessToken; }
  async function driveFetch(url, opts={}){
    await ensureToken();
    const headers=new Headers(opts.headers||{}); headers.set('Authorization','Bearer '+accessToken);
    let resp=await fetch(url,{...opts,headers});
    if(resp.status===401){ accessToken=null; await authorize(''); headers.set('Authorization','Bearer '+accessToken); resp=await fetch(url,{...opts,headers}); }
    if(!resp.ok){ const t=await resp.text(); throw new Error(`Drive API ${resp.status}: ${t.slice(0,300)}`); }
    return resp;
  }
  function localVaultPayload(){
    const meta=localStorage.getItem(META_KEY), encryptedData=localStorage.getItem(DATA_KEY);
    if(!meta||!encryptedData) throw new Error('No encrypted local vault exists yet. Create/unlock the app first.');
    return {format:'family-finance-encrypted-vault-v1',version:1,updatedAt:new Date().toISOString(),meta:JSON.parse(meta),encryptedData:JSON.parse(encryptedData)};
  }
  async function findVault(){
    const cached=localStorage.getItem(FILE_ID_KEY);
    if(cached){
      try{ const r=await driveFetch(`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(cached)}?fields=id,name,modifiedTime,trashed`); const f=await r.json(); if(!f.trashed)return f; }catch(e){ localStorage.removeItem(FILE_ID_KEY); }
    }
    const q=encodeURIComponent(`name='${VAULT_NAME}' and trashed=false`);
    const r=await driveFetch(`https://www.googleapis.com/drive/v3/files?q=${q}&spaces=drive&fields=files(id,name,modifiedTime)&pageSize=10`);
    const data=await r.json(); const f=(data.files||[]).sort((a,b)=>(b.modifiedTime||'').localeCompare(a.modifiedTime||''))[0];
    if(f) localStorage.setItem(FILE_ID_KEY,f.id); return f||null;
  }
  async function createVault(payload){
    const boundary='-------ff'+Math.random().toString(36).slice(2);
    const metadata={name:VAULT_NAME,mimeType:'application/json'};
    const body=`--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n--${boundary}\r\nContent-Type: application/json\r\n\r\n${JSON.stringify(payload)}\r\n--${boundary}--`;
    const r=await driveFetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,modifiedTime',{method:'POST',headers:{'Content-Type':'multipart/related; boundary='+boundary},body});
    const f=await r.json(); localStorage.setItem(FILE_ID_KEY,f.id); return f;
  }
  async function updateVault(fileId,payload){
    const r=await driveFetch(`https://www.googleapis.com/upload/drive/v3/files/${encodeURIComponent(fileId)}?uploadType=media&fields=id,name,modifiedTime`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
    return r.json();
  }
  async function downloadVault(fileId){
    const r=await driveFetch(`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}?alt=media`);
    const payload=await r.json();
    if(payload?.format!=='family-finance-encrypted-vault-v1'||!payload.meta||!payload.encryptedData) throw new Error('The selected Drive file is not a valid Family Finance encrypted vault.');
    return payload;
  }
  function installRemoteVault(payload,fileId){
    localStorage.setItem(META_KEY,JSON.stringify(payload.meta));
    localStorage.setItem(DATA_KEY,JSON.stringify(payload.encryptedData));
    if(fileId)localStorage.setItem(FILE_ID_KEY,fileId);
  }

  window.connectGoogleDrive=async function(){
    try{ status('Connecting to Google Drive…'); await authorize('select_account'); const f=await findVault(); status(f?`Connected. Vault found (${new Date(f.modifiedTime).toLocaleString()}).`:'Connected. No Drive vault exists yet.',true); }
    catch(e){ status(e.message,false); alert(e.message); }
  };
  window.syncVaultToDrive=async function(){
    try{
      status('Encrypting/syncing vault to Drive…',true);
      if(typeof encryptState==='function' && window.cryptoKey && window.state) await encryptState();
      const payload=localVaultPayload(); const existing=await findVault();
      const f=existing?await updateVault(existing.id,payload):await createVault(payload);
      status(`Encrypted vault synced to Google Drive at ${new Date(f.modifiedTime||Date.now()).toLocaleString()}.`,true);
    }catch(e){ status(e.message,false); alert(e.message); }
  };
  window.syncVaultFromDrive=async function(){
    try{
      const f=await findVault(); if(!f) throw new Error('No Family Finance vault was found in this Google Drive account.');
      if(!confirm(`Replace this device's local vault with the Drive copy modified ${new Date(f.modifiedTime).toLocaleString()}?`)) return;
      status('Downloading encrypted vault…',true); const payload=await downloadVault(f.id); installRemoteVault(payload,f.id);
      status('Drive vault downloaded. Unlock again with your Family Finance access code.',true);
      if(typeof lockApp==='function') lockApp();
      const exists=!!localStorage.getItem(META_KEY);
      const title=document.getElementById('lockTitle'), text=document.getElementById('lockText'), wrap=document.getElementById('confirmWrap');
      if(title) title.textContent=exists?'Unlock Family Finance':'Create your family access code';
      if(text) text.textContent='Drive vault restored. Enter the Family Finance access code to decrypt it on this device.';
      if(wrap) wrap.classList.add('hidden');
    }catch(e){ status(e.message,false); alert(e.message); }
  };
  window.restoreVaultFromDriveBeforeUnlock=async function(){
    const err=document.getElementById('lockError'); if(err)err.textContent='Connecting to Google Drive…';
    try{
      const f=await findVault(); if(!f) throw new Error('No Family Finance encrypted vault was found in this Google Drive account.');
      const payload=await downloadVault(f.id); installRemoteVault(payload,f.id);
      if(err)err.textContent='Drive vault restored. Enter your Family Finance access code.';
      const title=document.getElementById('lockTitle'), text=document.getElementById('lockText'), wrap=document.getElementById('confirmWrap');
      if(title)title.textContent='Unlock Family Finance';
      if(text)text.textContent='Your encrypted Google Drive vault is now on this device. Enter the shared Family Finance access code.';
      if(wrap)wrap.classList.add('hidden');
    }catch(e){ if(err)err.textContent=e.message; }
  };
  window.shareVaultWithSpouse=async function(){
    try{
      const email=(document.getElementById('shareEmail')?.value||'').trim(); if(!email)throw new Error('Enter your spouse’s Google email address.');
      let f=await findVault(); if(!f){ await window.syncVaultToDrive(); f=await findVault(); }
      await driveFetch(`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(f.id)}/permissions?sendNotificationEmail=true`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({type:'user',role:'writer',emailAddress:email})});
      status(`Encrypted vault shared with ${email}.`,true);
      alert('The encrypted Drive file was shared. For spouse sign-in with a separate Google account, the next build will add Google Picker-based vault selection so the narrow drive.file permission can remain in place.');
    }catch(e){ status(e.message,false); alert(e.message); }
  };
})();
