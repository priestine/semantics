import { SemanticsCtx } from '../interfaces/semantics-intermediate.interface';
import { Log } from '../utils/log.util';
import { Iro } from '@priestine/iro/src';
import { execPromise } from '../utils/exec-promise.util';
import { appendFileSync, existsSync, readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';

export function publishTagIfRequired({ intermediate }: SemanticsCtx) {
  if (!intermediate.publishTag) {
    Log.info('Skipping publishing newly created tag...');

    return intermediate;
  }

  if (!intermediate.privateToken) {
    Log.error('Private token not specified');
    process.exit(1);
  }

  if (!existsSync('./CHANGELOG.md')) {
    Log.warning('CHANGELOG.md is not in place. Creating the file.');
    writeFileSync('./CHANGELOG.md', '', 'ut8');
  }

  const changelog = readFileSync('./CHANGELOG.md', 'utf8');
  writeFileSync('./CHANGELOG.md', intermediate.tagMessageContents.concat('\n').concat(changelog));
  execSync('git add ./CHANGELOG.md');
  execSync(`git commit -m "docs(changelog): add ${intermediate.newVersion} changes"`);
  execSync(`git push`);

  execPromise(`git tag -am "${intermediate.tagMessageContents}" ${intermediate.newVersion}`)
    .then(() => execPromise(`git push origin ${intermediate.newVersion}`))
    .catch(Log.error);
}
