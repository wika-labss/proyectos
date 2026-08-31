import { startServer } from './server';

startServer()
  .then(({ port }) => {
    console.log(`my Pet web de prueba → http://127.0.0.1:${port}/`);
    console.log(`Landing semilla     → http://127.0.0.1:${port}/p/demo-luna`);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
