const express = require('express');
const app = express();
const compression = require('compression');
const fs = require('fs');
const topicRouter = require('./router/topic');
const indexRouter = require('./router/index');
const port = 3000;

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(compression());
app.get('*', (request, response, next) => {
  fs.readdir('./data', (error, filelist) => {
    request.list = filelist;
    next();
  })
})

app.use('/', indexRouter);
app.use('/topic', topicRouter);

//404 Error
app.use(function(req, res, next) {
  res.status(404);
});

//Error Handler
app.use(function (err, req, res, next) {
  console.error(err.stack)
  res.status(500).send('Something broke!')
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
