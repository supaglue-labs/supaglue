import { getDependencyContainer } from '@/dependency_container';
import { Request, Response, Router } from 'express';

const { sgUserService } = getDependencyContainer();

export default function init(app: Router): void {
  app.post('/v1/auth/_login', async (req: Request, res: Response) => {
    const loggedInSgUser = await sgUserService.login({
      applicationId: req.headers['x-application-id'] as string, // TODO: move to middleware
      username: req.body.username,
      password: req.body.password,
    });

    if (loggedInSgUser) {
      return res.status(200).send(loggedInSgUser);
    }

    return res.status(401).send(null);
  });
}
