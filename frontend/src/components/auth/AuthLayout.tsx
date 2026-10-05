import React from 'react';

interface AuthCardProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export const AuthLayout: React.FC<AuthCardProps> = ({ children, title, subtitle }) => {
  return (
    <div className="bg-white rounded-3xl shadow-2xl shadow-indigo-100/60 p-8 w-full max-w-md border border-slate-100">
      {/* Card header */}
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
        {subtitle && (
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        )}
      </div>
      {children}
    </div>
  );
};
