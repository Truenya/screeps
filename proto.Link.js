StructureLink.prototype.sendEnergy = function (toLink) {
    // console.log("Линки исследуем" + JSON.stringify(toLink, null, 2));
    if (this.store[RESOURCE_ENERGY] > (this.store.getCapacity(RESOURCE_ENERGY) / 2)
        && toLink.store[RESOURCE_ENERGY] < this.store[RESOURCE_ENERGY]) {
        let result = this.transferEnergy(toLink);
        if (result === OK) {
            console.log('[notice]-> energy was linked');
        }
    }
};