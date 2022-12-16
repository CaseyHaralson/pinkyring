/** Object shape for the .pinkyring.json file */
export interface IPinkyringConfig {
  /** the template name should match the folder name in the templates directory */
  templateName: string;
  /** the pinkyring version that this config is targeting */
  pinkyringVersion: string;
  /** 
   * Is the pinkyring.json file locked?
   * This is set to true when the pinkyring hooks have been removed from a project.
   */
  fileLocked?: boolean;
  /** list of removable options that the template has configured */
  removableOptions: TemplateRemovableOption[];
}

/** Removable option as defined by the template */
export interface TemplateRemovableOption {
  /** the label to display to the user when removing the option from the template project */
  label: string;
  /** 
   * Has this option been removed?
   * This is set to true when the option is removed by the user.
   */
  removed?: boolean;
  /** file glob patterns to remove */
  globPatterns?: string[];
  /** 
   * Content pattern inside files that can be used to remove content.
   * 
   * For example, lets use pattern of ".PINKYRING=TEST"
   * 
   * Pinkyring will look for this pattern in all the files in the project
   * and remove all lines starting with ".PINKYRING=TEST"
   * and will continue to remove all lines 
   * until (and including) it finds the ending pattern of ".PINKYRING=TEST.end"
   */
  contentPattern?: string;
  /**
   * Removes references from tsconfig.json files based on path patterns.
   * This is useful if a glob pattern completely removes a package.
   * 
   * The path pattern is a partial match.
   * So an entry of "apps/test" will remove "packages/apps/test"
   * from any tsconfig files.
   */
  typescriptReferences?: string[];
  /**
   * Removes references from package.json files based on exact package name.
   * This is useful if a glob pattern completely removes a package.
   */
  packageNames?: string[];

  // future?
  // description?: string;
  // warning?: string;
}
