"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var CircuitBreakerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CircuitBreakerService = void 0;
const common_1 = require("@nestjs/common");
const CircuitBreaker = require("opossum");
let CircuitBreakerService = CircuitBreakerService_1 = class CircuitBreakerService {
    constructor() {
        this.logger = new common_1.Logger(CircuitBreakerService_1.name);
        this.circuitBreakers = new Map();
    }
    createCircuitBreaker(action, options = {}) {
        const defaultOptions = Object.assign({ timeout: 3000, errorThresholdPercentage: 50, resetTimeout: 30000, rollingCountTimeout: 10000, rollingCountBuckets: 10, name: 'default' }, options);
        const breaker = new CircuitBreaker(action, defaultOptions);
        breaker.on('open', () => {
            this.logger.warn(`Circuit breaker [${defaultOptions.name}] opened`);
        });
        breaker.on('halfOpen', () => {
            this.logger.log(`Circuit breaker [${defaultOptions.name}] half-open`);
        });
        breaker.on('close', () => {
            this.logger.log(`Circuit breaker [${defaultOptions.name}] closed`);
        });
        breaker.on('failure', (error) => {
            this.logger.error(`Circuit breaker [${defaultOptions.name}] failure: ${error.message}`);
        });
        breaker.on('timeout', () => {
            this.logger.warn(`Circuit breaker [${defaultOptions.name}] timeout`);
        });
        breaker.on('fallback', (result) => {
            this.logger.log(`Circuit breaker [${defaultOptions.name}] fallback executed`);
        });
        this.circuitBreakers.set(defaultOptions.name, breaker);
        return breaker;
    }
    getCircuitBreaker(name) {
        return this.circuitBreakers.get(name);
    }
    getAllStats() {
        const stats = {};
        this.circuitBreakers.forEach((breaker, name) => {
            stats[name] = breaker.stats;
        });
        return stats;
    }
};
exports.CircuitBreakerService = CircuitBreakerService;
exports.CircuitBreakerService = CircuitBreakerService = CircuitBreakerService_1 = __decorate([
    (0, common_1.Injectable)()
], CircuitBreakerService);
//# sourceMappingURL=circuit-breaker.service.js.map