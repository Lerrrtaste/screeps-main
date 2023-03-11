// screeps start role

import { BaseRole, BaseRoleMemory, BaseCreepMemory } from "./base";

enum States {
    IDLE = "idle",
    HARVESTING = "harvesting",
    SUPPLY_SPAWN = "supply_spawn",
    SUPPLY_CONTROLLER = "supply_controller",
}

interface StarterCreepMemory extends BaseCreepMemory {
    targetPos: RoomPosition;
    targetSourceId: string;
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
            console.log("Starter: found new source " + source.id);
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
                            console.log("Starter: " + creep.name + " found harvest slot " + pos);
                            creep.say("back2work");
                            this.memory.harvestSlots[sourceId][pos] = creep.id;
                            return;
                        }
                    }
                }
                break;

            case States.HARVESTING:
                if (creep.store.getFreeCapacity() == 0) {
                    creepMemory.state = States.SUPPLY_SPAWN;
                    this.memory.harvestSlots[creepMemory.targetSourceId][creepMemory.targetPos.x + "," + creepMemory.targetPos.y] = "";
                    creep.say("I'm FULL");
                }
                break;

            case States.SUPPLY_SPAWN:
            case States.SUPPLY_CONTROLLER:
                if (creep.store.getUsedCapacity() == 0) {
                    creepMemory.state = States.IDLE;
                    creep.say("All done");
                }
                break;
        }
    }

    private runIdle(creep: Creep, creepMemory: StarterCreepMemory) {
        // Check for available harvest slots
        creep.say("am bored");
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

    public override postRun(creeps: Creep[]) {
        // nothing to do
    }
}

export { StarterRoleMemory, StarterCreepMemory };
