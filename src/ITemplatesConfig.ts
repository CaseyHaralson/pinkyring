/** Object shape for the templates.json file */
export interface ITemplatesConfig {
  /** the list of template options */
  options: ITemplateOption[];
}

/** A template option's properties */
export interface ITemplateOption {
  /**
   * The name of the repository.
   * Instances of this name in the repo will be replaced with the new project name.
   */
  name: string;
  /**
   * The repo url (like "owner/repo-name").
   * The repo-name should match the name property of this object.
   */
  repo: string;
}
