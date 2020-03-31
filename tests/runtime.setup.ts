import fetch from 'node-fetch';
import fastify from "fastify";

(global as any).fetch = fetch;
(global as any).Headers = (fetch as any).Headers;

let testServer = fastify({ logger: false });
export interface ITestJsonResponse {
	fake: "model"
}
export interface ITestMirrorResponse {
	queryString: string;
	queryObject: fastify.DefaultQuery;
	headers: fastify.DefaultHeaders;
	body: any;
}
export interface ITestStatusCodeResponse {
	statusText: "CustomStatusCode",
	statusCode: number
}
export async function startWebServer(port: number = 3000) {
	testServer
		.get("/json", (req, res) => {
			res.header("Content-type", "application/json");
			res.send({ fake: "model" });
		})
		.get("/text", (req, res) => {
			res.header("Content-type", "text/plain");
			res.send("text");
		})
		.get("/status-code/:code", (req, res) => {
			res.header("Content-type", "application/json");
			res.status(+req.params.code);
			res.send({
				statusText: "CustomStatusCode",
				statusCode: +req.params.code
			} as ITestStatusCodeResponse);
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
			}, +req.params.ms);
		});
	await testServer.listen(port);
	return `http://localhost:${port}`;
}
export function stopWebServer() {
	testServer?.close();
}