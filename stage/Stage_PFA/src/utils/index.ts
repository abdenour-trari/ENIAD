export * from './storage';

export const formatPrice = (price: number, symbol: string = 'DH'): string => {
  return `${price.toFixed(2)} ${symbol}`;
};
