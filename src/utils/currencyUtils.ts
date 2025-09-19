import ExchangeRate from "../models/exchangeRate";

export const getRate = async (base: string, target: string): Promise<number> => {
  if (base.toUpperCase() === target.toUpperCase()) return 1;

  const doc = await ExchangeRate.findOne({
    base: base.toUpperCase(),
    target: target.toUpperCase(),
  }).lean();

  if (!doc) throw new Error(`Exchange rate not found: ${base} -> ${target}`);
  return doc.rate;
};

export const convert = async (
  amount: number,
  base: string,
  target: string
): Promise<number> => {
  const rate = await getRate(base, target);
  return amount * rate;
};
