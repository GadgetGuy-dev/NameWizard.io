import { Switch, Route } from 'wouter';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { AuthProvider } from '@/hooks/use-auth';
import { Toaster } from '@/components/ui/toaster';
import { BatchProcessingProvider } from '@/context/BatchProcessingContext';
import { ProtectedRoute, AdminRoute, GodAdminRoute } from '@/lib/protected-route';
import { ThemeProvider } from '@/context/ThemeContext';
import Navbar from '@/components/layout/Navbar';
import { StatusFooter } from '@/components/StatusFooter';

// Pages
import HomePage from '@/pages/home-page';
import AuthPage from '@/pages/auth-page';
import NotFound from '@/pages/not-found';
import ProfilePage from '@/pages/profile-page';
import SettingsPage from '@/pages/settings-page';
import ApiKeysPage from '@/pages/api-keys-page';
import BulkRenamePage from './pages/bulk-rename';
import MagicFoldersPage from './pages/magic-folders';
import RenamingTemplatesPage from './pages/renaming-templates';
import HistoryPage from './pages/history';
import SetupWizardPage from './pages/setup-wizard-page';
import PricingPage from '@/pages/pricing-page';
import AIFeaturesPage from '@/pages/ai-features-page';
import SubscriptionPage from '@/pages/subscription-page';
import SubscriptionSuccessPage from '@/pages/subscription-success';
import SubscriptionCancelPage from '@/pages/subscription-cancel';
import AdminApiManagement from '@/pages/admin-api-management';
import AdminAutoTesting from '@/pages/admin-auto-testing';
import AdminKeyBackups from '@/pages/admin-key-backups';
import AdminDbManagement from '@/pages/admin-db-management';
import AdminSystemStatus from '@/pages/admin-system-status';
import AdminUsersPage from '@/pages/admin-users';
import AdminApiMetricsPage from '@/pages/admin-api-metrics';
import AdminPage from '@/pages/admin-page';
import ApiDashboard from '@/pages/api-dashboard';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <BatchProcessingProvider>
            <div className="min-h-screen bg-background pb-10">
              <Navbar />
              <main>
                <Switch>
                  <ProtectedRoute path="/" component={HomePage} />
                  <ProtectedRoute path="/profile" component={ProfilePage} />
                  <ProtectedRoute path="/settings" component={SettingsPage} />
                  <ProtectedRoute path="/api-keys" component={ApiKeysPage} />
                  <ProtectedRoute path="/api-dashboard" component={ApiDashboard} />
                  <ProtectedRoute path="/bulk-rename" component={BulkRenamePage} />
                  <ProtectedRoute path="/magic-folders" component={MagicFoldersPage} />
                  <ProtectedRoute path="/renaming-templates" component={RenamingTemplatesPage} />
                  <ProtectedRoute path="/history" component={HistoryPage} />
                  <ProtectedRoute path="/subscription" component={SubscriptionPage} />
                  <ProtectedRoute path="/subscription/success" component={SubscriptionSuccessPage} />
                  <ProtectedRoute path="/subscription/cancel" component={SubscriptionCancelPage} />
                  <GodAdminRoute path="/admin/api-management" component={AdminApiManagement} />
                  <AdminRoute path="/admin/system-status" component={AdminSystemStatus} />
                  <AdminRoute path="/admin/auto-testing" component={AdminAutoTesting} />
                  <AdminRoute path="/admin/key-backups" component={AdminKeyBackups} />
                  <GodAdminRoute path="/admin/db-management" component={AdminDbManagement} />
                  <GodAdminRoute path="/admin/users" component={AdminUsersPage} />
                  <AdminRoute path="/admin/api-metrics" component={AdminApiMetricsPage} />
                  <AdminRoute path="/admin" component={AdminPage} />
                  <Route path="/pricing" component={PricingPage} />
                  <Route path="/ai-features" component={AIFeaturesPage} />
                  <Route path="/setup-wizard" component={SetupWizardPage} />
                  <Route path="/auth" component={AuthPage} />
                  <Route component={NotFound} />
                </Switch>
              </main>
              <StatusFooter />
              <Toaster />
            </div>
          </BatchProcessingProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;