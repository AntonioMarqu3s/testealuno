
import MainLayout from "@/components/layout/MainLayout";
import { useAgentsPage } from "@/hooks/agent/useAgentsPage";
import { AgentsPageHeader } from "@/components/agent/AgentsPageHeader";
import { AgentsPageList } from "@/components/agent/AgentsPageList";
import { UpgradeModal } from "@/components/agent/UpgradeModal";

const Agents = () => {
  const {
    userEmail,
    userPlan,
    userAgents,
    setUserAgents,
    isLoading,
    qrAgentId,
    showUpgradeModal,
    setShowUpgradeModal,
    isRefreshing,
    handleCreateAgent,
    handleUpgradeClick,
    handleUpgradeConfirm,
    handleRefreshPlan
  } = useAgentsPage();
  
  return (
    <MainLayout title="Meus Agentes">
      <div className="space-y-6">
        <AgentsPageHeader 
          userPlan={userPlan}
          onCreateAgent={handleCreateAgent}
          onUpgradeClick={handleUpgradeClick}
          onRefreshPlan={handleRefreshPlan}
          isRefreshing={isRefreshing}
        />
        
        <AgentsPageList
          userAgents={userAgents}
          isLoading={isLoading}
          qrAgentId={qrAgentId}
          userEmail={userEmail}
          onCreateAgent={handleCreateAgent}
        />
      </div>
      
      <UpgradeModal 
        open={showUpgradeModal} 
        onOpenChange={setShowUpgradeModal}
        onConfirm={handleUpgradeConfirm}
      />
    </MainLayout>
  );
};

export default Agents;
