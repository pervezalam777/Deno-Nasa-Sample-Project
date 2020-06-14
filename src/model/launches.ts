import { flatMap, log } from "../deps.ts";

interface Launch {
    flightNumber: number;
    mission: string;
    rocket: string;
    launchDate: number;
    customers: Array<string>;
    upcoming: boolean;
    success?: boolean;
    target?: string;
}

const launches = new Map<number, Launch>();

async function downloadLaunchData(){
    log.info('Requesting SpaceX data')
    const response = await fetch('https://api.spacexdata.com/v3/launches', {
        method:"GET"
    })

    if(!response.ok) {
        log.error("Error ocurred while loading SpaceX data")
        throw new Error("Error ocurred during fetch")
    }

    const launchData = await response.json();

    for (const launch of launchData) {
        const payloads = launch["rocket"]["second_stage"]["payloads"];
    
        const customers = flatMap(payloads, (payload: any) => {
          return payload["customers"];
        });
    
        const flightData = {
            flightNumber: launch["flight_number"],
            mission: launch["mission_name"],
            rocket: launch["rocket"]["rocket_name"],
            launchDate: launch["launch_date_unix"],
            customers,
            upcoming: launch["upcoming"],
            success: launch['launch_success'],
        };
    
        launches.set(flightData.flightNumber, flightData);
      }
}

await downloadLaunchData();

export function getAll() {
    return Array.from(launches.values())
};

export function getOne( id : number) {
    if(launches.has(id)){
        return launches.get(id);
    }
    throw new Error("Launch does not exists");
}

export function addOne (data: Launch) {
    try {
        let finalObjet = {...data, upcoming:true, customers:["PSRC", "ASRC"]}
        launches.set(data.flightNumber, finalObjet);
        return finalObjet;
    } catch(e){
        log.error("Error on Adding", e);
        throw new Error(e);
    }
}

export function removeOne(id: number){
    const aborted = launches.get(id) as Launch;
    if(aborted){
        aborted.upcoming = false;
        aborted.success = false;
    }
    return aborted
}