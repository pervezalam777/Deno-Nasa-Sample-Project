import { Application, send } from "https://deno.land/x/oak@v5.0.0/mod.ts";

import { log } from "./src/deps.ts"

import api from "./src/router/api.ts";

const app = new Application();
const port = 8000;

// Logger setup
await log.setup({
    handlers: {
        console: new log.handlers.ConsoleHandler("INFO")
    },
    loggers:{
        default: {
            level:"INFO",
            handlers: ["console"]
        }
    }
});

// Any error ocurred while going through all the middleware.
// will be received here in the oak application listener
app.addEventListener('error', (event) => {
    log.error(event.error); 
})

// Middleware for catching error while executing
// all the other middleware
app.use(async (ctx, next) => {
    try {
        await next();
    } catch(err){
        ctx.response.body = `Internal server error`;
        throw err
    }
})

// log internal time taken by the server for sending data.
app.use(async (ctx, next) => {
    await next();
    const delta = ctx.response.headers.get('X-Response-Time');
    log.info(`${ctx.request.method} ${ctx.request.url} : ${delta}`);
})

//This middleware sets custom response header with the time taken by the server.
// Although, client may show different time since it shows overall time taken to 
// fullfill the request which include network transfer time as well.
app.use(async (ctx, next) => {
    const start = Date.now();
    await next();
    const delta = Date.now() - start;
    ctx.response.headers.set('X-Response-Time', `${delta}ms`)
})

// The following middleware creates API route
app.use(api.routes());

// The following middleware sends not implemented error
// if same API route us used with un-implemented method (GET, POST, PUT, etc.)
app.use(api.allowedMethods())

//Following are the frontend items
//TODO: find another way to solve this situation.
const fileWhiteList = [
    "/index.html",
    "/images/favicon.png",
    "/javascripts/script.js",
    "/stylesheets/style.css"        
]

//This middleware server static files.
app.use(async (ctx) => {
    let filePath = ctx.request.url.pathname;
    if(filePath === "/"){
        filePath += "index.html"
    }
    if(fileWhiteList.includes(filePath)){
        await send(ctx, filePath, {
            root:`${Deno.cwd()}/public`
        })
    }
})


if(import.meta.main){
    log.info(`server is running on http://localhost:${port}`)
    await app.listen({ port });
}
