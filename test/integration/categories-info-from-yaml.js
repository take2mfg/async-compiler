import { expect } from 'chai';
import nock from 'nock';

import { getMockCompiler } from '../support/test_utils';


const appYAML = `
site:
  title: 'BASE SITE TEMPLATE'
  # users can put arbitrary data here
  fb-info: 'Info to show to facebook crawler'
  twitter-info: 'Info that twitter crawler grabs'


pages:
  index:
    needs:
      featured-banners:
        type: sellables
        groupId: 120
        adapter: take2


categories:

  featured-banners:
    type: sellables
    groupId: 120
    adapter: take2

  magnetic-signs:
    display-name: "Magnetics"
    slug: 'magnetic-signs'
    group: 'magnetic-signs'
    children:

      lawn-care-magnetic-signs:
        display-name: "Lawn Care Magnetics"
        slug: 'lawn-care-magnetic-signs'
        group: 'lawn-care-magnetic-signs'

  for-sale-signs:
    display-name: "For Sale Signs"
    groupId: 87

  for-sale-signs-lb:
    display-name: "For Sale Signs In Loopback"
    groupId: 120

  large-banners:
    display-name: "Large Banners"
    slug: 'large-banners'
    groupId: 120
    children:

      party-banners:
        display-name: "Party Banners"
        slug: 'party-banners'
        group: 'banners-party'

      for-sale-banners:
        display-name: 'For Sale Banners'
        slug: 'for-sale-banners'
        group: 'banners-for-sale'
        children:

          large-for-sale-banners:
            display-name: "Large For Sale Banners"
            slug: 'large-for-sale-banners'
            group: 'large-for-sale-banners'

  small-banners:
    display-name: "Small Banners"
    slug: 'small-banners'
    group: 'banners-sm'
    children:

      sign-banners:
        display-name: "Sign Banners"
        slug: 'sign-banners'
        group: 'banners-sign'
`;


describe('Categories info from YAML', () => {

  beforeEach(() => {
    nock.disableNetConnect();
  });

  afterEach(() => {
    nock.enableNetConnect();
    nock.cleanAll();
  });


  it('fetches the fallback', function() {
    let compiler = getMockCompiler();

    nock('https://test-default-bucket.s3.amazonaws.com:443')
      .get('/app.yaml')
      .reply(200, appYAML);

    nock('http://take2-loopback.herokuapp.com')
      .get('/api/v1/sellables?filter%5Bwhere%5D%5BgroupId%5D=120')
      .reply(200, {});


    return compiler.yamlContext.getYAMLContextFor('index')
      .then(context => {
        expect(context.categories).to.deep.equal([
          {
            "key": "featured-banners",
            "name": "featured-banners",
            "slug": "featured-banners",
            "url": "/featured-banners",
            "groupId": 120
          },
          {
            "key": "magnetic-signs",
            "name": "Magnetics",
            "slug": "magnetic-signs",
            "group": "magnetic-signs",
            "url": "/magnetic-signs",
            "children": [
              {
                "key": "lawn-care-magnetic-signs",
                "name": "Lawn Care Magnetics",
                "slug": "lawn-care-magnetic-signs",
                "group": "lawn-care-magnetic-signs",
                "url": "/magnetic-signs/lawn-care-magnetic-signs"
              }
            ]
          },
          {
            "key": "for-sale-signs",
            "name": "For Sale Signs",
            "slug": "for-sale-signs",
            "url": "/for-sale-signs",
            "groupId": 87
          },
          {
            "key": "for-sale-signs-lb",
            "name": "For Sale Signs In Loopback",
            "slug": "for-sale-signs-lb",
            "url": "/for-sale-signs-lb",
            "groupId": 120
          },
          {
            "key": "large-banners",
            "name": "Large Banners",
            "slug": "large-banners",
            "url": "/large-banners",
            "groupId": 120,
            "children": [
              {
                "key": "party-banners",
                "name": "Party Banners",
                "slug": "party-banners",
                "url": "/large-banners/party-banners",
                "group": "banners-party"
              },
              {
                "key": "for-sale-banners",
                "name": "For Sale Banners",
                "slug": "for-sale-banners",
                "url": "/large-banners/for-sale-banners",
                "group": "banners-for-sale",
                "children": [
                  {
                    "key": "large-for-sale-banners",
                    "name": "Large For Sale Banners",
                    "slug": "large-for-sale-banners",
                    "url": "/large-banners/for-sale-banners/large-for-sale-banners",
                    "group": "large-for-sale-banners"
                  }
                ]
              }
            ]
          },
          {
            "key": "small-banners",
            "name": "Small Banners",
            "slug": "small-banners",
            "url": "/small-banners",
            "group": "banners-sm",
            "children": [
              {
                "key": "sign-banners",
                "name": "Sign Banners",
                "slug": "sign-banners",
                "url": "/small-banners/sign-banners",
                "group": "banners-sign"
              }
            ]
          }
        ]);
      });
  });

});
