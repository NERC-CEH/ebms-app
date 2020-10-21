import { date as dateHelp } from '@apps';
import userModel from 'userModel';
import * as Yup from 'yup';

const dateTimeFormat = new Intl.DateTimeFormat('en-GB', {
  hour: 'numeric',
  minute: 'numeric',
});

const transectLocationSchema = Yup.object().shape({
  id: Yup.string().required(),
  centroid_sref: Yup.string().required(),
  sref_system: Yup.string().required(),
});

const transectSchema = Yup.object().shape({
  location: Yup.mixed().test('area', 'Please select your transect.', val => {
    if (!val) {
      return false;
    }
    transectLocationSchema.validateSync(val);
    return true;
  }),
  recorder: Yup.string().required('Recorder info is missing'),
  surveyStartTime: Yup.date().required('Start time is missing'),
  // surveyEndTime: Yup.date().required('End time is missing'), // automatically set on send
  temperature: Yup.string().required('Temperature info is missing'),
  windSpeed: Yup.string().required('Wind speed info is missing'),
});

const config = {
  id: 562,
  name: 'transect',
  label: 'eBMS Transect',
  webForm: 'ebms-input-data',
  attrs: {
    date: {
      values(date) {
        return dateHelp.print(date);
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
      type: 'slider',
      info: 'Please specify the % of cloud cover.',
      max: 100,
      min: 0,
      id: 1457,
    },

    temperature: {
      label: 'Temperature',
      type: 'radio',
      info: 'Please specify the temperature C°.',
      id: 1388,
      values: [
        { value: 'Not recorded/no data', id: 16556, isDefault: true },
        { value: '10', id: 16530 },
        { value: '11', id: 16531 },
        { value: '12', id: 16532 },
        { value: '13', id: 16533 },
        { value: '14', id: 16534 },
        { value: '15', id: 16535 },
        { value: '16', id: 16536 },
        { value: '17', id: 16537 },
        { value: '18', id: 16538 },
        { value: '19', id: 16539 },
        { value: '20', id: 16540 },
        { value: '21', id: 16541 },
        { value: '22', id: 16542 },
        { value: '23', id: 16543 },
        { value: '24', id: 16544 },
        { value: '25', id: 16545 },
        { value: '26', id: 16546 },
        { value: '27', id: 16547 },
        { value: '28', id: 16548 },
        { value: '29', id: 16549 },
        { value: '30', id: 16550 },
        { value: '31', id: 16551 },
        { value: '32', id: 16552 },
        { value: '33', id: 16553 },
        { value: '34', id: 16554 },
        { value: '35', id: 16555 },
      ],
    },
    windDirection: {
      label: 'Wind Direction',
      type: 'radio',
      info: 'Please specify the wind direction.',
      id: 1389,
      values: [
        { value: 'Not recorded/no data', id: 2460 },
        { value: 'S', id: 2461 },
        { value: 'SW', id: 2462 },
        { value: 'W', id: 2463 },
        { value: 'NW', id: 2464 },
        { value: 'N', id: 2465 },
        { value: 'NE', id: 2466 },
        { value: 'E', id: 2467 },
        { value: 'SE', id: 2468 },
        { value: 'No direction', id: 2469 },
      ],
    },
    windSpeed: {
      label: 'Wind Speed',
      type: 'radio',
      info: 'Please specify the wind speed.',
      id: 1390,
      values: [
        { value: 'Not recorded/no data', id: 2459 },
        { value: 'Smoke rises vertically', id: 2606 },
        { value: 'Slight smoke drift', id: 2453 },
        { value: 'Wind felt on face, leaves rustle', id: 2454 },
        { value: 'Leaves and twigs in slight motion', id: 2455 },
        { value: 'Dust raised and small branches move', id: 2456 },
        { value: 'Small trees in leaf begin to sway', id: 2457 },
        { value: 'Large branches move and trees sway', id: 2458 },
      ],
    },

    comment: {
      label: 'Comment',
      type: 'textarea',
    },
  },

  smp: {
    attrs: {
      date: {
        values(date) {
          return dateHelp.print(date);
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

      cloud: {
        label: 'Cloud',
        type: 'slider',
        info: 'Please specify the % of cloud cover.',
        max: 100,
        min: 0,
        id: 1457,
      },

      reliability: {
        label: 'Reliability',
        type: 'radio',
        info: 'Please specify the reliability of the section count.',
        id: 1393,
        values: [
          { value: 'Suitable conditions', id: 16590 },
          { value: 'Unsuitable conditions', id: 16591 },
          { value: 'Unable to survey', id: 16592 },
        ],
      },
    },

    occ: {
      attrs: {
        training: {
          id: 'training',
        },

        count: {
          id: 780,
        },

        taxon: {
          id: 'taxa_taxon_list_id',
          values(taxon) {
            return taxon.warehouse_id;
          },
        },
      },

      create(Occurrence, attrs) {
        return new Occurrence({
          attrs: {
            count: 1,
            taxon: {
              scientific_name: null,
              warehouse_id: null,
            },
            ...attrs,
          },
        });
      },
    },

    create(Sample, location) {
      const sample = new Sample({
        metadata: {
          survey: 'transect',
        },
        attrs: {
          survey_id: config.id,
          sample_method_id: 776,
          location,
        },
      });

      return sample;
    },
  },

  verify(attrs) {
    try {
      transectSchema.validateSync(attrs, { abortEarly: false });
    } catch (attrError) {
      return attrError;
    }

    return null;
  },

  create(Sample) {
    const recorder = `${userModel.attrs.firstname} ${userModel.attrs.secondname}`;

    const sample = new Sample({
      metadata: {
        survey: 'transect',
      },
      attrs: {
        survey_id: config.id,
        date: new Date(),
        sample_method_id: 22,
        surveyStartTime: new Date(),
        recorder,
      },
    });

    return sample;
  },
};

export default config;
