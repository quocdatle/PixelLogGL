const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const env = require('./config/env');
const routes = require('./routes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

app.use(
  cors({
    origin: env.clientUrl || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());

app.use('/api', routes);

// Luôn đặt errorHandler sau cùng, sau mọi route
app.use(errorHandler);

module.exports = app;
