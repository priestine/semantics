import { Shell } from '@totemish/shell';
import { execPromise } from './utils/exec-promise';
import { buildChangelog } from './utils/build-changelog';
import { catchError } from './utils/catch-promise';
import { commitFormat } from './utils/commit-format';
import { normalizeChanges } from './utils/normalize-changes';
import { normalizeBody } from './utils/normalize-body';
import { extractCommitTypes } from './utils/extract-commit-types';
import { extractBreakingChanges } from './utils/extract-breaking-changes';
import { getAmendMajor } from './utils/get-amend-major';
import { getAmendMinor } from './utils/get-amend-minor';
import { getAmendPatch } from './utils/get-amend-patch';
import { changeVersion } from './utils/change-version';
import { getSubjects } from './utils/get-subjects';
import { getBreakingChanges } from './utils/get-breaking-changes';

execPromise('git rev-parse HEAD')
  .then((currentCommit: string) => {
    execPromise('git rev-parse --abbrev-ref HEAD')
      .then((branch: string) => {
        execPromise('git describe --tags `git rev-list --tags --max-count=1`')
          .then((currentTag: string) => {
            const versionChanger = changeVersion(currentTag);

            execPromise(`git show-ref ${currentTag} -s`)
              .then((latestTaggedCommit: string) => {
                execPromise(`git rev-list ${latestTaggedCommit}..HEAD --no-merges --format='${commitFormat}'`)
                  .then((changes: string) => {
                    const normalizedChanges = JSON.parse(normalizeChanges(changes))
                      .map(normalizeBody)
                      .map(extractCommitTypes)
                      .map(extractBreakingChanges);
                    normalizedChanges.map((x) => Shell.write(x));
                    const getCommitSubjects = getSubjects(normalizedChanges);
                    const amendMajor = getAmendMajor(normalizedChanges);
                    const amendMinor = getAmendMinor(normalizedChanges);
                    const amendPatch = getAmendPatch(normalizedChanges);
                    const newVersion = versionChanger(amendMajor, amendMinor, amendPatch);
                    const features = getCommitSubjects('feat');
                    const fixes = getCommitSubjects('fix');
                    const chores = getCommitSubjects('chore');
                    const reverts = getCommitSubjects('revert');
                    const tests = getCommitSubjects('test');
                    const refactors = getCommitSubjects('refactor');
                    const perfs = getCommitSubjects('perf');
                    const builds = getCommitSubjects('build');
                    const cis = getCommitSubjects('ci');
                    const breakingChanges = getBreakingChanges(normalizedChanges);
                    const changeLog = buildChangelog(
                      newVersion,
                      features,
                      fixes,
                      chores,
                      reverts,
                      tests,
                      refactors,
                      perfs,
                      builds,
                      cis,
                      breakingChanges
                    );
                    console.log(changeLog);
                  })
                  .catch(catchError);
              })
              .catch(catchError);
          })
          .catch(catchError);
      })
      .catch(catchError);
  })
  .catch(catchError);
