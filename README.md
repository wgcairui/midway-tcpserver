# midway-tcpserver


## midway自定义TcpServer框架

*实现了自定义装饰器*
*@TCPControll注册类

*@OnConnection() 连接处理

*@OnTCPMessage() 监听数据 默认监听data事件


*@OnTCPEmit() 触发本地事件 ,比如error

*@OnTCPWrite() 写入socket信息


### 示例
```
import { Provide, Inject } from "@midwayjs/decorator"
import { TCPControll, OnConnection, Context, OnDisConnection, OnTCPMessage, OnTCPEmit, OnTCPWrite } from "@cairui/midway-tcpserver"

@Provide()
@TCPControll()
export class TcpControll {

    @Inject()
    ctx!: Context

    @OnConnection()
    async connecting() {
        console.log(this.ctx.address());

    }

    @OnDisConnection()
    async disconnecting(reason: string) {
        console.log({ reason });

    }

    @OnTCPMessage("data")
    @OnTCPEmit("datass")
    @OnTCPWrite()
    async data(arg: any) {
        console.log({ arg });
        this.ctx.once("datass", a => {
            console.log({ a }, 'datasss');
        })
        return "ddddddddddddd"
    }

    @OnTCPMessage("datass")
    async test(arg: any) {


    }

}
```

[midway文档](https://www.yuque.com/midwayjs/midway_v2)
[net文档](http://nodejs.cn/api/net.html)