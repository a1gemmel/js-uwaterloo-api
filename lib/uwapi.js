import Url from 'url';

const templates = [
	'/foodservices/menu',
	'/foodservices/notes',
	'/foodservices/diets',
	'/foodservices/outlets',
	'/foodservices/locations',
	'/foodservices/watcard',
	'/foodservices/announcements',
	'/foodservices/products/{product_id}',
	'/foodservices/products/search',
	'/foodservices/{year}/{week}/menu',
	'/foodservices/{year}/{week}/notes',
	'/foodservices/{year}/{week}/announcements',
	'/courses/{subject}',
	'/courses/{course_id}',
	'/courses/{class_number}/schedule',
	'/courses/{subject}/{catalog_number}',
	'/courses/{subject}/{catalog_number}/schedule',
	'/courses/{subject}/{catalog_number}/prerequisites',
	'/courses/{subject}/{catalog_number}/examschedule',
	'/events',
	'/events/{site}',
	'/events/{site}/{id}',
	'/events/holidays',
	'/news',
	'/news/{site}',
	'/news/{site}/{id}',
	'/weather/current',
	'/terms/list',
	'/terms/{term_id}/examschedule',
	'/terms/{term_id}/{subject}/schedule',
	'/terms/{term_id}/{subject}/{catalog_number}/schedule',
	'/terms/{term_id}/infosessions',
	'/resources/tutors',
	'/resources/printers',
	'/resources/infosessions',
	'/resources/goosewatch',
	'/resources/sites',
	'/codes/units',
	'/codes/terms',
	'/codes/groups',
	'/codes/subjects',
	'/codes/instructions',
	'/buildings/list',
	'/buildings/{building_acronym}',
	'/buildings/{building_acronym}/{room_number}/courses',
	'/api/usage',
	'/api/services',
	'/api/methods',
	'/api/versions',
	'/api/changelog',
	'/server/time',
	'/server/codes'
];

export default class api {

	constructor(apiToken) {
		const spec = this.genSpec(templates);

		//Return spec if apiToken is not provided
		if(apiToken === null) {
			throw new Error('No api token given!');
		}

		const result = this.validSpec(this.spec);

		if (result instanceof Error) {
			throw new Error(`Could not generate valid spec using the given template ${result.message}`);
		}
		const api = this.compileAPISpec(spec);
		api.apiToken = apiToken;
		return api;
	}

	//Consumes a map of name-(template list) pairs of api endpoints
	//and returns an object with the specified methods.

	compileAPISpec(spec) {
		const baseURL = 'https://api.uwaterloo.ca/v2';
		const result = {};

		//Consumes an object and a template and returns the appropriate endpoint URL.
		function constructEndpoint(string, obj) {
			const params = string.match(/{(.*?)}/g) || [];
			const args = params.map(function(e){return e.replace(/{|}/g,'');});

			if(args.length !== Object.keys(obj).length) {return null;}

			for (const i in args) {
				if (typeof obj[args[i]] === 'undefined')
					{return null;}
				string = string.replace('{' + args[i] + '}', obj[args[i]]);
			}
			return string;
		}
	//Should probably move this into a seperate module
		function getJSON(url, data) {
			url = (url.constructor === Url.Url) ? url : Url.parse(url, true);
			delete url.search;
			for (const key in data) {url.query[key] = data[key];}

			return fetch(url.format())
			.then((res) => res.json());
		}

		function makeEndpointFn(templates, fname, cached) {
			return function(options = {}, getParams = {}) {
				let path = null;
				for (const i in templates) {
					path = constructEndpoint(templates[i], options);
					if(path) {
						break;
					}
				}

				if(!path) {
					return Promise.reject(new Error('Invalid parameters passed in to ' + fname));
				}
				if(cached[path]) {
					return Promise.resolve(cached[path]);
				}

				const url = baseURL + path + '.json';

				getParams.key = this.apiToken;

				return getJSON(url, getParams)
				.then((payload) => {
					if(Math.floor(payload.meta.status / 100) !== 2) {
						return Promise.reject(new Error('API Error: ' + payload.meta.message));
					}
					cached[path] = payload.data;
					return Promise.resolve(payload.data);
				});
			};
		}

		for (const name in spec) {
			const templates = spec[name];
			const cached = {};
			const endpointFunction = makeEndpointFn(templates, name, cached);
			result[name] = endpointFunction;
		}
		return result;
	}

	//Consumes raw API templates and generates a spec object
	genSpec(templates) {
		//Suggests a function name from the provided API template
		function getName(url) {
			url = (url instanceof Url.Url) ? url : Url.parse(url);
			const args = url.path.replace(/^\/|\/$/g,'').split('/');

			if (args[args.length-1][0] === '{' || args.length === 1)
				{return args[0];}
			else
				{return `${args[0]}${args[args.length-1][0].toUpperCase()}${args[args.length-1].slice(1)}`;}
		}

		const result = {};
		for(let i=0;i<templates.length;i++) {
			const name = getName(templates[i]);
			if(!result[name]) {result[name] = [];}
			result[name].push(templates[i]);
		}
		return result;
	}

	//Spec must contain a mapping of function names to templates. No two templates
	//in the list can accept the same set of parameteres..

	validSpec(spec) {
		for(const name in spec) {
			const seen = {};
			for(const i in spec[name]) {
				const template = spec[name][i];
				const params = template.match(/{.*?}/g) || [];
				const hash = params.sort().join();
				if(seen[hash]) {
					return new Error('Found duplicate parameter list for templates in ' + name);
				}
				seen[hash] = 1;
			}
		}
		return true;
	}
}
