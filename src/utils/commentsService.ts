import type { TaskComment, UserRole } from '../types';
import { supabase, isSupabaseConfigured } from './supabase';

const COMMENTS_CACHE_PREFIX = 'b2_task_comments_';

function getLocalCache(targetKey: string): TaskComment[] {
  try {
    const raw = localStorage.getItem(`${COMMENTS_CACHE_PREFIX}${targetKey}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setLocalCache(targetKey: string, comments: TaskComment[]): void {
  try {
    localStorage.setItem(`${COMMENTS_CACHE_PREFIX}${targetKey}`, JSON.stringify(comments));
  } catch (e) {
    console.warn('Failed to cache comments locally:', e);
  }
}

export function buildTargetKey(testId: string, tileType: string, variantId: string): string {
  return `${testId}_${tileType}_${variantId}`.trim().toLowerCase();
}

/**
 * Fetch ALL comments across all tasks for the Admin moderation tab
 */
export async function fetchAllCommentsAdmin(): Promise<TaskComment[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('task_comments')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        return data.map((row: Record<string, unknown>) => ({
          id: String(row.id),
          testId: String(row.test_id),
          tileType: String(row.tile_type),
          variantId: String(row.variant_id),
          targetKey: String(row.target_key),
          userId: String(row.user_id),
          userName: String(row.user_name || 'Gast'),
          userRole: (row.user_role as UserRole) || 'user',
          userEmail: row.user_email ? String(row.user_email) : undefined,
          content: String(row.content || ''),
          upvotes: Number(row.upvotes || 0),
          upvotedBy: Array.isArray(row.upvoted_by) ? (row.upvoted_by as string[]) : [],
          isVerified: Boolean(row.is_verified),
          isPinned: Boolean(row.is_pinned),
          createdAt: String(row.created_at),
        }));
      }
    } catch (err) {
      console.warn('Supabase fetchAllCommentsAdmin error:', err);
    }
  }

  // Fallback to searching all localStorage keys with prefix
  const all: TaskComment[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(COMMENTS_CACHE_PREFIX)) {
        const raw = localStorage.getItem(key);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            all.push(...parsed);
          }
        }
      }
    }
  } catch (e) {
    console.warn(e);
  }
  return all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

/**
 * Fetch comments for a specific task variant
 */
export async function fetchCommentsForTask(
  testId: string,
  tileType: string,
  variantId: string
): Promise<TaskComment[]> {
  const targetKey = buildTargetKey(testId, tileType, variantId);

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('task_comments')
        .select('*')
        .eq('target_key', targetKey)
        .order('created_at', { ascending: true });

      if (!error && data) {
        const mapped: TaskComment[] = data.map((row: Record<string, unknown>) => ({
          id: String(row.id),
          testId: String(row.test_id),
          tileType: String(row.tile_type),
          variantId: String(row.variant_id),
          targetKey: String(row.target_key),
          userId: String(row.user_id),
          userName: String(row.user_name || 'Gast'),
          userRole: (row.user_role as UserRole) || 'user',
          userEmail: row.user_email ? String(row.user_email) : undefined,
          content: String(row.content || ''),
          upvotes: Number(row.upvotes || 0),
          upvotedBy: Array.isArray(row.upvoted_by) ? (row.upvoted_by as string[]) : [],
          isVerified: Boolean(row.is_verified),
          isPinned: Boolean(row.is_pinned),
          createdAt: String(row.created_at),
        }));

        // Auto-sync any unsynced local comments from this device to Supabase
        const localList = getLocalCache(targetKey);
        const serverIds = new Set(mapped.map((m) => m.id));
        const unsynced = localList.filter((c) => !serverIds.has(c.id));
        if (unsynced.length > 0) {
          for (const c of unsynced) {
            supabase
              .from('task_comments')
              .insert({
                id: c.id,
                test_id: c.testId,
                tile_type: c.tileType,
                variant_id: c.variantId,
                target_key: c.targetKey,
                user_id: c.userId,
                user_name: c.userName,
                user_role: c.userRole,
                user_email: c.userEmail || null,
                content: c.content,
                upvotes: c.upvotes || 0,
                upvoted_by: c.upvotedBy || [],
                is_verified: c.isVerified || false,
                is_pinned: c.isPinned || false,
                created_at: c.createdAt,
              })
              .then(({ error: syncErr }) => {
                if (syncErr) console.warn('Sync unsynced comment error:', syncErr);
              });
            mapped.push(c);
          }
        }

        setLocalCache(targetKey, mapped);
        return mapped;
      }
    } catch (err) {
      console.warn('Supabase fetchComments error, falling back to localStorage:', err);
    }
  }

  return getLocalCache(targetKey);
}

/**
 * Post a new comment
 */
export async function createTaskComment(params: {
  testId: string;
  tileType: string;
  variantId: string;
  userId: string;
  userName: string;
  userRole?: UserRole;
  userEmail?: string;
  content: string;
}): Promise<{ success: boolean; comment?: TaskComment; error?: string }> {
  const targetKey = buildTargetKey(params.testId, params.tileType, params.variantId);
  const now = new Date().toISOString();
  const commentId = `cmt-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;

  const newComment: TaskComment = {
    id: commentId,
    testId: params.testId,
    tileType: params.tileType,
    variantId: params.variantId,
    targetKey,
    userId: params.userId,
    userName: params.userName.trim() || 'Gast',
    userRole: params.userRole || 'user',
    userEmail: params.userEmail,
    content: params.content.trim(),
    upvotes: 0,
    upvotedBy: [],
    isVerified: params.userRole === 'admin',
    isPinned: false,
    createdAt: now,
  };

  // Update local cache
  const localList = getLocalCache(targetKey);
  const updatedLocal = [...localList, newComment];
  setLocalCache(targetKey, updatedLocal);

  // Sync to Supabase
  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase.from('task_comments').insert({
        id: newComment.id,
        test_id: newComment.testId,
        tile_type: newComment.tileType,
        variant_id: newComment.variantId,
        target_key: newComment.targetKey,
        user_id: newComment.userId,
        user_name: newComment.userName,
        user_role: newComment.userRole,
        user_email: newComment.userEmail || null,
        content: newComment.content,
        upvotes: 0,
        upvoted_by: [],
        is_verified: newComment.isVerified,
        is_pinned: false,
        created_at: now,
      });

      if (error) {
        console.error('Could not save comment in Supabase:', error);
        return {
          success: false,
          error: `Cloud-Sync Fehler: ${error.message} (Tabelle task_comments existiert möglicherweise noch nicht in Supabase).`,
        };
      }
    } catch (e: unknown) {
      console.error('Supabase post comment exception:', e);
      const msg = e instanceof Error ? e.message : 'Verbindungsfehler';
      return { success: false, error: msg };
    }
  }

  return { success: true, comment: newComment };
}

