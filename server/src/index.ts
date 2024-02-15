import express from 'express';
import 'dotenv/config';
import './db';

const app = express();

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log('Listening on port 8080');
});