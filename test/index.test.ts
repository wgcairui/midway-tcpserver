import { Framework, IMidwayTcpApplication } from "../src"
import { createApp, close } from "@midwayjs/mock"
import { connect } from "net"
import { once } from "events"

describe("tcpServer", () => {

    let app: IMidwayTcpApplication

    beforeAll(async () => {
        try {
            app = await createApp<Framework>(process.cwd(), { port: 3000 }, Framework)


        } catch (err) {
            console.error('test beforeAll error', err);
            throw err;
        }
    })

    afterAll(async () => {
        await close(app)
    })
    it("test", async () => {

        const con = connect({ port: 3000 })
        //con.on("connect")
        const data = await once(con, "connect")

        console.log(data);

        expect(data).toBe("*")



        await close(app)

    })
})