'use client';

import { AuthProvider } from "@/contexts/AuthContext";
import Link from "next/link";
import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50 flex">
        {/* Left-side branding */}
        <div className="hidden lg:flex w-1/2 bg-gradient-to-tr from-indigo-800 to-blue-600 relative items-center justify-center">
            <div className="absolute bg-black opacity-20 inset-0"></div>
            <div className="text-center z-10 p-12">
                <h1 className="text-4xl xl:text-5xl font-black text-white leading-tight">
                    O Fim do Setup Manual de Tracking.
                </h1>
                <p className="mt-4 text-lg text-indigo-200">
                    Conecte suas plataformas e comece a rastrear em minutos, não em horas.
                </p>
            </div>
        </div>
        {/* Right-side form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center">
          <div className="w-full max-w-md p-8 space-y-8">
            <div className="text-center">
              <div className="flex items-center justify-center py-12">
                <Link href="/">
                  <Image
                    src="/logo-ai.svg"
                    alt="Tag Mage Logo"
                    width={150}
                    height={40}
                    priority
                  />
                </Link>
              </div>
            </div>
            {children}
          </div>
        </div>
      </div>
    </AuthProvider>
  );
} 