import { ConfigInterface } from './config.interface';
import { MiddlewareContextInterface } from '@priestine/data';
import { CommitInterface } from './commit.interface';

/**
 * SemanticsIntermediate describes internal properties that @priestine/semantics creates and uses
 * internally during its execution. These values cannot be set from outside or overriden.
 */
export interface SemanticsIntermediate extends ConfigInterface {
  /**
   * Hash of current commit.
   */
  currentCommitHash: string;

  /**
   * The latest version tag found (the name).
   */
  latestVersionTag: string;

  /**
   * The latest version tag found (the commit hash).
   */
  latestVersionCommitHash: string;

  /**
   * Array of commits found since latest version was released.
   */
  commitsSinceLatestVersion: string | CommitInterface[];

  /**
   * A tuple of three numbers representing each part of semantic version.
   */
  versionTuple: [number, number, number];

  /**
   * Deducted version to be published based on the latest version and the changes since last release.
   */
  newVersion: string;

  /**
   * Tag message to be assigned as release notes.
   */
  tagMessageContents: string;
}

/**
 * Shortcut type for defining middleware argument type within @priestine/semantics.
 */
export type SemanticsCtx = MiddlewareContextInterface<SemanticsIntermediate>;
