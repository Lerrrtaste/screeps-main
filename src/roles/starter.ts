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
    queued: boolean;
    queuedTicks: number;
}

interface StarterRoleMemory extends BaseRoleMemory {
    activeSourcesIds: string[],
    // per sourceid: dict with [x,y]: creepId
    harvestSlots: { [sourceId: string]: { [pos: string]: { harvesting: string, queue: string[] } } },
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
            if (this.memory.activeSourcesIds.indexOf(source.id) != -1 && this.memory.harvestSlots[source.id]) {
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
                        this.memory.harvestSlots[source.id][source.pos.x + x + "," + (source.pos.y + y)] = {
                            harvesting: "",
                            queue: [],
                        };
                        console.log("initialized harvest slot @" + source.pos);
                    }
                }
            }
        }

        // free slots for dead creeps
        for (const sourceId in this.memory.harvestSlots) {
            for (const pos in this.memory.harvestSlots[sourceId]) {
                if (this.memory.harvestSlots[sourceId][pos].harvesting != "" && !Game.getObjectById(this.memory.harvestSlots[sourceId][pos].harvesting)) {
                    console.log("(dead creep) freeing slot " + pos + " for source " + sourceId);
                    this.memory.harvestSlots[sourceId][pos].harvesting = "";
                }
                // this.memory.harvestSlots[sourceId][pos].queue = this.memory.harvestSlots[sourceId][pos].queue.filter((creepId) => Game.getObjectById(creepId));
            }
        }

        // print queues
        // console.log("harvest queues:");
        // for (const sourceId in this.memory.harvestSlots) {
        //     for (const pos in this.memory.harvestSlots[sourceId]) {
        //         let text = "  " + pos + ": ";
        //         text += (Game.getObjectById(this.memory.harvestSlots[sourceId][pos].harvesting) as Creep)?.name || "none";
        //         if (this.memory.harvestSlots[sourceId][pos].queue.length > 0) {
        //             text += " -> ";
        //         }
        //         for (const creepId of this.memory.harvestSlots[sourceId][pos].queue) {
        //             text += (Game.getObjectById(creepId) as Creep).name;
        //             text += "(" + ((Game.getObjectById(creepId) as Creep).memory as StarterCreepMemory).queuedTicks + ") ";

        //         }

        //         console.log(text);
        //     }
        // }
        // console.log("other creeps:");
        // for (const state in States) {
        //     console.log("  " + state + ": ");

        //     // use state s strnig value
        //     for (const creep of this.getCreepsByState(state)) {
        //         const creepMemory = creep.memory as StarterCreepMemory;
        //         console.log("-  " + creepMemory.state + (" (q" + creepMemory.queuedTicks + "): " ? creepMemory.queued : " . ") + creep.name);
        //     }
        // }
    }

    public reset(creep: Creep, creepMemory: StarterCreepMemory) {
        creepMemory.state = States.SUPPLY_CONTROLLER;
        creepMemory.targetPos = new RoomPosition(0, 0, creep.room.name);
        creepMemory.targetSourceId = "";
        creepMemory.supplyTargetId = "";
    }


    public override runCreep(creep: Creep, creepMemory: StarterCreepMemory) {
        this.updateCreepState(creep, creepMemory);

        // this.reset(creep, creepMemory);
        // if (creep.name != "Crazy Dan (v2)") {
        //     return;
        // }


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
                // check if queued resources is available
                if (creepMemory.queued && creepMemory.targetSourceId &&

                    // only unqueue if no one has more queued ticks
                    this.memory.harvestSlots[creepMemory.targetSourceId][creepMemory.targetPos.x + "," + creepMemory.targetPos.y].harvesting == "") {
                    // let selfFound = false;
                    // for (let queuedCreepId in this.memory.harvestSlots[creepMemory.targetSourceId][creepMemory.targetPos.x + "," + creepMemory.targetPos.y].queue) {
                        // if (!Game.getObjectById(queuedCreepId)) {
                        //     console.log("found dead creep in queue");
                        //     this.memory.harvestSlots[creepMemory.targetSourceId][creepMemory.targetPos.x + "," + creepMemory.targetPos.y].queue = this.memory.harvestSlots[creepMemory.targetSourceId][creepMemory.targetPos.x + "," + creepMemory.targetPos.y].queue.filter((id) => id != queuedCreepId);
                        //     continue;
                        // }
                        // if (!((Game.getObjectById(queuedCreepId) as Creep).memory as StarterCreepMemory).queued) {
                        //     console.log("found non queued creep in queue");
                        //     this.memory.harvestSlots[creepMemory.targetSourceId][creepMemory.targetPos.x + "," + creepMemory.targetPos.y].queue = this.memory.harvestSlots[creepMemory.targetSourceId][creepMemory.targetPos.x + "," + creepMemory.targetPos.y].queue.filter((id) => id != queuedCreepId);
                        //     continue;
                        // }
                        // if (queuedCreepId == creep.id) {
                        //     if (selfFound) {
                        //         console.log("found self twice in queue");
                        //         this.memory.harvestSlots[creepMemory.targetSourceId][creepMemory.targetPos.x + "," + creepMemory.targetPos.y].queue.filter((id) => id != creep.id);
                        //     }
                        //     selfFound = true;
                        // }
                        // const ticks = ((Game.getObjectById(queuedCreepId) as Creep).memory as StarterCreepMemory).queuedTicks;
                        // if (ticks && ticks > creepMemory.queuedTicks) {
                        //     return ;
                        // }
                    // }

                    // unqueue
                    creepMemory.queued = false;
                    creepMemory.queuedTicks = 0;
                    creep.say("wooork");
                    console.log("unqueueing " + creep.name + "after " + creepMemory.queuedTicks + " ticks");
                    creepMemory.state = States.HARVESTING;
                    // this.memory.harvestSlots[creepMemory.targetSourceId][creepMemory.targetPos.x + "," + creepMemory.targetPos.y].harvesting = creep.id;
                    // this.memory.harvestSlots[creepMemory.targetSourceId][creepMemory.targetPos.x + "," + creepMemory.targetPos.y].queue = this.memory.harvestSlots[creepMemory.targetSourceId][creepMemory.targetPos.x + "," + creepMemory.targetPos.y].queue.filter((creepId) => creepId != creep.id);
                    return;

                } else if (creepMemory.queued) {
                    // fix bugs?
                    // console.log(this.memory.harvestSlots[creepMemory.targetSourceId][creepMemory.targetPos.x + "," + creepMemory.targetPos.y].queue.indexOf(creep.id) == -1);
                    // if (!this.memory.harvestSlots[creepMemory.targetSourceId][creepMemory.targetPos.x + "," + creepMemory.targetPos.y].queue.indexOf(creep.id)) {
                    //     creepMemory.queued = false;
                    //     creepMemory.queuedTicks = 0;
                    //     console.log("WARNIGNcanceeled queued harvest because source is not available anymore");
                    // }
                }


                if (!creepMemory.queued) {
                    // check if harvesting is available or queue
                    const randomSource = _.sample(creep.room.find(FIND_SOURCES));
                    const randomSlot = _.sample(Object.keys(this.memory.harvestSlots[randomSource.id]));
                    let sourceIdSmallestQueue = randomSource.id;
                    let harvestSlotSmallestQueue = randomSlot;
                    // let smallestQueue = 999;

                    for (const sourceId of this.memory.activeSourcesIds) {
                        for (const pos in this.memory.harvestSlots[sourceId]) {
                            // check if harvesting is available
                            if (this.memory.harvestSlots[sourceId][pos].harvesting == "") {
                                creepMemory.targetPos = new RoomPosition(parseInt(pos.split(",")[0]), parseInt(pos.split(",")[1]), creep.room.name);
                                creepMemory.targetSourceId = sourceId;
                                creepMemory.state = States.HARVESTING;
                                creep.say("back2work");
                                // console.log(creep.name + 'skipping queue');
                                this.memory.harvestSlots[sourceId][pos].harvesting = creep.id;
                                return;
                            }

                            // check if queue is smaller
                            // if (this.memory.harvestSlots[sourceId][pos].queue.length < smallestQueue) {
                            //     smallestQueue = this.memory.harvestSlots[sourceId][pos].queue.length;
                            //     sourceIdSmallestQueue = sourceId;
                            //     harvestSlotSmallestQueue = pos;
                            // }
                        }
                    }

                    // if (smallestQueue == 999) {
                    //     console.log("no harvest slots available to queue!?");
                    //     return;
                    // }
                    // enter queue
                    creepMemory.queued = true;
                    creepMemory.targetPos = new RoomPosition(parseInt(harvestSlotSmallestQueue.split(",")[0]), parseInt(harvestSlotSmallestQueue.split(",")[1]), creep.room.name);
                    creepMemory.targetSourceId = sourceIdSmallestQueue;
                    // this.memory.harvestSlots[sourceIdSmallestQueue][harvestSlotSmallestQueue].queue.push(creep.id);
                    console.log(creep.name + " queued to " + harvestSlotSmallestQueue + " at " + sourceIdSmallestQueue);
                }


                break;

            case States.HARVESTING:
                if (creep.store.getFreeCapacity() == 0) {
                    // 0. free slot
                    if (this.memory.harvestSlots[creepMemory.targetSourceId][creepMemory.targetPos.x + "," + creepMemory.targetPos.y].harvesting == creep.id) {
                        this.memory.harvestSlots[creepMemory.targetSourceId][creepMemory.targetPos.x + "," + creepMemory.targetPos.y].harvesting = "";
                    } else {
                        console.log("harvesting creep was not in slot");
                    }
                    creep.say("I'm FULL");
                    this.setSupplyState(creep, creepMemory);
                    creepMemory.targetSourceId = "";
                }
                break;

            case States.SUPPLY_SPAWN:
                // switch to controller if spawn full
                if (Game.spawns["Spawn1"].store.getFreeCapacity(RESOURCE_ENERGY) == 0) {
                    this.setSupplyState(creep, creepMemory);
                    creep.say("storno");
                }
                if (creep.store.getUsedCapacity() == 0) {
                    creepMemory.state = States.IDLE;
                    creep.say("All done");
                }
                break;

            // switch to spawn if not full
            case States.SUPPLY_CONTROLLER:
                if (Game.spawns["Spawn1"].store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
                    this.setSupplyState(creep, creepMemory);
                    creep.say("storno");
                }
                if (creep.store.getUsedCapacity() == 0) {
                    creepMemory.state = States.IDLE;
                    creep.say("All done");
                }
                break;

            case States.SUPPLY_EXTENSION:
                // check if extenstion full
                const extension = Game.getObjectById(creepMemory.supplyTargetId) as StructureExtension;
                if (!extension || extension.store.getFreeCapacity(RESOURCE_ENERGY) == 0) {
                    this.setSupplyState(creep, creepMemory);
                    creep.say("storno");
                }
                if (creep.store.getUsedCapacity() == 0) {
                    creepMemory.state = States.IDLE;
                    creep.say("All done");
                }
                break;

            case States.SUPPLY_CONSTRUCTION:
                // check if construction finished
                const structure = Game.getObjectById(creepMemory.supplyTargetId) as ConstructionSite;
                if (!structure || structure.progress == structure.progressTotal) {
                    this.setSupplyState(creep, creepMemory);
                    creep.say("storno");
                }
                if (creep.store.getUsedCapacity() == 0) {
                    creepMemory.state = States.IDLE;
                    creep.say("All done");
                }
                break;
        }
    }

    private setSupplyState(creep: Creep, creepMemory: StarterCreepMemory) {

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

    private runIdle(creep: Creep, creepMemory: StarterCreepMemory) {
        if (creepMemory.queued) {
            creepMemory.queuedTicks++;
            creep.say(''+creepMemory.queuedTicks);
            if (creep.pos.inRangeTo(creepMemory.targetPos, 3)) {
                // make space
                this.goTo(creep, Game.spawns["Spawn1"].pos);
                // creep.say("go2spawn");

            } else if (!creep.pos.inRangeTo(creepMemory.targetPos, 5)) {
                // move near
                this.goTo(creep, creepMemory.targetPos);
                // creep.say("go2q");

            } else {
                // wait
                // creep.say("q");
            }

        }

    }

    private runHarvesting(creep: Creep, creepMemory: StarterCreepMemory) {
        // harvest
        if (!creepMemory.targetSourceId || !creepMemory.targetPos) {
            console.error("Starter: " + creep.name + " has invalid target");
            return;
        }

        if (creepMemory.queued) {
            console.warn("ehm a queued creep is harvesting?"); //TODO remove
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
