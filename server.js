const fs = require('fs');
const http = require('http');
const Koa = require('koa');
const koaBody = require('koa-body').default;
const koaStatic = require('koa-static');
const path = require('path');
const uuid = require('uuid');

const app = new Koa();

const pub = path.join(__dirname, '/public');

app.use(koaStatic(pub));

app.use(koaBody({
    urlencoded: true,
    multipart: true,
}));

app.use((ctx, next) => {
    if (ctx.request.method !== 'OPTIONS') {
        next();
        return;
    }

    ctx.response.set('Access-Control-Allow-Origin', '*');
    ctx.response.set('Access-Control-Allow-Methods', 'DELETE, PUT, PATCH, GET, POST');
    ctx.response.status = 204;
});


app.use((ctx, next) => {
    if (ctx.request.method !== 'POST') {
        next();
        return;
    }

    if (!('method' in ctx.request.query)) {
        ctx.response.status = 400;
        ctx.response.body = 'Неизвестная команда';
        return;
    }

    if (ctx.request.query.method !== 'createTicket') {
        next();
        return;
    }

    const objData = (typeof (ctx.request.body) == 'string') ? JSON.parse(ctx.request.body) : ctx.request.body;


    const nameFile = path.join(pub, objData.id);
    fs.writeFileSync(nameFile, JSON.stringify(objData));

    ctx.response.set('Access-Control-Allow-Origin', '*');
    ctx.response.body = 'OK';

    next();
});


app.use((ctx, next) => {
    if (ctx.request.method !== 'GET') {
        next();
        return;
    }

    if (!('method' in ctx.request.query)) {
        ctx.response.status = 400;
        ctx.response.body = 'Неизвестная команда';
        return;
    }

    if (ctx.request.query.method !== 'allTickets') {
        next();
        return;
    }

    const files = fs.readdirSync(pub);
    const respData = [];

    for (let file of files) {
        let data = fs.readFileSync(path.join(pub, file));
        respData.push(JSON.parse(data));
    }

    ctx.response.set('Access-Control-Allow-Origin', '*');
    ctx.response.set('Content-Type', 'application/json');
    ctx.response.body = JSON.stringify(respData);
    //ctx.response.body = 'OK';
    next();

});


app.use((ctx, next) => {
    if (ctx.request.method !== 'POST') {
        next();
        return;
    }

    if (!('method' in ctx.request.query)) {
        ctx.response.status = 400;
        ctx.response.body = 'Неизвестная команда';
        return;
    }

    if (ctx.request.query.method !== 'updateById') {
        next();
        return;
    }

    const nameFile = path.join(pub, ctx.request.query.id);

    try {
        fs.accessSync(nameFile, fs.constants.R_OK);
    } catch (err) {
        ctx.response.status = 400;
        ctx.response.body = 'Файл недоступен';
        return;
    } 

    if (!('id' in ctx.request.body)) {
        ctx.response.status = 400;
        ctx.response.body = 'Неверные данные';
        return;
    }

    fs.writeFileSync(nameFile, JSON.stringify(ctx.request.body));

    ctx.response.set('Access-Control-Allow-Origin', '*');
    ctx.response.body = 'OK';

    next();
});

app.use((ctx, next) => {
    if (ctx.request.method !== 'GET') {
        next();
        return;
    }

    if (!('method' in ctx.request.query)) {
        ctx.response.status = 400;
        ctx.response.body = 'Неизвестная команда';
        return;
    }

    if (ctx.request.query.method !== 'ticketById') {
        next();
        return;
    }

    const nameFile = path.join(pub, ctx.request.query.id);

    try {
        fs.accessSync(nameFile, fs.constants.R_OK);
    } catch (err) {
        ctx.response.status = 400;
        ctx.response.body = 'Файл недоступен';
        return;
    }

    let data = fs.readFileSync(nameFile);

    ctx.response.set('Access-Control-Allow-Origin', '*');
    ctx.response.set('Content-Type', 'application/json');
    ctx.response.body = data;

    next();
});


app.use((ctx, next) => {
    if (ctx.request.method !== 'DELETE') {
        next();
        return;
    }

    if (!('method' in ctx.request.query)) {
        ctx.response.status = 400;
        ctx.response.body = 'Неизвестная команда';
        return;
    }

    if (ctx.request.query.method !== 'deleteById') {
        next();
        return;
    }

    const nameFile = path.join(pub, ctx.request.query.id);

    try {
        fs.accessSync(nameFile, fs.constants.W_OK);
    } catch (err) {
        ctx.response.status = 400;
        ctx.response.body = 'Файл недоступен';
        return;
    }

    try {
        fs.unlinkSync(nameFile);
    } catch (err) {
        ctx.response.status = 400;
        ctx.response.body = 'Файл недоступен';
        return;
    }

    ctx.response.set('Access-Control-Allow-Origin', '*');
    ctx.response.body = 'OK';

    next();
});


const server = http.createServer(app.callback());

const port = process.env.PORT || 7070;

server.listen(port, (err) => {
    if (err) {
        console.log(err);
        return;
    }

    console.log('Server is listening to ' + port);
});