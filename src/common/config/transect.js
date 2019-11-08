import DateHelp from 'helpers/date';

const dateTimeFormat = new Intl.DateTimeFormat('en-GB', {
  hour: 'numeric',
  minute: 'numeric',
});

export default {
  id: 562,
  webForm: 'ebms-input-data',
  attrs: {
    smp: {
      date: {
        values(date) {
          return DateHelp.print(date);
        },
      },

      location: {
        id: 'location_id',
        values(location, submission) {
          // eslint-disable-next-line
          submission.fields = {
            ...submission.fields,
            ...{
              entered_sref_system: location.sref_system,
              entered_sref: location.centroid_sref,
            },
          };

          return location.id;
        },
      },
      device: {
        id: 922,
        values: {
          iOS: 2398,
          Android: 2399,
        },
      },
      device_version: { id: 759 },
      app_version: { id: 1139 },

      recorder: {
        label: 'Recorder',
        type: 'text',
        info:
          'Please specify the person responsible for identifying the species.',
        id: 1384,
      },

      surveyStartTime: {
        label: 'Start Time',
        type: 'time',
        format: 'HH:mm',
        id: 1385,
        values: date => dateTimeFormat.format(new Date(date)),
      },
      surveyEndTime: {
        label: 'End Time',
        type: 'time',
        format: 'HH:mm',
        id: 1386,
        values: date => dateTimeFormat.format(new Date(date)),
      },

      cloud: {
        label: 'Cloud',
        type: 'number',
        info: 'Please specify the % of cloud cover.',
        max: 100,
        min: 0,
        id: 1387,
      },

      temperature: {
        label: 'Temperature',
        type: 'radio',
        info: 'Please specify the temperature C°.',
        id: 1388,
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
        label: 'Wind Direction',
        type: 'radio',
        info: 'Please specify the wind direction.',
        id: 1389,
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
        label: 'Wind Speed',
        type: 'radio',
        info: 'Please specify the wind speed.',
        id: 1390,
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
        label: 'Reliability',
        type: 'radio',
        info: 'Please specify the reliability of the section count.',
        id: 1393,
        values: {
          1: 16590,
          2: 16591,
          3: 16592,
        },
      },

      comment: {
        label: 'Comment',
        type: 'textarea',
      },
    },
    occ: {
      training: {
        id: 'training',
      },

      count: {
        id: 780,
      },

      taxon: {
        values(taxon) {
          return taxon.warehouse_id;
        },
      },
    },
  },
};
