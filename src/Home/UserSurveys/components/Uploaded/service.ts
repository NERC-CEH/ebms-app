import axios from 'axios';
import config from 'common/config';
import ElasticSample from 'common/types/ElasticSampleHit';
import Sample, { surveyConfigs } from 'models/sample';
import userModel from 'models/user';
import { Survey } from 'Survey/common/config';

const surveyConfigsByCode = Object.values(surveyConfigs).reduce<any>(
  (agg: any, survey: Survey) => {
    if (survey.deprecated) return agg;

    // eslint-disable-next-line no-param-reassign
    agg[survey.id] = survey;
    return agg;
  },
  {}
);

export default async function fetchRemoteSamples(): Promise<Sample[]> {
  console.log('Fetching remote samples');

  const query = JSON.stringify({
    from: 0,
    size: 100,
    query: {
      bool: {
        must: [
          {
            bool: {
              should: [
                {
                  match: {
                    'metadata.survey.id': 565,
                  },
                },
                {
                  match: {
                    'metadata.survey.id': 681,
                  },
                },
                {
                  match: {
                    'metadata.survey.id': 562,
                  },
                },
                {
                  match: {
                    'metadata.survey.id': 645,
                  },
                },
              ],
            },
          },
          {
            bool: {
              must_not: {
                exists: {
                  field: 'event.parent_event_id',
                },
              },
            },
          },
        ],
      },
    },
    sort: [
      {
        'metadata.created_on': 'desc',
      },
    ],
  });

  const url = `${config.backend.indicia.url}/index.php/services/rest/es-samples/_search`;

  const requestConfig = {
    method: 'post',
    url,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${await userModel.getAccessToken()}`,
    },
    data: query,
  };

  const res = await axios.request(requestConfig);

  const getSource = (hit: any) => hit._source;
  const data = res.data.hits.hits.map(getSource);

  const syncedOn = new Date().getTime();

  const getSample = ({ id, event, metadata, stats }: ElasticSample) => {
    const survey = surveyConfigsByCode[metadata.survey.id].name;
    const date = new Date(metadata.created_on).toISOString();

    let subSamples: Sample[] = [];

    if (survey === 'precise-area' && stats.count_occurrences) {
      const getSubSample = () =>
        new Sample({
          notPersistent: true,
        });

      subSamples = Array.from(
        new Array(parseInt(stats.count_occurrences, 10)),
        getSubSample
      );
    }

    const sample = new Sample({
      notPersistent: true,

      id,
      cid: event.source_system_key || id,

      metadata: {
        survey,
        syncedOn,
        saved: true,
      },

      attrs: {
        date,
      },
    });

    sample.isRemotePartial = true;

    sample.samples.push(...subSamples);

    return sample;
  };

  const samples = data.map(getSample);

  return samples;
}
