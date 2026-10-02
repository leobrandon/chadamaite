import { createClient } from "npm:@supabase/supabase-js@2";
import { bytesToHex, derivePinHash, equalSecret, randomHex } from "./auth-utils.mjs";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const secretKeys = JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") ?? "{}");
const serviceKey = secretKeys.default ?? Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const publishableKeys = JSON.parse(Deno.env.get("SUPABASE_PUBLISHABLE_KEYS") ?? "{}");
const allowedApiKeys = new Set([
  ...Object.values(publishableKeys),
  Deno.env.get("SUPABASE_ANON_KEY") ?? "",
].filter((value): value is string => typeof value === "string" && value.length > 0));

if (!SUPABASE_URL || !serviceKey) {
  throw new Error("Supabase server credentials are unavailable.");
}

const db = createClient(SUPABASE_URL, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json; charset=utf-8",
};

class ApiError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

const respond = (status: number, data: unknown) =>
  new Response(JSON.stringify(data), { status, headers: corsHeaders });

function requireValue<T>(value: T | null | undefined, message = "Registro não encontrado."): T {
  if (value === null || value === undefined) throw new ApiError(message, 404);
  return value;
}

function cleanText(value: unknown, maxLength: number, fallback = "") {
  if (value === null || value === undefined) return fallback;
  return String(value)
    .replace(/<[^>]*>/g, "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim()
    .slice(0, maxLength)
    .trim();
}

function cleanName(value: unknown, maxLength = 80) {
  return cleanText(value, maxLength).replace(/\s+/g, " ");
}

function hexToBytes(value: string) {
  if (!/^(?:[0-9a-f]{2})+$/i.test(value)) throw new ApiError("Credencial inválida.", 500);
  return new Uint8Array(value.match(/.{2}/g)!.map((pair) => parseInt(pair, 16)));
}

function base64Url(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function fromBase64Url(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(normalized + "=".repeat((4 - normalized.length % 4) % 4));
  return new Uint8Array(Array.from(binary, (character) => character.charCodeAt(0)));
}

async function digestHex(value: string) {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return bytesToHex(new Uint8Array(bytes));
}

function equalHex(left: string, right: string) {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let i = 0; i < left.length; i += 1) {
    difference |= left.charCodeAt(i) ^ right.charCodeAt(i);
  }
  return difference === 0;
}

async function getCredentials() {
  const { data, error } = await db
    .from("admin_credentials")
    .select("id, pin_salt, pin_hash, pin_iterations")
    .eq("id", true)
    .maybeSingle();
  if (error) throw new ApiError("Não foi possível validar o acesso administrativo.", 503);
  return data ?? null;
}

async function signSession(pinHashValue: string) {
  const now = Date.now();
  const payload = {
    sub: "admin",
    aud: SUPABASE_URL,
    iat: now,
    exp: now + 30 * 60 * 1000,
    nonce: crypto.randomUUID(),
  };
  const payloadPart = base64Url(new TextEncoder().encode(JSON.stringify(payload)));
  const key = await crypto.subtle.importKey(
    "raw",
    hexToBytes(pinHashValue),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payloadPart));
  return `${payloadPart}.${base64Url(new Uint8Array(signature))}`;
}

async function verifySession(token: unknown, pinHashValue: string) {
  if (typeof token !== "string") return false;
  const [payloadPart, signaturePart, extra] = token.split(".");
  if (!payloadPart || !signaturePart || extra) return false;

  try {
    const key = await crypto.subtle.importKey(
      "raw",
      hexToBytes(pinHashValue),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"],
    );
    const validSignature = await crypto.subtle.verify(
      "HMAC",
      key,
      fromBase64Url(signaturePart),
      new TextEncoder().encode(payloadPart),
    );
    if (!validSignature) return false;
    const payload = JSON.parse(new TextDecoder().decode(fromBase64Url(payloadPart)));
    return payload.sub === "admin" &&
      payload.aud === SUPABASE_URL &&
      Number(payload.exp) > Date.now() &&
      Number(payload.iat) <= Date.now() + 60_000;
  } catch {
    return false;
  }
}

