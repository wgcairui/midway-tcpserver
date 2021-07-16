import { Framework } from "../dist"
import { create } from "@midwayjs/mock"
import { join } from "path"

describe("tcpServer", () => {
    it("test", async () => {
        const framework = create<Framework>(join(__dirname, "src"), { port: 3000 })
    })
})