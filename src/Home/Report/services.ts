import axios, { AxiosError } from 'axios';
import z from 'zod';
import { HandledError, isAxiosNetworkError } from '@flumens';
import config from 'common/config';
import { surveyConfigs as surveys } from 'common/models/sample';
import userModel from 'models/user';

export type Species = {
  scientificName: string;
  count: number;
  groupId?: number;
};

/* eslint-disable @typescript-eslint/naming-convention */
const dtoSchema = z.object({
  aggregations: z.object({
    bySpecies: z.object({
      buckets: z.array(
        z.object({
          key: z.string(),
          doc_count: z.number(),
          sample_count: z.object({ value: z.number() }).optional(),
          groupId: z.object({ value: z.number() }).optional(),
        })
      ),
    }),
  }),
});
/* eslint-enable @typescript-eslint/naming-convention */

export type DTO = z.infer<typeof dtoSchema>;

export async function fetchSpeciesReport(): Promise<Species[]> {
  const url = `${config.backend.url}/iform/esproxy/rawsearch/1`;

  const body = {
    'aggs[bySpecies][terms][field]': 'taxon.accepted_name.keyword',
    'aggs[bySpecies][aggs][sample_count][cardinality][field]': 'event.event_id',
    'query[bool][must][term][metadata.survey.id]': surveys['precise-area'].id,
    size: 0,
  };

  const formData = new FormData();
  const appendProps = (prop: [string, unknown]) =>
    formData.append(prop[0], prop[1] as string);
  Object.entries(body).forEach(appendProps);

  try {
    const { data } = await axios.post<DTO>(url, formData);

    if (!data.aggregations) return [];

    const isValid = dtoSchema.safeParse(data.aggregations).success;
    if (!isValid) throw new Error('Invalid server response.');

    return data.aggregations.bySpecies.buckets.map(bucket => ({
      scientificName: bucket.key,
      count: bucket.doc_count,
      groupId: bucket.groupId ? bucket.groupId.value : undefined,
    }));
  } catch (error: unknown) {
    if (isAxiosNetworkError(error as AxiosError))
      throw new HandledError(
        'Request aborted because of a network issue (timeout or similar).'
      );

    throw error;
  }
}

export async function fetchUserSpeciesReport(
  showLastMontOnly?: boolean
): Promise<Species[]> {
  const url = `${config.backend.indicia.url}/index.php/services/rest/es-occurrences/_search`;

  const date = new Date();
  date.setDate(1); // reset to start of the month
  const thisMonth = date.toISOString().split('T')[0];
  const lastMonthQuery = showLastMontOnly
    ? [{ range: { 'metadata.updatedOn': { gte: `${thisMonth} 00:00:00` } } }]
    : [];

  const options = {
    method: 'post' as const,
    url,
    headers: {
      Authorization: `Bearer ${await userModel.getAccessToken()}`,
      'Content-Type': 'application/json',
    },
    data: JSON.stringify({
      size: 0,
      query: {
        bool: {
          must: [
            { bool: { should: [{ match: { 'metadata.website.id': 118 } }] } },
            ...lastMonthQuery,
          ],
        },
      },
      aggs: {
        bySpecies: {
          terms: { field: 'taxon.accepted_name.keyword' },
          aggs: {
            sampleCount: { cardinality: { field: 'event.event_id' } },
            groupId: { min: { field: 'taxon.input_group_id' } },
          },
        },
      },
    }),
  };

  const response = await axios<DTO>(options);

  if (!response.data.aggregations) return [];

  const isValid = dtoSchema.safeParse(response.data.aggregations).success;

  if (!isValid) throw new Error('Invalid server response.');

  return response.data.aggregations.bySpecies.buckets.map(bucket => ({
    scientificName: bucket.key,
    count: bucket.doc_count,
    groupId: bucket.groupId ? bucket.groupId.value : undefined,
  }));
}
