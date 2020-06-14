import {
    join,
    BufReader,
    parse,
    pick,
    log
} from "../deps.ts"

// export interface Planet {
//     [key : string]:string
// }

type Planet = Record<string, string>

async function loadPlanetsData(){
    const path = join('data', 'original.csv');
    let file;
    let result:Array<Planet> = [];
    try{
        file = await Deno.open(path);
        const bufReader = new BufReader(file);
        result = (await parse(bufReader, {
            header: true,
            comment: '#'
        }) as Array<Planet>)   
    } catch(e) {
        log.critical('some error ocurred ', e)
    } finally {
        if(file && file.rid){
            Deno.close(file.rid);
        }
    }
    return result;
}

export function filterHabitatsPlanet(data:Array<Planet>):Array<Planet>{
    if(data){
        const habitatsPlanet:Array<Planet> = data.filter((planet:Planet) => {
            const planetaryRadius:Number = Number(planet["koi_prad"]);
            const stellarMass:Number = Number(planet["koi_smass"]);
            const stellarRadius = Number(planet["koi_srad"]);
           
            return planet["koi_disposition"] == "CONFIRMED" 
            && planetaryRadius > 0.5 && planetaryRadius < 1.5
            && stellarMass > 0.78 && stellarMass < 1.04
            && stellarRadius > 0.99 && stellarRadius < 1.01;
        })
        return habitatsPlanet;
    }
    return [];
}

function mapRequiredProperties(habitatsPlanet:Array<Planet>):Array<Planet>{
    return habitatsPlanet.map((planet:Planet) => {
        return pick(planet, [
            "koi_prad",
            "koi_smass",
            "koi_srad",
            "kepler_name",
            "koi_steff",
            "koi_count",
            "koi_period"
        ])
    });
}

let habitatsPlanet = await loadPlanetsData();
habitatsPlanet = filterHabitatsPlanet(habitatsPlanet);
habitatsPlanet = mapRequiredProperties(habitatsPlanet);
log.info(`Total habitat plates are : ${habitatsPlanet?.length}`);

const response = {
    planets: habitatsPlanet,
    filters: {
        koi_prad: {
            name:"Planetary Radius",
            symbol:"R⊕",
            greaterThan: 0.5,
            lessThan: 1.5
        },
        koi_smass: {
            name:"Solar Mass",
            symbol:"M☉",
            greaterThan: 0.78,
            lessThan: 1.04
        },
        koi_srad: {
            name:"Solar Radius",
            symbol:"R☉",
            greaterThan: 0.99,
            lessThan: 1.01 
        }
    }
}

export function getPossibleHabitatPlanet(){
    return response;
}