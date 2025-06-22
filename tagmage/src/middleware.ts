import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// O único propósito deste middleware é garantir que o cookie de sessão do Supabase esteja atualizado.
// A proteção de rotas será feita nos layouts do lado do cliente.
export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  await supabase.auth.getSession();
  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     *
     * A rota de API foi removida da exclusão para garantir
     * que o cookie de sessão seja atualizado corretamente.
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}; 