"use strict";
//import ejs from 'ejs';
Object.defineProperty(exports, "__esModule", { value: true });
exports.render = void 0;
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
    //return ejs.render(content, data);
}
exports.render = render;
