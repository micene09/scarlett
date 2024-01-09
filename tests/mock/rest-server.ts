import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

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
const handlers = [
	http.all("https://scarlett.mock/json", () => {
		return HttpResponse.json({ fake: "model" } as ITestJsonResponse);
	}),
	http.all("https://scarlett.mock/text", () => {
		return HttpResponse.text("text");
	}),
	http.get("https://scarlett.mock/status-code/:code", ({ params }) => {
		return HttpResponse.json({
			statusText: "CustomStatusCode",
			statusCode: +params.code
		} as ITestStatusCodeResponse, {
			statusText: "CustomStatusCode",
			status: +params.code,
		});
	}),
	http.get("https://scarlett.mock/status-code/:code/empty", ({ params }) => {
		return new HttpResponse(null, {
			status: +(params.code as string)
		})
	}),
	http.all("https://scarlett.mock/mirror", async req => {
		const queryString = req.request.url.split("?")[1] ?? "";
		const queryObject = queryString ? JSON.parse('{"' + decodeURI(queryString).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"') + '"}') : {}
		const body = await req.request.text();
		const headers: Record<string, string> = {};
		req.request.headers.forEach((value, key) => {
			headers[key] = value;
		});
		return HttpResponse.json({
			queryString,
			queryObject,
			headers,
			body
		} as ITestMirrorResponse);
	}),
	http.all("https://scarlett.mock/reply-in/:ms/milliseconds", async ({ params }) => {
		await new Promise<void>(resolve => {
			setTimeout(() => resolve(), +params.ms);
		})
		return HttpResponse.text("ok");
	}),
	http.get("https://scarlett.mock/timestamp", () => {
		return HttpResponse.json(Date.now() + "");
	})
];

const restServer = setupServer(...handlers);
export default restServer;