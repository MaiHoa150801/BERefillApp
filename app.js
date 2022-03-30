const http = require('http');
const cors = require('cors');
const express = require('express');
const app = express();
const socketUtils = require('./socketUtils');

const server = http.createServer(app);
const io = socketUtils.sio(server);
socketUtils.connection(io);

exports.socketIOMiddleware = (req, res, next) => {
  req.io = io;
  next();
};
// CORS
app.use(cors());

////////
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');
const errorMiddleware = require('./middlewares/error');
// config
require('dotenv').config({ path: './.env' });

app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
// app.use(fileUpload());
app.use(fileUpload({ useTempFiles: true }))
const shippermap = require('./routes/shipperMapRoute');
const user = require('./routes/userRoute');
const product = require('./routes/productRoute');
const salesperson = require('./routes/salespersonRoute');
const voucher = require('./routes/voucherRoute');
const order = require('./routes/orderRoute');
const post = require('./routes/postRoute');
const ratingProduct = require('./routes/RatingProductRoute');
const refillpoint = require('./routes/refillPointRoute');
app.use('/api/v1', shippermap);
app.use('/api/v1', user);
app.use('/api/v1', product);
app.use('/api/v1', salesperson);
app.use('/api/v1', voucher);
app.use('/api/v1', order);
app.use('/api/v1', post);
app.use('/api/v1', ratingProduct);
app.use('/api/v1', refillpoint);
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => {
  res.send('Server is Running! ');
});
app.use(errorMiddleware);

module.exports = server;
