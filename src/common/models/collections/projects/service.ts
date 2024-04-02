/* eslint-disable camelcase */
import axios from 'axios';
import { camelCase, mapKeys } from 'lodash';
import { ZodError } from 'zod';
import { isAxiosNetworkError, HandledError } from '@flumens';
import CONFIG from 'common/config';
import Project, { ProjectAttributes } from 'models/project';
import userModel from 'models/user';

type Props = { country?: string; member?: boolean };

export async function fetch({ member }: Props): Promise<ProjectAttributes[]> {
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
    const entities = res.data.map(getValues);

    entities.forEach(Project.schema.parse);

    return entities;
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

export async function join(project: ProjectAttributes) {
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
