/* eslint-disable @typescript-eslint/naming-convention, max-classes-per-file */
import config from 'common/config';
import { MachineInvolvement } from 'Survey/MothTrap/config';
import Occurrence, { type ClassifierSuggestion } from './occurrence';

jest.mock('@flumens', () => ({
  OccurrenceModel: class {},
  validateRemoteModel: jest.fn(),
}));

jest.mock('@ionic/react', () => ({
  IonIcon: () => null,
  isPlatform: () => false,
}));

jest.mock('Survey/MothTrap/config', () => ({
  __esModule: true,
  MachineInvolvement: {
    HUMAN_ACCEPTED_LESS_PREFERRED: 3,
    MACHINE: 5,
  },
  default: { id: 2, name: 'moth' },
}));

jest.mock('./media', () => ({ __esModule: true, default: class {} }));
jest.mock('./sample', () => ({ __esModule: true, default: class {} }));

const suggestion = (
  warehouseId: number,
  probability: number,
  scientificName: string
) =>
  ({
    warehouseId,
    probability,
    scientificName,
    taxon: scientificName,
    commonName: `${scientificName} common`,
    foundInName: 'scientificName',
    group: 114,
  }) as ClassifierSuggestion;

describe('Occurrence project extensions', () => {
  test('builds classifier audit data for machine and human choices', () => {
    const suggestions = [
      suggestion(10, 0.8, 'First species'),
      suggestion(20, 0.6, 'Chosen species'),
    ];
    const occurrence = {
      data: {
        taxon: {
          warehouseId: 20,
          version: 'classifier-v2',
          machineInvolvement: MachineInvolvement.HUMAN_ACCEPTED_LESS_PREFERRED,
          suggestions,
        },
      },
      media: [{ data: { queued: 'first.jpg' } }],
    };

    expect(
      Occurrence.prototype.getClassifierSubmission.call(
        occurrence as unknown as Occurrence
      )
    ).toEqual({
      values: {
        machine_involvement: MachineInvolvement.HUMAN_ACCEPTED_LESS_PREFERRED,
      },
      classification_event: {
        values: { created_by_id: null },
        classification_results: [
          {
            values: {
              classifier_id: config.classifierID,
              classifier_version: 'classifier-v2',
            },
            classification_suggestions: [
              {
                values: {
                  taxon_name_given: 'First species',
                  probability_given: 0.8,
                  taxa_taxon_list_id: 10,
                  classifier_chosen: 't',
                  human_chosen: 'f',
                },
              },
              {
                values: {
                  taxon_name_given: 'Chosen species',
                  probability_given: 0.6,
                  taxa_taxon_list_id: 20,
                  classifier_chosen: 'f',
                  human_chosen: 't',
                },
              },
            ],
            metaFields: { mediaPaths: ['first.jpg'] },
          },
        ],
      },
    });
  });

  test('omits classifier data without both suggestions and uploaded media', () => {
    const occurrence: {
      data: {
        taxon: {
          warehouseId: number;
          suggestions: ClassifierSuggestion[];
        };
      };
      media: { data: { queued: string } }[];
    } = {
      data: { taxon: { warehouseId: 10, suggestions: [] } },
      media: [{ data: { queued: 'first.jpg' } }],
    };

    expect(
      Occurrence.prototype.getClassifierSubmission.call(
        occurrence as unknown as Occurrence
      )
    ).toBeNull();

    occurrence.data.taxon.suggestions = [suggestion(10, 0.8, 'Species')];
    occurrence.media = [];

    expect(
      Occurrence.prototype.getClassifierSubmission.call(
        occurrence as unknown as Occurrence
      )
    ).toBeNull();
  });

  test('identifies an occurrence using the highest-probability image result', async () => {
    const lower = suggestion(10, 0.4, 'Lower species');
    const highest = suggestion(20, 0.9, 'Highest species');
    const occurrence = {
      data: { taxon: { warehouseId: 0 } },
      media: [
        { identify: jest.fn(() => Promise.resolve(lower)) },
        { identify: jest.fn(() => Promise.resolve(null)) },
        { identify: jest.fn(() => Promise.resolve(highest)) },
      ],
      getTopSuggestion: Occurrence.prototype.getTopSuggestion,
      save: jest.fn(),
    };

    const result = await Occurrence.prototype.identify.call(
      occurrence as unknown as Occurrence
    );

    expect(result).toEqual(occurrence.data.taxon);
    expect(occurrence.data.taxon).toEqual({
      foundInName: highest.foundInName,
      commonName: highest.commonName,
      taxonGroupId: highest.group,
      probability: highest.probability,
      scientificName: highest.scientificName,
      warehouseId: highest.warehouseId,
      machineInvolvement: MachineInvolvement.MACHINE,
      version: '1',
      suggestions: [lower, highest],
    });
    expect(occurrence.save).toHaveBeenCalledTimes(1);
  });
});
