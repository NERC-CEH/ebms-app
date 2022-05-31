import userModel from 'models/user';
import * as Yup from 'yup';
import {
  deviceAttr,
  deviceVersionAttr,
  appVersionAttr,
  windSpeedAttr,
  temperatureAttr,
  windDirectionAttr,
  cloudAttr,
  taxonAttr,
  surveyStartTimeAttr,
  surveyEndTimeAttr,
  commentAttr,
  dateAttr,
  stageAttr,
} from 'Survey/common/config';
import { chatboxOutline } from 'ionicons/icons';

const reliabilityValues = [
  { value: 'Suitable conditions', id: 16590 },
  { value: 'Unsuitable conditions', id: 16591 },
  { value: 'Unable to survey', id: 16592 },
];

const locationAttr = {
  remote: {
    id: 'location_id',
    values(location, submission) {
      // eslint-disable-next-line
      submission.values = {
        ...submission.values,
        ...{
          entered_sref_system: location.sref_system,
          entered_sref: location.centroid_sref,
        },
      };

      return location.id;
    },
  },
};

const transectLocationSchema = Yup.object().shape({
  id: Yup.string().required(),
  centroid_sref: Yup.string().required(),
  sref_system: Yup.string().required(),
});

const validation = val => {
  if (!val) {
    return false;
  }
  transectLocationSchema.validateSync(val);
  return true;
};
const transectSchema = Yup.object().shape({
  location: Yup.mixed().test(
    'area',
    'Please select your transect.',
    validation
  ),
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
    date: dateAttr,
    location: locationAttr,
    device: deviceAttr,
    device_version: deviceVersionAttr,
    app_version: appVersionAttr,
    surveyStartTime: surveyStartTimeAttr,
    surveyEndTime: surveyEndTimeAttr,
    cloud: cloudAttr,
    temperature: temperatureAttr,
    windDirection: windDirectionAttr,
    windSpeed: windSpeedAttr,
    comment: commentAttr,

    recorder: {
      pageProps: {
        attrProps: {
          input: 'text',
          info: 'Please specify the person responsible for identifying the species.',
        },
      },
      remote: { id: 1384 },
    },
  },

  smp: {
    attrs: {
      date: dateAttr,
      location: locationAttr,
      cloud: cloudAttr,
      comment: {
        menuProps: { icon: chatboxOutline, skipValueTranslation: true },
        pageProps: {
          attrProps: {
            input: 'textarea',
            info: 'Please add any extra info about this section.',
          },
        },
      },

      reliability: {
        pageProps: {
          attrProps: {
            input: 'radio',
            info: 'Please specify the reliability of the section count.',
            inputProps: { options: reliabilityValues },
          },
        },
        remote: { id: 1393, values: reliabilityValues },
      },
    },

    occ: {
      attrs: {
        count: {
          remote: {
            id: 780,
          },
        },
        comment: commentAttr,
        stage: stageAttr,
        taxon: taxonAttr,
      },

      create(Occurrence, attrs) {
        return new Occurrence({
          attrs: {
            count: 1,
            stage: 'Adult',
            comment: null,
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
          survey_id: config.id,
          survey: 'transect',
        },
        attrs: {
          sample_method_id: 776,
          location,
          comment: null,
        },
      });

      return sample;
    },

    modifySubmission(submission) {
      if (!submission.survey_id) {
        // backwards compatible
        submission.survey_id = config.id; //eslint-disable-line
      }

      return submission;
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
    const recorder = `${userModel.attrs.firstName} ${userModel.attrs.lastName}`;
    const now = new Date().toISOString();

    const sample = new Sample({
      metadata: {
        survey_id: config.id,
        survey: config.name,
      },
      attrs: {
        date: now,
        location: null,
        sample_method_id: 22,
        surveyStartTime: now,
        recorder,
      },
    });

    return sample;
  },

  modifySubmission(submission) {
    if (!submission.survey_id) {
      // backwards compatible
      submission.survey_id = config.id; //eslint-disable-line
    }

    return submission;
  },
};

export default config;
