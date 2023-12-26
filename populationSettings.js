/**
 *
 * @type {{harvester: {pref: string, limit: number, body: [*]}, harvesterLD: {pref: string, limit: number, body: [*]}, upgrader: {pref: string, limit: number, body: [*]}, builder: {pref: string, limit: number, body: [*]}, repair: {pref: string, limit: number, body: [*]}, TowerSupply: {pref: string, limit: number, body: [*]}}}
 */
StructureSpawn.prototype.population = {
    //майнер энергии
    'harvester': {
        pref: 'H',
        limit: 3,
        body: [WORK, MOVE, CARRY, WORK]
    },
    // перетаскиватель ресурсов
    'lorry': {
        pref: 'L',
        limit: 1,
        body: [MOVE, CARRY, CARRY, CARRY, MOVE]
    },
    //апгрейд контроллера
    'upgrader': {
        pref: 'Up',
        limit: 2,
        body: [MOVE, MOVE, CARRY, WORK]
    },
    // строитель
    'builder': {
        pref: 'B',
        limit: 3,
        body: [MOVE, CARRY, WORK, WORK]
    },
    //майнер энергии в других комнатах
    'harvesterLD': {
        pref: 'HLD',
        limit: 0,
        body: [WORK, MOVE, CARRY, MOVE]
    },
    // ремонтник, способен замещать строителя, если нет объектов для ремонта
    'repair': {
        pref: 'R',
        limit: 1,
        body: [MOVE, CARRY, WORK, WORK]
    },
    // ремонтник, способен замещать строителя, если нет объектов для ремонта
    'repairWall': {
        pref: 'WR',
        limit: 0,
        body: [MOVE, CARRY, WORK, WORK]
    },
    //обслуживание башен, когда башня полная, исполняет роль harvester'a
    'TowerSupply': {
        pref: 'TS',
        limit: 1,
        body: [MOVE, CARRY, WORK, WORK]
    },
    'RoomClaimer': {
        pref: 'RC',
        limit: 0,
        body: [MOVE, CARRY, CLAIM, WORK]
    },
};

StructureSpawn.prototype.populationPriority = ['harvester', 'builder', 'harvesterLD', 'lorry', 'upgrader', 'repair', 'repairWall', 'TowerSupply', 'RoomClaimer'];