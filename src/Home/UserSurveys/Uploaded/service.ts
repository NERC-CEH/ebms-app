import axios from 'axios';
import { ElasticSample } from '@flumens';
import config from 'common/config';
import { matchAppSurveys } from 'common/services/ES';
import Sample from 'models/sample';
import userModel from 'models/user';

const beTopLevelSample = {
  bool: {
    must_not: {
      exists: {
        field: 'event.parent_event_id',
      },
    },
  },
};

export default async function fetchRemoteSamples(
  from: number
): Promise<Sample[]> {
  console.log('Fetching remote samples, page', from);

  const query = JSON.stringify({
    from,
    size: 50,
    query: {
      bool: {
        must: [matchAppSurveys, beTopLevelSample],
      },
    },
    sort: [
      {
        'metadata.created_on': 'desc',
      },
    ],
  });

  const requestConfig = {
    method: 'post',
    url: config.backend.sampleServiceURL,
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

  const getSample = (doc: ElasticSample) => {
    try {
      const parsedDoc = Sample.parseRemoteJSON(doc);
      const sample = Sample.fromJSON({ skipStore: true, ...parsedDoc });
      sample.metadata.syncedOn = syncedOn;
      sample.isPartial = true;
      return sample;
    } catch (error) {
      console.warn(doc);
      console.error(error);
      return null;
    }
  };

  const exists = (o: any) => !!o;
  const samples = data.map(getSample).filter(exists);

  return samples;
}
