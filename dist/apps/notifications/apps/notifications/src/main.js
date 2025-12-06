"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const notifications_module_1 = require("./notifications.module");
const microservices_1 = require("@nestjs/microservices");
const common_1 = require("../../../libs/common/src");
async function bootstrap() {
    const app = await core_1.NestFactory.createMicroservice(notifications_module_1.NotificationsModule, {
        transport: microservices_1.Transport.RMQ,
        options: {
            urls: [process.env.RabbitMQ_URL || 'amqp://localhost:5672'],
            queue: common_1.QUEUES.NOTIFICATIONS_QUEUE,
            queueOptions: {
                durable: false
            },
        },
    });
    app.useGlobalFilters(new common_1.RpcExceptionFilterMicroservice());
    await app.listen();
}
bootstrap();
//# sourceMappingURL=main.js.map