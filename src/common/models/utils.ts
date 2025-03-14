import { AttrConfig } from 'Survey/common/config';
import Occurrence, { Attrs as OccurrenceAttrs } from './occurrence';
import Sample, { Data as SampleAttrs } from './sample';

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

export function getLocalAttributes(doc: any, schema: any) {
  type Entry = [string, CustomAttr | CustomAttr[]];

  const getLocal = ([key, values]: Entry) => {
    const isCustom = key.match(/:\d+/);
    const remoteId = isCustom ? (key.split(':').pop() as string) : `${key}`;

    const attrConfigWithName = Object.entries<AttrConfig>(schema).find(
      byAttrID(remoteId)
    );

    if (!attrConfigWithName) return null;

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

  const exists = (obj: any) => !!obj;
  const localEntries: any = Object.entries<CustomAttr>(doc)
    .flatMap(getLocal)
    .filter(exists);

  return Object.fromEntries(localEntries);
}

export const assignIfMissing = (
  model: Sample | Occurrence,
  key: keyof SampleAttrs | keyof OccurrenceAttrs,
  value: any
) => {
  if (Number.isFinite((model as any).data[key]) || (model as any).data[key])
    return;
  if (!Number.isFinite(value) && !value) return;

  // eslint-disable-next-line no-param-reassign
  (model as any).data[key] = value;
};
