import axios from 'axios';
import config from 'common/config';
import ElasticSample from 'common/types/ElasticSampleHit.d';
import { Survey } from 'Survey/common/config';
import Sample, { surveyConfigs } from '.';
import Occurrence from '../occurrence';
import userModel from '../user';

const getSurveyByCode = (code: string) =>
  Object.values(surveyConfigs).find(
    (survey: Survey) => survey.id === parseInt(code, 10)
  );

export async function fetchRemoteSamples(sampleId: string): Promise<Sample[]> {
  console.log('Fetching remote sample', sampleId);

  const query = JSON.stringify({
    size: 500,
    query: {
      bool: { must: [{ match: { 'event.parent_event_id': sampleId } }] },
    },
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

  const getSample = ({ id, event, metadata }: ElasticSample) => {
    const survey = getSurveyByCode(metadata.survey.id)?.name;
    const date = new Date(metadata.created_on).toISOString();

    const sample = new Sample({
      notPersistent: true,

      id,
      cid: event.source_system_key || id,

      metadata: {
        survey,
        syncedOn,
      },

      attrs: {
        date,
      },
    });

    return sample;
  };

  const samples = data.map(getSample);

  return samples;
}

export async function fetchRemoteOccurrences(
  sampleIds: string[]
): Promise<Occurrence[]> {
  console.log('Fetching remote occurrences', sampleIds);
  if (!sampleIds.length) return [];

  const matchParentSamplesQuery = sampleIds.map((sampleId: string) => ({
    match: {
      'event.parent_event_id': sampleId,
    },
  }));

  const query = JSON.stringify({
    size: 500,
    query: {
      query: {
        bool: {
          must: [
            {
              bool: {
                should: matchParentSamplesQuery,
              },
            },
          ],
        },
      },
    },
  });

  const url = `${config.backend.indicia.url}/index.php/services/rest/es-occurrences/_search`;

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

  const getSample = ({ id, event, metadata }: ElasticSample) => {
    const survey = getSurveyByCode(metadata.survey.id)?.name;
    const date = new Date(metadata.created_on).toISOString();

    const sample = new Sample({
      notPersistent: true,

      id,
      cid: event.source_system_key || id,

      metadata: {
        survey,
        syncedOn,
      },

      attrs: {
        date,
      },
    });

    return sample;
  };

  const samples = data.map(getSample);

  return samples;
}

const extension: any = {
  /** If the sample originates from remote and isn't fully fetched yet. */
  isRemotePartial: false,

  async fetchRemoteFull() {
    if (!this.id) throw new Error('Sample id is missing for fetchRemoteFull');

    if (!this.isRemotePartial)
      throw new Error('Remote sample is already fully fetched.');

    const remoteSubSamples = await fetchRemoteSamples(this.id);

    const getId = (sample: Sample) => sample.id!;
    const remoteSubSampleIds = remoteSubSamples.map(getId);
    const remoteOccurrences = await fetchRemoteOccurrences(remoteSubSampleIds);

    console.log(remoteSubSamples, remoteOccurrences);

    this.isRemotePartial = false;
  },
};

export default extension;
