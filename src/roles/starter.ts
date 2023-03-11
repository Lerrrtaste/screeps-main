// screeps start role
//
// Harvesters and then supplies in priority order:
// 1. Spawn
// 2. Extensions
// 3. Construction sites
// 4. Room controller

import { BaseRole, BaseRoleMemory, BaseCreepMemory } from "./base";

enum States {
    IDLE = "idle",
    HARVESTING = "harvesting",
    SUPPLY_SPAWN = "supply_spawn",
    SUPPLY_EXTENSION = "supply_extension",
    SUPPLY_CONSTRUCTION = "supply_construction",
    SUPPLY_CONTROLLER = "supply_controller",
}

interface StarterCreepMemory extends BaseCreepMemory {
    targetPos: RoomPosition;
    targetSourceId: string;
    supplyTargetId: string;
}

interface StarterRoleMemory extends BaseRoleMemory {
    activeSourcesIds: string[],
    // per sourceid: dict with [x,y]: creepId
    harvestSlots: { [sourceId: string]: { [pos: string]: string } },
}

export class StarterRole extends BaseRole {
    constructor() {
        super("starter");
    }

    memory: StarterRoleMemory = Memory.roles['starter'] as StarterRoleMemory || {
        activeSourcesIds: [],
        harvestSlots: {},
    };

    // Init new Creeps
    public override initCreep(creep: Creep, creepMemory: StarterCreepMemory) {
        creepMemory.state = States.IDLE;
    }

    // Prepare Run
    public override preRun(room: Room) {
        // collect harvesting positions //TODO cache
        const sources = room.find(FIND_SOURCES_ACTIVE);
        const terrain = room.getTerrain();
        for (const source of sources) {
            if (this.memory.activeSourcesIds.indexOf(source.id) != -1) {
                continue; // already added
            }
            this.memory.activeSourcesIds.push(source.id);
            this.memory.harvestSlots[source.id] = {};

            for (let x = -1; x <= 1; x++) {
                for (let y = -1; y <= 1; y++) {
                    if (x == 0 && y == 0) {
                        continue;
                    }
                    if (terrain.get(source.pos.x + x, source.pos.y + y) != TERRAIN_MASK_WALL) {
                        this.memory.harvestSlots[source.id][source.pos.x + x + "," + (source.pos.y + y)] = "";
                    }
                }
            }
        }

        // free slots for dead creeps
        for (const sourceId in this.memory.harvestSlots) {
            for (const pos in this.memory.harvestSlots[sourceId]) {
                if (this.memory.harvestSlots[sourceId][pos] != "" && !Game.getObjectById(this.memory.harvestSlots[sourceId][pos])) {
                    console.log("(dead creep) freeing slot " + pos + " for source " + sourceId);
                    this.memory.harvestSlots[sourceId][pos] = "";
                }
            }
        }
    }

    public override runCreep(creep: Creep, creepMemory: StarterCreepMemory) {
        // const creepMemory = creep.memory as StarterCreepMemory;

        this.updateCreepState(creep, creepMemory);

        switch (creepMemory.state) {
            case States.IDLE:
                this.runIdle(creep, creepMemory);
                break;
            case States.HARVESTING:
                this.runHarvesting(creep, creepMemory);
                break;
            case States.SUPPLY_SPAWN:
                this.runSupplySpawn(creep, creepMemory);
                break;
            case States.SUPPLY_CONTROLLER:
                this.runSupplyController(creep, creepMemory);
                break;
            case States.SUPPLY_EXTENSION:
                this.runSupplyExtension(creep, creepMemory);
                break;
            case States.SUPPLY_CONSTRUCTION:
                this.runSupplyConstruction(creep, creepMemory);
                break;
        }
    }

