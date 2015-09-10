import RSVP from 'rsvp';
import Compiler from '../lib/async-compiler';


export function getSpyableCompiler() {
  let compiler = new Compiler({
    s3KeyId: 'test-s3-key-id',
    s3AccessKey: 'test-s3-access-key',
    defaultBucket: 'test-default-bucket',
  });

  compiler.FETCHES_FROM_S3 = [];
  compiler.fetchFromS3 = function(key, bucket=compiler._bucket) {
    compiler.LAST_FETCH_FROM_S3 = {
      key,
      bucket
    };

    compiler.FETCHES_FROM_S3.push(compiler.LAST_FETCH_FROM_S3);

    return RSVP.resolve(compiler.NEXT_S3_RESPONSE || {});
  };

  return compiler;
}
