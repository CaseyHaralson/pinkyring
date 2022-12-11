"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.render = void 0;
const ejs_1 = __importDefault(require("ejs"));
function render(content, data) {
    return ejs_1.default.render(content, data);
}
exports.render = render;
