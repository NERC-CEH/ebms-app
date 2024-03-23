/* eslint-disable camelcase */
import axios from 'axios';
import { isAxiosNetworkError, HandledError } from '@flumens';
import CONFIG from 'common/config';
import userModel from 'models/user';

export interface RemoteProject {
  id: string;
  title: string;
  description: string;
  group_type: string;
  created_on: string;
  joining_method: string;
  website_id: string;
  group_type_id: string;
  from_date: any;
  to_date: any;
  created_by_id: string;
}

type Props = { country?: string; member?: boolean };

export async function fetch({ member }: Props): Promise<RemoteProject[]> {
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

    const getValues = (doc: any) => doc.values;
    return res.data.map(getValues);
  } catch (error: any) {
    if (axios.isCancel(error)) return [];

    if (isAxiosNetworkError(error))
      throw new HandledError(
        'Request aborted because of a network issue (timeout or similar).'
      );

    throw error;
  }
}

export async function join(project: RemoteProject) {
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
