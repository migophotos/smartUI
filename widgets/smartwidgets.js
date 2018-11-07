/* eslint-disable indent */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-multi-spaces) */
/* eslint-disable no-underscore-dangle */

/**
 * @copyright Copyright © 2018 ... All rights reserved.
 * @author Michael Goyberg
 * @license
 * @version   1.0
 *
 * @overview  SmartWidgets the base class for family of smart controls
 *
 *
 */
class SmartWidgets {
    constructor() {
        this._version = '1.0';
        this._heap = new Map();
        this._initialized = false;
        this._timeout = 100;
		this.defs = `
			<filter id="drop-shadow">
				<feGaussianBlur in="SourceAlpha" stdDeviation="2.2"/>
				<feOffset dx="2" dy="2" result="offsetblur"/>
				<feFlood flood-color="rgba(0,0,0,0.5)"/>
				<feComposite in2="offsetblur" operator="in"/>
				<feMerge>
					<feMergeNode/>
					<feMergeNode in="SourceGraphic"/>
				</feMerge>
			</filter>
			<pattern id="pattern-stripe"
				width="4" height="4"
				patternUnits="userSpaceOnUse"
				patternTransform="rotate(45)">
				<rect width="2" height="4" transform="translate(0,0)" fill="white"></rect>
			</pattern>
			<mask id="mask-stripe">
				<rect x="0" y="0" width="100%" height="100%" fill="url(#pattern-stripe)" />
			</mask>
		`;

    }
    static isNewSite() {
        return (typeof Ext != 'undefined' && typeof Site != 'undefined');
    }
	// get href link paramter to new or old site
	static getLink(link) {
		if (!SmartWidgets.isNewSite() || !link || link == '') {
			return link;
		}
		return window.location.pathname + link.replace('/grapher.cgi?', '?');
	}
	static get defaultDataFormat() { // deault data format section
		const df = {
			uuid: '$FULL_PATH_MD5',
			state: '$ALERT_STATE',
			color: '$ALERT_COLOR',
			value: '$PCT',
			link: '$LINK',
			tooltip: '$TARGET_NAME'
		};
		return df;
    }
    // creates svg element, sets attributes and append it to parent, if it not null
	// the new element returned
	// usage example: createElement('circle',{cx:50,cy:50,r:10})
	// special case for 'text' element creation: uppend pair text:'any text...' into params object
	// and this text will be automathically appended to 'text' element
	static addElement(type, params, parent = null, doc = null) {
		if (!doc) { // try to main document in case of doc not specified
			if (parent) {
				doc = parent.ownerDocument;
			} else {
				doc = window.document;
			}
		}
			// Fix for error: <circle> attribute r: A negative value is not valid!
		if (type == 'circle' && params.r < 0) {
			params.r = 1;
		}
		const svgNS = 'http://www.w3.org/2000/svg';
		let textData = '';

		const elem = doc.createElementNS(svgNS, type);
		for (let i in params || {}) {
			if (i) {
				if (i === 'text') {
					textData = params[i];
				} else {
					elem.setAttribute(i, params[i]);
				}
			}
		}
		if (typeof parent !== 'undefined' && parent) {
			parent.appendChild(elem);
		}
		if (type === 'text') {
			elem.appendChild(doc.createTextNode(textData));
		}
		return elem;
    }
	// http get returns promis
	static 	_httpGet(url) {
		return new Promise(function (resolve, reject) {
			const xhr = new XMLHttpRequest();
			xhr.open('GET', url, true);

			xhr.onload = function () {
				if (this.status == 200) {
					resolve(this.response);
				} else {
					const error = new Error(this.statusText);
					error.code = this.status;
					reject(error);
				}
			};

			xhr.onerror = function () {
				reject(new Error('Network Error'));
			};
			xhr.send();
		});
    }
    /**
	 * Converts known numeric property to numbers
	 * @param {object} optObj reference to an options object
     * @param {object} knownParams an array of properties names to be converted
	 * @param {string} prop the property name which value needs (in case of specified) to be validated. If null, all properties will be validated.
     * returns true if Ok and false in case of nothing was converted
	 */
    static convertToNumbers(options = {}, knownParams = [], propName) {
		if (typeof options !== 'object') {
			throw new ReferenceError('options object cannot be undefined!');
		}
		if (typeof knownParams !== 'object') {
			throw new ReferenceError('knownParams array cannot be undefined!');
		}
		let val, count = 0;
		for (let np of knownParams) {
			if (propName) {
				if (np === propName && typeof options[propName] !== 'undefined') {
					val = options[propName];
					if (typeof val === 'string') {
						val = val.split('px')[0];
					}
					options[propName] = Number(val);
					count++;
					break;
				}
			} else if (typeof options[np] !== 'undefined') {
				val = options[np];
				if (typeof val === 'string') {
					val = val.split('px')[0];
				}
				options[np] = Number(val);
				count++;
			}
		}
		return (count > 0);
    }
	/**
	 *	Converts any property in form '--prefix-first-second' to 'firstSecond' parameter
	    example of use: 'accent-height'.replace(CAMELIZE, capitalize)
	 * @param {*} prop
	 */
	static customProp2Param(prop) {
		const CAMELIZE = /[-:]([a-z])/g;
		const capitalize = function (token) {
			return token[1].toUpperCase();
		};
		return prop.replace(CAMELIZE, capitalize);
	}

