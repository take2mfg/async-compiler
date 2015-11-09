import { expect } from 'chai';
import fs from 'fs';
import nock from 'nock';

import { getSpyableCompiler } from './support/test_utils';

const take2ApiHost   = 'http://take2-loopback.herokuapp.com/api/v1';
const take2SecretKey = 'sk_somefakekey';

const baseDir = './test/fixtures';

function getCompilerWithFixture(fixtureName) {
  let compiler = getSpyableCompiler();
    
  let basicYAML = fs.readFileSync(baseDir + `/${fixtureName}`, 'utf8');
  compiler.NEXT_S3_RESPONSE = {
    Body: basicYAML
  };

  return compiler;
}


describe('YAML context', () => {

  before(() => {
    nock.disableNetConnect();
  });

  after(() => {
    nock.enableNetConnect();
  });

  describe('basic yaml file', () => {
    let compiler;
    before(() => {
      compiler = getCompilerWithFixture('basic.yaml');
    });


    it('gets context needed for home page', () => {
      const featuredBannersResponse = {
        items: ['some', 'items', 'here']
      };
      
      nock(take2ApiHost)
        .get('/customizables?filter%5Bwhere%5D%5BgroupId%5D=3')
        .reply(200, featuredBannersResponse)
        .matchHeader('authorization', `Bearer ${take2SecretKey}`);

      const featuredSignsResponse = {
        items: ['signs', 'here']
      };
      nock(take2ApiHost)
        .get('/customizables?filter%5Bwhere%5D%5BgroupId%5D=5')
        .reply(200, featuredSignsResponse);

      const githubResponse = {
        pulls: ['some', 'prs']
      };
      nock('http://api.github.example.com/')
        .get('/pulls?user=myuser')
        .reply(200, githubResponse);

      return compiler.yamlContext.getYAMLContextFor('index')
        .then(context => {
          expect(context).to.deep.equal({
            title: 'FastBannerSigns.com',
            'fb-info': 'Info to show to facebook crawler',
            'twitter-info': 'Info that twitter crawler grabs',

            'categories': [
              {
                'key'   : 'parent',
                'name'  : 'Parent',
                'slug'  : 'parent',
                'group' : 'parent-group',
                'children' : [
                  {
                    'key'   : 'child',
                    'name'  : 'Child',
                    'slug'  : 'child',
                    'group' : 'child-group',
                    'children' : [
                      {
                        'key'   : 'child-child',
                        'name'  : 'child-child',
                        'slug'  : 'child-child',
                        'group' : 'child-child'
                      }
                    ]
                  },
                  {
                    'key'   : 'child-with-defaults',
                    'name'  : 'child-with-defaults',
                    'slug'  : 'child-with-defaults',
                    'group' : 'child-with-defaults'
                  }
                ]
              },
            ],
            
            'featured-banners': {
              path: `${take2ApiHost}/customizables`,
              response: featuredBannersResponse
            },
            'featured-signs': {
              path: `${take2ApiHost}/customizables`,
              response: featuredSignsResponse
            },
            'pull-requests': {
              path: 'http://api.github.example.com/pulls?user=myuser',
              response: githubResponse
            },
          });
        });
    });


    it('gets context needed for freeway signs landing page', () => {
      const productTemplatePairsResponse = {"freeway-signs":{"path":"http://localhost:5000/api/v1/productTemplatePairs","response":{"data":[{"type":"productTemplatePairs","id":"null-1-null","relationships":{"template":{"data":{"type":"templates","id":"1"}}}}],"included":[{"type":"templates","id":1,"attributes":{"account":1,"ownerUser":null,"name":"My temp","description":null}}]}}};
      nock(take2ApiHost)
        .get('/customizables?filter%5Bwhere%5D%5BgroupId%5D=1')
        .matchHeader('authorization', `Bearer ${take2SecretKey}`)
        .reply(200, productTemplatePairsResponse);

      const productResponse = { some: 'response', id: 13 };
      nock(take2ApiHost)
        .get('/products/13')
        .matchHeader('authorization', `Bearer ${take2SecretKey}`)
        .reply(200, productResponse);

      const templateResponse = { some: 'template response', id: 14 };
      nock(take2ApiHost)
        .get('/templates/14?include=faces%2Cfaces.designs')
        .matchHeader('authorization', `Bearer ${take2SecretKey}`)
        .reply(200, templateResponse);

      return compiler.yamlContext.getYAMLContextFor('freeway-signs')
        .then(context => {
          expect(context.title).to.be.equal('FastBannerSigns.com');
          expect(context['fb-info']).to.be.equal('Info to show to facebook crawler');
          expect(context['twitter-info']).to.be.equal('Info that twitter crawler grabs');

          expect(context.category.response).to.deep.equal(productTemplatePairsResponse);
          // TODO: match take2 group name
          // expect(context.category['display-name']).to.be.equal('The freeway signs');

          expect(context['my-featured-product'].response).to.deep.equal(productResponse);
          expect(context['my-featured-template-with-includes']).to.exist;
        });
    });


    it('gets context needed for "parent" category page, even with no site defined for it', () => {
      const productTemplatePairsResponse = {"freeway-signs":{"path":"http://localhost:5000/api/v1/productTemplatePairs","response":{"data":[{"type":"productTemplatePairs","id":"null-1-null","relationships":{"template":{"data":{"type":"templates","id":"1"}}}}],"included":[{"type":"templates","id":1,"attributes":{"account":1,"ownerUser":null,"name":"My temp","description":null}}]}}};
      nock(take2ApiHost)
        .get('/customizables?filter%5Bwhere%5D%5BgroupId%5D=37')
        .matchHeader('authorization', `Bearer ${take2SecretKey}`)
        .reply(200, productTemplatePairsResponse);

      return compiler.yamlContext.getYAMLContextFor('parent')
        .then(context => {
          expect(context.title).to.be.equal('FastBannerSigns.com');
          expect(context['fb-info']).to.be.equal('Info to show to facebook crawler');
          expect(context['twitter-info']).to.be.equal('Info that twitter crawler grabs');

          expect(context.category.response).to.deep.equal(productTemplatePairsResponse);
        });
    });


    it('reject for not declared page', () => {
      return compiler.yamlContext.getYAMLContextFor('not-declared-in-yaml')
        .should.be.rejected;
    });


    it('reject for not being called nested under its parent', () => {
      return compiler.yamlContext.getYAMLContextFor('summer-party-banners')
        .should.be.rejected;
    });


    it('gets nested category context', () => {
      const productTemplatePairsResponse = {"freeway-signs":{"path":"http://localhost:5000/api/v1/productTemplatePairs","response":{"data":[{"type":"productTemplatePairs","id":"null-1-null","relationships":{"template":{"data":{"type":"templates","id":"1"}}}}],"included":[{"type":"templates","id":1,"attributes":{"account":1,"ownerUser":null,"name":"My temp","description":null}}]}}};
      nock(take2ApiHost)
        .get('/customizables?filter%5Bwhere%5D%5BgroupId%5D=47')
        .matchHeader('authorization', `Bearer ${take2SecretKey}`)
        .reply(200, productTemplatePairsResponse);

      return compiler.yamlContext.getYAMLContextFor('parent/child')
        .then(context => {
          expect(context.title).to.be.equal('FastBannerSigns.com');
          expect(context['fb-info']).to.be.equal('Info to show to facebook crawler');
          expect(context['twitter-info']).to.be.equal('Info that twitter crawler grabs');

          expect(context.category.response).to.deep.equal(productTemplatePairsResponse);
          expect(context.category['display-name']).to.be.equal('Child');
        });
    });
    
  });

});
