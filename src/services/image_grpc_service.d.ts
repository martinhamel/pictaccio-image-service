import { sendUnaryData, ServerUnaryCall, UntypedHandleCall } from '@grpc/grpc-js';
import { IImageServer } from 'dist/lib/grpc-service-contracts/src/image-service/image_service_v1_grpc_pb';
import { ResizeRequest, ResizeResponse, WatermarkedResizeRequest } from 'dist/lib/grpc-service-contracts/src/image-service/image_service_v1_pb';
export declare class ImageGrpcService implements IImageServer {
    [name: string]: UntypedHandleCall;
    createThumbnails(call: ServerUnaryCall<ResizeRequest, ResizeResponse>, callback: sendUnaryData<ResizeResponse>): void;
    createWatermarkedThumbnails(call: ServerUnaryCall<WatermarkedResizeRequest, ResizeResponse>, callback: sendUnaryData<ResizeResponse>): void;
}
