import { observable } from 'mobx';

type Model = 'smp' | 'occ';
type TaxonGroup = string | number | null | undefined;
type Locks = Partial<Record<Model, Record<string, unknown>>>;

const requireTaxonGroup = (taxonGroup: TaxonGroup) => {
  if (taxonGroup === null || taxonGroup === undefined)
    throw new Error('taxon group is required');

  return taxonGroup;
};

export default () => {
  const data = observable<Record<string | number, Locks>>({});

  const getAll = (taxonGroup: TaxonGroup): Locks => {
    const group = requireTaxonGroup(taxonGroup);
    const taxonLocks = data[group];
    const all = group === 'all' ? undefined : data.all;

    return {
      smp: { ...all?.smp, ...taxonLocks?.smp },
      occ: { ...all?.occ, ...taxonLocks?.occ },
    };
  };

  const set = (
    taxonGroup: TaxonGroup,
    model: Model,
    attr: string,
    value: unknown
  ) => {
    const group = requireTaxonGroup(taxonGroup);
    data[group] ||= {};
    data[group][model] ||= {};
    data[group][model][attr] = JSON.parse(JSON.stringify(value)) as unknown;
  };

  const unset = (taxonGroup: TaxonGroup, model: Model, attr: string) => {
    const group = requireTaxonGroup(taxonGroup);
    delete data[group]?.[model]?.[attr];
  };

  const get = (taxonGroup: TaxonGroup, model: Model, attr: string) =>
    getAll(taxonGroup)[model]?.[attr];

  function isLocked(
    taxonGroup: TaxonGroup,
    model: Model,
    attr: string,
    value?: unknown
  ) {
    const lockedValue = get(taxonGroup, model, attr);
    if (arguments.length < 4) return lockedValue !== undefined;

    return (
      lockedValue !== undefined &&
      JSON.stringify(lockedValue) === JSON.stringify(value)
    );
  }

  return { getAll, set, unset, get, isLocked };
};
