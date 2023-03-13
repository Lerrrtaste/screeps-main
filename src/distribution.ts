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

// This class implements the distribution logic
// for a single room. It reads all data from the game
// calculates the diffrent resource levels and then
// creates a list of tasks to fullfill the distribution
// targest.
//
// It also creates cunsruction sites for new supply containers.
// All manual containers are considered consume containers. (can still add id to memory by hand )
// Construction logic will probably be extracted to a seperate class later. But for now it is fine here.
//
//
// It keeps track of the container types. (They are all StructureContainer ingame)
// It keeps track of the container ids.
// It keeps track of the container energy levels.
// It keeps track of the container energy targets.
//
// The Distributor Role Creeps then take available tasks
// from the list and execute them. (not here)

const TARGET_HARVEST_CONTAINER_ENERGY = 500;
const TARGET_CONSUME_CONTAINER_ENERGY = 2000;
const CONSUME_CONTAINER_PER_SOURCE = 1;
const TASK_THRESHOLD = 100; // only create tasks if the diff is bigger than this
const TASK_MAX_AMOUNT = 500; // max amount of energy to transfer in one task


interface DistributionTask {
    sourceId: string;
    targetId: string;
    amount: number;
    taskId: string;
    takenByCreepId: string | null;
}

interface DistributionMemory {
    tasks: DistributionTask[];
    supplyContainerIds: string[];
    consumeContainerIds: string[];
    nextTaskId: number;
}

enum ContainerType {
    Supply,
    Consume
}


class Distributor {
    private room: Room;
    private memory: DistributionMemory;
    private logging: boolean;


    constructor(room: Room, logging: boolean = false) {
        this.room = room;
        this.logging = logging;
        this.memory = Memory.rooms[room.name].distribution || {
            tasks: [],
            nextTaskId: 0,
            supplyContainerIds: [],
            consumeContainerIds: [],
        }
    }


    public run() {
        this.log("Distributor: " + this.room.name);
        this.log("Supply Containers: " + this.memory.supplyContainerIds.length);
        this.log("Consume Containers: " + this.memory.consumeContainerIds.length);
        this.log("Tasks: " + this.memory.tasks.length);

        // update energy levels
        let supplyContainerEnergy = this.getSupplyContainerAvailableEnergy();
        let consumeContainerEnergy = this.getConsumeContainerNeededEnergy();
        let spawnNeedEnergy = this.getSpawnNeedEnergy();
        let extensionNeedEnergy = this.getExtensionNeedEnergy();

        // update existing tasks
        for (let task of this.memory.tasks) {
            // clear dead creeps tasks
            if (task.takenByCreepId != null) {
                let creep = Game.getObjectById(task.takenByCreepId) as Creep;
                if (!creep) {
                    task.takenByCreepId = null;
                }
            }

            // update untaken task amount

        }

    }

    registerContainer(container: StructureContainer, type: ContainerType) {
        if (type == ContainerType.Supply) {
            this.memory.supplyContainerIds.push(container.id);
        } else if (type == ContainerType.Consume) {
            this.memory.consumeContainerIds.push(container.id);
        }
        this.log("Registered Container: " + container.id + " as " + ContainerType[type]);
    }

    getTask(): DistributionTask | null {
        return this.memory.tasks.pop() || null;
    }

    ////// Helper Functions - Calculate Energy Levels //////
    private getSupplyContainerAvailableEnergy(): { [id: string]: number } {
        let supplyContainers = this.memory.supplyContainerIds.map(id => Game.getObjectById(id) as StructureContainer);

        // find available supply
        let supplyContainerEnergy: { [id: string]: number } = {};
        for (let supplyContainer of supplyContainers) {
            let diff = supplyContainer.store.energy - TARGET_HARVEST_CONTAINER_ENERGY;
            if (diff > TASK_THRESHOLD) {
                supplyContainerEnergy[supplyContainer.id] = diff;
            }
        }

        return supplyContainerEnergy;
    }

    private getConsumeContainerNeededEnergy(): { [id: string]: number } {
        let consumeContainers = this.memory.consumeContainerIds.map(id => Game.getObjectById(id) as StructureContainer);

        // find needed energy
        let consumeContainerEnergy: { [id: string]: number } = {};
        for (let consumeContainer of consumeContainers) {
            let diff = TARGET_CONSUME_CONTAINER_ENERGY - consumeContainer.store.energy;
            if (diff > TASK_THRESHOLD) {
                consumeContainerEnergy[consumeContainer.id] = diff;
            }
        }

        return consumeContainerEnergy;
    }

    private getSpawnNeedEnergy(): number {
        let spawn = this.room.find(FIND_MY_SPAWNS)[0];
        return spawn.energyCapacity - spawn.energy;
    }

    private getExtensionNeedEnergy(): { [id: string]: number } {
        let extensions = this.room.find(FIND_MY_STRUCTURES, {
            filter: (s) => s.structureType == STRUCTURE_EXTENSION
        }) as StructureExtension[];

        let extensionEnergy: { [id: string]: number } = {};
        for (let extension of extensions) {
            let diff = extension.energyCapacity - extension.energy;
            if (diff > TASK_THRESHOLD) {
                extensionEnergy[extension.id] = diff;
            }
        }

        return extensionEnergy;
    }




    private createTask(sourceId: string, targetId: string, amount: number): DistributionTask {
        return {
            sourceId: sourceId,
            targetId: targetId,
            amount: amount,
            taskId: (this.memory.nextTaskId++).toString(),
            takenByCreepId: null
        }
    }




    private log(message: string) {
        if (this.logging) {
            console.log("DIST: " + message);
        }
    }

}

export { Distributor, DistributionTask, DistributionMemory };
