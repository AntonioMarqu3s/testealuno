'use client';

import React from "react";
import { SignupForm } from "@/components/auth/SignupForm";

export default function AuthPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md space-y-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Agent Hub Genesis</h1>
          <p className="text-gray-500 mb-6">Crie sua conta</p>
        </div>
        
        <SignupForm />
      </div>
    </div>
  );
} 