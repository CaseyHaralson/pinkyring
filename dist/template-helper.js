"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.render = void 0;
/**
 * Replace all instances of the template project name with the new project name.
 * The template project name is cleaned of "-" and "_" before the replacement.
 *
 * @param content a string of the file content from the template
 * @param data data necessary for the replacement
 * @returns returns the file content but with the replaced name
 */
function render(content, data) {
    if (content) {
        const simpleTemplateName = data.selectedTemplate
            .replaceAll('-', '')
            .replaceAll('_', '');
        let newContent = content.replaceAll(data.selectedTemplate, data.projectName);
        newContent = newContent.replaceAll(simpleTemplateName, data.projectName);
        return newContent;
    }
    return content;
}
exports.render = render;