async function requestIpHash(req: Request, salt: string) {
  const forwarded = req.headers.get("cf-connecting-ip") ??
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown";
  return await digestHex(`${salt}:${forwarded}`);
}

async function getActiveAttempts(ipHash: string) {
  const { data, error } = await db
    .from("admin_login_attempts")
    .select("failures, window_started_at, blocked_until")
    .eq("ip_hash", ipHash)
    .maybeSingle();
  if (error) throw new ApiError("Não foi possível validar o acesso administrativo.", 503);
  return data;
}

async function recordFailedAttempt(ipHash: string, attempt: Record<string, unknown> | null) {
  const now = Date.now();
  const windowStart = Date.parse(String(attempt?.window_started_at ?? ""));
  const inWindow = Number.isFinite(windowStart) && now - windowStart < 15 * 60 * 1000;
  const failures = inWindow ? Number(attempt?.failures ?? 0) + 1 : 1;
  const { error } = await db.from("admin_login_attempts").upsert({
    ip_hash: ipHash,
    failures,
    window_started_at: inWindow ? new Date(windowStart).toISOString() : new Date(now).toISOString(),
    blocked_until: failures >= 5 ? new Date(now + 15 * 60 * 1000).toISOString() : null,
  }, { onConflict: "ip_hash" });
  if (error) throw new ApiError("Não foi possível registrar a tentativa de acesso.", 503);
}

async function clearAttempts(ipHash: string) {
  const { error } = await db.from("admin_login_attempts").delete().eq("ip_hash", ipHash);
  if (error) throw new ApiError("Não foi possível concluir o acesso administrativo.", 503);
}

async function login(req: Request, pin: unknown) {
  if (typeof pin !== "string" || pin.length < 4 || pin.length > 25) {
    throw new ApiError("Senha incorreta.", 401);
  }
  let credentials = await getCredentials();
  const ipHashSalt = credentials?.pin_salt ?? await digestHex(`legacy-admin:${serviceKey}`);
  const ipHash = await requestIpHash(req, ipHashSalt);
  const attempt = await getActiveAttempts(ipHash);
  if (attempt?.blocked_until && Date.parse(attempt.blocked_until) > Date.now()) {
    throw new ApiError("Muitas tentativas. Aguarde 15 minutos antes de tentar novamente.", 429);
  }

  if (credentials) {
    const suppliedHash = await derivePinHash(pin, credentials.pin_salt, credentials.pin_iterations);
    if (!equalHex(suppliedHash, credentials.pin_hash)) {
      await recordFailedAttempt(ipHash, attempt);
      throw new ApiError("Senha incorreta.", 401);
    }
  } else {
    const { data: legacyConfig, error: legacyError } = await db
      .from("event_config")
      .select("admin_pin, updated_at")
      .eq("id", "default_config")
      .maybeSingle();
    if (legacyError) throw new ApiError("Não foi possível validar o acesso administrativo.", 503);
    const legacyPin = legacyConfig?.admin_pin;
    if (typeof legacyPin !== "string" || !legacyPin) {
      throw new ApiError("O acesso administrativo está temporariamente indisponível.", 503);
    }
    if (!equalSecret(pin, legacyPin)) {
      await recordFailedAttempt(ipHash, attempt);
      throw new ApiError("Senha incorreta.", 401);
    }

    const pinSalt = randomHex(32);
    const migratedPinHash = await derivePinHash(pin, pinSalt, 310_000);
    const { error: migrationError } = await db.rpc("migrate_legacy_admin_credentials", {
      p_pin_salt: pinSalt,
      p_pin_hash: migratedPinHash,
      p_pin_iterations: 310_000,
      p_expected_updated_at: legacyConfig.updated_at,
    });
    if (migrationError) throw new ApiError("Não foi possível concluir o acesso administrativo. Tente novamente.", 503);

    credentials = await getCredentials();
    if (!credentials) {
      throw new ApiError("As configurações de acesso foram atualizadas. Tente entrar novamente.", 409);
    }
    const confirmedHash = await derivePinHash(pin, credentials.pin_salt, credentials.pin_iterations);
    if (!equalHex(confirmedHash, credentials.pin_hash)) {
      await recordFailedAttempt(ipHash, attempt);
      throw new ApiError("Senha incorreta.", 401);
    }
  }

  if (!credentials) {
    await recordFailedAttempt(ipHash, attempt);
    throw new ApiError("O acesso administrativo está temporariamente indisponível.", 503);
  }

  await clearAttempts(ipHash);
  return { token: await signSession(credentials.pin_hash), expiresInSeconds: 1800 };
}

