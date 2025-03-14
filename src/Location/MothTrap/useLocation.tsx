/* eslint-disable no-param-reassign */
import { useRouteMatch } from 'react-router-dom';
import locations from 'common/models/collections/locations';
import Location from 'models/location';

const byCid =
  (val: any) =>
  ({ cid }: any) =>
    cid === val;

const byId =
  (val: any) =>
  ({ id }: any) =>
    id === val;

const isCID = (val?: string) =>
  !!val?.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/);

function useLocation<T extends Location = Location>(): { location?: T } {
  const models: any = {};

  const match = useRouteMatch<{ locId?: string }>();

  const { locId } = match.params;

  const comparator = isCID(locId) ? byCid : byId;
  const location = locations.find(comparator(locId));
  models.location = location;

  return models;
}

export default useLocation;
