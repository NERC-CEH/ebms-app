/* eslint-disable */
// it is important to keep .js extension for webpack to avoid over-aliasing
import transectConfig from './transect.js';
console.error('XXX');

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
          'Not recorded/no data': 16556,
          10: 16530,
          11: 16531,
          12: 16532,
          13: 16533,
          14: 16534,
          15: 16535,
          16: 16536,
          17: 16537,
          18: 16538,
          19: 16539,
          20: 16540,
          21: 16541,
          22: 16542,
          23: 16543,
          24: 16544,
          25: 16545,
          26: 16546,
          27: 16547,
          28: 16548,
          29: 16549,
          30: 16550,
          31: 16551,
          32: 16552,
          33: 16553,
          34: 16554,
          35: 16555,
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
          1: 15298,
          2: 15299,
          3: 15300,
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
