import type { BlogPost } from '../types';
import { INITIAL_BLOG_POSTS } from '../data/initialBlogPosts';
import { supabase, isSupabaseConfigured } from './supabase';

const BLOG_STORAGE_KEY = 'b2_blog_posts_v1';

export function getBlogPostsLocal(): BlogPost[] {
  try {
    const data = localStorage.getItem(BLOG_STORAGE_KEY);
    if (!data) {
      localStorage.setItem(BLOG_STORAGE_KEY, JSON.stringify(INITIAL_BLOG_POSTS));
      return INITIAL_BLOG_POSTS;
    }
    const parsed: BlogPost[] = JSON.parse(data);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return INITIAL_BLOG_POSTS;
    }
    return parsed;
  } catch (e) {
    console.error('Failed to parse local blog posts:', e);
    return INITIAL_BLOG_POSTS;
  }
}

export function saveBlogPostsLocal(posts: BlogPost[]): void {
  try {
    localStorage.setItem(BLOG_STORAGE_KEY, JSON.stringify(posts));
  } catch (e) {
    console.error('Failed to save blog posts locally:', e);
  }
}

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  const posts = getBlogPostsLocal();
  return posts.find((p) => p.slug === slug || p.id === slug);
}

export async function fetchBlogPostsAsync(): Promise<BlogPost[] | null> {
  if (!isSupabaseConfigured) return null;
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .order('order_index', { ascending: true });

    if (error || !data || data.length === 0) {
      return null;
    }

    const formatted: BlogPost[] = data.map((item: any) => ({
      id: item.id,
      slug: item.slug,
      title: item.title,
      excerpt: item.excerpt,
      content: item.content,
      category: item.category,
      readTime: item.read_time || '5 Min.',
      date: item.date || item.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
      author: item.author || 'Fachredaktion Beruf B2+',
      seoKeywords: Array.isArray(item.seo_keywords) ? item.seo_keywords : [],
      coverEmoji: item.cover_emoji || '📖',
      published: Boolean(item.published),
      orderIndex: item.order_index || 0,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    }));

    saveBlogPostsLocal(formatted);
    return formatted;
  } catch (err) {
    console.error('Error fetching blog posts from Supabase:', err);
    return null;
  }
}

export async function saveBlogPostsAsync(
  posts: BlogPost[]
): Promise<{ success: boolean; error?: string }> {
  saveBlogPostsLocal(posts);

  if (!isSupabaseConfigured) {
    return { success: true };
  }

  try {
    const rows = posts.map((p, idx) => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt,
      content: p.content,
      category: p.category,
      read_time: p.readTime,
      date: p.date,
      author: p.author,
      seo_keywords: p.seoKeywords,
      cover_emoji: p.coverEmoji,
      published: p.published,
      order_index: p.orderIndex ?? idx,
      updated_at: new Date().toISOString(),
    }));

    const { error } = await supabase.from('blog_posts').upsert(rows, { onConflict: 'id' });
    if (error) {
      console.warn('Supabase blog_posts upsert warning:', error.message);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    console.error('Error saving blog posts to Supabase:', err);
    return { success: false, error: err.message || 'Unknown error' };
  }
}
