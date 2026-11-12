export const STORE_CONFIG = 'STORE_CONFIG';
export interface StoreConfig { storeName: string; defaultCurrency: string; taxPercent: number }
export const AppConfigProvider = {
  provide: STORE_CONFIG,
  useValue: { storeName: 'AutoParts Store', defaultCurrency: 'UAH', taxPercent: 20 } as StoreConfig,
};
