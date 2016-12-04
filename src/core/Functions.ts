import * as request from 'request';

export function download(url : string, cb : Function) {
	request({
		uri: url,
		method: "GET",
		timeout: 5000,
		followRedirect: true,
		maxRedirects: 5
	}, function(error, response, body) {

		if (error) {
			cb(undefined);
		}
		else {
			if (response.headers['content-type'].toLowerCase().indexOf("json") != -1) {
				cb(JSON.parse(body));
			}
			else {
				cb(body);
			}
		}
		
	});

}