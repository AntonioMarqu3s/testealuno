
import { ResourcesCard } from "./ResourcesCard";
import { GettingStartedCard } from "./GettingStartedCard";
import { SupportCard } from "./SupportCard";

interface DashboardCardsProps {
  userAgentsCount: number;
  agentLimit: number;
  planName: string;
  isTrialPlan: boolean;
  isTrialExpired: boolean;
  isSubscriptionExpired?: boolean;
  trialDaysRemaining: number;
  onUpgrade: () => void;
}

export const DashboardCards = ({
  userAgentsCount,
  agentLimit,
  planName,
  isTrialPlan,
  isTrialExpired,
  isSubscriptionExpired = false,
  trialDaysRemaining,
  onUpgrade
}: DashboardCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <ResourcesCard
        userAgentsCount={userAgentsCount}
        agentLimit={agentLimit}
        planName={planName}
        isTrialPlan={isTrialPlan}
        isTrialExpired={isTrialExpired}
        isSubscriptionExpired={isSubscriptionExpired}
        trialDaysRemaining={trialDaysRemaining}
        onUpgrade={onUpgrade}
      />
      <GettingStartedCard />
      <SupportCard />
    </div>
  );
};
