import { saveClassMetadata, saveModule, Scope, ScopeEnum, attachClassMetadata } from "@midwayjs/decorator"


export const TCP_CONTROLLER_KEY = "tcp:controll"

export const TCP_EVENT_KEY = "tcp:event"

export enum TCPEventTypeEnum {
    ON_CONNECTION = 'tcp:onConnection',
    ON_DISCONNECTION = 'tcp:onDisconnection',
    ON_MESSAGE = 'tcp:onMessage',
    EMIT = 'tcp:Emit',
    WRITE = 'tcp:write'
}

export interface TCPEventInfo {
    /**
     * web socket event name in enum
     */
    eventType: TCPEventTypeEnum;
    /**
     * decorator method name
     */
    propertyName: string;

    descriptor: PropertyDescriptor;
    /**
     * the event name by user definition
     */
    messageEventName?: string;
}

/**
 * TcpServer控制器
 * @returns 
 */
export function TCPControll(): ClassDecorator {
    return (target: any) => {
        saveModule(TCP_CONTROLLER_KEY, target)

        saveClassMetadata(
            TCP_CONTROLLER_KEY,
            {
                server: 'ttt'
            },
            target
        )
        Scope(ScopeEnum.Request)(target)
    }
}

/**
 * 监听连接
 * @returns 
 */
export function OnConnection(): MethodDecorator {
    return (target, propertyKey, descriptor) => {
        attachClassMetadata(
            TCP_EVENT_KEY,
            {
                eventType: TCPEventTypeEnum.ON_CONNECTION,
                propertyName: propertyKey,
                descriptor
            } as TCPEventInfo,
            target.constructor
        )
    }
}

/**
 * 监听离线
 * @returns 
 */
export function OnDisConnection(): MethodDecorator {
    return (target, propertyKey, descriptor) => {
        attachClassMetadata(
            TCP_EVENT_KEY,
            {
                eventType: TCPEventTypeEnum.ON_DISCONNECTION,
                propertyName: propertyKey,
                descriptor
            } as TCPEventInfo,
            target.constructor
        )
    }
}

/**
 * 监听事件
 * @param messageEventName 
 * @default "data"
 * @returns 
 */
export function OnTCPMessage(messageEventName: string = "data"): MethodDecorator {
    return (target, propertyKey, descriptor) => {
        attachClassMetadata(
            TCP_EVENT_KEY,
            {
                eventType: TCPEventTypeEnum.ON_MESSAGE,
                messageEventName,
                propertyName: propertyKey,
                descriptor
            } as TCPEventInfo,
            target.constructor
        )
    }
}

/**
 * 触发本地事件
 * @param messageEventName 事件名,慎用data事件,逻辑错误将导致爆栈
 * @returns 
 */
export function OnTCPEmit(messageEventName: string): MethodDecorator {
    return (target, propertyKey, descriptor) => {
        attachClassMetadata(
            TCP_EVENT_KEY,
            {
                eventType: TCPEventTypeEnum.EMIT,
                messageEventName,
                propertyName: propertyKey,
                descriptor
            } as TCPEventInfo,
            target.constructor
        )
    }
}

/**
 * 返回客户端数据
 * @returns 
 */
export function OnTCPWrite(): MethodDecorator {
    return (target, propertyKey, descriptor) => {
        attachClassMetadata(
            TCP_EVENT_KEY,
            {
                eventType: TCPEventTypeEnum.WRITE,
                propertyName: propertyKey,
                descriptor
            } as TCPEventInfo,
            target.constructor
        )
    }
}