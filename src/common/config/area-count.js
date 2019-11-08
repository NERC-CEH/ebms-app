import DateHelp from 'helpers/date';
import Wkt from 'wicket';
import { toJS } from 'mobx';
import L from 'leaflet';

function transformToMeters(coordinates) {
  return coordinates.map(([lng, lat]) => {
    const { x, y } = L.Projection.SphericalMercator.project({ lat, lng });
    return [x, y];
  });
}
function getGeomString(shape) {
  const geoJSON = toJS(shape);
  if (geoJSON.type === 'Polygon') {
    geoJSON.coordinates[0] = transformToMeters(geoJSON.coordinates[0]);
  } else {
    geoJSON.coordinates = transformToMeters(geoJSON.coordinates);
  }

  const wkt = new Wkt.Wkt(geoJSON);
  return wkt.write();
}

const dateTimeFormat = new Intl.DateTimeFormat('en-GB', {
  hour: 'numeric',
  minute: 'numeric',
});

const config = {
  id: 565,
  webForm: 'enter-app-record',
  attrs: {
    smp: {
      location: {
        values(location, submission) {
          const areaId = config.attrs.smp.area.id;

          const geomAndArea = {
            [areaId]: location.area,
            geom: getGeomString(location.shape),
          };

          // eslint-disable-next-line
          submission.fields = {
            ...submission.fields,
            ...geomAndArea,
          };

          return `${parseFloat(location.latitude).toFixed(7)}, ${parseFloat(
            location.longitude
          ).toFixed(7)}`;
        },
      },
      device: {
        id: 922,
        values: {
          iOS: 2398,
          Android: 2399,
        },
      },
      device_version: { id: 759 },
      app_version: { id: 1139 },

      date: {
        values(date) {
          return DateHelp.print(date);
        },
        isValid: val => val && val.toString() !== 'Invalid Date',
        type: 'date',
        max: () => new Date(),
      },

      surveyStartTime: {
        id: 1385,
        values: date => dateTimeFormat.format(new Date(date)),
      },
      surveyEndime: {
        id: 1386,
        values: date => dateTimeFormat.format(new Date(date)),
      },

      area: { id: 723 },
    },
    occ: {
      training: {
        id: 'training',
      },

      taxon: {
        values(taxon) {
          return taxon.warehouse_id;
        },
      },
      count: { id: 780 },
      stage: {
        id: 293,
        label: 'Stage',
        type: 'radio',
        default: 'Not Recorded',

        values: {
          Adults: 3929,
          Larvae: 3931,
          Eggs: 3932,
          Pupae: 3930,
          'Larval webs': 14079,
        },
      },
    },
  },
};

export default config;
