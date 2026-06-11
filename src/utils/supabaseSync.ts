import { createClient } from '@supabase/supabase-js';
import { MemoryMilestone, LoveLetter } from '../types';
import { getImageLocal, saveImageLocal } from './imageDb';

let supabase: ReturnType<typeof createClient> | null = null;

export function initSupabase(url: string, key: string) {
  try {
    supabase = createClient(url, key);
    localStorage.setItem('supabase_sync_url', url);
    localStorage.setItem('supabase_sync_key', key);
    return true;
  } catch (e) {
    console.error("Failed to initialize Supabase:", e);
    return false;
  }
}

export function disconnectSupabase() {
  supabase = null;
  localStorage.removeItem('supabase_sync_url');
  localStorage.removeItem('supabase_sync_key');
}

export function getSupabase() {
  if (supabase) return supabase;
  const url = localStorage.getItem('supabase_sync_url');
  const key = localStorage.getItem('supabase_sync_key');
  if (url && key) {
    try {
      supabase = createClient(url, key);
      return supabase;
    } catch (e) {
      console.error("Auto init Supabase failed:", e);
    }
  }
  return null;
}

export function isSupabaseConnected() {
  return getSupabase() !== null;
}

// SQL schema scripts that the user can run in Supabase SQL editor
export const SUPABASE_SQL_SCHEMA = `-- Create wishes table
create table if not exists public.sea_wishes (
  id text primary key,
  sender text not null,
  content text not null,
  timestamp text not null,
  "hasCodedSeal" boolean default false,
  "isFavorite" boolean default false,
  created_at timestamptz default now()
);

-- Enable RLS & Allow public access
alter table public.sea_wishes enable row level security;
create policy "Allow public read/write access to wishes" on public.sea_wishes 
  for all using (true) with check (true);

-- Create milestones table
create table if not exists public.sea_milestones (
  id text primary key,
  date text not null,
  title text not null,
  description text not null,
  icon text not null,
  image text,
  created_at timestamptz default now()
);

-- Enable RLS & Allow public access
alter table public.sea_milestones enable row level security;
create policy "Allow public read/write access to milestones" on public.sea_milestones 
  for all using (true) with check (true);

-- Create images table
create table if not exists public.sea_images (
  id text primary key,
  base64 text not null,
  created_at timestamptz default now()
);

-- Enable RLS & Allow public access
alter table public.sea_images enable row level security;
create policy "Allow public read/write access to images" on public.sea_images 
  for all using (true) with check (true);
`;

/**
 * Bi-directional Sync of Wishes/Letters
 */
export async function syncWishes(localWishes: LoveLetter[]): Promise<LoveLetter[]> {
  const client = getSupabase();
  if (!client) return localWishes;

  try {
    // 1. Fetch remote wishes
    const { data: remoteWishes, error } = await client
      .from('sea_wishes')
      .select('*');

    if (error) throw error;

    const remoteWishesTyped = (remoteWishes || []) as LoveLetter[];
    const mergedMap = new Map<string, LoveLetter>();

    // Add local ones to map
    localWishes.forEach(w => mergedMap.set(w.id, w));

    // Add remote ones (remote wins conflict or updates local)
    remoteWishesTyped.forEach(rw => {
      mergedMap.set(rw.id, rw);
    });

    const mergedList = Array.from(mergedMap.values());

    // 2. Identify local wishes that need to be pushed to remote
    const remoteIds = new Set(remoteWishesTyped.map(w => w.id));
    const toPush = localWishes.filter(w => !remoteIds.has(w.id));

    if (toPush.length > 0) {
      const { error: pushError } = await client
        .from('sea_wishes')
        .upsert(toPush);
      if (pushError) console.warn("Failed to push new wishes to Supabase:", pushError);
    }

    return mergedList;
  } catch (err) {
    console.error("Wish sync failed, falling back to local data:", err);
    return localWishes;
  }
}

/**
 * Bi-directional Sync of Milestones/Memories and their base64 images
 */