    /**
     * build and returns an options object or css vars
	 *
	 * input: {
	 * 	paramKey: value,	// custom prop is param-key
	 *  paramKey: value		// custorm property is var-param-key
	 * }
	 * preffix = '';
     * output: {
     *  paramKey: value,	// custom prop is param-key
     *  varParamKey: value,	// custom property is var-param-key
     * }
	 * preffix = 'any';
     * output: {
     *   --any-param-key: value,		// custom property is param-key
     *   --any-var-param-key: value,	// custom property is var-param-key
     * }
	 *
	 * @param {object} opt current options object from widget
	 * @param {object} prop custom properties array from widget
	 * @param {string} preffix flag '' or 'preffix' means the type of returned data.
	 * the preffix flag is just a name, that will be extended by '--' at the start and '-' at the end
	 * for example: stpgn will be extended to '--stpgn-'
	 */
	static buidOptionsAndCssVars(opt, prop, preffix = '') {
		const options = {
		};

		// convert all properties to css vars
		const customProp = SmartPolygon.getCustomProperties();
		for (let n = 0; n < customProp.length; n++) {
			if (preffix != '') {
				let cssKey = `--${preffix}-${customProp[n]}`;
				let oKey = SmartWidgets.customProp2Param(`${customProp[n]}`);
				let cssVal = opt[oKey];
				if (typeof cssVal !== 'undefined') {
					cssVal = cssVal.toString();
					options[`${cssKey}`] = cssVal;
				}
			} else {
				const propKey = SmartWidgets.customProp2Param(`${customProp[n]}`);
				let propVal = opt[propKey];
				if (typeof propVal !== 'undefined') {
					options[propKey] = propVal;
				}
			}
		}
		return options;
	}

	/**
	 * Returns an array of custom properties in form of parameter names in case of options equals null.
	 * If 'options' is specified, then this functions returns the filled object.
	 * for example, each property in form 'first-second-third' will be converter to parameter name 'firstSecondThird'
	 * and in case of specified options:
	 * params = {
	 * 	firstSecondThird: options.firstSecondThird
	 * } will be returned
	 * in case filter equals 'dirty' returns only changed (dirty) parameters
	 */
	static getCustomParams(custProp, defOpt, options = null, filter = 'all') {
		const paramsArray = [];
		for (let prop of custProp) {
			paramsArray.push(SmartPolygons.customProp2Param(prop));
		}
		if (!options) {
			return paramsArray;
		}
		const params = {};
		for (let prop of paramsArray) {
			if (typeof options[prop] !== 'undefined') {
				if (filter === 'all' ||
					(filter === 'dirty' && options[prop] !== defOpt[prop])) {
					params[prop] = options[prop];
				}
			}
		}
		return params;
    }

    // private - please don't call this function from outside!
	_intervalTimer() {
		this._interval = setInterval(() => {
			for (let entry of this._heap.entries()) {
				let obj = entry[1].getCtrl();
				if (obj && obj._o.isRun) { // realtime updates are enabled
					let ic = obj.intervalCounter;
					ic -= this._timeout;
					obj.intervalCounter = ic;	// it will restored automatically to _o.interval, if <= 0
					if (ic <= 0) {
						let data = null, updMode = obj.isEmulate();	// 1 - enabled, 0 - disabled, -1 - nulled
						if (updMode) {
							data = obj.generateExData();
							if (updMode === -1) {	// clear all data and stop emulation
								obj.emulate(0);
							}
						}
						obj.update(data);
					}
				}
			}
		}, 100);
    }

    // public API
	init(dashboardContext = {}) {
		if (dashboardContext) {
			this.lang = dashboardContext.lang || 'ru';
			this.document = dashboardContext.document || document;
			this.editorAPI = dashboardContext.editorAPI || null;
			this.runtimeAPI = dashboardContext.runtimeAPI || null;
		}
		if (!this._initialized) {
			// start continious interval timer
			this._intervalTimer();
			this._initialized = true;
		}
	}
	get(id) {
		const ref = this._heap.get(id);
		if (ref) {
			return ref.getCtrl();
		}
		return null;
	}
	set(id, obj) {
		this._heap.set(id, obj);
		return this;
	}
	unset(id) {
		return this._heap.delete(id);
	}
    initCtrl(id, options) {
        throw new Error('You must overwrite this function in derived class!');
    }
    unInitCtrl(id) {
        throw new Error('You must overwrite this function in derived class!');
    }
    getDataFormat() {
		return SmartWidgets.defaultDataFormat;
    }
	getParams(id) {
		const ctrl = this.get(id);
		if (ctrl) {
			return ctrl.getParams();
		}
		return null;
    }
    setParams(id, options) {
		const ctrl = this.get(id);
		if (ctrl) {
			return ctrl.setParams(options);
		}
		return false;
    }
	emulate(id, mode) { // 0/-1/1 - disabled/nulled/enabled
		const ctrl = this.get(id);
		if (ctrl) {	// all checks inside!
			ctrl.emulate(mode);
		}
	}
	run(id) {
		const ctrl = this.get(id);
		if (ctrl) {
            ctrl.run(true);
        }
	}
	stop(id) {
		const ctrl = this.get(id);
		if (ctrl) {
            ctrl.run(0);
        }
	}
	update(id, data = {}) {
		const ctrl = this.get(id);
		if (ctrl) {
            ctrl.update(data);
        }
	}
}

