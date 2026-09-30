import { useApiQuery } from '@shared/hooks/useApiQuery';
import { authService } from '@shared/api/auth.service';

/** Which social sign-in providers the server has enabled. */
export function useAuthProviders() {
  const { data } = useApiQuery(() => authService.getProviders(), []);
  return { google: data?.google ?? false };
}
