/**
 * Dual-Depot Inventory & Supply Chain State Machine
 * Depot 1: CWC Central Logistics Depot, Ludhiana (Primary)
 * Depot 2: Markfed Regional Depot, Nakodar (Redundant Strategic Reserve)
 */

export class RegionalInventoryManager {
  constructor() {
    this.depots = {
      cwc_ludhiana: {
        name: 'CWC Central Depot, Ludhiana',
        type: 'PRIMARY',
        status: 'ACTIVE',
        stock: {
          oxygenCylinders: 170,
          maxOxygen: 200,
          bloodPlasmaLiters: 144,
          maxPlasma: 200,
          potableWaterLiters: 4500,
          maxWater: 5000
        }
      },
      markfed_nakodar: {
        name: 'Markfed Regional Depot, Nakodar',
        type: 'REDUNDANT',
        status: 'STANDBY',
        stock: {
          oxygenCylinders: 65,
          maxOxygen: 100,
          bloodPlasmaLiters: 50,
          maxPlasma: 100,
          potableWaterLiters: 2250,
          maxWater: 3000
        }
      }
    };
  }

  getDepotState() {
    return JSON.parse(JSON.stringify(this.depots));
  }

  dispatchEmergencyPayload(depotId, requirements = { o2: 15, plasma: 10, water: 400 }) {
    const depot = this.depots[depotId];
    if (!depot) throw new Error(`Unknown depot ${depotId}`);

    const fulfilled = {
      o2: Math.min(depot.stock.oxygenCylinders, requirements.o2 || 0),
      plasma: Math.min(depot.stock.bloodPlasmaLiters, requirements.plasma || 0),
      water: Math.min(depot.stock.potableWaterLiters, requirements.water || 0)
    };

    depot.stock.oxygenCylinders -= fulfilled.o2;
    depot.stock.bloodPlasmaLiters -= fulfilled.plasma;
    depot.stock.potableWaterLiters -= fulfilled.water;

    return {
      depot: depot.name,
      dispatched: fulfilled,
      remaining: { ...depot.stock }
    };
  }

  triggerCorridorFailover() {
    this.depots.cwc_ludhiana.status = 'INUNDATED_EVACUATION';
    this.depots.markfed_nakodar.status = 'ACTIVE_PRIMARY';
    return {
      message: 'Automatic supply chain failover executed. Depot 2 mobilized as Primary Hub.',
      activeDepot: this.depots.markfed_nakodar
    };
  }
}
