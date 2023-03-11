import { ErrorMapper } from "utils/ErrorMapper";
import * as _ from "lodash";
import CreepClass from './creepClass';
import { BaseRoleMemory, BaseRole } from './roles/base';
import { StarterRole, StarterCreepMemory, StarterRoleMemory } from './roles/starter';

declare global {
  /*
    Example types, expand on these or remove them and add your own.
    Note: Values, properties defined here do no fully *exist* by this type definiton alone.
          You must also give them an implemention if you would like to use them. (ex. actually setting a `role` property in a Creeps memory)

    Types added in this `global` block are in an ambient, global context. This is needed because `main.ts` is a module file (uses import or export).
    Interfaces matching on name from @types/screeps will be merged. This is how you can extend the 'built-in' interfaces from @types/screeps.
  */
  // Memory extension samples
  interface Memory {
    uuid: number;
    log: any;

    creepClasses: { [name: string]: CreepClass };
    roles: { [role: string]: BaseRoleMemory };
  }

  interface CreepMemory {
    creepClass: string;
    version: number;
    role: string;
  }

  // Syntax for adding proprties to `global` (ex "global.log")
  namespace NodeJS {
    interface Global {
      log: any;
    }
  }

  // Spawn1


}

// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
export const loop = ErrorMapper.wrapLoop(() => {

  // Genreal Todos
  // - memorry plumbing every x ticks (cleanup dead creeps, add new creeps, etc)

  // Roles
  // - Distributor (take from containers carry to spawn, extensions, storage)
  //   tries to keep all containers 1/2 full (overflow to storage, underflow from storage)
  //   body focus: carry, move
  //
  // - Harvester (take from source and put in container)
  //   body focus: work
  //
  // - Worker (take from nearest container and put in construction sites, repair sites, etc)
  //   body focus: work, move,
  //

  // Distribution and Construction Logic
  // - Supply Containers: x per source,
  //   supplied by harvesters,
  //   emptied by distributors
  //
  // - Consume Containers: x per source,
  //   supplied by distributors,
  //   used by workers
  //
  // - Storage: x per room, supplied by distributors,
  //   supplied by distributers
  //   take overflow of harvest containers
  //   taken from if harvest containers are empty
  //
  // - Extensions: x per room, supplied by distributors
  // - Spawn: x per room, supplied by distributors
  //
  // - Towers: x per room, supplied by distributors

  // Resource Levels
  // - Supply Container Energy
  // - Consume Container Energy
  // - Storage Energy
  // - Spawn+Extension Energy
  // - Harvestable Energy
  // - Total Energy

  
  // Ui Actions
  // - Create creepClasses
  // - Set targets per creepClass
  // - Set construciton targets
  // - Set Worker Priorities
  // - Set target Storage Levels (per container type)
  //
  // Ui Data
  // - CreepClasses
  // - Pop per Class
  // - Pop per Role
  // - Creeps (Name, Class, Role, state, (target), lifetime)
  // - Construction Queue and Progress
  // - Spawn Queue and Progress
  // - Terrain
  // - Harvesting slots (claimed/free/status)
  //
  // phase system with room level

  const starterClass = new CreepClass("Dan", 1, [WORK, CARRY, MOVE, WORK], "starter");
  let starterRole = new StarterRole();
  starterRole.runRole(Game.rooms["E6N39"]);

  const targetPop = 12;
  const currentPop = _.size(Game.creeps);
  if (currentPop < targetPop) {
    starterClass.spawn(Game.spawns["Spawn1"]);
  }

  // Automatically delete memory of missing creeps
  for (const name in Memory.creeps) {
    if (!(name in Game.creeps)) {
      delete Memory.creeps[name];
    }
  }
});
