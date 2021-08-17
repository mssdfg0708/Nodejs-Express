const express = require('express')
const router = express.Router()
const path = require('path');
const fs = require('fs');
const sanitizeHtml = require('sanitize-html');
const template = require('../lib/template.js');

//route '/create'
router.get('/create', (request, response) => {
  console.log('access : create page');
  const title = 'WEB - create';
  const list = template.list(request.list);
  const html = template.HTML(title, list, `
    <form action="/topic/create_process" method="post">
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

//route '/create_process'
router.post('/create_process', (request, response) => {
  console.log('access : create_process');
  const post = request.body;
  const title = post.title;
  const description = post.description;
  fs.writeFile(`data/${title}`, description, 'utf8', (err) => {
    response.redirect(302, `/topic/${title}`);
  })
})

//route '/update'
router.get('/update/:pageID', (request, response) => {
  console.log('access : update page / ' + request.params.pageID);
  const filteredId = path.parse(request.params.pageID).base;
  fs.readFile(`data/${filteredId}`, 'utf8', (err, description) => {
    const title = request.params.pageID;
    const list = template.list(request.list);
    const html = template.HTML(title, list,
      `
      <form action="/topic/update_process" method="post">
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
      `<a href="/topic/create">create</a> <a href="/topic/update?id=${title}">update</a>`
    );
    response.send(html);
  })
})

//route '/update_process'
router.post('/update_process', (request, response) => {
  console.log('access : update_process');
  const post = request.body;
  const id = post.id;
  const title = post.title;
  const description = post.description;
  fs.rename(`data/${id}`, `data/${title}`, function(error){
    fs.writeFile(`data/${title}`, description, 'utf8', function(err){
      response.redirect(302, `/topic/${title}`);
    })
  })
})

//route '/delete_process'
router.post('/delete_process', (request ,response) => {
  console.log('access : delete_process');
  const post = request.body;
  const id = post.id;
  const filteredId = path.parse(id).base;
  fs.unlink(`data/${filteredId}`, (error) => {
    response.redirect(302, `/`);
  })
})

//route '/topic/:pageID'
router.get('/:pageID', (request, response, next) => {
  console.log('access : page / ' + request.params.pageID);
  const filteredId = path.parse(request.params.pageID).base;
  fs.readFile(`data/${filteredId}`, 'utf8', (err, description) => {
    if (err){
      next(err);
    } else {
    const title = request.params.pageID;
    const sanitizedTitle = sanitizeHtml(title);
    const sanitizedDescription = sanitizeHtml(description, {
      allowedTags:['']
    })
    const list = template.list(request.list);
    const html = template.HTML(sanitizedTitle, list,
      `<h2>${sanitizedTitle}</h2>${sanitizedDescription}`,
      ` <a href="/topic/create">create</a>
        <a href="/topic/update/${sanitizedTitle}">update</a>
        <form action="/topic/delete_process" method="post">
          <input type="hidden" name="id" value="${sanitizedTitle}">
          <input type="submit" value="delete">
        </form>`
    );
    response.send(html);
    }
  })
})

module.exports = router;
