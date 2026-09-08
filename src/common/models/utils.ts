/* eslint-disable import-x/prefer-default-export */
import { Data as OccurrenceAttrs } from './occurrence';
import { Data as SampleAttrs } from './sample';

export const assignIfMissing = <
  Attrs extends SampleAttrs | OccurrenceAttrs,
  Key extends keyof Attrs,
>(
  model: { data: Attrs },
  key: Key,
  value: Attrs[Key]
) => {
  const currentValue = model.data[key];
  if (
    (typeof currentValue === 'number' && Number.isFinite(currentValue)) ||
    currentValue
  )
    return;
  if (!(typeof value === 'number' && Number.isFinite(value)) && !value) return;
  model.data[key] = value;
};
