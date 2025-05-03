
import React from "react";
import MainLayout from "@/components/layout/MainLayout";
import { UserProfileCard } from "@/components/settings/UserProfileCard";
import { SubscriptionInfoCard } from "@/components/settings/SubscriptionInfoCard";
import { useUserSettings } from "@/hooks/settings/useUserSettings";

export default function Settings() {
  const {
    userEmail,
    plan,
    isLoading,
    isSyncing,
    handleSyncUserPlan,
    getDaysRemaining,
    getExpirationDate,
    getPlanStartDate
  } = useUserSettings();

  return (
    <MainLayout>
      <div className="container max-w-5xl py-8">
        <h1 className="text-3xl font-bold mb-6">Configurações</h1>
        
        <div className="grid gap-6">
          {/* User Profile Section */}
          <UserProfileCard userEmail={userEmail} />
          
          {/* Subscription Information */}
          <SubscriptionInfoCard
            plan={plan}
            isLoading={isLoading}
            isSyncing={isSyncing}
            onSyncClick={handleSyncUserPlan}
            getDaysRemaining={getDaysRemaining}
            getExpirationDate={getExpirationDate}
            getPlanStartDate={getPlanStartDate}
          />
        </div>
      </div>
    </MainLayout>
  );
}
