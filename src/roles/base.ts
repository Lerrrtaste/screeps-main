// base role for all other creep roles
// should handle all generic common tasks
// like spawning, harvesting, upgrading, etc
//
// it provides a common interface for all other roles
// including state machine and common tasks
// the actual role logic is implemented in the derived classes
// like builder, harvester, etc

interface BaseRoleMemory {
}

interface BaseCreepMemory extends CreepMemory {
    state: string;
    role: string;
}

class BaseRole {
    // array of possible states (only basic, role specific states are implemented in the children)
    name: string = 'base';
    memory: BaseRoleMemory = {};

    constructor(name: string) {
        this.name = name;
    }

    // get all creeps with this role
    getCreeps(): Creep[] {
        return _.filter(Game.creeps, (creep) => creep.memory.role == this.name);
    }

    // get all creeps with this role and state
    getCreepsByState(state: string): Creep[] {
        return _.filter(this.getCreeps(), (creep) => {
            let creepMemory = <BaseCreepMemory>creep.memory;
            return creepMemory.state == state;
        });
    }

    // go to position
    goTo(creep: Creep, pos: RoomPosition) {
        const to = new RoomPosition(pos.x, pos.y, pos.roomName);
        creep.moveTo(to);
        creep.room.visual.line(creep.pos, pos, { color: 'red' });
    }

    runRole(room: Room) {
        const creeps = this.getCreeps();

        this.preRun(room);

        for (let creep of creeps) {
            let creepMemory = <BaseCreepMemory>creep.memory;
            if (!creepMemory.state) {
                this.initCreep(creep, creepMemory);
            } else {
                this.runCreep(creep, creepMemory);
            }
        }

        this.postRun(creeps);
    }

    // to be overridden by children
    public initCreep(creep: Creep, creepMemory: BaseCreepMemory) {
        creep.say('Im bored :(');
        // console.log('Init creep not implemented for role ' + this.name);
    };

    public runCreep(creep: Creep, creepMemory: BaseCreepMemory) {
        console.log('Run creep not implemented for role ' + this.name);
    };

    public preRun(room: Room) {
        console.log('Pre run not implemented for role ' + this.name);
    };

    public postRun(creeps: Creep[]) {
        console.log('Post run not implemented for role ' + this.name);
    };

    // update or initialize role memory
    updateRoleMemory() {
        if (!Memory.roles) {
            Memory.roles = {};
            console.log('Created memory for roles');
        }
        if (!Memory.roles[this.name]) {
            Memory.roles[this.name] = this.memory;
            console.log('Created memory for role ' + this.name);
        }

        this.memory = Memory.roles[this.name];
        // update memory of all creeps with this role
        this.memory.creepIds = this.getCreeps().map((creep) => creep.id);
        // console.log('Updated memory for role ' + this.name);

        // console.log('Loaded memory: ' + JSON.stringify(this.memory));
    }

    // save role memory to global memory
    saveRoleMemory() {
        // console.log('Saving memory for role ' + this.name);
        Memory.roles[this.name] = this.memory;
        // console.log('Saved memory: ' + JSON.stringify(this.memory));
    }
}


export { BaseRole, BaseCreepMemory, BaseRoleMemory };
