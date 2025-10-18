import { Navigate, Route, Routes } from 'react-router-dom';

import { AppLayout } from '@/components/layout/AppLayout';

import { ProtectedRoute } from '@/features/auth/ProtectedRoute';

import { LoginPage } from '@/features/auth/LoginPage';

import { DashboardPage } from '@/features/dashboard/DashboardPage';

import { UsersPage } from '@/features/users/UsersPage';

import { DealersPage } from '@/features/dealers/DealersPage';

import { AppsPage } from '@/features/apps/AppsPage';

import { ProgramsPage } from '@/features/programs/ProgramsPage';

import { ProgramVersionsPage } from '@/features/programVersions/ProgramVersionsPage';

import { LicensesPage } from '@/features/licenses/LicensesPage';

import { AuthorizationsPage } from '@/features/authorizations/AuthorizationsPage';

import { ConnectionsPage } from '@/features/connections/ConnectionsPage';

import { CompanyAddressesPage } from '@/features/companyAddresses/CompanyAddressesPage';

import { CompanyRepresentativesPage } from '@/features/companyRepresentatives/CompanyRepresentativesPage';



const App = () => (

  <Routes>

    <Route path="/GiriÅŸ" element={<LoginPage />} />

    <Route element={<ProtectedRoute />}>

      <Route element={<AppLayout />}>

        <Route index element={<DashboardPage />} />

        <Route path="/kullanicilar" element={<UsersPage />} />

        <Route path="/bayiler" element={<DealersPage />} />

        <Route path="/uygulamalar" element={<AppsPage />} />

        <Route path="/programlar" element={<ProgramsPage />} />

        <Route path="/program-surumleri" element={<ProgramVersionsPage />} />

        <Route path="/lisanslar" element={<LicensesPage />} />

        <Route path="/yetkilendirmeler" element={<AuthorizationsPage />} />

        <Route path="/BaÄŸlantÄ±lar" element={<ConnectionsPage />} />

        <Route path="/Şirket-adresleri" element={<CompanyAddressesPage />} />

        <Route

          path="/Şirket-temsilcileri"

          element={<CompanyRepresentativesPage />}

        />

      </Route>

    </Route>

    <Route path="*" element={<Navigate to="/" replace />} />

  </Routes>

);



export default App;




