/* eslint-disable */
// it is important to keep .js extension for webpack to avoid over-aliasing
import transectConfig from './transect.js';

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

export default mergeDeep(transectConfig, {
  id: 560,
  attrs: {
    smp: {
      recorder: {
        id: 1416,
      },

      surveyStartTime: {
        id: 1417,
      },
      surveyEndTime: {
        id: 1418,
      },

      cloud: {
        id: 1419,
      },

      temperature: {
        id: 1420,
        values: {
          '10': 15237,
          '11': 15238,
          '12': 15239,
          '13': 15240,
          '14': 15241,
          '15': 15242,
          '16': 15243,
          '17': 15244,
          '18': 15245,
          '19': 15246,
          '20': 15247,
          '21': 15248,
          '22': 15249,
          '23': 15250,
          '24': 15251,
          '25': 15252,
          '26': 15253,
          '27': 15254,
          '28': 15255,
          '29': 15256,
          '30': 15257,
          '31': 15258,
          '32': 15259,
          '33': 15260,
          '34': 15261,
          '35': 15262,
          'Not recorded/no data': 15263,
        },
      },
      windDirection: {
        id: 1421,
        values: {
          'Not recorded/no data': 2460,
          S: 2461,
          SW: 2462,
          W: 2463,
          NW: 2464,
          N: 2465,
          NE: 2466,
          E: 2467,
          SE: 2468,
          'No direction': 2469,
        },
      },
      windSpeed: {
        id: 1422,
        values: {
          'Not recorded/no data': 2459,
          'Smoke rises vertically': 2606,
          'Slight smoke drift': 2453,
          'Wind felt on face, leaves rustle': 2454,
          'Leaves and twigs in slight motion': 2455,
          'Dust raised and small branches move': 2456,
          'Small trees in leaf begin to sway': 2457,
          'Large branches move and trees sway': 2458,
        },
      },

      reliability: {
        id: 1425,
        values: {
          'Suitable conditions': 15298,
          'Unsuitable conditions': 15299,
          'Unable to survey': 15300,
        },
      },
    },
    occ: {
      count: {
        id: 784,
      },
    },
  },
});
