import axios from 'axios';
import { ElasticOccurrence, ElasticSample } from '@flumens';
import commonConfig from 'common/config';
import { AttrConfig } from 'Survey/common/config';
import Sample from '.';
import Occurrence from '../occurrence';
import userModel from '../user';

export async function fetchRemoteSubSamples(
  parentId: string
): Promise<Sample[]> {
  console.log('Fetching remote sample with parent ID', parentId);

  const query = JSON.stringify({
    size: 1000,
    query: {
      bool: { must: [{ match: { 'event.parent_event_id': parentId } }] },
    },
  });

  const requestConfig = {
    method: 'post',
    url: commonConfig.backend.sampleServiceURL,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${await userModel.getAccessToken()}`,
    },
    data: query,
  };

  const res = await axios.request(requestConfig);

  const getSource = (hit: any): ElasticSample => hit._source;
  const data = res.data.hits.hits.map(getSource);

  const syncedOn = new Date().getTime();

  const getSample = (doc: ElasticSample) => {
    const parsedDoc = Sample.parseRemoteJSON(doc);
    const sample = Sample.fromJSON({ skipStore: true, ...parsedDoc });
    sample.metadata.syncedOn = syncedOn;
    sample.isPartial = true;

    return sample;
  };

  const samples = data.map(getSample);

  return samples;
}

export async function fetchRemoteSample(id: string): Promise<Sample> {
  console.log('Fetching remote sample with ID', id);

  const query = JSON.stringify({
    size: 1000,
    query: {
      bool: { must: [{ match: { 'event.source_system_key': id } }] },
    },
  });

  const requestConfig = {
    method: 'post',
    url: commonConfig.backend.sampleServiceURL,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${await userModel.getAccessToken()}`,
    },
    data: query,
  };

  const res = await axios.request(requestConfig);

  const getSource = (hit: any): ElasticSample => hit._source;
  const data = res.data.hits.hits.map(getSource);
  const doc = data[0];
  if (!doc) throw new Error(`Remote sample with id ${id} was not found`);

  const syncedOn = new Date().getTime();

  const parsedDoc = Sample.parseRemoteJSON(doc);
  const sample = Sample.fromJSON({ skipStore: true, ...parsedDoc });
  sample.metadata.syncedOn = syncedOn;
  sample.isPartial = true;

  return sample;
}

type OccurrenceAndParentId = [Occurrence, number][];

export async function fetchRemoteOccurrences(
  parentId: string
): Promise<OccurrenceAndParentId> {
  console.log('Fetching remote occurrences with top parent ID', parentId);

  const matchTopParent = { match: { 'event.parent_event_id': parentId } };
  const matchParent = { match: { 'event.event_id': parentId } };
  const query = JSON.stringify({
    size: 1000,
    query: {
      bool: {
        must: [{ bool: { should: [matchTopParent, matchParent] } }],
      },
    },
  });

  const requestConfig = {
    method: 'post',
    url: commonConfig.backend.occurrenceServiceURL,
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

  const getOccurrenceAndParent = (doc: ElasticOccurrence) => {
    const parsedDoc = Occurrence.parseRemoteJSON(doc);
    const occurrence = Occurrence.fromJSON(parsedDoc);
    occurrence.metadata.syncedOn = syncedOn;

    return [occurrence, doc.event.event_id];
  };

  return data.map(getOccurrenceAndParent);
}

interface RemoteAttr {
  value: any;
  id: string;
}

export const parseRemoteAttrs = (
  config: { [key: string]: AttrConfig },
  remoteAttrs: RemoteAttr[]
) => {
  const attrConfigs = Object.entries<AttrConfig>(config);
  const toConfig = (agg: any, remoteAttr: RemoteAttr) => {
    const byId = ([, attrConfig]: [string, AttrConfig]) =>
      attrConfig.remote?.id === parseInt(remoteAttr.id, 10);

    const attrConfig = attrConfigs.find(byId);
    if (!attrConfig) {
      console.warn(
        `Remote attr ${remoteAttr.id} could not be mapped to local.`
      );
      return agg;
    }

    const [localAttrKey] = attrConfig;
    const parsedValue = Number.isFinite(parseFloat(remoteAttr.value))
      ? parseFloat(remoteAttr.value)
      : remoteAttr.value;

    // eslint-disable-next-line no-param-reassign
    agg[localAttrKey] = parsedValue;
    return agg;
  };

  return remoteAttrs.reduce(toConfig, {});
};

const extension: any = {
  /** If the sample originates from remote and isn't fully fetched yet. */
  isPartial: false,

  async fetchRemote() {
    if (!this.id) throw new Error('Sample id is missing for fetchRemote');

    if (!this.isPartial)
      throw new Error('Remote sample is already fully fetched.');

    const remoteSubSamplesPromise = fetchRemoteSubSamples(this.id);
    const remoteOccurrencesPromise = fetchRemoteOccurrences(this.id);

    const [remoteSubSamples, remoteOccurrences] = await Promise.all([
      remoteSubSamplesPromise,
      remoteOccurrencesPromise,
    ]);

    const byId = (agg: any, smp: Sample) => {
      // eslint-disable-next-line no-param-reassign
      agg[smp.id!] = smp;
      return agg;
    };
    const remoteSubSamplesMap = remoteSubSamples.reduce(byId, {});
    const attachOccToSamples = ([occ, parentId]: [Occurrence, number]) => {
      if (parentId === this.id) {
        this.occurrences.push(occ);
        return;
      }
      remoteSubSamplesMap[parentId].occurrences.push(occ);
    };
    remoteOccurrences.forEach(attachOccToSamples);
    this.samples.push(...remoteSubSamples);

    this.isPartial = false;
  },
};

export default extension;
