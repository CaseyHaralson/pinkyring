export interface IPinkyringConfig {
  templateName: string;
  pinkyringVersion: string;
  removableOptions: TemplateRemovableOption[];
}

export interface TemplateRemovableOption {
  label: string;
  description?: string;
  warning?: string;
  removed?: boolean;
  globPatterns?: string[];
  contentPattern?: string;
  typescriptReferences?: string[];
  packageNames?: string[];
}
