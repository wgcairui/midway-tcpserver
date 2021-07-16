import * as net from "net"
import { IMidwayApplication, IMidwayContext, IConfigurationOptions } from "@midwayjs/core"

export type IMidwayTcpApplication = IMidwayApplication<IMidwayTcpContext> & net.Server

export type IMidwayTcpConfigurationOptions = IConfigurationOptions & net.ServerOpts & net.ListenOptions & { MaxConnections?: number }

export type IMidwayTcpContext = IMidwayContext<{ app: IMidwayTcpApplication } & net.Socket>

export type Application = IMidwayTcpApplication

export interface Context extends IMidwayTcpContext { }
