/* eslint-disable camelcase */
import axios from 'axios';
import { camelCase, mapKeys } from 'lodash';
import { ZodError , z, object } from 'zod';
import { isAxiosNetworkError, HandledError } from '@flumens';
import CONFIG from 'common/config';
import Project, { RemoteAttributes } from 'models/project';
import userModel from 'models/user';

type Props = { country?: string; member?: boolean };

export async function fetch({ member }: Props): Promise<RemoteAttributes[]> {
  const url = `${
    CONFIG.backend.indicia.url
  }/index.php/services/rest/groups?view=${member ? 'member' : 'joinable'}`;

  const token = await userModel.getAccessToken();

  const options = {
    params: { verbose: 1 },
    headers: { Authorization: `Bearer ${token}` },
    timeout: 80000,
  };

  try {
    const res = await axios.get(url, options);

    const getValues = (doc: any) =>
      mapKeys(doc.values, (_, key) => camelCase(key));
    const docs = res.data.map(getValues);

    docs.forEach(Project.remoteSchema.parse);

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
  locationCode: z.string(),
  locationBoundaryGeom: z.string(),
  locationLat: z.string(),
  locationLon: z.string(),
  locationCreatedOn: z.string(),
  locationUpdatedOn: z.string(),
  id: z.string().optional(),
  createdOn: z.string().optional(),
  createdById: z.string().optional(),
  groupId: z.string().optional(),
  groupTitle: z.string().optional(),
  locationCentroidSref: z.string().optional(),
  locationCentroidSrefSystem: z.string().optional(),
  locationCreatedById: z.string().optional(),
  locationUpdatedById: z.string().optional(),
  locationComment: z.string().nullable().optional(),
  locationExternalKey: z.string().nullable().optional(),

  projectId: z.string(), // we have added this for linking to projects, warehouse doesn't return it yet
});

export type RemoteLocationAttributes = z.infer<typeof remoteLocationSchema>;

export async function fetchLocations(
  projectId: string | number
): Promise<RemoteLocationAttributes[]> {
  const url = `${CONFIG.backend.indicia.url}/index.php/services/rest/groups/${projectId}/locations`;

  const token = await userModel.getAccessToken();

  const options = {
    headers: { Authorization: `Bearer ${token}` },
    timeout: 80000,
  };

  try {
    const res = await axios.get(url, options);

    const getValues = (doc: any) =>
      mapKeys(doc.values, (_, key) => camelCase(key));
    const addProjectId = (doc: any) => ({ ...doc, projectId });
    const docs = res.data.map(getValues).map(addProjectId);

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

export async function join(project: RemoteAttributes) {
  const url = `${CONFIG.backend.indicia.url}/index.php/services/rest/groups/${project.id}/users`;

  const token = await userModel.getAccessToken();

  const body = {
    values: {
      id: userModel.attrs.indiciaUserId,
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

export async function leave(projectId: string) {
  const url = `${CONFIG.backend.indicia.url}/index.php/services/rest/groups/${projectId}/users/${userModel.attrs.indiciaUserId}`;

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
