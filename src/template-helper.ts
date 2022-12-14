export interface TemplateData {
  projectName: string;
  selectedTemplate: string;
}

export function render(content: string, data: TemplateData) {
  if (content) {
    const simpleTemplateName = data.selectedTemplate
      .replaceAll('-', '')
      .replaceAll('_', '');
    let newContent = content.replaceAll(
      data.selectedTemplate,
      data.projectName
    );
    newContent = newContent.replaceAll(simpleTemplateName, data.projectName);
    return newContent;
  }
  return content;
}
