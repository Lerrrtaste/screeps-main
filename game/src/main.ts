import { ErrorMapper } from "utils/ErrorMapper";
import * as _ from "lodash";
import CreepClass from './creepClass';
import { BaseRoleMemory, BaseRole } from './roles/base';
import { StarterRole, StarterCreepMemory, StarterRoleMemory } from './roles/starter';
import { Distributor, DistributionMemory } from './distribution';

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
    rooms: { [room: string]: RoomMemory };
  }

  interface RoomMemory {
  //   creepClasses: { [name: string]: CreepClass };
  //   roles: { [role: string]: BaseRoleMemory };
    distribution: DistributionMemory;
  }

  // Extended by class and roles
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
  // - defenses and all that

  // Roles
  // - Distributor (take from containers carry to spawn, extensions, storage)
  //   tries to keep all containers 1/2 full (overflow to storage, underflow from storage)
  //   body focus: carry, move
  //
  // - Harvester (take from source and put in container)
  //   body focus: work
  //
  // - Worker (take from nearest container and put in construction sites, repair sites, etc)
  // All in One (Build, Repair, Upgrade)
  //   body focus: work, move,
  //
  //   Specialzed:
  //   - Repairman (take from nearest supply container and repair)
  //   - Upgrader (take from nearest supply container and upgrade)
  //   - Builder (take from nearest supply container and build)
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
  // - Set container types (supply, consume, storage)
  //
  // Ui Data
  // - CreepClasses
  // - Pop per Class (+ spawn new? + suicide too many?)
  // - Pop per Role
  // - Creeps (Name, Class, Role, state, (target), lifetime)
  // - Construction Queue and Progress

// - Spawn Queue and Progress
  // - Terrain
  // - Harvesting slots (claimed/free/status)
  // - calculated movement speed (per class)
  // - remaing total construction energy
  //
  // phase system with room level

  // Init Room Memory
  const room = "E6N39";
  if (!Memory.rooms) {
    Memory.rooms = {};
  }
  if (!Memory.rooms[room]) {
    Memory.rooms[room] = {} as RoomMemory;
  }

  // Classes
  const starterClass = new CreepClass("Dan", 3, [WORK, WORK, CARRY, MOVE, MOVE], "starter");

  // Manager
  const distributor = new Distributor(Game.rooms[room], false);
  distributor.run();

  // Roles
  let starterRole = new StarterRole();
  starterRole.runRole(Game.rooms[room]);

  // Pop Spawner
  const targetPop = 24;
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
