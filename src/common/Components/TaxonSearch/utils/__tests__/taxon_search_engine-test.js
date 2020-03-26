import searchEngine from '../taxon_search_engine';

(process.env.SAUCE_LABS ? describe.skip : describe)(
  'Taxon Search Engine',
  () => {
    before(function _(done) {
      this.timeout(20000);
      // TODO: remove this as the engine should work without it!
      searchEngine
        .init()
        .then(done)
        .catch(done);
    });

    it('should be an API object with search function', () => {
      expect(searchEngine).to.be.an('object');
      expect(searchEngine.search).to.exist;
      expect(searchEngine.search).to.be.a('function');
    });

    describe('search', () => {
      it('should return a Promise', () => {
        const promise = searchEngine.search('blackbird');
        expect(promise).to.be.a('Promise');
        return promise;
      });

      it('should resolve to an array', () =>
        searchEngine.search('aglais').then(results => {
          expect(results).to.be.an('array');
          expect(results.length).to.equal(4);
        }));

      it('should include full species description', () =>
        searchEngine.search('Aglais').then(results => {
          const result = results[0];

          expect(result).to.be.an('object');
          expect(result).to.have.all.keys(
            'array_id',
            'found_in_name',
            'warehouse_id',
            'scientific_name'
          );
        }));

      it('should accept both capitalized and lowercase strings', () =>
        searchEngine
          .search('Aglais')
          .then(results =>
            searchEngine
              .search('aglais')
              .then(results2 => expect(results).to.deep.equal(results2))
          ));

      it('should work with selected taxa', () => {
        const searchLatin = () =>
          searchEngine.search('Aglais io').then(results => {
            expect(results).to.not.be.empty;
            const result = results[0];

            expect(result.warehouse_id).to.be.equal(432425);
            expect(result.scientific_name).to.be.equal('Aglais io');
          });

        const searchGenus = () =>
          searchEngine.search('Aglais').then(results => {
            expect(results).to.not.be.empty;
            const result = results[0];

            expect(result.warehouse_id).to.be.equal(432093);
            expect(result.scientific_name).to.be.equal('Aglais');
          });

        return searchLatin().then(searchGenus);
      });

      it('should allow searching Recorder style (5 characters) ', () =>
        searchEngine.search('lopac').then(results => {
          const species = results.find(
            res => res.scientific_name === 'Lopinga achine'
          );
          expect(species).to.be.an('object');
        }));

      it('should allow searching by species (in latin) name', async () => {
        // When
        const results = await searchEngine.search('io');
        // Then
        const found = results.find(
          species => species.scientific_name === 'Aglais io'
        );
        expect(!!found).to.be.equal(true);
      });

      describe('genus', () => {
        it('should add all species belonging to it', () =>
          searchEngine.search('Aglais').then(results => {
            expect(results.length).to.be.equal(4);
            const genus = results[0];
            expect(genus.warehouse_id).to.be.equal(432093);
            expect(genus.scientific_name).to.be.equal('Aglais');

            const puffinusAsimilis = results[1];
            expect(puffinusAsimilis.warehouse_id).to.be.equal(432427);
            expect(puffinusAsimilis.scientific_name).to.be.equal(
              'Aglais ichnusa'
            );
          }));
      });
    });
  }
);
