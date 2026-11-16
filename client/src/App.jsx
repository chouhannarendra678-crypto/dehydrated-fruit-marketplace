import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AppRoutes from './routes/AppRoutes';
import { selectIsAuthenticated, updateUser } from './redux/slices/authSlice';
import { useGetMeQuery } from './services/authApi';

function App() {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const dispatch = useDispatch();
  
  // Revalidate profile if authenticated
  const { data: meData } = useGetMeQuery(undefined, {
    skip: !isAuthenticated,
  });

  useEffect(() => {
    if (meData?.data?.user) {
      dispatch(updateUser(meData.data.user));
    }
  }, [meData, dispatch]);

  return (
    <div className="min-h-screen bg-oat text-ink">
      <AppRoutes />
    </div>
  );
}

export default App;
