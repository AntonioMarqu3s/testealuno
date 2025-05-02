
import MainLayout from "@/components/layout/MainLayout";
import { useUserPlanData } from "@/hooks/useUserPlanData";
import { UserProfileCard } from "@/components/settings/UserProfileCard";
import { ConnectionSettingsCard } from "@/components/settings/ConnectionSettingsCard";
import { SubscriptionInfoCard } from "@/components/settings/SubscriptionInfoCard";

export default function Settings() {
  const { userEmail, plan, isLoading } = useUserPlanData();

  return (
    <MainLayout>
      <div className="container max-w-5xl py-8">
        <h1 className="text-3xl font-bold mb-6">Configurações</h1>
        
        <div className="grid gap-6">
          {/* User Profile Section */}
          <UserProfileCard userEmail={userEmail} />
          
          {/* Auto Connection Settings */}
          <ConnectionSettingsCard initialConnectionValue={plan?.connectInstancia || false} />
          
          {/* Subscription Information */}
          <SubscriptionInfoCard 
            plan={plan} 
            isLoading={isLoading} 
            userEmail={userEmail} 
          />
        </div>
      </div>
    </MainLayout>
  );
}
