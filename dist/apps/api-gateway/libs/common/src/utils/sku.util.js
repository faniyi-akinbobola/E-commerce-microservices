"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSku = generateSku;
function generateSku() {
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    const timestamp = Date.now().toString().slice(-6);
    return `SKU-${random}-${timestamp}`;
}
//# sourceMappingURL=sku.util.js.map