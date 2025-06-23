'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const { updatePassword } = useAuth();
  
  // O useEffect para validar o token na URL não é mais estritamente necessário
  // porque o Supabase manipula a sessão quando o usuário clica no link.
  // A tentativa de update da senha já validará o token implicitamente.

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }
    if (password.length < 6) {
        setError('A senha deve ter pelo menos 6 caracteres.');
        return;
    }

    setLoading(true);
    setError('');

    const { error } = await updatePassword(password);

    setLoading(false);
    if (error) {
      setError('Não foi possível redefinir a senha. O link pode ter expirado ou ser inválido. Por favor, tente o processo de recuperação novamente.');
    } else {
      setSuccess(true);
    }
  };

  if (success) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Senha Redefinida!</h2>
        <p className="mt-2 text-sm text-gray-600">
          Sua senha foi alterada com sucesso.
        </p>
        <div className="mt-6">
            <Link href="/login"
                className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700"
            >
                Ir para o Login
            </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div>
        <h2 className="text-3xl font-extrabold text-gray-900">
          Crie uma nova senha
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Sua nova senha deve ser diferente da anterior.
        </p>
      </div>

      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        {error && (
            <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
                <span className="font-medium">Erro:</span> {error}
            </div>
        )}
        <div className="space-y-4">
          <div>
              <label htmlFor="password">Nova Senha</label>
              <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="********"
              />
          </div>
          <div>
              <label htmlFor="confirm-password">Confirme a Nova Senha</label>
              <input
                  id="confirm-password"
                  name="confirm-password"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1 w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="********"
              />
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? 'Redefinindo...' : 'Redefinir Senha'}
          </button>
        </div>
      </form>
    </>
  );
} 
