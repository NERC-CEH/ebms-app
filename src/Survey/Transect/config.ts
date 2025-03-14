import { chatboxOutline } from 'ionicons/icons';
import * as Yup from 'yup';
import appModel from 'models/app';
import { DRAGONFLY_GROUP } from 'models/occurrence';
import userModel from 'models/user';
import {
  Survey,
  deviceAttr,
  deviceVersionAttr,
  appVersionAttr,
  windSpeedAttr,
  temperatureAttr,
  windDirectionAttr,
  taxonAttr,
  surveyStartTimeAttr,
  surveyEndTimeAttr,
  commentAttr,
  dateAttr,
  stageAttr,
  dragonflyStageAttr,
  speciesGroupsAttr,
  cloudAttr,
} from 'Survey/common/config';

const reliabilityValues = [
  { value: 'Suitable conditions', id: 16590 },
  { value: 'Unsuitable conditions', id: 16591 },
  { value: 'Unable to survey', id: 16592 },
];

const locationAttr = {
  remote: {
    id: 'location_id',
    values(location: any, submission: any) {
      // eslint-disable-next-line
      submission.values = {
        ...submission.values,
        ...{
          entered_sref_system:
            location.centroidSrefSystem ||
            // Backwards compatible
            location.sref_system,
          entered_sref:
            location.centroidSref ||
            // Backwards compatible
            location.centroid_sref,
        },
      };

      return location.id;
    },
  },
};

const transectLocationSchema = Yup.object().shape({
  id: Yup.string().required(),
  // TODO: enable once all the old samples are uploaded
  // centroidSref: Yup.string().required(),
  // srefSystem: Yup.string().required(),
});

const validation = (val: any) => {
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

const config: Survey = {
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

  metadata: {
    speciesGroups: speciesGroupsAttr,
  },

  smp: {
    attrs: {
      date: dateAttr,
      location: locationAttr,
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
        dragonflyStage: dragonflyStageAttr,
        taxon: taxonAttr,
      },

      create({ Occurrence, taxon }) {
        const isDragonfly = taxon.group === DRAGONFLY_GROUP;

        return new Occurrence({
          attrs: {
            count: 1,
            stage: !isDragonfly ? 'Adult' : undefined,
            dragonflyStage: isDragonfly ? 'Adult' : undefined,
            comment: null,
            taxon,
          },
        });
      },

      verify(attrs) {
        try {
          Yup.object()
            .shape({ count: Yup.number().required('Count cannot be empty') })
            .validateSync(attrs, { abortEarly: false });
        } catch (attrError) {
          return attrError;
        }

        return null;
      },
    },

    create({ Sample, location }) {
      const sample = new Sample({
        metadata: {
          survey: config.name,
          survey_id: config.id,
        },
        attrs: {
          surveyId: config.id,
          sampleMethodId: 776,
          location,
          comment: null,
          reliability: 'Suitable conditions',
        },
      });

      return sample;
    },

    verify(attrs) {
      try {
        Yup.object()
          .shape({
            reliability: Yup.string().required('Reliability cannot be empty.'),
          })
          .validateSync(attrs, { abortEarly: false });
      } catch (attrError) {
        return attrError;
      }

      return null;
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

  create({ Sample }) {
    const recorder = `${userModel.data.firstName} ${userModel.data.lastName}`;
    const now = new Date().toISOString();

    const sample = new Sample({
      metadata: {
        survey_id: config.id,
        survey: config.name,
        speciesGroups: [],
      },
      attrs: {
        surveyId: config.id,
        date: now,
        training: appModel.data.useTraining,
        location: null,
        sampleMethodId: 22,
        surveyStartTime: now,
        recorder,
      },
    });

    return sample;
  },
};

export default config;
