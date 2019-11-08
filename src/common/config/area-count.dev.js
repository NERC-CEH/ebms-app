/* eslint-disable */
// it is important to keep .js extension for webpack to avoid over-aliasing
import areaCountConfig from './area-count.js';

/**
 * Simple object check.
 * @param item
 * @returns {boolean}
 */
export function isObject(item) {
  return item && typeof item === 'object' && !Array.isArray(item);
}

/**
 * Deep merge two objects.
 * @param target
 * @param ...sources
 */
export function mergeDeep(target, ...sources) {
  if (!sources.length) return target;
  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        mergeDeep(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }

  return mergeDeep(target, ...sources);
}

export default mergeDeep(areaCountConfig, {
  id: 561,
  webForm: 'enter-app-record',
  attrs: {
    smp: {

      surveyStartTime: {
        id: 1417,
      },
      surveyEndime: {
        id: 1418,
      },

      area: { id: 1462 },
    },
    occ: {
      count: { id: 791 },
      stage: {
        id: 790,
        label: 'Stage',
        type: 'radio',
        default: 'Not Recorded',

        values: {
          Adults: 3929,
          Larvae: 3931,
          Eggs: 3932,
          Pupae: 3930,
          'Larval webs': 14079,
        },
      },
    },
  },
});
