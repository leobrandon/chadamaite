import { createClient } from 'npm:@supabase/supabase-js@2';
import { validateIds, transitionPath, pagePhotos, verifyAlbumSession } from './album-utils.mjs';

const url = Deno.env.get('SUPABASE_URL') ?? '';
const secrets = JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS') ?? '{}');
const key = secrets.default ?? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const db = createClient(url, key, {auth:{persistSession:false, autoRefreshToken:false}});
const BUCKET = 'maite-event-photos';
const store = db.storage.from(BUCKET);
const MAX_BYTES = 5 * 1024 * 1024;
const cors = {'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type','Access-Control-Allow-Methods':'POST, OPTIONS','Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'};
class ApiError extends Error { constructor(message:string, public status=400){super(message);} }
const reply = (status:number, data:unknown) => new Response(JSON.stringify(data),{status,headers:cors});
const missing = (error:any) => String(error?.statusCode ?? error?.status)==='404' || /(?:bucket|object) not found|does not exist|not_found/i.test(error?.message ?? '');
let bucketReady = false;
async function ensureBucket() {
  if (bucketReady) return;
  const existing=await db.storage.getBucket(BUCKET);
  if(existing.error) {
    if(!missing(existing.error)) throw new ApiError('Não foi possível acessar o armazenamento de fotos.',503);
    const created=await db.storage.createBucket(BUCKET,{public:false,fileSizeLimit:MAX_BYTES,allowedMimeTypes:['image/jpeg','application/json']});
    if(created.error && !/already exists|duplicate/i.test(created.error.message)) throw new ApiError('Não foi possível preparar o armazenamento de fotos.',503);
  } else if(existing.data.public) {
    throw new ApiError('O armazenamento de fotos precisa ser privado.',503);
  }
  bucketReady=true;
}
async function requireAdmin(token:unknown) {
  const {data,error}=await db.from('admin_credentials').select('pin_hash').eq('id',true).maybeSingle();
  if(error) throw new ApiError('Não foi possível validar a sessão administrativa.',503);
  if(!data || !await verifyAlbumSession(token,data.pin_hash,url)) throw new ApiError('Sessão administrativa expirada. Entre novamente no painel.',401);
}
async function listFolder(folder:string) {
  const rows:any[]=[];
  for(let offset=0;;offset+=100) {
    const {data,error}=await store.list(folder,{limit:100,offset,sortBy:{column:'name',order:'asc'}});
    if(error) { if(missing(error)) return []; throw new ApiError('Não foi possível carregar as fotos. Tente novamente.',503); }
    for(const row of data ?? []) {
      if(!row.id) continue;
      const id=`${folder}/${row.name}`;
      try {validateIds([id]);} catch {continue;}
      const timestamp=Number(row.name.slice(0,13));
      rows.push({id,createdAt:row.created_at,publishedAt:folder.includes('published') ? new Date(timestamp).toISOString() : null});
    }
    if((data ?? []).length<100) break;
  }
  return rows;
}
async function getOrder() {
  const {data,error}=await store.download('settings/order.json');
  if(error) {if(missing(error)) return 'recent';throw new ApiError('Não foi possível carregar a ordem do álbum.',503);}
  const settings=await data.json();
  return ['recent','oldest','random'].includes(settings.order) ? settings.order : 'recent';
}
async function signPhotos(photos:any[]) {
  if(!photos.length) return [];
  const {data,error}=await store.createSignedUrls(photos.map(x=>x.id),3600);
  if(error || !data || data.some(x=>x.error || !x.signedUrl)) throw new ApiError('Não foi possível abrir as fotos. Tente novamente.',503);
  return photos.map((photo,i)=>({...photo,url:data[i].signedUrl}));
}
async function handle(body:any) {
  const action=String(body.action ?? '');
  if(action==='public-list') {
    const offset=Number(body.offset ?? 0),limit=Number(body.limit ?? 24);
    if(!Number.isSafeInteger(offset)||offset<0||!Number.isSafeInteger(limit)||limit<1||limit>48) throw new ApiError('Página inválida.');
    const order=await getOrder();
    const all=await listFolder('published');
    const page=pagePhotos(all,order,String(body.seed ?? '').slice(0,100),offset,limit);
    return {photos:await signPhotos(page),total:all.length,hasMore:offset+limit<all.length,order};
  }
  if(!['admin-list','admin-prepare-upload','admin-publish','admin-trash','admin-restore','admin-delete','admin-set-order'].includes(action)) throw new ApiError('Ação inválida.');
  await requireAdmin(body.token);
  await ensureBucket();
  if(action==='admin-list') {
    if(!['drafts','published','trash'].includes(body.state)) throw new ApiError('Seção inválida.');
    const photos=body.state==='trash' ? [...await listFolder('trash/drafts'),...await listFolder('trash/published')] : await listFolder(body.state);
    return {photos:await signPhotos(pagePhotos(photos,'recent','',0,photos.length)),order:await getOrder()};
  }
  if(action==='admin-prepare-upload') {
    if(body.contentType!=='image/jpeg' || !Number.isSafeInteger(body.size) || body.size<1 || body.size>MAX_BYTES) throw new ApiError('Envie uma imagem JPEG de até 5 MB.');
    const path=`drafts/${Date.now()}_${crypto.randomUUID()}.jpg`;
    const {data,error}=await store.createSignedUploadUrl(path);
    if(error || !data) throw new ApiError('Não foi possível iniciar o envio da foto.',503);
    return {path,token:data.token};
  }
  if(action==='admin-set-order') {
    if(!['recent','oldest','random'].includes(body.order)) throw new ApiError('Ordem inválida.');
    const {error}=await store.upload('settings/order.json',JSON.stringify({order:body.order}),{contentType:'application/json',upsert:true,cacheControl:'0'});
    if(error) throw new ApiError('Não foi possível salvar a ordem do álbum.',503);
    return {order:body.order};
  }
  const ids=validateIds(body.ids);
  const operation=action.slice(6);
  // Valida todo o lote antes de executar qualquer alteração.
  const transitions=ids.map((id:string)=>({id,destination:transitionPath(id,operation)}));
  const succeeded:string[]=[],failed:{id:string,error:string}[]=[];
  for(const item of transitions) {
    const {error}=operation==='delete' ? await store.remove([item.id]) : await store.move(item.id,item.destination!);
    if(error) failed.push({id:item.id,error:'Não foi possível alterar esta foto. Atualize a lista e tente novamente.'});
    else succeeded.push(item.id);
  }
  return {succeeded,failed};
}
Deno.serve(async req=>{
  if(req.method==='OPTIONS') return new Response('ok',{headers:cors});
  if(req.method!=='POST') return reply(405,{error:'Método não permitido.'});
  try {
    const size=Number(req.headers.get('content-length') ?? 0);
    if(size>32000) throw new ApiError('Solicitação muito grande.',413);
    const raw=await req.text();
    if(raw.length>32000) throw new ApiError('Solicitação muito grande.',413);
    return reply(200,await handle(JSON.parse(raw)));
  } catch(error) {
    return reply(error instanceof ApiError ? error.status : 400,{error:error instanceof ApiError || (error instanceof Error && /seleção|ação/i.test(error.message)) ? error.message : 'Não foi possível concluir a operação do álbum.'});
  }
});
