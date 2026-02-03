import axios, { AxiosResponse } from 'axios';
import { CamelizeKeys } from '@flumens/utils';
import config from 'common/config';
import { getLanguageIso } from 'common/config/languages';
import { getCamelCaseObj } from 'common/flumens';
import { getCommonNameById } from 'common/helpers/taxonSearch/commonNamesSearch';
import { speciesStore } from 'common/models/store';
import appModel from 'models/app';
import userModel from 'models/user';

/* eslint-disable @typescript-eslint/naming-convention */
type DTO = {
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
/* eslint-enable @typescript-eslint/naming-convention */

export type Suggestion = CamelizeKeys<DTO> & {
  warehouseId: number;
  foundInName: 'scientificName' | 'commonName';
  scientificName: string;
  commonName?: string;
};

export default async function identify(url: string): Promise<Suggestion[]> {
  const data = new URLSearchParams({ image: url });

  const params = new URLSearchParams({
    _api_proxy_uri: 'identify-proxy/v1/?app_name=uni-jena', // eslint-disable-line @typescript-eslint/naming-convention
  });

  const options: any = {
    method: 'post',
    params,
    url: `${config.backend.url}/api-proxy/waarneming`,
    headers: {
      Authorization: `Bearer ${await userModel.getAccessToken()}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    data,
    timeout: 80000,
  };

  try {
    const response: AxiosResponse<DTO[]> = await axios(options);

    const isValidDTO = (sp: DTO) => sp.taxa_taxon_list_id && sp.taxon;

    const fromDTO = (sp: DTO) => ({
      ...getCamelCaseObj(sp),
      warehouseId: parseInt(sp.taxa_taxon_list_id, 10),
      scientificName: sp.taxon,
      foundInName: 'scientificName',
    });

    const normalized = response.data.filter(isValidDTO).map(fromDTO);

    const language = getLanguageIso(appModel.data.language);

    // attach common names asynchronously
    const suggestions = await Promise.all(
      normalized.map(async sp => {
        const commonName = await getCommonNameById(
          speciesStore,
          sp.warehouseId,
          language
        );
        return commonName
          ? { ...sp, commonName, foundInName: 'commonName' as const }
          : { ...sp, foundInName: 'scientificName' as const };
      })
    );

    return suggestions;
  } catch (e: any) {
    console.error(e);
  }

  return [];
}
