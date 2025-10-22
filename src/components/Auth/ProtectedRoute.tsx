import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { canManageUsers, canCreateDemanda, canAssignMissions } from '@/lib/permissions';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: 'manage_users' | 'create_demanda' | 'assign_missions';
  fallbackPath?: string;
}

export const ProtectedRoute = ({ 
  children, 
  requiredPermission, 
  fallbackPath = '/dashboard' 
}: ProtectedRouteProps) => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkPermission = () => {
      if (!isAuthenticated || !user) {
        navigate('/');
        return;
      }

      if (!requiredPermission) {
        setIsLoading(false);
        return;
      }

      let hasPermission = false;

      switch (requiredPermission) {
        case 'manage_users':
          hasPermission = canManageUsers(user.tipo);
          break;
        case 'create_demanda':
          hasPermission = canCreateDemanda(user.tipo);
          break;
        case 'assign_missions':
          hasPermission = canAssignMissions(user.tipo);
          break;
      }

      if (!hasPermission) {
        navigate(fallbackPath);
        return;
      }

      setIsLoading(false);
    };

    checkPermission();
  }, [isAuthenticated, user, requiredPermission, navigate, fallbackPath]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-muted-foreground">Verificando permissões...</p>
      </div>
    );
  }

  return <>{children}</>;
};
