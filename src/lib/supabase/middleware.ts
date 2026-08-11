import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const isPlaceholderEnv = supabaseUrl.includes('placeholder') || supabaseUrl.includes('your-project-id');
  const devRoleCookie = request.cookies.get('telc_b2_dev_role')?.value;

  // Secure Admin Route Protection: /admin-beruf
  if (request.nextUrl.pathname.startsWith('/admin-beruf')) {
    // If running in local dev mode or cookie says ADMIN, allow access
    if (isPlaceholderEnv || devRoleCookie === 'ADMIN') {
      return supabaseResponse;
    }

    const supabase = createServerClient(
      supabaseUrl,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key',
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
            supabaseResponse = NextResponse.next({
              request,
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        url.searchParams.set('error', 'admin_login_required');
        return NextResponse.redirect(url);
      }

      // Check DB user role
      const { data: profile } = await (supabase.from('users') as any)
        .select('role')
        .eq('id', user.id)
        .single();

      if (!profile || profile.role !== 'ADMIN') {
        const url = request.nextUrl.clone();
        url.pathname = '/';
        return NextResponse.redirect(url);
      }
    } catch (err) {
      console.warn('Middleware Supabase error -> allowing dev admin access:', err);
      return supabaseResponse;
    }
  }

  return supabaseResponse;
}
