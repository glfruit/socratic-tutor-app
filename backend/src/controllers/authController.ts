import { Request, Response } from 'express';
import { container } from '../config/container';

export class AuthController {
  async register(req: Request, res: Response) {
    const data = await container.authService.register(req.body);
    res.status(201).json(data);
  }

  async login(req: Request, res: Response) {
    const data = await container.authService.login(req.body);
    res.json(data);
  }

  async refresh(req: Request, res: Response) {
    const data = await container.authService.refresh(req.body.refreshToken);
    res.json(data);
  }

  async oauthLogin(req: Request, res: Response) {
    const { provider } = req.params;
    const profile = await container.oauthService.getProfile(provider, req.body.accessToken);
    const data = await container.authService.oauthLogin(profile);
    res.json(data);
  }
}
