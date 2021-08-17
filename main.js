const template = require('./lib/template.js');
const sanitizeHtml = require('sanitize-html');
const express = require('express')
const path = require('path');
const fs = require('fs');
const qs = require('querystring');
const app = express()
const port = 3000

//route 'main page'
app.get('/', (request, response) => {
  console.log('access : main page');
  fs.readdir('./data', (error, filelist) => {
    const title = 'Welcome';
    const description = 'Hello, Node.js';
    const list = template.list(filelist);
    const html = template.HTML(title, list,
      `<h2>${title}</h2>${description}`,
      `<a href="/create">create</a>`
    );
    response.send(html);
  })
})

//route '/page/:pageID'
app.get('/page/:pageID', (request, response) => {
  console.log('access : page / ' + request.params.pageID);
  fs.readdir('./data', (error, filelist) => {
    const filteredId = path.parse(request.params.pageID).base;
    fs.readFile(`data/${filteredId}`, 'utf8', (err, description) => {
      const title = request.params.pageID;
      const sanitizedTitle = sanitizeHtml(title);
      const sanitizedDescription = sanitizeHtml(description, {
        allowedTags:['']
      })
      const list = template.list(filelist);
      const html = template.HTML(sanitizedTitle, list,
        `<h2>${sanitizedTitle}</h2>${sanitizedDescription}`,
        ` <a href="/create">create</a>
          <a href="/update/${sanitizedTitle}">update</a>
          <form action="/delete_process" method="post">
            <input type="hidden" name="id" value="${sanitizedTitle}">
            <input type="submit" value="delete">
          </form>`
      );
      response.send(html);
    })
  })
})

//route '/create'
app.get('/create', (request, response) => {
  console.log('access : create page');
  fs.readdir('./data', (error, filelist) => {
    const title = 'WEB - create';
    const list = template.list(filelist);
    const html = template.HTML(title, list, `
      <form action="/create_process" method="post">
        <p><input type="text" name="title" placeholder="title"></p>
        <p>
          <textarea name="description" placeholder="description"></textarea>
        </p>
        <p>
          <input type="submit">
        </p>
      </form>
    `, '');
    response.send(html);
  })
})

//route '/create_process'
app.post('/create_process', (request, response) => {
  console.log('access : create_process');
  let body = '';
  request.on('data', (data) => {
    body = body + data;
  })
  request.on('end', () => {
    const post = qs.parse(body);
    const title = post.title;
    const description = post.description;
    fs.writeFile(`data/${title}`, description, 'utf8', (err) => {
      response.redirect(302, `/page/${title}`);
    })
  })
})

//route '/update'
app.get('/update/:pageID', (request, response) => {
  console.log('access : update page / ' + request.params.pageID);
  fs.readdir('./data', (error, filelist) => {
    const filteredId = path.parse(request.params.pageID).base;
    fs.readFile(`data/${filteredId}`, 'utf8', (err, description) => {
      const title = request.params.pageID;
      const list = template.list(filelist);
      const html = template.HTML(title, list,
        `
        <form action="/update_process" method="post">
          <input type="hidden" name="id" value="${title}">
          <p><input type="text" name="title" placeholder="title" value="${title}"></p>
          <p>
            <textarea name="description" placeholder="description">${description}</textarea>
          </p>
          <p>
            <input type="submit">
          </p>
        </form>
        `,
        `<a href="/create">create</a> <a href="/update?id=${title}">update</a>`
      );
      response.send(html);
    })
  })
})

//route '/update_process'
app.post('/update_process', (request, response) => {
  console.log('access : update_process');
  let body = '';
  request.on('data', (data) => {
    body = body + data;
  });
  request.on('end', () => {
    const post = qs.parse(body);
    const id = post.id;
    const title = post.title;
    const description = post.description;
    fs.rename(`data/${id}`, `data/${title}`, function(error){
      fs.writeFile(`data/${title}`, description, 'utf8', function(err){
        response.redirect(302, `/page/${title}`);
      })
    })
  })
})

//route '/delete_process'
app.post('/delete_process', (request ,response) => {
  console.log('access : delete_process');
  let body = '';
  request.on('data', (data) => {
    body = body + data;
  });
  request.on('end', () => {
    const post = qs.parse(body);
    const id = post.id;
    const filteredId = path.parse(id).base;
    fs.unlink(`data/${filteredId}`, (error) => {
      response.redirect(302, `/`);
    })
  })
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

// var http = require('http');
// var fs = require('fs');
// var url = require('url');
// var qs = require('querystring');
// var template = require('./lib/template.js');
// var path = require('path');
// var sanitizeHtml = require('sanitize-html');

// var app = http.createServer(function(request,response){
//     var _url = request.url;
//     var queryData = url.parse(_url, true).query;
//     var pathname = url.parse(_url, true).pathname;
//     if(pathname === '/'){

//     } else {

//     } else if(pathname === '/create'){

//     } else if(pathname === '/create_process'){

//     } else if(pathname === '/update'){

//     } else if(pathname === '/update_process'){

//     } else if(pathname === '/delete_process'){

//     } else {
//       response.writeHead(404);
//       response.end('Not found');
//     }
// });
// app.listen(3000);
