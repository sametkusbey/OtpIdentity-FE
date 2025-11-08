import { Navigate, Route, Routes } from 'react-router-dom';

import { AppLayout } from '@/components/layout/AppLayout';
import { ProtectedRoute } from '@/features/auth/ProtectedRoute';
import { LoginPage } from '@/features/auth/LoginPage';
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { UsersPage } from '@/features/users/UsersPage';
import { DealersPage } from '@/features/dealers/DealersPage';
import { CustomersPage } from '@/features/customers/CustomersPage';
import { AppsPage } from '@/features/apps/AppsPage';
import { ProgramsPage } from '@/features/programs/ProgramsPage';
import { ProgramVersionsPage } from '@/features/programVersions/ProgramVersionsPage';
import { ProgramEditionsPage } from '@/features/programEditions/ProgramEditionsPage';
import { LicensesPage } from '@/features/licenses/LicensesPage';
import { AuthorizationsPage } from '@/features/authorizations/AuthorizationsPage';
import { ConnectionsPage } from '@/features/connections/ConnectionsPage';
import { CompanyAddressesPage } from '@/features/companyAddresses/CompanyAddressesPage';
import { CompanyRepresentativesPage } from '@/features/companyRepresentatives/CompanyRepresentativesPage';
import { GeneralSettingsPage } from '@/features/settings/GeneralSettingsPage';
import { DebugPage } from '@/features/debug/DebugPage';
import { RequireMenu } from '@/features/auth/RequireMenu';
import { ForbiddenPage } from '@/features/errors/ForbiddenPage';

const App = () => (
  <Routes>
    <Route path="/giris" element={<LoginPage />} />
    <Route element={<ProtectedRoute />}>
      <Route element={<AppLayout />}>
        <Route index element={<RequireMenu code="dashboard"><DashboardPage /></RequireMenu>} />
        <Route path="/kullanicilar" element={<RequireMenu code="users"><UsersPage /></RequireMenu>} />
        <Route path="/bayiler" element={<RequireMenu code="dealers"><DealersPage /></RequireMenu>} />
        <Route path="/musteriler" element={<RequireMenu code="customers"><CustomersPage /></RequireMenu>} />
        <Route path="/uygulamalar" element={<RequireMenu code="apps"><AppsPage /></RequireMenu>} />
        <Route path="/programlar" element={<RequireMenu code="programs"><ProgramsPage /></RequireMenu>} />
        <Route path="/program-surumleri" element={<RequireMenu code="programVersions"><ProgramVersionsPage /></RequireMenu>} />
        <Route path="/program-yayinlari" element={<RequireMenu code="programEditions"><ProgramEditionsPage /></RequireMenu>} />
        <Route path="/lisanslar" element={<RequireMenu code="licenses"><LicensesPage /></RequireMenu>} />
        <Route path="/yetkilendirmeler" element={<RequireMenu code="authorizations"><AuthorizationsPage /></RequireMenu>} />
        <Route path="/baglantilar" element={<RequireMenu code="connections"><ConnectionsPage /></RequireMenu>} />
        <Route path="/sirket-adresleri" element={<RequireMenu code="companyAddresses"><CompanyAddressesPage /></RequireMenu>} />
        <Route path="/sirket-temsilcileri" element={<RequireMenu code="companyRepresentatives"><CompanyRepresentativesPage /></RequireMenu>} />
        <Route path="/genel-ayarlar" element={<RequireMenu code="generalSettings"><GeneralSettingsPage /></RequireMenu>} />
        <Route path="/debug" element={<DebugPage />} />
      </Route>
    </Route>
    <Route path="/403" element={<ForbiddenPage />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default App;




