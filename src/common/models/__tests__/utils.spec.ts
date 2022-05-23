/* eslint-disable @getify/proper-arrows/name */
import { getLocalAttributes } from '../utils';

describe('getCustomAttributes', () => {
  it('should get a custom attribute', () => {
    // Given
    const schema = {
      customAttr: {
        remote: { id: 1 },
      },
    };
    const document = {
      'locAttr:1': { raw_value: 2 },
    };

    // When
    const customAttrs = getLocalAttributes(document, schema);

    // Then
    expect(customAttrs).toStrictEqual({
      customAttr: 2,
    });
  });

  it('should get a custom attribute with mapped value', () => {
    // Given
    const schema = {
      customAttr: {
        remote: { id: 1, values: [{ id: 2, value: 'custom value' }] },
      },
    };
    const document = {
      'locAttr:1': { raw_value: 2 },
    };

    // When
    const customAttrs = getLocalAttributes(document, schema);

    // Then
    expect(customAttrs).toStrictEqual({
      customAttr: 'custom value',
    });
  });

  it('should get a custom attributes with multiple mapped values', () => {
    // Given
    const schema = {
      customAttr: {
        remote: {
          id: 1,
          values: [
            { id: 2, value: 'custom value' },
            { id: 3, value: 'another custom value' },
          ],
        },
      },
    };
    const document = {
      'locAttr:1': [{ raw_value: 2 }, { raw_value: 3 }],
    };

    // When
    const customAttrs = getLocalAttributes(document, schema);

    // Then
    expect(customAttrs).toStrictEqual({
      customAttr: ['custom value', 'another custom value'],
    });
  });

  it('should get selected custom attributes only', () => {
    // Given
    const schema = {
      customAttr: {
        remote: { id: 1, values: [{ id: 2, value: 'custom value' }] },
      },
    };
    const document = {
      'locAttr:1': { raw_value: 2 }, // only this one
      'locAttr:2': { raw_value: 2 },
    };

    // When
    const customAttrs = getLocalAttributes(document, schema, ['customAttr']);

    // Then
    expect(customAttrs).toStrictEqual({
      customAttr: 'custom value',
    });
  });

  it('should throw an error if attr config in schema is missing', () => {
    // Given
    const schema = {};
    const document = {
      'locAttr:1': { raw_value: 2 },
    };

    // When
    // Then
    expect(() => getLocalAttributes(document, schema)).toThrow();
  });
});