async function requireAdmin(token: unknown) {
  const credentials = await getCredentials();
  if (!await verifySession(token, credentials.pin_hash)) {
    throw new ApiError("Sessão administrativa expirada. Entre novamente.", 401);
  }
  return credentials;
}

function mapGiftInput(source: Record<string, unknown>, includeId = true) {
  const title = cleanText(source.title, 160);
  const category = cleanText(source.category, 80);
  if (!title || !category) throw new ApiError("Informe o nome e a categoria do presente.");
  return {
    ...(includeId ? { id: cleanText(source.id, 100) || `gift-${crypto.randomUUID()}` } : {}),
    title,
    category,
    description: cleanText(source.description, 1000),
    icon: cleanText(source.icon, 32, "🎁") || "🎁",
    status: source.status === "reserved" ? "reserved" : "available",
    reserved_by: cleanName(source.reservedBy ?? source.reserved_by),
    reserved_at: source.reservedAt ?? source.reserved_at ?? null,
    priority: ["low", "medium", "high"].includes(String(source.priority)) ? source.priority : "medium",
    target_quantity: Math.max(1, Math.min(999, Number(source.targetQuantity ?? source.target_quantity) || 1)),
    display_order: Math.trunc(Number(source.displayOrder ?? source.display_order) || 999),
  };
}

function mapRsvpInput(source: Record<string, unknown>) {
  const name = cleanName(source.name);
  if (!name) throw new ApiError("O nome do convidado é obrigatório.");
  const attending = Boolean(source.attending);
  const rawCompanions = source.companionNames ?? source.companion_names;
  const companions = Array.isArray(rawCompanions)
    ? rawCompanions.slice(0, 20).map((item) => cleanName(item)).filter(Boolean)
    : [];
  return {
    name,
    attending,
    adults_count: attending ? Math.max(1, Math.min(20, Number(source.adultsCount ?? source.adults_count) || 1)) : 0,
    children_count: attending ? Math.max(0, Math.min(20, Number(source.childrenCount ?? source.children_count) || 0)) : 0,
    companion_names: attending ? companions : [],
    phone: cleanText(source.phone, 30),
    message: cleanText(source.message, 500),
  };
}

function mapMessageInput(source: Record<string, unknown>, status: "pending" | "approved" = "pending") {
  const author = cleanName(source.author) || "Amigo com carinho";
  const text = cleanText(source.text, 500);
  if (!text) throw new ApiError("Escreva um recado antes de enviar.");
  return {
    id: cleanText(source.id, 100) || `msg-${crypto.randomUUID()}`,
    author,
    text,
    date: new Date().toISOString(),
    likes: 0,
    status,
    created_at: new Date().toISOString(),
  };
}

async function dataOrThrow(query: PromiseLike<{ data: unknown; error: { message?: string } | null }>, message: string) {
  const { data, error } = await query;
  if (error) throw new ApiError(message, 400);
  return data;
}

