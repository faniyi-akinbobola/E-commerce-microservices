// import { Test, TestingModule } from '@nestjs/testing';
// import { ShippingService } from './shipping.service';
// import { getRepositoryToken } from '@nestjs/typeorm';
// import { Shipment } from './entities/shipment.entity';
// import { Repository } from 'typeorm';
// import { RpcException } from '@nestjs/microservices';

// describe('ShippingService', () => {
//   let service: ShippingService;
//   let shipmentRepository: jest.Mocked<Repository<Shipment>>;

//   const mockShipment = {
//     id: 'shipment-1',
//     orderId: 'order-1',
//     trackingNumber: 'TRACK123',
//     carrier: 'UPS',
//     status: 'PENDING',
//     estimatedDelivery: new Date(),
//     createdAt: new Date(),
//     updatedAt: new Date(),
//   };

//   const mockShipmentRepository = {
//     create: jest.fn(),
//     save: jest.fn(),
//     findOne: jest.fn(),
//     find: jest.fn(),
//     update: jest.fn(),
//   };

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       providers: [
//         ShippingService,
//         {
//           provide: getRepositoryToken(Shipment),
//           useValue: mockShipmentRepository,
//         },
//       ],
//     }).compile();

//     service = module.get<ShippingService>(ShippingService);
//     shipmentRepository = module.get(getRepositoryToken(Shipment));
//   });

//   afterEach(() => {
//     jest.clearAllMocks();
//   });

//   it('should be defined', () => {
//     expect(service).toBeDefined();
//   });

//   describe('createShipment', () => {
//     it('should create a new shipment', async () => {
//       const dto = {
//         orderId: 'order-1',
//         carrier: 'UPS',
//         trackingNumber: 'TRACK123',
//       };

//       mockShipmentRepository.create.mockReturnValue(mockShipment as any);
//       mockShipmentRepository.save.mockResolvedValue(mockShipment as any);

//       const result = await service.createShipment(dto as any);

//       expect(mockShipmentRepository.create).toHaveBeenCalled();
//       expect(mockShipmentRepository.save).toHaveBeenCalled();
//       expect(result).toEqual(mockShipment);
//     });
//   });

//   describe('getShipmentByOrderId', () => {
//     it('should retrieve shipment by order ID', async () => {
//       mockShipmentRepository.findOne.mockResolvedValue(mockShipment as any);

//       const result = await service.getShipmentByOrderId('order-1');

//       expect(mockShipmentRepository.findOne).toHaveBeenCalledWith({
//         where: { orderId: 'order-1' },
//       });
//       expect(result).toEqual(mockShipment);
//     });

//     it('should throw error if shipment not found', async () => {
//       mockShipmentRepository.findOne.mockResolvedValue(null);

//       await expect(service.getShipmentByOrderId('order-999')).rejects.toThrow(
//         RpcException,
//       );
//     });
//   });

//   describe('getShipmentByTrackingNumber', () => {
//     it('should retrieve shipment by tracking number', async () => {
//       mockShipmentRepository.findOne.mockResolvedValue(mockShipment as any);

//       const result = await service.getShipmentByTrackingNumber('TRACK123');

//       expect(mockShipmentRepository.findOne).toHaveBeenCalledWith({
//         where: { trackingNumber: 'TRACK123' },
//       });
//       expect(result).toEqual(mockShipment);
//     });

//     it('should throw error if shipment not found', async () => {
//       mockShipmentRepository.findOne.mockResolvedValue(null);

//       await expect(
//         service.getShipmentByTrackingNumber('TRACK999'),
//       ).rejects.toThrow(RpcException);
//     });
//   });

//   describe('updateShipmentStatus', () => {
//     it('should update shipment status', async () => {
//       const dto = {
//         shipmentId: 'shipment-1',
//         status: 'SHIPPED',
//       };

//       mockShipmentRepository.findOne.mockResolvedValue(mockShipment as any);
//       mockShipmentRepository.save.mockResolvedValue({
//         ...mockShipment,
//         status: 'SHIPPED',
//       } as any);

//       const result = await service.updateShipmentStatus(dto as any);

//       expect(mockShipmentRepository.save).toHaveBeenCalled();
//       expect(result.status).toBe('SHIPPED');
//     });

//     it('should throw error if shipment not found', async () => {
//       const dto = {
//         shipmentId: 'shipment-999',
//         status: 'SHIPPED',
//       };

//       mockShipmentRepository.findOne.mockResolvedValue(null);

//       await expect(service.updateShipmentStatus(dto as any)).rejects.toThrow(
//         RpcException,
//       );
//     });
//   });

//   describe('getAllShipments', () => {
//     it('should retrieve all shipments', async () => {
//       const shipments = [mockShipment];
//       mockShipmentRepository.find.mockResolvedValue(shipments as any);

//       const result = await service.getAllShipments();

//       expect(mockShipmentRepository.find).toHaveBeenCalled();
//       expect(result).toEqual(shipments);
//     });
//   });
// });
