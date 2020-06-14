import { Router, Context  } from "https://deno.land/x/oak@v5.0.0/mod.ts";
import * as planets from "../model/planets.ts";
import * as launches from "../model/launches.ts";

const apiVersion = '/api/v1'

const router = new Router();

router.get(apiVersion, (ctx) => {
    ctx.response.body = `Hi there you are accessing api`
});

router.get(`${apiVersion}/habitable/planets`, ctx => {
    //ctx.throw(501, 'Client will not get this message.') // for testing purpose
    //ctx.throw(400, 'Client will get this message.') // for testing purpose
    ctx.response.body = planets.getPossibleHabitatPlanet();
});

router.get(`${apiVersion}/launches`, (ctx) => {
    ctx.response.body = {
        launches: launches.getAll()
    };
})

router.get(`${apiVersion}/launches/:id`, (ctx) => {
   if(ctx.params?.id){
       const launchDetails  = launches.getOne(Number(ctx.params.id));
       if(launchDetails){
           ctx.response.body = launches.getOne(Number(ctx.params.id));
       } else {
           ctx.throw(400, `Launch, with ${ctx.params.id} Id, doesn't exists`);
       }
   }
})

router.delete(`${apiVersion}/launches/:id`, ctx => {
    if(ctx.params?.id){
        const result = launches.removeOne(Number(ctx.params.id));
        if(result){
            ctx.response.body = { success: true, launch: result };
        } else {
            ctx.throw(400, `Launch, with ${ctx.params.id} id, does not exits`)
        }
    }
});

router.post(`${apiVersion}/launches`, async (ctx) => {
    const body = await ctx.request.body();
    const bodyValue = body.value;
    if(bodyValue){
        let finalObject = launches.addOne(bodyValue);
        ctx.response.body = { launch: finalObject, success: true}
    } else {
        ctx.throw(400, `Data not provided.`)
    }
})

export default router;