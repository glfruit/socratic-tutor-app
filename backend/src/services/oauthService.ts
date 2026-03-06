import { AppError } from '../utils/appError';

interface OAuthProvider {
  getProfile: (accessToken: string) => Promise<{ email: string; name: string }>;
}

export class OAuthService {
  constructor(
    private readonly providers: Record<string, OAuthProvider>,
    private readonly fetchImpl: typeof fetch = fetch
  ) {}

  static createDefault(fetchImpl: typeof fetch = fetch): OAuthService {
    return new OAuthService(
      {
        google: {
          getProfile: async (accessToken: string) => {
            const response = await fetchImpl('https://www.googleapis.com/oauth2/v2/userinfo', {
              headers: { Authorization: `Bearer ${accessToken}` }
            });
            if (!response.ok) {
              throw new AppError('Invalid Google token', 401);
            }
            const data = (await response.json()) as { email: string; name?: string };
            return { email: data.email, name: data.name ?? 'Google User' };
          }
        },
        github: {
          getProfile: async (accessToken: string) => {
            const response = await fetchImpl('https://api.github.com/user', {
              headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: 'application/vnd.github+json'
              }
            });
            if (!response.ok) {
              throw new AppError('Invalid GitHub token', 401);
            }
            const data = (await response.json()) as {
              email?: string | null;
              name?: string;
              login: string;
            };

            let email = data.email;
            if (!email) {
              const emailResp = await fetchImpl('https://api.github.com/user/emails', {
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                  Accept: 'application/vnd.github+json'
                }
              });
              if (!emailResp.ok) {
                throw new AppError('GitHub email unavailable', 401);
              }
              const emails = (await emailResp.json()) as Array<{ email: string; primary: boolean }>;
              email = emails.find((item) => item.primary)?.email ?? emails[0]?.email;
            }

            if (!email) {
              throw new AppError('GitHub email unavailable', 401);
            }

            return { email, name: data.name ?? data.login };
          }
        }
      },
      fetchImpl
    );
  }

  async getProfile(provider: string, accessToken: string) {
    const impl = this.providers[provider];
    if (!impl) {
      throw new AppError('Unsupported OAuth provider', 400);
    }

    return impl.getProfile(accessToken);
  }
}
