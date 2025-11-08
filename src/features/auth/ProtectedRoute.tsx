import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { useAuth } from './AuthContext';



export const ProtectedRoute = () => {
  // Authorization geçici olarak devre dışı - tüm sayfalar erişilebilir
  // const { isAuthenticated } = useAuth();
  // const location = useLocation();

  // if (!isAuthenticated) {
  //   return <Navigate to="/giris" replace state={{ from: location }} />;
  // }

  return <Outlet />;
};



