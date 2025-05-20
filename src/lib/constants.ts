
export const INITIAL_HONEY = 0;
export const INITIAL_POLLEN = 10;
export const INITIAL_PROPOLIS = 5;
export const INITIAL_BEE_COINS = 100;
export const INITIAL_HIVE_LEVEL = 1;
export const INITIAL_WORKER_BEES = 5;

export const INITIAL_HONEY_PRICE = 10; // BeeCoins per unit of honey
export const INITIAL_POLLEN_PRICE = 5; // BeeCoins per unit of pollen
export const INITIAL_PROPOLIS_PRICE = 15; // BeeCoins per unit of propolis

// Realistic Production Rates (per second, assuming 'units' are balanced for gameplay)
// Honey: (workerBees * baseBeeProd + hiveLevel * baseHiveProd)
export const BASE_HONEY_PRODUCTION_PER_BEE_PER_SECOND = 0.0025; // Increased from 0.002
export const HONEY_PRODUCTION_HIVE_LEVEL_MULTIPLIER_PER_SECOND = 0.0015; // Increased from 0.001

// Pollen: (workerBees * baseBeeProd + hiveLevel * baseHiveProd)
export const BASE_POLLEN_PRODUCTION_PER_BEE_PER_SECOND = 0.001;
export const POLLEN_PRODUCTION_HIVE_LEVEL_MULTIPLIER_PER_SECOND = 0.0005;

// Propolis: (hiveLevel * baseHiveProd)
export const BASE_PROPOLIS_PRODUCTION_PER_HIVE_LEVEL_PER_SECOND = 0.0002;


export const POLLEN_CHANCE_ON_COLLECT = 0.1; // 10% chance to get 1 pollen
export const PROPOLIS_CHANCE_ON_COLLECT = 0.05; // 5% chance to get 1 propolis

export const HIVE_UPGRADE_COST_MULTIPLIER = 1.20; // Cost increases by 20% per level (Changed from 1.3)
export const BASE_HIVE_UPGRADE_COST = 50; // BeeCoins for level 2

export const WORKER_BEE_COST = 20; // BeeCoins per worker bee

// Max Worker Bees
export const BASE_MAX_WORKER_BEES = 100; // Initial capacity for level 1 hive
export const MAX_WORKER_BEES_INCREASE_PER_HIVE_LEVEL = 100; // Each hive level increases max bees by this amount

// Queen Bee Mechanics
export const QUEEN_BEE_INITIAL_PRESENCE = true; // Does the game start with a queen?
export const QUEEN_BEE_BIRTH_INTERVAL_SECONDS = 300; // Queen produces a bee every 5 minutes
export const QUEEN_BEE_BIRTH_AMOUNT = 1; // Number of bees born each interval

export const MAX_OFFLINE_PRODUCTION_HOURS = 12;

export const FLOWER_TYPES = ['Lavender', 'Sunflower', 'Clover', 'Rosemary', 'Poppy'];

export const MARKET_PRICE_FLUCTUATION_INTERVAL = 30000; // 30 seconds for all resources

export const MARKET_HONEY_PRICE_MIN = 5;
export const MARKET_HONEY_PRICE_MAX = 25;

export const MARKET_POLLEN_PRICE_MIN = 2;
export const MARKET_POLLEN_PRICE_MAX = 10;

export const MARKET_PROPOLIS_PRICE_MIN = 10;
export const MARKET_PROPOLIS_PRICE_MAX = 30;

