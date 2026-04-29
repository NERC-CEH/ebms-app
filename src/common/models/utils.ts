/* eslint-disable import-x/prefer-default-export */
import Occurrence, { Data as OccurrenceAttrs } from './occurrence';
import Sample, { Data as SampleAttrs } from './sample';

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
