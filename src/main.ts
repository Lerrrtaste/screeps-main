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
  // console.log(`Current game tick is ${Game.time}`);
  // let targetCreepCount = 12;
  // let creepCount = _.size(Game.creeps);

  // if (creepCount < targetCreepCount && Game.spawns["Spawn1"].spawning == null) {
  //   let newName = "Harvester_V2_" + Game.time;
  //   // console.log("Spawning new harvester: " + newName);
  //   Game.spawns["Spawn1"].spawnCreep([WORK, CARRY, MOVE, WORK], newName);
  // }

  //TODO distributor and harvest roles, store in containers next to sources for pickup
  // calculate the number of creeps per role

  // TODO ROles
  // - All in one starter (basically this)
  // - Distributor (take from containers and put in storage)
  // - Harvester (take from source and put in container)
  // - Builder (take from storage and build)
  //
  // Ui to create creep classes (body + role)
  //
  // ui targets for construction
  // phase system with room level

  // test
  const starterClass = new CreepClass("Dan", 1, [WORK, CARRY, MOVE, WORK], "starter");
  // starterClass.spawn(Game.spawns["Spawn1"]);

  let starterRole = new StarterRole();
  starterRole.runRole(Game.rooms["sim"]);

  const targetPop = 12;
  const currentPop = _.size(Game.creeps);
  if (currentPop < targetPop) {
    starterClass.spawn(Game.spawns["Spawn1"]);
  }



  // for (let name in Game.creeps) {
  //   let creep = Game.creeps[name];
  //   if (creep.memory.role == "harvester") {
  //     // update working status
  //     if (creep.memory.working == false && creep.store[RESOURCE_ENERGY] == 0) {
  //       creep.memory.working = true;
  //       creep.say("Going to work now");
  //       creep.memory.target = creep.memory.target + 1;
  //       creep.memory.target = creep.memory.target % 6;
  //       // console.log(creep.name + " is going to work at " + source);
  //       console.log("nextSource: " + creep.memory.target);
  //     }
  //     else if (creep.memory.working == true && creep.store[RESOURCE_ENERGY] == 50) {
  //       creep.memory.working = false;
  //       creep.say("I am full");
  //     }

  //     // do work
  //     if (creep.memory.working) {
  //       let sourceIdx = creep.memory.target < 5 ? 1 : 0;
  //       let source = creep.room.find(FIND_SOURCES)[sourceIdx];
  //       // if (typeof creep.memory.target != "number")
  //       //   console.log("source is null");
  //       //   creep.memory.working = false;
  //       //   continue;
  //       // }
  //       if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
  //         creep.moveTo(source);
  //         creep.room.visual.poly([creep.pos, source.pos], { stroke: '#ff0000' });
  //       }
  //     }
  //     else {
  //       if (Game.spawns["Spawn1"].store[RESOURCE_ENERGY] < 300) {
  //         if (creep.transfer(Game.spawns["Spawn1"], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
  //           creep.moveTo(Game.spawns["Spawn1"]);
  //           creep.room.visual.poly([creep.pos, Game.spawns["Spawn1"].pos], { stroke: '#ff0000', strokeWidth: 0.15, opacity: 0.1, lineStyle: 'dashed' });
  //         }
  //       } else {
  //         // bring to controller
  //         let controller = creep.room.controller;
  //         if (controller) {
  //           if (creep.upgradeController(controller) == ERR_NOT_IN_RANGE) {
  //             creep.moveTo(controller);
  //             creep.room.visual.poly([creep.pos, controller.pos], { stroke: '#ff0000', strokeWidth: 0.15, opacity: 0.1, lineStyle: 'dashed' });
  //           }
  //         }
  //       }
  //     }
  //   }
  // }







  // for (let name in Game.creeps) {
  //   let creep = Game.creeps[name];
  //   if (true || creep.memory.role == "harvester") {
  //     let sources = creep.room.find(FIND_SOURCES);
  //     if (creep.store[RESOURCE_ENERGY] < 50 && creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
  //       creep.moveTo(sources[0], { visualizePathStyle: { stroke: "#ffaa00" } });
  //       creep.say("🔄 harvest");
  //     } else if (creep.store.getFreeCapacity() > 0) {
  //       if(creep.transfer(Game.spawns["Spawn1"], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
  //         creep.moveTo(Game.spawns["Spawn1"], { visualizePathStyle: { stroke: "#ffffff" } });
  //         creep.say("🔄 transfer");
  //       }
  //     }
  //   }
  // }


  // Automatically delete memory of missing creeps
  for (const name in Memory.creeps) {
    if (!(name in Game.creeps)) {
      delete Memory.creeps[name];
    }
  }
});
