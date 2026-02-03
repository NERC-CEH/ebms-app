import axios, { AxiosRequestConfig, AxiosError, CancelToken } from 'axios';
import z from 'zod';
import {
  HandledError,
  isAxiosNetworkError,
  ElasticOccurrence,
  normalizeCoords,
  ElasticSearchResponse,
} from '@flumens';
import CONFIG from 'common/config';
import { matchAppSurveys } from 'common/services/ES';
import userModel from 'models/user';

/* eslint-disable @typescript-eslint/naming-convention */
const dtoSchema = z.object({
  aggregations: z.object({
    bySrid: z.object({
      buckets: z
        .object({
          doc_count: z.number(),
          bySquare: z.object({
            buckets: z
              .object({
                key: z.string(),
                doc_count: z.number(),
              })
              .array(),
          }),
        })
        .array(),
    }),
  }),
});

/* eslint-enable @typescript-eslint/naming-convention */

export type DTO = z.infer<typeof dtoSchema>;

export type Square = {
  key: string;
  docCount: number;
  size: number; // in meters
};

type LatLng = { lat: number; lng: number };

/* eslint-disable @typescript-eslint/naming-convention */
const getRecordsQuery = (northWest: LatLng, southEast: LatLng) =>
  JSON.stringify({
    size: 1000,
    query: {
      bool: {
        must: [matchAppSurveys],
        filter: {
          geo_bounding_box: {
            'location.point': {
              top_left: { lat: northWest.lat, lon: northWest.lng },
              bottom_right: { lat: southEast.lat, lon: southEast.lng },
            },
          },
        },
      },
    },
  });
/* eslint-enable @typescript-eslint/naming-convention */

type CancelTokenSource = {
  cancel: () => void;
  token: CancelToken;
};

let requestCancelToken: CancelTokenSource | null = null;

export async function fetchRecords(northWest: LatLng, southEast: LatLng) {
  if (requestCancelToken) {
    requestCancelToken.cancel();
  }

  requestCancelToken = axios.CancelToken.source();

  const OPTIONS: AxiosRequestConfig = {
    method: 'post',
    url: CONFIG.backend.occurrenceServiceURL,
    headers: {
      authorization: `Bearer ${await userModel.getAccessToken()}`,
      'Content-Type': 'application/json',
    },
    timeout: 80000,
    cancelToken: requestCancelToken.token,
    data: getRecordsQuery(
      normalizeCoords(northWest),
      normalizeCoords(southEast)
    ),
  };

  let records = [];

  try {
    const { data } =
      await axios<ElasticSearchResponse<ElasticOccurrence>>(OPTIONS);
    const hits = data?.hits?.hits;
    if (!Array.isArray(hits))
      throw new HandledError('Unexpected response from server.');

    records = hits.map(hit => {
      if (!hit._source)
        throw new HandledError('Unexpected response from server.');

      return hit._source;
    });
  } catch (error: unknown) {
    if (axios.isCancel(error)) return null;

    if (isAxiosNetworkError(error as AxiosError))
      throw new HandledError(
        'Request aborted because of a network issue (timeout or similar).'
      );

    throw error;
  }

  return records;
}

/* eslint-disable @typescript-eslint/naming-convention */
const getSquaresQuery = (
  northWest: LatLng,
  southEast: LatLng,
  squareSize: number
) =>
  JSON.stringify({
    size: 0,
    query: {
      bool: {
        must: [matchAppSurveys],
        filter: {
          geo_bounding_box: {
            'location.point': {
              top_left: { lat: northWest.lat, lon: northWest.lng },
              bottom_right: { lat: southEast.lat, lon: southEast.lng },
            },
          },
        },
      },
    },
    aggs: {
      bySrid: {
        terms: { field: 'location.grid_square.srid', size: 1000 },
        aggs: {
          bySquare: {
            terms: {
              field: `location.grid_square.${squareSize}km.centre`,
              size: 100000,
            },
          },
        },
      },
    },
  });
/* eslint-enable @typescript-eslint/naming-convention */

export async function fetchSquares(
  northWest: LatLng,
  southEast: LatLng,
  squareSize: number // in meters
) {
  if (requestCancelToken) {
    requestCancelToken.cancel();
  }

  requestCancelToken = axios.CancelToken.source();

  const squareSizeInKm = squareSize / 1000;

  try {
    const options: AxiosRequestConfig = {
      method: 'post',
      url: CONFIG.backend.occurrenceServiceURL,
      headers: {
        authorization: `Bearer ${await userModel.getAccessToken()}`,
        'Content-Type': 'application/json',
      },
      timeout: 80000,
      cancelToken: requestCancelToken.token,
      data: getSquaresQuery(
        normalizeCoords(northWest),
        normalizeCoords(southEast),
        squareSizeInKm
      ),
    };

    const { data } = await axios<DTO>(options);
    if (!data.aggregations) return [];

    const isValid = dtoSchema.safeParse(data).success;
    if (!isValid) throw new Error('Invalid server response.');

    const squares = data?.aggregations?.bySrid?.buckets
      .flatMap(bucket =>
        bucket?.bySquare?.buckets.map(
          (square): Square => ({
            key: square.key,
            docCount: square.doc_count,
            size: squareSize,
          })
        )
      )
      .filter(o => !!o);

    return squares || [];
  } catch (error: unknown) {
    if (axios.isCancel(error)) return null;

    if (isAxiosNetworkError(error as AxiosError))
      throw new HandledError(
        'Request aborted because of a network issue (timeout or similar).'
      );

    throw error;
  }
}
