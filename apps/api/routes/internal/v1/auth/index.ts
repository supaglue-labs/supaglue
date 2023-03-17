import { getDependencyContainer } from '@/dependency_container';
import { Request, Response, Router } from 'express';

const { sgUserService } = getDependencyContainer();

export default function init(app: Router): void {
  const authRouter = Router();

  authRouter.post('/_login', async (req: Request, res: Response) => {
    const loggedInSgUser = await sgUserService.login({
      applicationId: req.headers['x-application-id'] as string, // TODO: shouldn't be logging into an application, but an organization
      username: req.body.username,
      password: req.body.password,
    });

    if (loggedInSgUser) {
      return res.status(200).send(loggedInSgUser);
    }

    return res.status(401).send(null);
  });

  app.use('/auth', authRouter);
}
