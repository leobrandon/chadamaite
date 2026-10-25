import test from 'node:test';
import assert from 'node:assert/strict';
import { transitionPath, validateIds, pagePhotos, verifyAlbumSession } from './album-utils.mjs';
const file = '1792970000000_00000000-0000-4000-8000-000000000001.jpg';
test('transitions preserve trash origin and forbid permanent deletion outside trash', () => {
  assert.equal(transitionPath('drafts/'+file, 'trash'), 'trash/drafts/'+file);
  assert.equal(transitionPath('trash/drafts/'+file, 'restore'), 'drafts/'+file);
  assert.equal(transitionPath('trash/published/'+file, 'restore'), 'published/'+file);
  assert.equal(transitionPath('drafts/'+file, 'publish', 1792971000000), 'published/1792971000000_'+file.split('_')[1]);
  assert.throws(()=>transitionPath('published/'+file, 'delete'));
  assert.throws(()=>transitionPath('drafts/'+file, 'restore'));
});
test('paths cannot escape album folders or include non-image payloads', () => {
  for(const value of ['../../settings/order.json','published/../'+file,'drafts/a.svg','trash/'+file,'settings/order.json']) assert.throws(()=>validateIds([value]));
  assert.deepEqual(validateIds(['drafts/'+file,'drafts/'+file]), ['drafts/'+file]);
  assert.throws(()=>validateIds([]));
  assert.throws(()=>validateIds(Array(101).fill('drafts/'+file)));
});
test('random pagination stays stable without duplicates and oldest/recent differ',()=>{
  const items=Array.from({length:50},(_,i)=>({id:`published/${1792970000000+i}_00000000-0000-4000-8000-000000000001.jpg`}));
  const first=pagePhotos(items,'random','fixed',0,24),second=pagePhotos(items,'random','fixed',24,24);
  assert.equal(new Set([...first,...second].map(x=>x.id)).size,48);
  assert.deepEqual(first,pagePhotos(items,'random','fixed',0,24));
  assert.equal(pagePhotos(items,'oldest','',0,1)[0].id,items[0].id);
  assert.equal(pagePhotos(items,'recent','',0,1)[0].id,items[49].id);
});
test('admin session rejects forged, expired and wrong-audience tokens', async()=>{
  const pinHash='ab'.repeat(32), now=1792970000000, audience='https://example.supabase.co';
  const sign=async(payload)=>{
    const part=Buffer.from(JSON.stringify(payload)).toString('base64url');
    const key=await crypto.subtle.importKey('raw',Buffer.from(pinHash,'hex'),{name:'HMAC',hash:'SHA-256'},false,['sign']);
    return part+'.'+Buffer.from(await crypto.subtle.sign('HMAC',key,new TextEncoder().encode(part))).toString('base64url');
  };
  const valid=await sign({sub:'admin',aud:audience,iat:now,exp:now+60000});
  assert.equal(await verifyAlbumSession(valid,pinHash,audience,now),true);
  assert.equal(await verifyAlbumSession(valid,pinHash,audience+'x',now),false);
  assert.equal(await verifyAlbumSession(valid,pinHash,audience,now+60001),false);
  assert.equal(await verifyAlbumSession(valid+'x',pinHash,audience,now),false);
  assert.equal(await verifyAlbumSession(null,pinHash,audience,now),false);
});
