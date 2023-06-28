import axios, { AxiosResponse } from 'axios';
import config from 'common/config';
import speciesCommonNamesData from 'common/data/commonNames/index.json';
import appModel from 'models/app';
import userModel from 'models/user';

type Result = {
  classifier_id: string;
  classifier_name: string;
  probability: number;
  group: number;
  taxon: string;
  authority: string;
  language_iso: string;
  preferred: string;
  preferred_taxon: string;
  preferred_authority: string;
  /**
   * @deprecated this comes from the server which might differ from the app ones
   */
  default_common_name: string; // not using this one
  taxa_taxon_list_id: string;
  taxon_meaning_id: string;
};

type ResultWithCommonName = Result & {
  warehouse_id: number;
  found_in_name: string;
  scientific_name: string;
  common_name?: string;
};

function getCommonName(sp: Result) {
  const { language } = appModel.attrs;
  const speciesDataBySpecificLanguage = (speciesCommonNamesData as any)[
    language as any
  ];
  const byId = ({ preferredId, scientific_name }: any) =>
    preferredId === parseInt(sp.taxa_taxon_list_id, 10) ||
    scientific_name === sp.taxon;
  const taxon = speciesDataBySpecificLanguage?.find(byId);
  if (!taxon) return {} as any;

  return {
    common_name: taxon.common_name,
    found_in_name: 'common_name',
  };
}

export default async function identify(
  url: string
): Promise<ResultWithCommonName[]> {
  const data = new URLSearchParams({ image: url });

  const params = new URLSearchParams({
    _api_proxy_uri: 'identify-proxy/v1/?app_name=uni-jena',
  });

  const options: any = {
    method: 'post',
    params,
    url: `${config.backend.url}/api-proxy/waarneming`,
    // url: 'https://butterfly-monitoring.net/api-proxy/waarneming',
    headers: {
      Authorization: `Bearer ${await userModel.getAccessToken()}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    data,
    timeout: 80000,
  };

  try {
    const response: AxiosResponse<Result[]> = await axios(options);
    const withValidData = (sp: Result) => sp.taxa_taxon_list_id && sp.taxon;
    const normalizeBaseValues = (sp: Result) => ({
      ...sp,
      warehouse_id: parseInt(sp.taxa_taxon_list_id, 10),
      scientific_name: sp.taxon,
      found_in_name: 'scientific_name',
    });

    const attachCommonName = (sp: Result) => ({ ...sp, ...getCommonName(sp) });
    const suggestions = response.data
      .filter(withValidData)
      .map(normalizeBaseValues)
      .map(attachCommonName);

    return suggestions;
  } catch (e: any) {
    console.error(e);
  }

  return [];
}
