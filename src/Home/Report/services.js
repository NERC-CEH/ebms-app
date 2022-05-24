import * as Yup from 'yup';
import config from 'common/config';
import axios from 'axios';
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
