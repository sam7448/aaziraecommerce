import React from 'react';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { RegisterForm } from '../../components/auth/RegisterForm';

export const RegisterPage: React.FC = () => {
  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join NovaMarket and start shopping or selling today"
    >
      <RegisterForm />
    </AuthLayout>
  );
};
