import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('role');

      // Accept both ADMIN and SHOP roles
      if (token && (role === 'SHOP' || role === 'ADMIN')) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        router.push('/login');
      }
      setIsLoading(false);
    }
  }, [router]);

  return { isAuthenticated, isLoading };
};