async function handleAction(body: Record<string, unknown>, req: Request) {
  const action = String(body.action ?? "");

  if (action === "admin-login") {
    return await login(req, body.pin);
  }

  const isAdmin = action.startsWith("admin-");
  if (isAdmin) await requireAdmin(body.token);

  switch (action) {
    case "public-submit-rsvp": {
      const input = mapRsvpInput((body.rsvp ?? {}) as Record<string, unknown>);
      const rsvp = { id: `rsvp-${crypto.randomUUID()}`, ...input, created_at: new Date().toISOString() };
      const insertedRsvp = await dataOrThrow(
        db.from("rsvps").insert(rsvp).select("*").single(),
        "Não foi possível salvar a confirmação. Tente novamente.",
      ) as Record<string, unknown>;

      if (input.message) {
        const message = mapMessageInput({ author: input.name, text: input.message }, "pending");
        const { error } = await db.from("messages").insert(message);
        if (error) {
          await db.from("rsvps").delete().eq("id", rsvp.id);
          throw new ApiError("Não foi possível salvar a confirmação e o recado. Tente novamente.", 400);
        }
        return { rsvp: insertedRsvp, message };
      }
      return { rsvp: insertedRsvp, message: null };
    }

    case "public-submit-message": {
      const message = mapMessageInput((body.message ?? {}) as Record<string, unknown>);
      await dataOrThrow(
        db.from("messages").insert(message).select("*").single(),
        "Não foi possível enviar o recado. Tente novamente.",
      );
      return { message };
    }

    case "public-add-pledge": {
      const giftId = cleanText(body.giftId, 100);
      const giverName = cleanName(body.giverName) || "Amigo do Chá";
      const quantity = Math.max(1, Math.min(999, Math.trunc(Number(body.quantity) || 1)));
      if (!giftId) throw new ApiError("Selecione um presente.");
      const pledge = {
        id: `pledge-${crypto.randomUUID()}`,
        gift_id: giftId,
        giver_name: giverName,
        quantity,
      };
      await dataOrThrow(
        db.from("gift_pledges").insert(pledge).select("*").single(),
        "A quantidade disponível pode ter sido atingida. Atualize a página e tente novamente.",
      );
      return { pledge };
    }

    case "public-reserve-gift": {
      const giftId = cleanText(body.giftId, 100);
      const reservedBy = cleanName(body.guestName) || "Convidado com carinho";
      if (!giftId) throw new ApiError("Selecione um presente.");
      const { data, error } = await db
        .from("gifts")
        .update({ status: "reserved", reserved_by: reservedBy, reserved_at: new Date().toISOString() })
        .eq("id", giftId)
        .eq("status", "available")
        .select("id, status")
        .maybeSingle();
      if (error) throw new ApiError("Não foi possível reservar este presente. Tente novamente.", 400);
      if (!data) throw new ApiError("Este presente já foi reservado. Atualize a lista.", 409);
      return { gift: data };
    }

    case "public-like-message": {
      const messageId = cleanText(body.messageId, 100);
      if (!messageId) throw new ApiError("Recado inválido.");
      const likes = await dataOrThrow(
        db.rpc("increment_message_likes", { p_message_id: messageId }),
        "Não foi possível registrar a curtida.",
      );
      return { id: messageId, likes };
    }

    case "admin-gifts": {
      return await dataOrThrow(
        db.from("gifts").select("*").order("display_order", { ascending: true }),
        "Não foi possível carregar os presentes.",
      );
    }
    case "admin-rsvps": {
      return await dataOrThrow(
        db.from("rsvps").select("*").order("created_at", { ascending: false }),
        "Não foi possível carregar as confirmações.",
      );
    }
    case "admin-messages": {
      return await dataOrThrow(
        db.from("messages").select("*").order("created_at", { ascending: false }),
        "Não foi possível carregar os recados.",
      );
    }
    case "admin-pledges": {
      return await dataOrThrow(
        db.from("gift_pledges").select("*").order("created_at", { ascending: true }),
        "Não foi possível carregar as contribuições.",
      );
    }
    case "admin-update-rsvp": {
      const id = cleanText(body.id, 100);
      const fields = (body.fields ?? {}) as Record<string, unknown>;
      const existing = await dataOrThrow(
        db.from("rsvps").select("*").eq("id", id).maybeSingle(),
        "Não foi possível carregar a confirmação.",
      );
      const current = requireValue(existing as Record<string, unknown>);
      const update = mapRsvpInput({ ...current, ...fields });
      const data = await dataOrThrow(
        db.from("rsvps").update(update).eq("id", id).select("*").maybeSingle(),
        "Não foi possível atualizar a confirmação.",
      );
      return requireValue(data as Record<string, unknown>);
    }
    case "admin-delete-rsvp": {
      const id = cleanText(body.id, 100);
      await dataOrThrow(db.from("rsvps").delete().eq("id", id), "Não foi possível excluir a confirmação.");
      return { id };
    }
    case "admin-approve-message": {
      const id = cleanText(body.id, 100);
      const data = await dataOrThrow(
        db.from("messages").update({ status: "approved" }).eq("id", id).select("*").maybeSingle(),
        "Não foi possível aprovar o recado.",
      );
      return requireValue(data as Record<string, unknown>);
    }
    case "admin-update-message": {
      const id = cleanText(body.id, 100);
      const fields = (body.fields ?? {}) as Record<string, unknown>;
      const update: Record<string, string> = {};
      if (fields.author !== undefined) update.author = cleanName(fields.author);
      if (fields.text !== undefined) {
        update.text = cleanText(fields.text, 500);
        if (!update.text) throw new ApiError("O recado não pode ficar vazio.");
      }
      if (!Object.keys(update).length) throw new ApiError("Nenhuma alteração foi informada.");
      const data = await dataOrThrow(
        db.from("messages").update(update).eq("id", id).select("*").maybeSingle(),
        "Não foi possível atualizar o recado.",
      );
      return requireValue(data as Record<string, unknown>);
    }
    case "admin-delete-message": {
      const id = cleanText(body.id, 100);
      await dataOrThrow(db.from("messages").delete().eq("id", id), "Não foi possível excluir o recado.");
      return { id };
    }
    case "admin-delete-pledge": {
      const id = cleanText(body.id, 100);
      await dataOrThrow(db.from("gift_pledges").delete().eq("id", id), "Não foi possível cancelar a contribuição.");
      return { id };
    }
    case "admin-create-gift": {
      const gift = mapGiftInput((body.gift ?? {}) as Record<string, unknown>);
      const data = await dataOrThrow(
        db.from("gifts").insert(gift).select("*").single(),
        "Não foi possível adicionar o presente.",
      );
      return data;
    }
    case "admin-update-gift": {
      const id = cleanText(body.id, 100);
      const fields = (body.fields ?? {}) as Record<string, unknown>;
      const existing = await dataOrThrow(
        db.from("gifts").select("*").eq("id", id).maybeSingle(),
        "Não foi possível carregar o presente.",
      );
      const current = requireValue(existing as Record<string, unknown>);
      const gift = mapGiftInput({ ...current, ...fields, id });
      const { data: total, error: totalError } = await db
        .from("gift_pledge_totals")
        .select("pledged_quantity")
        .eq("gift_id", id)
        .maybeSingle();
      if (totalError) throw new ApiError("Não foi possível verificar a meta atual.", 400);
      if (Number(total?.pledged_quantity ?? 0) > gift.target_quantity) {
        throw new ApiError("A nova meta não pode ser menor que a quantidade já escolhida.");
      }
      const { id: _id, ...update } = gift;
      const data = await dataOrThrow(
        db.from("gifts").update(update).eq("id", id).select("*").maybeSingle(),
        "Não foi possível atualizar o presente.",
      );
      return requireValue(data as Record<string, unknown>);
    }
    case "admin-delete-gift": {
      const id = cleanText(body.id, 100);
      await dataOrThrow(db.from("gifts").delete().eq("id", id), "Não foi possível excluir o presente.");
      return { id };
    }
    case "admin-reset-gifts": {
      if (!Array.isArray(body.gifts) || body.gifts.length === 0 || body.gifts.length > 200) {
        throw new ApiError("A lista de presentes padrão está inválida.");
      }
      const gifts = body.gifts.map((value) => mapGiftInput(value as Record<string, unknown>));
      await dataOrThrow(
        db.from("gifts").upsert(gifts, { onConflict: "id" }),
        "Não foi possível restaurar a lista padrão.",
      );
      const ids = gifts.map((gift) => gift.id);
      const { error } = await db.from("gifts").delete().not("id", "in", `(${ids.map((id) => `"${id.replaceAll('"', '')}"`).join(",")})`);
      if (error) throw new ApiError("A lista padrão foi salva, mas alguns presentes antigos não foram removidos.", 400);
      return gifts;
    }
    case "admin-cancel-reservation": {
      const id = cleanText(body.id, 100);
      const data = await dataOrThrow(
        db.from("gifts")
          .update({ status: "available", reserved_by: "", reserved_at: null })
          .eq("id", id)
          .select("*")
          .maybeSingle(),
        "Não foi possível liberar o presente.",
      );
      return requireValue(data as Record<string, unknown>);
    }
    case "admin-save-config": {
      const source = (body.config ?? {}) as Record<string, unknown>;
      const config = {
        id: "default_config",
        baby_name: cleanText(source.babyName, 100),
        parents: cleanText(source.parents, 150),
        event_date: cleanText(source.date, 20),
        event_time: cleanText(source.time, 20),
        display_date: cleanText(source.displayDate, 100),
        display_time: cleanText(source.displayTime, 100),
        location_name: cleanText(source.locationName, 160),
        address: cleanText(source.address, 300),
        city: cleanText(source.city, 100),
        map_url: cleanText(source.mapUrl, 1000),
        pix_key: cleanText(source.pixKey, 160),
        pix_name: cleanText(source.pixName, 120),
        welcome_message: cleanText(source.welcomeMessage, 1000),
        updated_at: new Date().toISOString(),
      };
      if (Object.values(config).some((value) => value === "")) {
        throw new ApiError("Preencha todos os campos de configuração antes de salvar.");
      }

      const newPin = typeof body.newPin === "string" ? body.newPin.trim() : "";
      let replacementCredentials: Record<string, unknown> | null = null;
      if (newPin) {
        if (newPin.length < 8 || newPin.length > 25) {
          throw new ApiError("O novo PIN deve ter entre 8 e 25 caracteres.");
        }
        const salt = crypto.getRandomValues(new Uint8Array(32));
        const saltHex = bytesToHex(salt);
        replacementCredentials = {
          pin_salt: saltHex,
          pin_hash: await derivePinHash(newPin, saltHex, 310000),
          pin_iterations: 310000,
          updated_at: new Date().toISOString(),
        };
      }

      const savedConfig = await dataOrThrow(
        db.from("event_config").upsert(config, { onConflict: "id" })
          .select("id,baby_name,parents,event_date,event_time,display_date,display_time,location_name,address,city,map_url,pix_key,pix_name,welcome_message,updated_at")
          .single(),
        "Não foi possível salvar as configurações.",
      );
      let token: string | null = null;
      if (replacementCredentials) {
        const updated = await dataOrThrow(
          db.from("admin_credentials").update(replacementCredentials).eq("id", true).select("pin_hash").single(),
          "As configurações foram salvas, mas não foi possível alterar o PIN.",
        ) as { pin_hash: string };
        token = await signSession(updated.pin_hash);
      }
      return { config: savedConfig, token };
    }
    default:
      throw new ApiError("Ação não reconhecida.", 404);
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return respond(405, { error: "Método não permitido." });

  const suppliedKey = req.headers.get("apikey") ?? "";
  if (!allowedApiKeys.has(suppliedKey)) return respond(401, { error: "Chave de API inválida." });

  try {
    const body = await req.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      throw new ApiError("Requisição inválida.", 400);
    }
    return respond(200, await handleAction(body as Record<string, unknown>, req));
  } catch (error) {
    if (error instanceof ApiError) return respond(error.status, { error: error.message });
    console.error("app-api request failed:", error instanceof Error ? error.message : "unknown error");
    return respond(500, { error: "Ocorreu um erro ao processar sua solicitação." });
  }
});
