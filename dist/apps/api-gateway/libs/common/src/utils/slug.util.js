"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSlug = generateSlug;
const slugify_1 = require("slugify");
function generateSlug(name) {
    return (0, slugify_1.default)(name, {
        lower: true,
        strict: true,
    });
}
//# sourceMappingURL=slug.util.js.map