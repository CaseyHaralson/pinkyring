/**
 * Replace all instances of the template project name with the new project name.
 * The template project name is cleaned of "-" and "_" before the replacement.
 *
 * Also replaces "<pinkyring.selected_template_name>" with the selected template name.
 *
 * @param content a string of the file content from the template
 * @param templateName the name of the template project
 * @param newProjectName the name of the new project
 * @returns returns the file content but with the replaced name
 */
export function render(
  content: string,
  templateName: string,
  newProjectName: string
) {
  if (content) {
    const simpleTemplateName = templateName
      .replaceAll('-', '')
      .replaceAll('_', '');
    const re = new RegExp(`${templateName}|${simpleTemplateName}`, 'gi');
    let newContent = content.replace(re, newProjectName);
    newContent = newContent.replaceAll(
      '<pinkyring.selected_template_name>',
      templateName
    );
    return newContent;
  }
  return content;
}
