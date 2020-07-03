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
  name: 'area',
  label: '15min Count',
  webForm: 'enter-app-record',
  attrs: {
    location: {
      id: 'entered_sref',
      values(location, submission) {
        const areaId = config.attrs.area.id;

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

    comment: {
      label: 'Comment',
      type: 'textarea',
      info: 'Please add any extra info about this record.',
    },
    temperature: {
      id: 1388,
      label: 'Temperature',
      type: 'radio',
      info: 'Please specify the temperature C°.',
      values: [
        { value: null, isDefault: true, label: 'Not recorded/no data' },
        { value: 10, id: 16530 },
        { value: 11, id: 16531 },
        { value: 12, id: 16532 },
        { value: 13, id: 16533 },
        { value: 14, id: 16534 },
        { value: 15, id: 16535 },
        { value: 16, id: 16536 },
        { value: 17, id: 16537 },
        { value: 18, id: 16538 },
        { value: 19, id: 16539 },
        { value: 20, id: 16540 },
        { value: 21, id: 16541 },
        { value: 22, id: 16542 },
        { value: 23, id: 16543 },
        { value: 24, id: 16544 },
        { value: 25, id: 16545 },
        { value: 26, id: 16546 },
        { value: 27, id: 16547 },
        { value: 28, id: 16548 },
        { value: 29, id: 16549 },
        { value: 30, id: 16550 },
        { value: 31, id: 16551 },
        { value: 32, id: 16552 },
        { value: 33, id: 16553 },
        { value: 34, id: 16554 },
        { value: 35, id: 16555 },
      ],
    },
    cloud: {
      id: 1457,
      label: 'Cloud',
      type: 'slider',
      info: 'Please specify the % of cloud cover.',
      max: 100,
      min: 0,
    },
    windDirection: {
      id: 1389,
      label: 'Wind Direction',
      type: 'radio',
      info: 'Please specify the wind direction.',
      values: [
        { value: null, isDefault: true, label: 'Not recorded/no data' },
        { value: 'S', id: 2461 },
        { value: 'SW', id: 2462 },
        { value: 'W', id: 2463 },
        { value: 'NW', id: 2464 },
        { value: 'N', id: 2465 },
        { value: 'NE', id: 2466 },
        { value: 'E', id: 2467 },
        { value: 'SE', id: 2468 },
        { value: 'No direction', id: 2469 },
      ],
    },
    windSpeed: {
      id: 1390,
      label: 'Wind Speed',
      type: 'radio',
      info: 'Please specify the wind speed.',
      values: [
        { value: null, isDefault: true, label: 'Not recorded/no data' },
        { value: 'Smoke rises vertically', id: 2606 },
        { value: 'Slight smoke drift', id: 2453 },
        { value: 'Wind felt on face, leaves rustle', id: 2454 },
        { value: 'Leaves and twigs in slight motion', id: 2455 },
        { value: 'Dust raised and small branches move', id: 2456 },
        { value: 'Small trees in leaf begin to sway', id: 2457 },
        { value: 'Large branches move and trees sway', id: 2458 },
      ],
    },
  },

  occ: {
    attrs: {
      training: {
        id: 'training',
      },

      taxon: {
        id: 'taxa_taxon_list_id',
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
