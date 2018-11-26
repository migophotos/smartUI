/* eslint-disable linebreak-style */
/* eslint-disable indent */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-multi-spaces) */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-unused-vars */
/* eslint-disable guard-for-in */

class SmartHeap extends Map {
}

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

/**
 * State to color interpretator.
 * stateColors is a comma-separated string, contains the pairs of state and hexa-color in form 'state''hex-color',
 * for example: 1#00ff00,2#00aabb,3#ff0000,... or old format: 1:#00ff00;2:#00aabb;3:#ff0000,...
 */
class StateToColors extends Map {
	constructor(stateColorsDef = null, useAsGlobal = 0) {
		super();
		if (typeof stateColorsDef === 'string') {
			this.init(stateColorsDef, useAsGlobal);
		}
	}
	init(stateDef, useAsGlobal = 0) {
		super.clear();
		if (typeof stateDef === 'string' && stateDef.length) {
			const states = stateDef.split(/[,;]/g);	// split by ',' or ';'
			let s2c = states[0].split(/[#:]/g);	// split by ',' or ';'
			if (s2c.length == 1) {
				// I don't want to check the content of this string, I just think it is mean 'global' :)
				return;
			}
			for (let st of states) {
				if (st.includes(':')) {
					s2c = st.split(':');
					if (typeof s2c[1] !== 'undefined') {
						super.set(s2c[0].toString(), s2c[1]);
					}
				} else {
					s2c = st.split('#');
					if (typeof s2c[1] !== 'undefined') {
						super.set(s2c[0].toString(), `#${s2c[1]}`);
					}
				}
			}
			// set the last colors definition as global
			if (useAsGlobal && window.StateToColors != this) {
				if (!window.StateToColors) {
					window.StateToColors = new StateToColors();
				}
				for (let [key, value] of this.entries()) {
					window.StateToColors.set(key, value);

					// localStorage.setItem('SmartWidgets.stateColors', window.StateToColors.get());
				}
			}
		}
	}
	delete(state = '') {
		if (typeof state === 'number') {
			state = state.toString();
		}

		if (state != '') {
			super.delete(state);
		}
	}
	get(state = '') {
		if (typeof state === 'number') {
			state = state.toString();
		}

		if (state != '') {
			return super.get(state);
		}
		let str = '';
		for (let [key, value] of this.entries()) {
			str += `${key}${value},`;
		}
		str = str.slice(0, -1);
		return str;
	}
	set(state, value = '', useAsGlobal = 0) {
		if (typeof state === 'number') {
			state = state.toString();
		}
		if (value == '') {
			this.init(state, useAsGlobal);
			return;
		}
		super.set(state, value.startsWith('#') ? value : `#${value}`);
	}
	size() {
		return super.size;
	}
}

class SmartWidgets {
	static getAlias() {
		return 'stwidget';
	}
    constructor() {
        this._version = '1.0';
		if (!window.SmartHeap) {
			window.SmartHeap = new SmartHeap();
		}
		if (!window.StateToColors) {
			window.StateToColors = new StateToColors();
		}
		// let def = localStorage.getItem('SmartWidgets.stateColors');
		// if (def) {
		// 	window.StateToColors.init(def, 1);
		// }

		this._heap = window.SmartHeap;
		this._alias = null;	// alias name, for example: 'stbar', or 'stpgn',...  Each smart widget has function getAlias() and returns it's alias name
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
	static setAttributes(elems, attrs) {
		for (let el of elems) {
			for (let attr in attrs) {
				if (attr === 'text') {
					el.textContent = attrs[attr];
				} else {
					el.setAttribute(attr, attrs[attr]);
				}
			}
		}
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
    /**
     * Builds and return the path for regular polygon and stars
     * @param {number} n The number of corners of a regular polygon. Default is 4
     * @param {number} x X position of center point
     * @param {number} y Y position of center point
     * @param {number} r Radius of inscribed circle
     * @param {number} angle Starting Angle in degrees
     * @param {number} rotate rotate start angle
     * @param {number} counterclockwise
     * @param {number} star Inner radius for star in percents to r
     */
	static buildPolygon(n, x, y, r, angle, rotate, counterclockwise, star) {
        counterclockwise = counterclockwise || 0;
		star = star || 0;

        angle = angle || 0;
        if (star) {
            angle /= 2;
            n *= 2;
        }
		angle = (angle + rotate) * Math.PI / 180;  // convert degrees to radians
		const innerRadius = r / 100 * star;
        let points;
        if (star) {
            points = `${x + innerRadius * Math.sin(angle)},${y - innerRadius * Math.cos(angle)}`;
        } else {
            points = `${x + r * Math.sin(angle)},${y - r * Math.cos(angle)}`;
        }
        let delta = 2 * Math.PI / n;

		for (let i = 1; i < n; i++) {
            angle += counterclockwise ? -delta : delta; // correct an angle
            if (star) {
                if (i % 2) {
                    points += ` ${x + r * Math.sin(angle)},${y - r * Math.cos(angle)}`;
                } else {
                    points += ` ${x + innerRadius * Math.sin(angle)},${y - innerRadius * Math.cos(angle)}`;
                }
            } else {
                points += ` ${x + r * Math.sin(angle)},${y - r * Math.cos(angle)}`;
            }
		}
        return points;
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
	 * Hyphenates a property name, for example:
	 *
	 *   > hyphenateProp('backgroundColor')
	 *   < "background-color"
	 *   > hyphenateStyleName('varFormFactor')
	 *   < "--stbar-form-factor"
	 *
	 *
	 * @param {string} string
	 * @param {string} smartPrefix  '--stbar-', for example
	 * @return {string}
	 */
	static hyphenate(string) {
		const _uppercasePattern = /([A-Z])/g;
		return string.replace(_uppercasePattern, '-$1').toLowerCase();
	}
	static hyphenateProp(string, smartPrefix = null) {
		const stVar = /^var-/;
		if (smartPrefix) {
			return SmartWidgets.hyphenate(string).replace(stVar, smartPrefix);
		}
		return SmartWidgets.hyphenate(string);
	}

	/**
	 * Sort data array by specified parameter
	 *
	 * @param {array} data An array of data properties
	 * @property {string} name The name of signal. Existing parameter legend will be used instead of this one
	 * @property {string} legend the legend for signal.
	 * @property {number || string} value The value of signal. In case of this parameter's type is 'string' it will be converted to number before compiring
	 * @property {string} color Represents the color of value
	 * @property {number} state Represents state of value. In case of this parameter's type is 'string' it will be converted to number before compiring
	 * @param {string} sortParam Sort data by one of the next parameters:
	 * 		asis - don't sort,
	 * 		states/state - sort by state or colors (in case of state is not exists),
	 * 		values/value - sort by value,
	 * 		colors/color - sort by color,
	 * 		names/name - sort by legend or name,
	 * 		any other word 	- sort by this 'word parameter. For example: link
	 * @param {number} sortDir Data sorting direction. 1 means from low to hight(down), 0 - from high to low (up)
	 *
	 * Be careful: this function changes an array data!
	 */
	static sortDataByParam(data = [], sortParam = 'asis', sortDir = 1) {
		switch (sortParam) {
			case 'asis':
				break;
			// sort by name and ignore lower and upper case
			case 'name':
			case 'names': {
				data.sort((a, b) => {
					let aName = a.legend || a.name;
					let bName = b.legend || b.name;
					const nameA = aName.toUpperCase(); // ignore upper and lowercase
					const nameB = bName.toUpperCase(); // ignore upper and lowercase
					if (nameA < nameB) {
						return sortDir ? -1 : 1;
					}
					if (nameA > nameB) {
						return sortDir ? 1 : -1;
					}
					return 0;
				});
				break;
			}
			case 'value':
			case 'values': {
				data.sort((a, b) => {
					if (Number(a.value) > Number(b.value)) {
						return sortDir ? 1 : -1;
					}
					if (Number(a.value) < Number(b.value)) {
						return sortDir ? -1 : 1;
					}
					return 0;
				});
				break;
			}
			case 'color':
			case 'colors': {
				data.sort((a, b) => {
					if (a.color > b.color) { return sortDir ? 1 : -1; }
					if (a.color < b.color) { return sortDir ? -1 : 1; }
					return 0;
				});
				break;
			}
			case 'state':
			case 'states': {
				data.sort((a, b) => {
					if (!a.state || !b.state) {
						if (a.color > b.color) { return sortDir ? 1 : -1; }
						if (a.color < b.color) { return sortDir ? -1 : 1; }
					} else {
						if (Number(a.state) > Number(b.state)) { return sortDir ? 1 : -1; }
						if (Number(a.state) < Number(b.state)) { return sortDir ? -1 : 1; }
					}
					return 0;
				});
				break;
			}
			default: {
				data.sort((a, b) => {
					if (a[sortParam] > b[sortParam]) { return sortDir ? 1 : -1; }
					if (a[sortParam] < b[sortParam]) { return sortDir ? -1 : 1; }
					return 0;
				});
			}
		}
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
		for (let n = 0; n < prop.length; n++) {
			if (preffix != '') {
				let cssKey = `--${preffix}-${prop[n]}`;
				let oKey = SmartWidgets.customProp2Param(`${prop[n]}`);
				let cssVal = opt[oKey];
				if (typeof cssVal !== 'undefined') {
					cssVal = cssVal.toString();
					options[`${cssKey}`] = cssVal;
				}
			} else {
				const propKey = SmartWidgets.customProp2Param(`${prop[n]}`);
				let propVal = opt[propKey];
				if (typeof propVal !== 'undefined') {
					options[propKey] = propVal;
				}
			}
		}
		return options;
	}

	/**
	 * Returns an array of custom properties in form of parameter names in case of 'opt' equals null.
	 * If 'opt' is specified, then this functions returns the filled object.
	 * for example, each property in form 'first-second-third' will be converter to parameter name 'firstSecondThird'
	 * and in case of specified 'opt':
	 * params = {
	 * 	firstSecondThird: opt.firstSecondThird
	 * } will be returned
	 * in case filter equals 'dirty' returns only changed (dirty) parameters
	 * in case of alias equals name of widget and not equals 'none' compress properties into one string concatenated by '-'
	 * and prepend it with 'stwidget:' and alias name, specified in this parameter
	 * @param {object} custProp an array of custom properties
	 * @param {object} defOpt an array of default options of widget
	 * @param {object} opt if null, then function returns an array of custom properties only, in another case it returns filled object
	 * @param {string} filter 'all' means all properties, when 'dirty' - only changed (not default) properties
	 * @param {string} alias this flag enables creating 'compressed form' of options. Specify here the name of widget, for ex.: 'stbar' and
	 * this function will return all properties as one string. In case of filter equals 'all' each unchanged property will be replaced by '.'
	 * @returns {object}
	 */
	static getCustomParams(custProp, defOpt, opt = null, filter = 'all', alias = 'none') {
		const paramsArray = [];
		for (let prop of custProp) {
			paramsArray.push(SmartWidgets.customProp2Param(prop));
		}
		if (!opt) {
			return paramsArray;
		}
		const params = {};
		for (let prop of paramsArray) {
			if (typeof defOpt[prop] !== 'undefined') {
				if (filter === 'dirty' && typeof opt[prop] !== 'undefined' && opt[prop] !== defOpt[prop]) {
					params[prop] = opt[prop];
				}
				if (filter === 'all') {
					if (typeof opt[prop] === 'undefined') {
						params[prop] = alias !== 'none' ? '.' : defOpt[prop];
					} else {
						params[prop] = opt[prop];
					}
				}
			}
		}
		if (alias != 'none') {
			let compressed = alias;
			for (let i in params || {}) {
				compressed += `-${params[i]}`;
			}
			const paramName = SmartWidgets.getAlias();
			const obj = {
			};
			obj[paramName] = compressed;
			return obj;
		}
		return params;
	}

	static getSVGContext(contextId, wdgRootId) {
		const svgContext = `
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" id="${contextId}" text-rendering="optimizeLegibility" shape-rendering="geometricPrecision">
<g id="${wdgRootId}" >
<rect id="fakeR" x="10" y="10" width="150" height="150" fill="#eee" stroke="black" stroke-dasharray="4 4"></rect>
</g></svg>`;
		return svgContext;
	}

    // private - please don't call this function from outside!
	_intervalTimer() {
		this._interval = setInterval(() => {
			for (let entry of this._heap.entries()) {
				let obj = entry[1].getCtrl();
				if (obj && obj.getAlias() == this._alias && obj._o.isRun) { // realtime updates are enabled
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
	/**
	 * Function Generator unique IDs
	 * @param {string} alias
	 * @param {number} start start sequence from this number
	 */
	* _makeId(alias, start) {
		let iterationCount = 0;
		for (let i = start; i < Infinity; i += 1) {
			iterationCount++;
			yield `${alias}-${iterationCount}`;
		}
		return iterationCount;
	}
	/**
	 * Returns unique id in form alias-number
	 * Example of use:
	 * Initialization in derived class - this.uniqueId = this._makeId('stbar', 0);
	 * Getting unique id - window.SmartBars.getId();
	 */
	getId() {
		return this.uniqueId.next().value;
	}

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
/**
 * Scrollable Container is an analog of html options list
 * The class constructor gots an ID of parent's <g> element as 'ud' and 
 * options parameters as 'options' object.
 * This two parameters must to be specified!
 * The structure of options:
 * context 	- an SVG context
 * width 	- the width of scrollable container, or 36 by default
 * height	- the height of scrollable container, or 36 be default
 * gap		- the gap between items and body border
 */
class ScrollableContainer {
	constructor(id = null, options = null) {
		if (!id || !options) {
			throw new ReferenceError('id and options cannot be undefined!');
		}
		this._heap = new Map();

		this._id		= id;
		this._root		= options.context;
		this._svgroot	= this._root.getElementById(id);
		this._svgdoc	= this._svgroot.ownerDocument;

		this._width		= options.width || 36;	// container width
		this._height	= options.height || 36;	// container height
		this._rowHeight = options.row;			// rows height
		this._gap		= options.gap || 4,		// gap between rows and around of items

		this._body = SmartWidgets.addElement('g', {
			class: 'scroll-container-body',
			'clip-path': `url(#${this._id}-clippath)`
		}, this._svgroot, this._svgdoc);

		this._clipFace = SmartWidgets.addElement('clipPath', {
			id: `${this._id}-clippath`
		}, this._svgroot, this._svgdoc);
		this._face = SmartWidgets.addElement('rect', {
			id: `${this._id}-clipface`,
			x: 0,
			y: 0,
			width: this._width + this._gap,
			height: this._height
		}, this._clipFace, this._svgdoc);

		this._bodyActiveG = SmartWidgets.addElement('g', {
			class: 'scroll-container-body_g'
		}, this._body, this._svgdoc);

		this._bodyActiveBkg = SmartWidgets.addElement('rect', {
			class: 'scroll-container-body_g_bkg',
			x: 0,
			y: 0,
			width: this._width + this._gap,
			height: this._height * 2,
			fill: '#666666',
			stroke: '#ffffff',
			'stroke-width': 2
		}, this._bodyActiveG, this._svgdoc);
		this._bodyActiveG.addEventListener('wheel', (evt) => {
			evt.preventDefault();
			let scroll = Number(this._bodyActiveG.dataset['offset']) || 0;
			const delta = evt.deltaY || evt.detail || evt.wheelDelta;
			if (delta > 0) {
				scroll -= 2;
			} else {
				scroll += 2;
			}
			// const lastItem = this._root.getElementById(`${this._id}-item-${this._heap.size - 1}`);
			// const clipFace = this._face.getBoundingClientRect();
			// const location = lastItem.getBoundingClientRect();
			// if (delta > 0 && location.bottom < clipFace.bottom) {
			// 	this._bodyActiveG.setAttribute('transform', `translate(0, ${scroll})`);
			// 	this._bodyActiveG.dataset['offset'] = scroll;
			// 	return;
			// }

			if (scroll <= 0) {
				this._bodyActiveG.setAttribute('transform', `translate(0, ${scroll})`);
				this._bodyActiveG.dataset['offset'] = scroll;
			}
		});
	}
	/**
	 * Add new element into container collection.
	 * The structure of 'elem' object:
	 * id		- element's Id
	 * cb		- callback function that must create an element
	 * @param {object} elem 
	 */
	add(elem) {
		const iWidth = this._width - (2 * this._gap);
		const iHeight = this._rowHeight || iWidth;
		const offset = this._gap + (this._heap.size * (iHeight + this._gap));
		let item = null;

		if (typeof elem.cb === 'function') {
			item = elem.cb(this._bodyActiveG, {
				x: this._gap,
				y: offset,
				width: iWidth,
				height: iHeight,	
				id: elem.id,
				stroke: '#ffffff',
				'stroke-width': 2,
				tabindex: this._heap.size,
				data: elem.data,
				owner: elem.owner
			});
		} else {
			// draw new element just as colored rectangle
			item = SmartWidgets.addElement('rect', {
				id: elem.id,
				x: this._gap,
				y: offset,
				width: iWidth,
				height: iHeight,
				stroke: '#ffffff',
				'stroke-width': 0.5,
				fill: '#ffaaaa',
				tabindex: this._heap.size
			}, this._bodyActiveG, this._svgdoc);
		}
		this._bodyActiveBkg.setAttribute('height', offset + iHeight + this._gap);
		this._heap.set(elem.id, elem);
		return item;
	}
	get(id) {
		return this._heap.get(id);
	}
}
