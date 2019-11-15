import React from 'react';
import {
  IonContent,
  IonList,
  IonItem,
  IonPage,
  IonItemDivider,
  IonLabel,
} from '@ionic/react';
import Device from 'helpers/device';
import makeRequest from 'common/helpers/makeRequest';
import speciesNames from 'common/data/names';

function getCommonName(taxon) {
  const species = speciesNames.data.find(
    sp => sp.preferred_taxon === taxon && sp.language_iso === 'eng'
  );
  return species ? species.taxon : null;
}

async function fetchReport() {
  const data = JSON.stringify({
    query: {
      bool: {
        must: [
          {
            term: {
              'metadata.survey.id': 565,
            },
          },
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
    size: 0,
  });

  const url = `https://warehouse1.indicia.org.uk/index.php/services/rest/es-able/_search`;
  const options = {
    method: 'post',
    mode: 'cors',
    headers: {
      Authorization: ``,
      'content-type': 'application/json',
    },
    body: data,
  };

  let response;
  try {
    response = await makeRequest(url, options, 1000000);
    // const isValidResponse = await transectsSchemaBackend.isValid(transects);

    // if (!isValidResponse) {
    //   throw new Error('Invalid server response.');
    // }

    return response.aggregations.by_species.buckets;
  } catch (e) {
    throw new Error(t(e.message));
  }
}

function oldRender() {
  return (
    <IonPage>
      <IonContent id="home-report" class="ion-padding">
        <IonList lines="full">
          <IonItem class="empty">
            <span>
              <p>
                {t(
                  'This app supports butterfly monitoring and conservation. Click on the + button below to starting counting butterflies.'
                )}
              </p>
              <br />
              <p>
                {t(
                  'You will see lots of enhancements to this app as we add in new features over the coming months.'
                )}
              </p>
            </span>
          </IonItem>
        </IonList>
      </IonContent>
    </IonPage>
  );
}

class Report extends React.Component {
  static propTypes = {
    // prop: PropTypes,
  };

  state = {
    species: null,
  };

  componentDidMount = async () => {
    if (window.reports && !this.state.species && Device.isOnline()) {
      this.setState({ species: await fetchReport() });
    }
  };

  render() {
    if (!window.reports) {
      return oldRender();
    }

    const species = [...(this.state.species || [])].splice(0, 5);

    return (
      <IonPage>
        <IonContent id="home-report">
          <IonList lines="none">
            {/* <IonItemDivider>
              <IonLabel>{t('TOP RECORDERS')}</IonLabel>
            </IonItemDivider>
            <IonItem>
              <small>{t('Not enough data yet')}</small>
            </IonItem> */}
            <IonItemDivider>
              <IonLabel>{t('TOP SPECIES')}</IonLabel>
            </IonItemDivider>
            <IonItem lines="full">
              <IonLabel>
                <small>{t('Species')}</small>
              </IonLabel>
              <IonLabel class="ion-text-right">
                <small>{t('Counts')}</small>
              </IonLabel>
            </IonItem>

            {species.map(sp => (
              <IonItem key={sp.key}>
                <IonLabel style={{ margin: '7px 0' }}>
                  <IonLabel
                    class="ion-text-wrap"
                    position="stacked"
                    style={{ margin: 0 }}
                  >
                    <b style={{ fontSize: '1.1em' }}>{getCommonName(sp.key)}</b>
                  </IonLabel>
                  <IonLabel
                    class="ion-text-wrap"
                    position="stacked"
                    style={{ opacity: 0.6 }}
                  >
                    <i>{sp.key}</i>
                  </IonLabel>
                </IonLabel>
                <IonLabel slot="end" style={{ maxWidth: '50px' }}>
                  {sp.doc_count}
                </IonLabel>
              </IonItem>
            ))}
          </IonList>
        </IonContent>
      </IonPage>
    );
  }
}

export default Report;
