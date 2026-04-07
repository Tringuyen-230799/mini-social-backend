import express from 'express';
import bodyParser from 'body-parser';
import { router } from './routes';

function startServer() {
  const app = express();
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  app.get('/health-check', ((req, res) => {
    res.send("Health check");
  }))

  app.use(router);

  app.listen(3000, () => {
    console.log('Server is running on port 3000');
  })
}

startServer();

