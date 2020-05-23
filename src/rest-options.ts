import { IRequestOptions } from './interfaces';
export class RestOptions {
	private current: IRequestOptions = {};
	constructor(opts: IRequestOptions) {
		this.current = opts;
	}
	public localOverride(opts?: IRequestOptions | undefined) {
		return Object.assign({}, this.current, opts ?? {});
	}
}
