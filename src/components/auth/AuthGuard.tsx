
import { Navigate } from "react-router-dom";
import { useAuth } from "@/lib/context/auth-context";

interface AuthGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
}

// This component guards routes that require authentication
export const AuthGuard = ({ 
  children,
  redirectTo = "/auth" 
}: AuthGuardProps) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-qlearn-purple"></div>
    </div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }
  
  return <>{children}</>;
};

// This component guards routes that shouldn't be accessible when authenticated
export const UnauthGuard = ({ 
  children,
  redirectTo = "/" 
}: AuthGuardProps) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-qlearn-purple"></div>
    </div>;
  }
  
  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }
  
  return <>{children}</>;
};
