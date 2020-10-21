import * as Yup from 'yup';
import config from 'config';
import makeRequest from 'common/helpers/makeRequest';
import surveys from 'common/config/surveys';

const speciesSchemaBackend = Yup.object().shape({
  aggregations: Yup.object()
    .shape({
      by_species: Yup.object()
        .shape({
          buckets: Yup.array().required(),
        })
        .required(),
    })
    .required(),
});

async function fetchSpeciesReport() {
  const url = `${config.site_url}iform/esproxy/rawsearch/1`;

  const body = {
    'aggs[by_species][terms][field]': 'taxon.accepted_name.keyword',
    'aggs[by_species][aggs][sample_count][cardinality][field]':
      'event.event_id',
    'query[bool][must][term][metadata.survey.id]': surveys.area.id,
    size: 0,
  };

  const formData = new FormData();
  Object.entries(body).forEach(prop => formData.append(...prop));

  const options = {
    method: 'post',
    body: formData,
  };

  let response;
  try {
    response = await makeRequest(url, options, 1000000);
    const isValidResponse = await speciesSchemaBackend.isValid(response);

    if (!isValidResponse) {
      throw new Error('Invalid server response.');
    }

    return response.aggregations.by_species.buckets;
  } catch (e) {
    throw new Error(e.message);
  }
}

export { fetchSpeciesReport }; // eslint-disable-line
