import { rmSync } from "node:fs"

rmSync("dist/fonts", { recursive: true, force: true })
