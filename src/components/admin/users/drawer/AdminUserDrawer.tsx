import { UserPlanInfo } from './UserPlanInfo';

      <TabsContent value="plano" className="space-y-4">
        <UserPlanInfo 
          plan={adminUser?.plan || 0} 
          planName={adminUser?.plan_name || 'Teste Gratuito'} 
        />
        <AdminUserForm
          adminUser={adminUser}
          isUpdating={isUpdating}
          showPasswordFields={showPasswordFields}
          handlePasswordToggle={handlePasswordToggle}
          onSubmit={handleUpdateAdmin}
          canEditAdminLevel={canEditAdminLevel}
          isCurrentAdmin={isCurrentAdmin}
        />
      </TabsContent> 