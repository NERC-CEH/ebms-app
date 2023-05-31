import * as Yup from 'yup';
import userModel from 'models/user';
import config from 'common/config';
import { HandledError, isAxiosNetworkError } from '@flumens';
import axios from 'axios';
import surveys from 'common/config/surveys';

const speciesSchemaBackend = Yup.object().shape({
  by_species: Yup.object()
    .shape({
      buckets: Yup.array().required(),
    })
    .required(),
});

export async function fetchSpeciesReport() {
  const url = `${config.backend.url}/iform/esproxy/rawsearch/1`;

  const body = {
    'aggs[by_species][terms][field]': 'taxon.accepted_name.keyword',
    'aggs[by_species][aggs][sample_count][cardinality][field]':
      'event.event_id',
    'query[bool][must][term][metadata.survey.id]': surveys['precise-area'].id,
    size: 0,
  };

  const formData = new FormData();
  const appendProps = prop => formData.append(...prop);
  Object.entries(body).forEach(appendProps);

  let response;
  try {
    response = await axios.post(url, formData);
    response = response.data;

    if (!response.aggregations) return [];

    const isValidResponse = await speciesSchemaBackend.isValid(
      response.aggregations
    );

    if (!isValidResponse) {
      throw new Error('Invalid server response.');
    }

    return response.aggregations.by_species.buckets;
  } catch (error) {
    if (isAxiosNetworkError(error))
      throw new HandledError(
        'Request aborted because of a network issue (timeout or similar).'
      );

    throw error.message;
  }
}

export async function fetchUserSpeciesReport(showLastMontOnly) {
  const url = `${config.backend.indicia.url}/index.php/services/rest/es-occurrences/_search`;

  const date = new Date();
  date.setDate(1); // reset to start of the month
  const thisMonth = date.toISOString().split('T')[0];
  const lastMonthQuery = showLastMontOnly
    ? [
        {
          range: {
            'metadata.updated_on': {
              gte: `${thisMonth} 00:00:00`,
            },
          },
        },
      ]
    : [];

  const data = JSON.stringify({
    size: 0,
    query: {
      bool: {
        must: [
          {
            bool: {
              should: [
                {
                  match: {
                    'metadata.website.id': 118,
                  },
                },
              ],
            },
          },

          ...lastMonthQuery,
        ],
      },
    },
    aggs: {
      by_species: {
        terms: {
          field: 'taxon.accepted_name.keyword',
        },
        aggs: {
          sample_count: {
            cardinality: {
              field: 'event.event_id',
            },
          },
        },
      },
    },
  });

  const options = {
    method: 'post',
    url,
    headers: {
      Authorization: `Bearer ${await userModel.getAccessToken()}`,
      'Content-Type': 'application/json',
    },
    data,
  };

  let response;
  try {
    response = await axios(options);
    response = response.data;

    if (!response.aggregations) return [];

    const isValidResponse = await speciesSchemaBackend.isValid(
      response.aggregations
    );
    if (!isValidResponse) {
      throw new Error('Invalid server response.');
    }

    return response.aggregations.by_species.buckets;
  } catch (e) {
    throw new Error(e.message);
  }
}
