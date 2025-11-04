import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './store/authStore';
import Login from './pages/Login';
import Messages from './pages/Messages';
import Organization from './pages/Organization';
import Notice from './pages/Notice';
import Settings from './pages/Settings';
import PopupLayout from './layouts/PopupLayout';

const queryClient = new QueryClient();

const PrivateRoute = ({ children }: { children: React.ReactElement }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/messages"
            element={
              <PrivateRoute>
                <PopupLayout>
                  <Messages />
                </PopupLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/organization"
            element={
              <PrivateRoute>
                <PopupLayout>
                  <Organization />
                </PopupLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/notice"
            element={
              <PrivateRoute>
                <PopupLayout>
                  <Notice />
                </PopupLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <PrivateRoute>
                <PopupLayout>
                  <Settings />
                </PopupLayout>
              </PrivateRoute>
            }
          />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