/**
 * Toggle Upvote for a comment
 */
export async function toggleUpvoteComment(
  commentId: string,
  targetKey: string,
  currentUserId: string
): Promise<{ success: boolean; upvotes: number; hasUpvoted: boolean }> {
  const localList = getLocalCache(targetKey);
  const idx = localList.findIndex((c) => c.id === commentId);

  let newUpvotes = 0;
  let hasUpvoted = false;

  if (idx >= 0) {
    const comment = localList[idx];
    const upvotedBy = new Set(comment.upvotedBy || []);

    if (upvotedBy.has(currentUserId)) {
      upvotedBy.delete(currentUserId);
      hasUpvoted = false;
    } else {
      upvotedBy.add(currentUserId);
      hasUpvoted = true;
    }

    newUpvotes = upvotedBy.size;
    const updatedComment: TaskComment = {
      ...comment,
      upvotes: newUpvotes,
      upvotedBy: Array.from(upvotedBy),
    };

    localList[idx] = updatedComment;
    setLocalCache(targetKey, localList);

    // Sync to Supabase
    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('task_comments')
          .update({
            upvotes: newUpvotes,
            upvoted_by: Array.from(upvotedBy),
          })
          .eq('id', commentId);
      } catch (e) {
        console.warn('Could not sync upvote to Supabase:', e);
      }
    }
  }

  return { success: true, upvotes: newUpvotes, hasUpvoted };
}

/**
 * Delete a comment (by author or admin)
 */
export async function deleteTaskComment(
  commentId: string,
  targetKey: string
): Promise<{ success: boolean; error?: string }> {
  // Update local cache
  const localList = getLocalCache(targetKey);
  const updatedLocal = localList.filter((c) => c.id !== commentId);
  setLocalCache(targetKey, updatedLocal);

  // Sync to Supabase
  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase.from('task_comments').delete().eq('id', commentId);
      if (error) {
        return { success: false, error: error.message };
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Verbindungsfehler';
      return { success: false, error: msg };
    }
  }

  return { success: true };
}

/**
 * Toggle Pin or Verify (Admin features)
 */
export async function togglePinComment(
  commentId: string,
  targetKey: string,
  isPinned: boolean
): Promise<{ success: boolean }> {
  const localList = getLocalCache(targetKey);
  const idx = localList.findIndex((c) => c.id === commentId);

  if (idx >= 0) {
    localList[idx].isPinned = isPinned;
    setLocalCache(targetKey, localList);

    if (isSupabaseConfigured) {
      try {
        await supabase.from('task_comments').update({ is_pinned: isPinned }).eq('id', commentId);
      } catch (e) {
        console.warn(e);
      }
    }
  }

  return { success: true };
}

export async function toggleVerifyComment(
  commentId: string,
  targetKey: string,
  isVerified: boolean
): Promise<{ success: boolean }> {
  const localList = getLocalCache(targetKey);
  const idx = localList.findIndex((c) => c.id === commentId);

  if (idx >= 0) {
    localList[idx].isVerified = isVerified;
    setLocalCache(targetKey, localList);

    if (isSupabaseConfigured) {
      try {
        await supabase.from('task_comments').update({ is_verified: isVerified }).eq('id', commentId);
      } catch (e) {
        console.warn(e);
      }
    }
  }

  return { success: true };
}

/**
 * Cascade Delete: Delete all comments when a variant or test is deleted
 */
export async function deleteCommentsForVariant(targetKey: string): Promise<{ success: boolean }> {
  try {
    localStorage.removeItem(`${COMMENTS_CACHE_PREFIX}${targetKey}`);
  } catch (e) {
    console.warn(e);
  }

  if (isSupabaseConfigured) {
    try {
      await supabase.from('task_comments').delete().eq('target_key', targetKey);
    } catch (e) {
      console.warn('Could not cascade delete comments in Supabase:', e);
    }
  }

  return { success: true };
}
