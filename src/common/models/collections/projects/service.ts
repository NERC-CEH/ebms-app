/* eslint-disable camelcase */
import axios from 'axios';
import { isAxiosNetworkError, HandledError } from '@flumens';
import CONFIG from 'common/config';
import userModel from 'models/user';

export type Response = RemoteProject[];

export interface RemoteProject {
  id: number;
  title: string;
  description: string;
  group_type: string;
  created_on: string;
}

type Props = { country?: string; member?: boolean };

export async function fetchMock({
  country, // eslint-disable-line
  member,
}: Props): Promise<RemoteProject[]> {
  await new Promise((res: any) => setTimeout(res, 2000));

  const projects = [
    {
      id: 1,
      title: 'Project 1',
      description: 'This is a private project description.',
      group_type: 'Local',
      created_on: '2024-02-22T11:29:40.431Z',
    },
    {
      id: 2,
      title: 'Some other private project',
      description: 'Some other project description.',
      group_type: 'Natural History',
      created_on: '2024-01-22T11:29:40.431Z',
    },
    {
      id: 3,
      title: 'Some public new project',
      description: 'Some other project description.',
      group_type: 'Natural History',
      created_on: '2024-01-22T11:29:40.431Z',
    },
    {
      id: 4,
      title: 'Yet another public project',
      description: 'Some other project description.',
      group_type: 'Natural History',
      created_on: '2024-01-22T11:29:40.431Z',
    },
  ];

  if (member) return projects.slice(0, 2);

  return projects.slice(2, 4);
}

export async function fetch({ country, member }: Props) {
  const url = `${
    CONFIG.backend.indicia.url
  }/index.php/services/rest/groups?view=${member ? 'member' : 'joinable'}`;

  const token = await userModel.getAccessToken();

  const options = {
    params: {
      verbose: 1,
    },
    headers: { Authorization: `Bearer ${token}` },
    timeout: 80000,
  };

  try {
    const res = await axios.get(url, options);

    let docs: Response = res.data;

    return docs;
  } catch (error: any) {
    if (axios.isCancel(error)) return [];

    if (isAxiosNetworkError(error))
      throw new HandledError(
        'Request aborted because of a network issue (timeout or similar).'
      );

    throw error;
  }
}

export async function joinMock(project: RemoteProject) {
  await new Promise((res: any) => setTimeout(res, 2000));
}

export async function join(project: RemoteProject) {
  const url = `${CONFIG.backend.indicia.url}/index.php/services/rest/groups/${project.id}/members`;

  const token = await userModel.getAccessToken();

  const options = {
    headers: { Authorization: `Bearer ${token}` },
    timeout: 80000,
    body: {
      user_id: userModel.attrs.indiciaUserId,
    },
  };

  try {
    const res = await axios.post(url, options);

    let docs: Response = res.data;

    return docs;
  } catch (error: any) {
    if (axios.isCancel(error)) return [];

    if (isAxiosNetworkError(error))
      throw new HandledError(
        'Request aborted because of a network issue (timeout or similar).'
      );

    throw error;
  }
}
