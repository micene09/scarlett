import { beforeAll, afterEach, afterAll } from 'vitest'
import restServer from "./tests/mock/rest-server"

beforeAll(() => restServer.listen())
afterEach(() => restServer.resetHandlers())
afterAll(() => restServer.close())