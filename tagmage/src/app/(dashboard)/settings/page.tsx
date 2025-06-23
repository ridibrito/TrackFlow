'use client';

import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import ProfilePhotoUpload from "@/components/settings/ProfilePhotoUpload";
import toast from 'react-hot-toast';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

export default function SettingsPage() {
  const { user, updateUser, updatePassword } = useAuth();
  
  // State for profile info
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [initialName, setInitialName] = useState('');

  // State for password change
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (user) {
      const currentName = user.user_metadata?.full_name || '';
      setName(currentName);
      setInitialName(currentName);
      setEmail(user.email || '');
    }
  }, [user]);
  
  const hasProfileChanges = name !== initialName;

  const handleProfileSaveChanges = async () => {
    if (!hasProfileChanges) return;
    setIsSavingProfile(true);
    const { error } = await updateUser({ data: { full_name: name } });
    setIsSavingProfile(false);
    if (error) {
      toast.error('Ocorreu um erro ao salvar as alterações de perfil.');
    } else {
      toast.success('Perfil atualizado com sucesso!');
      setInitialName(name);
    }
  };

  const handlePasswordChange = async () => {
    if (newPassword.length < 8) {
        toast.error('A nova senha deve ter no mínimo 8 caracteres.');
        return;
    }
    if (newPassword !== confirmPassword) {
        toast.error('As senhas não coincidem.');
        return;
    }

    setIsSavingPassword(true);
    const { error } = await updatePassword(newPassword);
    setIsSavingPassword(false);

    if (error) {
        toast.error('Ocorreu um erro ao alterar sua senha.');
    } else {
        toast.success('Senha alterada com sucesso!');
        setNewPassword('');
        setConfirmPassword('');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-10">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Configurações</h1>
        <p className="mt-2 text-lg text-gray-700">Gerencie sua conta e as preferências do seu plano.</p>
      </header>
      
      <div className="space-y-12">
        {/* Account Settings Card */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 md:p-8">
            <h2 className="text-2xl font-bold text-gray-900">Configurações da Conta</h2>
            <p className="mt-1 text-gray-600">Atualize suas informações de perfil.</p>
          </div>
          <div className="px-6 md:px-8 pb-8 space-y-6">
            <ProfilePhotoUpload />
            <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
              <label htmlFor="name" className="text-sm font-semibold text-gray-700 md:col-span-1">
                Nome completo
              </label>
              <div className="md:col-span-2">
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 text-base text-gray-900 placeholder:text-gray-500 border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Seu nome completo"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
              <label htmlFor="email" className="text-sm font-semibold text-gray-700 md:col-span-1">
                Endereço de e-mail
              </label>
              <div className="md:col-span-2">
                <input
                  type="email"
                  id="email"
                  value={email}
                  readOnly
                  className="w-full px-4 py-3 text-base text-gray-800 bg-gray-100 border-gray-300 rounded-lg shadow-sm cursor-not-allowed"
                  placeholder="seu@email.com"
                />
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-6 md:px-8 py-4 border-t border-gray-200 flex justify-end">
            <button 
              onClick={handleProfileSaveChanges}
              disabled={!hasProfileChanges || isSavingProfile}
              className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-blue-600 rounded-lg hover:shadow-lg hover:shadow-indigo-500/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSavingProfile ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </div>

        {/* Plan Settings Card */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 md:p-8">
            <h2 className="text-2xl font-bold text-gray-900">Seu Plano</h2>
            <p className="mt-1 text-gray-600">Visualize ou altere seu plano de assinatura.</p>
          </div>
          <div className="px-6 md:px-8 pb-8">
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                <div className="mb-4 sm:mb-0">
                  <h3 className="text-xl font-bold text-gray-900">Plano Gratuito</h3>
                  <p className="mt-1 text-gray-700">Nosso plano inicial para você começar. <span className="font-semibold">Limite de 1 projeto.</span></p>
                </div>
                <button className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-blue-600 rounded-lg hover:shadow-lg hover:shadow-indigo-500/40 transition-all duration-300 whitespace-nowrap">
                  Fazer Upgrade
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Security Settings Card */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 md:p-8">
            <h2 className="text-2xl font-bold text-gray-900">Segurança</h2>
            <p className="mt-1 text-gray-600">Altere sua senha.</p>
          </div>
          <div className="px-6 md:px-8 pb-8 space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
              <label htmlFor="new-password" className="text-sm font-semibold text-gray-700 md:col-span-1">
                Nova senha
              </label>
              <div className="relative md:col-span-2">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  id="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 text-base text-gray-900 placeholder:text-gray-500 border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Mínimo de 8 caracteres"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                >
                  {showNewPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
              <label htmlFor="confirm-password" className="text-sm font-semibold text-gray-700 md:col-span-1">
                Confirmar nova senha
              </label>
              <div className="relative md:col-span-2">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirm-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 text-base text-gray-900 placeholder:text-gray-500 border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Repita a nova senha"
                />
                 <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-6 md:px-8 py-4 border-t border-gray-200 flex justify-end">
            <button 
                onClick={handlePasswordChange}
                disabled={isSavingPassword || !newPassword || !confirmPassword}
                className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-blue-600 rounded-lg hover:shadow-lg hover:shadow-indigo-500/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSavingPassword ? 'Alterando...' : 'Alterar Senha'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 
