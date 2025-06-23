'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    const { error } = await resetPassword(email);

    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
    }
  };

  if (success) {
    return (
        <div className="text-center">
            <CheckCircleIcon className="w-16 h-16 mx-auto text-green-500" />
            <h2 className="mt-4 text-2xl font-bold text-gray-900">Verifique seu e-mail</h2>
            <p className="mt-2 text-sm text-gray-600">
                Se uma conta com este e-mail existir, enviamos um link para você redefinir sua senha.
            </p>
            <div className="mt-6">
                <Link href="/login"
                    className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    Voltar para o Login
                </Link>
            </div>
        </div>
    );
  }

  return (
    <>
      <div>
        <h2 className="text-3xl font-extrabold text-gray-900">
          Esqueceu sua senha?
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Sem problemas. Digite seu e-mail abaixo e enviaremos um link para você criar uma nova.
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
              <label htmlFor="email-address" className="sr-only">
                  Email
              </label>
              <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-600"
                  placeholder="seu@email.com"
              />
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? 'Enviando...' : 'Enviar link de recuperação'}
          </button>
        </div>
        <div className="text-sm text-center">
            <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                Lembrou a senha? Voltar para o login
            </Link>
        </div>
      </form>
    </>
  );
} 
