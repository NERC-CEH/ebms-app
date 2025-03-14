/* eslint-disable camelcase */
import axios from 'axios';
import { camelCase, mapKeys } from 'lodash';
import { ZodError, z, object } from 'zod';
import { isAxiosNetworkError, HandledError } from '@flumens';
import CONFIG from 'common/config';
import countries from 'common/config/countries';
import appModel from 'common/models/app';
import Group, { RemoteAttributes } from 'models/group';
import userModel from 'models/user';

type Props = { country?: string; member?: boolean };

export async function fetch({ member }: Props): Promise<RemoteAttributes[]> {
  const url = `${CONFIG.backend.indicia.url}/index.php/services/rest/groups`;

  const token = await userModel.getAccessToken();

  const countryCode = appModel.data.country!;
  const countryId = countries[countryCode]?.id;

  const options = {
    params: {
      view: member ? 'member' : 'joinable',
      indexed_location_ids:
        !member && Number.isFinite(countryId) ? countryId : undefined,
    },
    headers: { Authorization: `Bearer ${token}` },
    timeout: 80000,
  };

  try {
    const res = await axios.get(url, options);

    const getValues = (doc: any) =>
      mapKeys(doc.values, (_, key) => camelCase(key));
    const docs = res.data.map(getValues);

    docs.forEach(Group.remoteSchema.parse);

    return docs;
  } catch (error: any) {
    if (axios.isCancel(error)) return [];

    if (isAxiosNetworkError(error))
      throw new HandledError(
        'Request aborted because of a network issue (timeout or similar).'
      );

    if ('issues' in error) {
      const err: ZodError = error;
      throw new Error(
        err.issues.map(e => `${e.path.join(' ')} ${e.message}`).join(' ')
      );
    }

    throw error;
  }
}

const remoteLocationSchema = object({
  locationId: z.string(),
  locationName: z.string(),
  locationBoundaryGeom: z.string(),
  locationLat: z.string(),
  locationLon: z.string(),
  locationCreatedOn: z.string(),
  locationUpdatedOn: z.string(),
  locationCentroidSref: z.string(),
  locationCentroidSrefSystem: z.string(),

  id: z.string().nullable().optional(),
  createdOn: z.string().nullable().optional(),
  createdById: z.string().nullable().optional(),
  groupId: z.string().nullable().optional(),
  groupTitle: z.string().nullable().optional(),
  locationCode: z.string().nullable().optional(),
  locationCreatedById: z.string().nullable().optional(),
  locationUpdatedById: z.string().nullable().optional(),
  locationComment: z.string().nullable().optional(),
  locationExternalKey: z.string().nullable().optional(),
});

export type RemoteLocationAttributes = z.infer<typeof remoteLocationSchema>;

export async function fetchLocations(
  groupId: string | number
): Promise<RemoteLocationAttributes[]> {
  const url = `${CONFIG.backend.indicia.url}/index.php/services/rest/groups/${groupId}/locations`;

  const token = await userModel.getAccessToken();

  const options = {
    headers: { Authorization: `Bearer ${token}` },
    timeout: 80000,
  };

  try {
    const res = await axios.get(url, options);

    const getValues = (doc: any) =>
      mapKeys(doc.values, (_, key) => camelCase(key));
    const docs = res.data.map(getValues);

    docs.forEach(remoteLocationSchema.parse);

    return docs;
  } catch (error: any) {
    if (axios.isCancel(error)) return [];

    if (isAxiosNetworkError(error))
      throw new HandledError(
        'Request aborted because of a network issue (timeout or similar).'
      );

    if ('issues' in error) {
      const err: ZodError = error;
      throw new Error(
        err.issues.map(e => `${e.path.join(' ')} ${e.message}`).join(' ')
      );
    }

    throw error;
  }
}

export async function join(group: RemoteAttributes) {
  const url = `${CONFIG.backend.indicia.url}/index.php/services/rest/groups/${group.id}/users`;

  const token = await userModel.getAccessToken();

  const body = {
    values: {
      id: userModel.data.indiciaUserId,
    },
  };

  const options = {
    headers: { Authorization: `Bearer ${token}` },
    timeout: 80000,
  };

  try {
    await axios.post(url, body, options);
  } catch (error: any) {
    if (axios.isCancel(error)) return;

    if (isAxiosNetworkError(error))
      throw new HandledError(
        'Request aborted because of a network issue (timeout or similar).'
      );

    throw error;
  }
}

export async function leave(groupId: string) {
  const url = `${CONFIG.backend.indicia.url}/index.php/services/rest/groups/${groupId}/users/${userModel.data.indiciaUserId}`;

  const token = await userModel.getAccessToken();

  const options = {
    headers: { Authorization: `Bearer ${token}` },
    timeout: 80000,
  };

  try {
    await axios.delete(url, options);
  } catch (error: any) {
    if (axios.isCancel(error)) return;

    if (isAxiosNetworkError(error))
      throw new HandledError(
        'Request aborted because of a network issue (timeout or similar).'
      );

    throw error;
  }
}
