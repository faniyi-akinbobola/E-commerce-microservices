"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paginate = paginate;
function paginate(items, total, options = {}) {
    const page = options.page && options.page > 0 ? options.page : 1;
    const limit = options.limit && options.limit > 0 ? options.limit : 10;
    return {
        data: items,
        meta: {
            pagination: {
                total,
                page,
                pageSize: limit,
            },
        },
    };
}
//# sourceMappingURL=paginate.js.map