export async function syncMilestones(localMemories: MemoryMilestone[]): Promise<MemoryMilestone[]> {
  const client = getSupabase();
  if (!client) return localMemories;

  try {
    // 1. Fetch remote milestones
    const { data: remoteMems, error } = await client
      .from('sea_milestones')
      .select('*');

    if (error) throw error;

    const remoteMemsTyped = (remoteMems || []) as MemoryMilestone[];
    const mergedMap = new Map<string, MemoryMilestone>();

    // Add local ones
    localMemories.forEach(m => mergedMap.set(m.id, m));

    // Add remote ones
    remoteMemsTyped.forEach(rm => {
      mergedMap.set(rm.id, rm);
    });

    const mergedList = Array.from(mergedMap.values());

    // 2. Identify local milestones to push to remote
    const remoteIds = new Set(remoteMemsTyped.map(m => m.id));
    const toPush = localMemories.filter(m => !remoteIds.has(m.id));

    if (toPush.length > 0) {
      const { error: pushError } = await client
        .from('sea_milestones')
        .upsert(toPush);
      if (pushError) console.warn("Failed to push milestones to Supabase:", pushError);
    }

    // 3. Image database syncing (IndexedDB <-> Supabase)
    // Run asynchronously in background to not block UI rendering
    syncImagesInBackground(mergedList, client).catch(e => console.warn("Image sync error:", e));

    return mergedList;
  } catch (err) {
    console.error("Milestone sync failed, falling back to local data:", err);
    return localMemories;
  }
}

/**
 * Background Sync of base64 images
 */
async function syncImagesInBackground(memories: MemoryMilestone[], client: ReturnType<typeof createClient>) {
  for (const memory of memories) {
    const imgKey = memory.image;
    if (!imgKey || !imgKey.startsWith('image-')) continue;

    try {
      // Check if image exists locally
      const localBase64 = await getImageLocal(imgKey);

      // Check if image exists on remote
      const { data: remoteImg, error } = await client
        .from('sea_images')
        .select('id')
        .eq('id', imgKey)
        .maybeSingle();

      if (error) {
        console.warn(`Failed to inspect remote image presence for ${imgKey}:`, error);
        continue;
      }

      if (localBase64 && !remoteImg) {
        // Push local image to remote
        console.log(`Pushing image ${imgKey} to Supabase...`);
        await client
          .from('sea_images')
          .upsert({ id: imgKey, base64: localBase64 });
      } else if (!localBase64 && remoteImg) {
        // Pull remote image to local IndexedDB
        console.log(`Downloading image ${imgKey} from Supabase...`);
        const { data: fetchedImg, error: fetchErr } = await client
          .from('sea_images')
          .select('base64')
          .eq('id', imgKey)
          .single();

        if (fetchErr) {
          console.warn(`Failed to download remote image ${imgKey}:`, fetchErr);
        } else if (fetchedImg && fetchedImg.base64) {
          await saveImageLocal(imgKey, fetchedImg.base64);
          // Dispatch custom event to tell UI that PolaroidImage needs to re-fetch
          window.dispatchEvent(new CustomEvent('local_image_updated', { detail: { id: imgKey } }));
        }
      }
    } catch (e) {
      console.warn(`Error syncing image ${imgKey}:`, e);
    }
  }
}

/**
 * Single push helpers to call when adding item locally
 */
export async function pushSingleWish(wish: LoveLetter) {
  const client = getSupabase();
  if (!client) return;
  await client.from('sea_wishes').upsert(wish);
}

export async function pushSingleMilestone(milestone: MemoryMilestone) {
  const client = getSupabase();
  if (!client) return;
  await client.from('sea_milestones').upsert(milestone);

  // If it has a local image, push it too
  const imgKey = milestone.image;
  if (imgKey && imgKey.startsWith('image-')) {
    const base64 = await getImageLocal(imgKey);
    if (base64) {
      await client.from('sea_images').upsert({ id: imgKey, base64 });
    }
  }
}

export async function deleteSingleWish(id: string) {
  const client = getSupabase();
  if (!client) return;
  await client.from('sea_wishes').delete().eq('id', id);
}

export async function deleteSingleMilestone(id: string, imgKey?: string) {
  const client = getSupabase();
  if (!client) return;
  await client.from('sea_milestones').delete().eq('id', id);
  if (imgKey && imgKey.startsWith('image-')) {
    await client.from('sea_images').delete().eq('id', imgKey);
  }
}