    private updateCreepState(creep: Creep, creepMemory: StarterCreepMemory) {
        switch (creepMemory.state) {
            case States.IDLE:
                const harvestSlots = this.memory.harvestSlots;
                for (const sourceId of this.memory.activeSourcesIds) {
                    for (const pos in harvestSlots[sourceId]) {
                        if (harvestSlots[sourceId][pos] == "") {
                            creepMemory.targetPos = new RoomPosition(parseInt(pos.split(",")[0]), parseInt(pos.split(",")[1]), creep.room.name);
                            creepMemory.targetSourceId = sourceId;
                            creepMemory.state = States.HARVESTING;
                            creep.say("back2work");
                            console.log("Starter: " + creep.name + " is harvesting at " + creepMemory.targetPos);
                            this.memory.harvestSlots[sourceId][pos] = creep.id;
                            return;
                        }
                    }
                }
                creep.say("no slot...");
                let idlePos = Game.spawns['Spawn1'].pos;
                idlePos.y += 2;
                this.goTo(creep, idlePos);
                break;

            case States.HARVESTING:
                if (creep.store.getFreeCapacity() == 0) {
                    // 0. free slot
                    if (this.memory.harvestSlots[creepMemory.targetSourceId][creepMemory.targetPos.x + "," + creepMemory.targetPos.y] == creep.id) {
                        this.memory.harvestSlots[creepMemory.targetSourceId][creepMemory.targetPos.x + "," + creepMemory.targetPos.y] = "";
                    }
                    creep.say("I'm FULL");

                    // 1. supply spawn
                    if (Game.spawns["Spawn1"].store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
                        creepMemory.state = States.SUPPLY_SPAWN;
                        creepMemory.supplyTargetId = "";
                        return;
                    }

                    // 2. supply extensions
                    const extensions = creep.room.find(FIND_MY_STRUCTURES, {
                        filter: (s) => s.structureType == STRUCTURE_EXTENSION
                            && s.store.getFreeCapacity(RESOURCE_ENERGY) > 0
                    });
                    if (extensions.length > 0) {
                        creepMemory.state = States.SUPPLY_EXTENSION;
                        creepMemory.supplyTargetId = extensions[0].id;
                        return;
                    }

                    // 3. supply construction sites
                    const constructionSites = creep.room.find(FIND_MY_CONSTRUCTION_SITES);
                    if (constructionSites.length > 0) {
                        creepMemory.state = States.SUPPLY_CONSTRUCTION;
                        creepMemory.supplyTargetId = constructionSites[0].id;
                        return;
                    }

                    // 4. supply controller
                    creepMemory.state = States.SUPPLY_CONTROLLER;
                    creepMemory.supplyTargetId = "";
                }
                break;

            case States.SUPPLY_SPAWN:
                if (Game.spawns["Spawn1"].store.getFreeCapacity(RESOURCE_ENERGY) == 0) {
                    creepMemory.state = States.IDLE;
                    creep.say("storno");
                }
                if (creep.store.getUsedCapacity() == 0) {
                    creepMemory.state = States.IDLE;
                    creep.say("All done");
                }
                break;

            case States.SUPPLY_CONTROLLER:
                if (Game.spawns["Spawn1"].store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
                    creepMemory.state = States.IDLE;
                    creep.say("storno");
                }
                if (creep.store.getUsedCapacity() == 0) {
                    creepMemory.state = States.IDLE;
                    creep.say("All done");
                }
                break;

            case States.SUPPLY_EXTENSION:
                const extension = Game.getObjectById(creepMemory.supplyTargetId) as StructureExtension;
                if (!extension || extension.store.getFreeCapacity(RESOURCE_ENERGY) == 0) {
                    creepMemory.state = States.IDLE;
                    creep.say("storno");
                }
                if (creep.store.getUsedCapacity() == 0) {
                    creepMemory.state = States.IDLE;
                    creep.say("All done");
                }
                break;

            case States.SUPPLY_CONSTRUCTION:
                const structure = Game.getObjectById(creepMemory.supplyTargetId) as ConstructionSite;
                if (!structure || structure.progress == structure.progressTotal) {
                    creepMemory.state = States.IDLE;
                    creep.say("storno");
                }

                if (creep.store.getUsedCapacity() == 0) {
                    creepMemory.state = States.IDLE;
                    creep.say("All done");
                }
        }
    }

    private runIdle(creep: Creep, creepMemory: StarterCreepMemory) {
        // Check for available harvest slots
        // creep.say("am bored");
    }

    private runHarvesting(creep: Creep, creepMemory: StarterCreepMemory) {
        // harvest
        if (!creepMemory.targetSourceId || !creepMemory.targetPos) {
            console.error("Starter: " + creep.name + " has invalid target");
            return;
        }

        let targetSource = Game.getObjectById(creepMemory.targetSourceId) as Source;
        let targetPos = creepMemory.targetPos;

        if (creep.harvest(targetSource) == ERR_NOT_IN_RANGE) {
            this.goTo(creep, targetPos);
        }
    }

    private runSupplySpawn(creep: Creep, creepMemory: StarterCreepMemory) {
        if (creep.transfer(Game.spawns["Spawn1"], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            this.goTo(creep, Game.spawns["Spawn1"].pos);
        }
    }

    private runSupplyController(creep: Creep, creepMemory: StarterCreepMemory) {
        if (creep.upgradeController(creep.room.controller!) == ERR_NOT_IN_RANGE) {
            this.goTo(creep, creep.room.controller!.pos);
        }
    }

    private runSupplyExtension(creep: Creep, creepMemory: StarterCreepMemory) {
        const extensionStructure = Game.getObjectById(creepMemory.supplyTargetId) as StructureExtension;
        if (extensionStructure && creep.transfer(extensionStructure, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            this.goTo(creep, extensionStructure.pos);
        }
    }

    private runSupplyConstruction(creep: Creep, creepMemory: StarterCreepMemory) {
        const constructionSite = Game.getObjectById(creepMemory.supplyTargetId) as ConstructionSite;
        if (constructionSite && creep.build(constructionSite) == ERR_NOT_IN_RANGE) {
            this.goTo(creep, constructionSite.pos);
        }
    }

    public override postRun(creeps: Creep[]) {
        // nothing to do
    }
}

export { StarterRoleMemory, StarterCreepMemory };
