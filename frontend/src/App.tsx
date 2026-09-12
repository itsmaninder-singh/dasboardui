import React, { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { AppRoutes } from "./routes";
import { useAuth } from "./hooks/useAuth";

const AppBootstrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { checkAuthSilent } = useAuth();

  useEffect(() => {
    
    
    checkAuthSilent();
  }, []);

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppBootstrapper>
          <AppRoutes />
        </AppBootstrapper>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
