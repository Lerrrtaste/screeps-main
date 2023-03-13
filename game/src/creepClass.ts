// One creep class
//
// Will be used to spawn and manage creeps
// it is mainly a data strucutre to save configurations
// Contains name body parts and role and helper functions and other data
//
// becaus in screeps the data can only be saved in the memory
// this will function as storage object for the creep
// that needs to be loaded and saved in the memory
// and then used to spawn the creep

const ADJECTIVES = [
  "Adventurous",
  "Amused",
  "Bashful",
  "Bold",
  "Brave",
  "Calm",
  "Charming",
  "Cheerful",
  "Clever",
  "Confident",
  "Cool",
  "Crazy",
  "Curious",
  "Daring",
  "Delightful",
  "Determined",
  "Eager",
  "Energetic",
  "Excited",
  "Friendly",
  "Funny",
  "Gentle",
  "Giggly",
  "Grateful",
  "Happy",
  "Heartfelt",
  "Hilarious",
  "Inquisitive",
  "Jolly",
  "Joyful",
  "Kooky",
  "Lively",
  "Lucky",
  "Mischievous",
  "Optimistic",
  "Passionate",
  "Playful",
  "Positive",
  "Quirky",
  "Radiant",
  "Refreshing",
  "Relaxed",
  "Sassy",
  "Smiling",
  "Soothing",
  "Spontaneous",
  "Spirited",
  "Thrilled",
  "Upbeat",
  "Witty",
  "Zesty"
];

class CreepClass {
    name: string;
    version: number;
    body: BodyPartConstant[];
    role: string;

    constructor(name: string, version: number, body: BodyPartConstant[], role: string) {
        this.name = name;
        this.version = version;
        this.body = body;
        this.role = role;
    }

    loadFromMemory(className: string) {
        // Load a creep class from ingame memory

        if (Memory.creepClasses[className] === undefined) {
            console.log("Creep class " + className + " not found");
            return false;
        }

        this.name = Memory.creepClasses[className].name;
        this.version = Memory.creepClasses[className].version;
        this.body = Memory.creepClasses[className].body;
        this.role = Memory.creepClasses[className].role;
        return true;
    }

    saveToMemory() {
        // Save a creep class to ingame memory

        if (Memory.creepClasses === undefined) {
            Memory.creepClasses = {};
        }

        Memory.creepClasses[this.name] = this;
    }

    spawn(spawn: StructureSpawn) {
        // Spawn a creep from a creep class

        if (spawn.spawning !== null || spawn.room.energyAvailable < this.getBodyCost()) {
            return ;
        }

        let adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
        let result = spawn.spawnCreep(this.body, adjective + " " + this.name + " (v" + this.version + ")",
            {
                memory: {
                    role: this.role,
                    version: this.version,
                    creepClass: this.name,
                }
            });
        if (result === OK) {
            console.log("Spawning " + this.name + "_" + this.version);
        } else {
            console.log("Failed to spawn " + adjective+ '_'+ this.name + "_" + this.version + " with error " + result);
        }
    }

    getBodyCost() {
        // Calculate the cost of a creep class

        let cost = 0;
        for (let part of this.body) {
            cost += BODYPART_COST[part];
        }
        return cost;
    }
};

export default CreepClass;
