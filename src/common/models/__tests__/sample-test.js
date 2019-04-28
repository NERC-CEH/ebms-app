import DateHelp from 'helpers/date';
import Sample from 'sample';
import Occurrence from 'occurrence';
import appModel from 'app_model';
import Device from 'helpers/device';
import savedSamples from '../../saved_samples';

/* eslint-disable no-unused-expressions */
const validTaxon = { warehouse_id: 1, group: 1 };

function getRandomSample(taxon) {
  const occurrence = new Occurrence({
    taxon: taxon || validTaxon,
  });
  const sample = new Sample(
    {
      location: {
        latitude: 12.12,
        longitude: -0.23,
        name: 'automatic test',
      },
    },
    {
      occurrences: [occurrence],
      Collection: savedSamples,
      onSend: () => {}, // overwrite Collection's one checking for user login
    }
  );

  sample.metadata.saved = true;

  return sample;
}

describe.skip('Sample', () => {
  let sampleRemoteCreateStub;
  beforeEach(() => {
    sampleRemoteCreateStub = sinon
      .stub(Sample.prototype, '_create')
      .resolves({ data: {} });
  });

  afterEach(() => {
    sampleRemoteCreateStub.restore();
  });

  it('should have current date by default', () => {
    const sample = new Sample();
    const date = sample.get('date');

    expect(DateHelp.print(date)).to.be.equal(DateHelp.print(new Date()));
  });

  it('should set training mode', () => {
    appModel.set('useTraining', false);

    let sample = getRandomSample();
    expect(sample.metadata.training).to.be.equal(false);

    appModel.set('useTraining', true);

    sample = getRandomSample();
    expect(sample.metadata.training).to.be.equal(true);
  });

  it('should not resend', done => {
    const sample = getRandomSample(validTaxon);
    sample.id = 123;
    sample.metadata.server_on = new Date();
    sample
      .save(null, { remote: true })
      .then(() => {
        expect(sampleRemoteCreateStub.calledOnce).to.be.false;
        done();
      })
      .catch(done);
  });

  describe('getKeys', () => {
    it.skip('should call getSurvey and return its sample attrs', () => {
      expect(false).to.be.equal(true);
    });
  });

  describe('validation', () => {
    it('should return sample send false invalid if not saved', () => {
      const sample = getRandomSample();
      delete sample.metadata.saved;
      sample.setTaxon(validTaxon);
      expect(sample.validate).to.be.a('function');
      sample.clear();

      const invalids = sample.validate(null, { remote: true });
      expect(invalids.attributes.send).to.be.false;
    });

    it('should return attributes and occurrence objects with invalids', () => {
      const sample = getRandomSample();
      sample.metadata.saved = true;
      sample.clear();

      let invalids = sample.validate({}, { remote: true });
      expect(invalids)
        .to.be.an('object')
        .and.have.all.keys('attributes', 'occurrences', 'samples');

      // sample
      expect(invalids.attributes).to.have.all.keys(
        'date',
        'location',
        'location name'
      );

      // occurrence
      expect(invalids.occurrences).to.be.an('object').and.to.be.empty;

      const occ = new Occurrence();
      sample.addOccurrence(occ);
      invalids = sample.validate(null, { remote: true });
      expect(invalids.occurrences).to.not.be.empty;
      expect(invalids.occurrences).to.have.property(occ.cid);
    });
  });

  describe('setToSend', () => {
    it('should set the saved flag in sample metadata', () => {
      const sample = getRandomSample();
      sample.setToSend();
      expect(sample.metadata.saved).to.be.true;
    });

    it('should return a promise', () => {
      const sample = getRandomSample();
      const promise = sample.setToSend();
      expect(promise).to.be.an.instanceof(Promise);
    });

    it('should not send if invalid, but set validationError', () => {
      const sample = getRandomSample();
      delete sample.attributes.location;
      delete sample.metadata.saved;
      const valid = sample.setToSend();
      expect(valid).to.be.false;

      expect(sample.validationError).to.be.an('object');
      expect(sample.metadata.saved).to.be.false;
    });
  });

  describe('GPS extension', () => {
    it('has GPS functions', () => {
      const sample = new Sample();
      expect(sample.startGPS).to.be.a('function');
      expect(sample.stopGPS).to.be.a('function');
      expect(sample.isGPSRunning).to.be.a('function');
    });
  });

  describe('onSend', () => {
    let devicePlatformStub;
    let deviceVersionStub;
    before(() => {
      devicePlatformStub = sinon.stub(Device, 'getPlatform');
      deviceVersionStub = sinon.stub(Device, 'getVersion');
    });

    after(() => {
      devicePlatformStub.restore();
      deviceVersionStub.restore();
    });
    function getFullRandomSample() {
      const occ = new Occurrence({
        taxon: validTaxon,
      });
      const sample = new Sample(
        {
          location: {
            latitude: 12.12,
            longitude: -0.23,
            name: 'automatic test',
          },
        },
        {
          occurrences: [occ],
          Collection: savedSamples,
        }
      );
      return sample;
    }

    it('should return a promise', () => {
      const sample = getFullRandomSample();
      expect(sample.onSend()).to.be.instanceOf(Promise);
    });

    it('should not modify original submission', done => {
      const sample = getFullRandomSample();
      const submission = {};
      sample
        .onSend(submission)
        .then(() => {
          expect(Object.keys(submission).length).to.eql(0);
          done();
        })
        .catch(done);
    });

    it('should add survey id', done => {
      const sample = getFullRandomSample();
      const submission = {};
      sample
        .onSend(submission)
        .then(returns => {
          expect(returns[0].survey_id).to.exist;
          done();
        })
        .catch(done);
    });

    it('should add input form', done => {
      const sample = getFullRandomSample();
      const submission = {};
      sample
        .onSend(submission)
        .then(returns => {
          expect(returns[0].input_form).to.exist;
          done();
        })
        .catch(done);
    });

    it('should add a device platform', done => {
      devicePlatformStub.returns('Android');

      const sample = getFullRandomSample();
      const smpAttrs = sample.getSurvey().attrs.smp;
      const submission = {};
      sample
        .onSend(submission)
        .then(returns => {
          expect(returns[0].fields[smpAttrs.device.id]).to.eql(
            smpAttrs.device.values.Android
          );
          done();
        })
        .catch(done);
    });

    it('should add a device version', done => {
      deviceVersionStub.returns(1);

      const sample = getFullRandomSample();
      const smpAttrs = sample.getSurvey().attrs.smp;
      const submission = {};
      sample
        .onSend(submission)
        .then(returns => {
          expect(returns[0].fields[smpAttrs.device_version.id]).to.eql(1);
          done();
        })
        .catch(done);
    });

    it('should add a app version', done => {
      const sample = getFullRandomSample();

      const smpAttrs = sample.getSurvey().attrs.smp;
      const submission = {};
      sample
        .onSend(submission)
        .then(returns => {
          expect(returns[0].fields[smpAttrs.app_version.id]).to.exist;
          done();
        })
        .catch(done);
    });
  });
});
