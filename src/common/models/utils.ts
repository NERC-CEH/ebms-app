import { AttrConfig } from 'Survey/common/config';
import Occurrence, { Attrs as OccurrenceAttrs } from './occurrence';
import Sample, { Attrs as SampleAttrs } from './sample';

export type CustomAttr = {
  attribute_id: string; // eslint-disable-line camelcase
  value_id: string; // eslint-disable-line camelcase
  caption: string; // eslint-disable-line camelcase
  data_type: string; // eslint-disable-line camelcase
  multi_value: string; // eslint-disable-line camelcase
  value: string; // eslint-disable-line camelcase
  raw_value: string; // eslint-disable-line camelcase
  upper_value: any; // eslint-disable-line camelcase
};

const byAttrID =
  (attrId: string) =>
  // eslint-disable-next-line @getify/proper-arrows/name
  ([, attr]: [string, AttrConfig]) =>
    `${attr.remote?.id}` === attrId;

export function getLocalAttributes(
  doc: any,
  schema: any,
  onlyAttrs?: string[]
) {
  type Entry = [string, CustomAttr | CustomAttr[]];

  const getLocal = ([key, values]: Entry) => {
    const isCustom = key.match(/:\d+/);
    const remoteId = isCustom ? (key.split(':').pop() as string) : `${key}`;

    if (onlyAttrs) {
      const getId = (attrKey: string): string => `${schema[attrKey].remote.id}`;
      const skipAttribute = !onlyAttrs.map(getId).includes(remoteId);
      if (skipAttribute) return []; // flatMap will filter out
    }

    const attrConfigWithName = Object.entries<AttrConfig>(schema).find(
      byAttrID(remoteId)
    );

    if (!attrConfigWithName)
      throw new Error(`Attr config for ${remoteId} is missing`);

    const [localKey, localConfig] = attrConfigWithName;

    let localValues: any;
    const getConfigValueById = (remoteValue: CustomAttr) => {
      const byId = ({ id }: any) => remoteValue.raw_value === id;

      if (!Array.isArray(localConfig.remote?.values))
        return remoteValue.raw_value;

      const localValue = localConfig.remote?.values?.find(byId)?.value;
      if (!localValue) return remoteValue.raw_value;

      return localValue;
    };

    if (Array.isArray(values)) {
      localValues = values.map(getConfigValueById);
    } else {
      localValues = getConfigValueById(values);
    }

    return [[localKey, localValues]];
  };

  const localEntries = Object.entries<CustomAttr>(doc).flatMap(getLocal);

  return Object.fromEntries(localEntries);
}

export const assignIfMissing = (
  model: Sample | Occurrence,
  key: keyof SampleAttrs | keyof OccurrenceAttrs,
  value: any
) => {
  if (Number.isFinite((model as any).attrs[key]) || (model as any).attrs[key])
    return;
  if (!Number.isFinite(value) && !value) return;

  // eslint-disable-next-line no-param-reassign
  (model as any).attrs[key] = value;
};
