import fetch from 'node-fetch';
import AbortController from "abort-controller"
import fastify from "fastify";

(globalThis as any).fetch = fetch;
(globalThis as any).Headers = (fetch as any).Headers;
(globalThis as any).AbortController = AbortController;

let testServer = fastify({ logger: false });
export interface ITestJsonResponse {
	fake: "model"
}
export interface ITestMirrorResponse {
	queryString: string;
	queryObject: Record<string, string>;
	headers: Record<string, string>;
	body: string;
}
export interface ITestStatusCodeResponse {
	statusText: "CustomStatusCode",
	statusCode: number
}
export async function startWebServer(port: number = 3000) {
	testServer
		.all("/json", (req, res) => {
			res.header("Content-type", "application/json");
			res.send({ fake: "model" });
		})
		.all("/text", (req, res) => {
			res.header("Content-type", "text/plain");
			res.send("text");
		})
		.get("/status-code/:code", (req, res) => {
			res.header("Content-type", "application/json");
			res.status(+(req.params as any).code);
			res.send({
				statusText: "CustomStatusCode",
				statusCode: +(req.params as any).code
			} as ITestStatusCodeResponse);
		})
		.get("/status-code/:code/empty", (req, res) => {
			res.status(+(req.params as any).code);
			res.send();
		})
		.all("/mirror", (req, res) => {
			res.header("Content-type", "application/json");
			res.send({
				queryString: req.raw.url?.split("?")[1] ?? "",
				queryObject: req.query,
				headers: req.headers,
				body: req.body
			} as ITestMirrorResponse);
		})
		.all("/reply-in/:ms/milliseconds", (req, res) => {
			res.header("Content-type", "text/plain");
			setTimeout(() => {
				res.send("ok");
			}, +(req.params as any).ms);
		});
	await testServer.listen(port);
	return `http://localhost:${port}`;
}
export function stopWebServer() {
	testServer?.close();
}