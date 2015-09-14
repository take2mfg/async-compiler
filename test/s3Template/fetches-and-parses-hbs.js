import { expect } from 'chai';
import fs from 'fs';
import cheerio from 'cheerio';

import { getSpyableCompiler } from '../testUtils';


const baseDir = './test/s3Template/fixtures';


function getCompilerWithFixture(fixtureName) {
  let compiler = getSpyableCompiler();
    
  let baseHBS = fs.readFileSync(baseDir + `/${fixtureName}`, 'utf8');
  compiler.NEXT_S3_RESPONSE = {
    Body: baseHBS
  };

  return compiler;
}


describe('S3Template', () => {

  it('fetches home, compiles it and adds the right context', () => {
    let compiler = getCompilerWithFixture('base.hbs');

    return compiler.s3Template.fetchTemplateFor('home')
      .then(template => {
        expect(compiler.LAST_FETCH_FROM_S3.key).to.be.equal('home.hbs');

        const context = {
          title: 'My Page',
          'featured-banners': {
            response: {
              description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Ratione earum culpa iste nihil cupiditate soluta dolorem quaerat, quis unde inventore accusamus, repellat neque tempore praesentium similique reiciendis velit, facere dolor.'
            }
          }
        };
        const renderedPage = template(context);
        const $ = cheerio.load(renderedPage);
        
        expect($('title').html()).to.be.equal(context.title);
        expect($('.lorem').html().trim()).to.be.equal(context['featured-banners'].response.description);
      });
  });

});
