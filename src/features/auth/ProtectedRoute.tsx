import { Outlet } from 'react-router-dom';

export const ProtectedRoute = () => {
  // Authorization gecici olarak devre disi, bu yuzden tum route'lar aciktir.
  // const { isAuthenticated } = useAuth();
  // const location = useLocation();

  // if (!isAuthenticated) {
  //   return <Navigate to="/giris" replace state={{ from: location }} />;
  // }

  return <Outlet />;
};
