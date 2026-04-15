import { createExpressAppInstance } from './app.bootstrap';

async function bootstrap(): Promise<void> {
  const expressApp = await createExpressAppInstance();
  const port = Number(process.env.PORT ?? 3001);
  await new Promise<void>((resolve, reject) => {
    const server = expressApp.listen(port, () => {
      resolve();
    });
    server.on('error', reject);
  });
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
