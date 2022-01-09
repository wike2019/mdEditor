
import mitt from 'mitt'
import {DWorker} from "./work";

import {cache} from "./cache";

const bus = mitt()

let core={
    bus,
    DWorker,
    mitt,
    cache
}


export {core}