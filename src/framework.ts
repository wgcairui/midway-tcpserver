import { BaseFramework, getProviderId, getClassMetadata } from "@midwayjs/core"
import { listModule } from "@midwayjs/decorator"
import { IMidwayTcpApplication, IMidwayTcpConfigurationOptions, IMidwayTcpContext } from "./interface"
import * as net from "net"
import { TCPEventInfo, TCPEventTypeEnum, TCP_CONTROLLER_KEY, TCP_EVENT_KEY } from "./decorator"

interface TCPMethod {
    responseEvents?: TCPEventInfo[]
}

export class MidwayTcpServerFarmework extends BaseFramework<IMidwayTcpApplication, IMidwayTcpContext, IMidwayTcpConfigurationOptions>{
    public app!: IMidwayTcpApplication


    async applicationInitialize(options: Partial<IMidwayTcpConfigurationOptions>) {
        this.app = new net.Server() as IMidwayTcpApplication
        this.app.sockets = new Set()
    }



    protected async afterContainerReady(options: Partial<IMidwayTcpConfigurationOptions>) {
        await this.loadMidwayController();
    }

    async run() {
        await new Promise<void>(resolve => {
            this.app.listen(this.configurationOptions, () => {
                const address = this.app.address() as net.AddressInfo
                this.logger.info(`TcpServer ${address.address}:${address.port} start success`)
                this.app.setMaxListeners(this.configurationOptions.MaxConnections || 2000)
                resolve()
            })
        })


    }

    protected async beforeStop() {
        return await new Promise<void>(resolve => {
            this.app.sockets.forEach(socket => {
                socket.destroy()
            })
            this.app.close(() => {
                resolve()
            })
        })

    }

    public getFrameworkType(): any {
        return "TCPServer"
    }

    public getFrameworkName() {
        return "midway:tcpServer"
    }
    private async loadMidwayController() {
        // 获取所有装饰了TCPControll的类
        const controllerModules = listModule(TCP_CONTROLLER_KEY);
        for (const target of controllerModules) {
            const providerId = getProviderId(target);

            if (providerId) {
                await this.addEmint(target, providerId)
            }
        }
    }

    /**
     * 添加监听
     * @param target 
     * @param providerId 
     */
    private async addEmint(target: any, providerId: string) {

        this.app.on("connection", async (socket: IMidwayTcpContext) => {
            

            this.app.sockets.add(socket)
            socket.on("close", () => {
                this.app.sockets.delete(socket)
            })
            // 注册上下文
            this.app.createAnonymousContext(socket)
            // 注册组件
            socket.requestContext.registerObject("socket", socket)
            socket.app = this.app

            const tcpEvents: TCPEventInfo[] = getClassMetadata(TCP_EVENT_KEY, target)
            // console.log({ tcpEvents });

            const methodMap: Record<string, TCPMethod> = {}
            for (let event of tcpEvents) {
                methodMap[event.propertyName] = methodMap[event.propertyName] || { responseEvents: [] }

                // 控制器controll
                const controller = await socket.requestContext.getAsync(providerId) as any

                // result是控制器方法返回的结果
                switch (event.eventType) {
                    case TCPEventTypeEnum.ON_CONNECTION:
                        {
                            // 执行connecting操作
                            const result = await controller[event.propertyName].apply(controller, socket)
                            await this.bindSocketResponse(result, socket, event.propertyName, methodMap)

                        }
                        break;

                    case TCPEventTypeEnum.ON_DISCONNECTION:
                        {
                            // 监听断开,执行disconnecting操作
                            socket.on("disconnecting", async (reason: string) => {
                                const result = await controller[event.propertyName].apply(controller, [reason])
                                await this.bindSocketResponse(result, socket, event.propertyName, methodMap)
                            })
                        }
                        break

                    case TCPEventTypeEnum.ON_MESSAGE:
                        {
                            // 监听绑定事件,
                            socket.on(event.messageEventName!, async (buffer: Buffer | string) => {
                                const result = await controller[event.propertyName].apply(controller, [buffer])
                                await this.bindSocketResponse(result, socket, event.propertyName, methodMap)
                            })
                        }
                        break

                    default:
                        {
                            methodMap[event.propertyName].responseEvents!.push(event)
                        }
                        break;
                }
            }
            // console.log({ methodMap });
        })
    }

    /**
     * 处理监听处理程序返回的数据,当有Emit或Write装饰器,发送数据
     * @param result 
     * @param socket 
     * @param propertyName 
     * @param methodMap 
     */
    async bindSocketResponse(result: any, socket: IMidwayTcpContext, propertyName: string, methodMap: Record<string, TCPMethod>) {
        if (result) {
            const du = methodMap[propertyName]
            // console.log({ result, propertyName, du: du.responseEvents });
            // 如果监听事件还有挂载的返回
            if (du && du.responseEvents && du.responseEvents.length > 0) {
                for (const tcpEventInfo of du.responseEvents) {
                    switch (tcpEventInfo.eventType) {
                        case TCPEventTypeEnum.EMIT:
                            {
                                socket.emit(tcpEventInfo.messageEventName!, result)
                            }
                            break;

                        case TCPEventTypeEnum.WRITE:
                            {
                                socket.write(result)
                            }
                            break
                    }
                }
            }
        }
    }

}