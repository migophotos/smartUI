/* eslint-disable linebreak-style */
/* eslint-disable indent */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-multi-spaces) */
/* eslint-disable no-underscore-dangle */
/* eslint-disable guard-for-in */
/* eslint-disable no-multi-spaces */


/**
 * @copyright Copyright © 2018 ... All rights reserved.
 * @author Michael Goyberg
 * @license
 * @version   1.0

 */
class SmartPalettes extends SmartWidgets {
	static getAlias() {
		return 'stpal';
	}
	static buidOptionsAndCssVars(opt, what = 'options') {
		const customProp = SmartPalettes.getCustomProperties();
		return SmartWidgets.buidOptionsAndCssVars(opt, customProp, what == 'options' ? '' : SmartPalettes.getAlias());
	}
	static getOptions(opt) {
		return SmartPalettes.buidOptionsAndCssVars(opt);
	}
	static getCSS(opt) {
		return SmartPalettes.buidOptionsAndCssVars(opt, 'css');
	}
	static getJSON(opt) {
		return `'${JSON.stringify(SmartPalettes.getOptions(opt))}'`;
	}
	static getCompressedJSON(opt) {
		const customProp = SmartPalettes.getCustomProperties();
		const defOptions = SmartPalettes.defOptions();
		const fullJson = SmartWidgets.getCustomParams(customProp, defOptions, opt, 'all', SmartPalettes.getAlias());
		return `'${JSON.stringify(fullJson)}'`;
	}
    static init(context = {}) {
        if (!window.SmartPalettes) {
            window.SmartPalettes = new SmartPalettes();
        }
        window.SmartPalettes.init(context);
	}
	static JsonToOptions(jsonOpt) {
		const options = {
		};
		if (typeof jsonOpt === 'string' && jsonOpt.length) {
			const tmpOpt = JSON.parse(jsonOpt);
			const smartWidgetAlias = SmartWidgets.getAlias();

			if (typeof tmpOpt[smartWidgetAlias] != 'undefined') {
				// lets decompress options...
				const optArr = tmpOpt[smartWidgetAlias].split('-');
				const customProp = SmartPalettes.getCustomProperties();
				let index = 1;
				for (let prop of customProp) {
					if (optArr[index] != '.') {
						options[SmartWidgets.customProp2Param(prop)] = optArr[index];
					}
					index++;
				}
				SmartPalettes.convertNumericProps(options);
				options.alias = optArr[0];
				return options;
			}
			const aliasKey = `--${SmartPalettes.getAlias()}-`;
			for (let key in tmpOpt) {
				const paramName = key.replace(aliasKey, '');
				options[SmartWidgets.customProp2Param(paramName)] = tmpOpt[key];
			}
			SmartPalettes.convertNumericProps(options);
			return options;
		}
		return null;
	}
	static getCustomProperties() {
		return [
			'role',				// in demo mode this parameter has value 'demoMode'
			'alias',			// 'stpal'
			'is-global-colors', // use global state to color definition instead of 'state-colors'
			'state-colors'		// State to color interpretator. String in comma-separated format 'state''hex color', for example: 1#00ff00,2#00aabb,3#ff0000,...
								// by default (currently) is empty, what means not in use
        ];
    }
    static defOptions() {
        return {
			role: '',			// in demo mode this parameter has value 'demoMode'
			alias: SmartPalettes.getAlias(),
			isGlobalColors: 1,
			stateColors: '0:#0080c0,1:#008000,2:#ffff15,3:#ff2f2f,4:#9f0000,5:#f0f0f0'
		};
	}
	static convertNumericProps(options = {}, propName) {
        const numericProps = [
			'isGlobalColors'
        ];
        return SmartWidgets.convertToNumbers(options, numericProps, propName);
	}

    constructor() {
		super();
		this._alias = SmartPalettes.getAlias();
		this.uniqueId = this._makeId(this._alias, 0);
	}
	initCtrl(id, options) {
		let ctrl = this.get(id);
		if (!ctrl) {
			ctrl = new SmartPalette(id, options);
			if (ctrl) {
				ctrl.init(options);
			}
		}
	}
	unInitCtrl(id) {
        // todo....  #E3D44D
	}
}

class SmartPalette {
    static serializeOptions(opt, templateId) {
		let template = '', className;
		let dtO = null;
		// disable emulation (this.option only for builder!)
		if (typeof opt.isEmulate !== 'undefined') {
			delete opt.isEmulate;
		}

		className = `${opt.orient == 'ver' ? 'vert' : 'hor'}-${opt.type == 'discrete' ? 'dots' : 'line'}`;
		switch (templateId) {
			case 'def-custom-elem_btn':
				// convert all options into css vars
				dtO = SmartPalettes.getCSS(opt);
                template = '&lt;style>\n';
                template += `  .${className} {\n`;
                // template += `    `
                for (let key in dtO) {
                    template += `    ${key}:${dtO[key]};\n`;
                }
                template += '  }\n';
                template += '&lt;/style>\n';
				template += `&lt;smart-ui-palette class="${className}" id="ANY_UNIQUE_NUMBER">This browser does not support custom elements.&lt/smart-ui-palette>\n`;
                break;
			case 'def-json_btn': {
				const jstr = SmartPalettes.getCompressedJSON(opt); // get all parameters in compressed json format
				template = `${jstr}`;
				template += '\n\n';
				template +=
				`// later, use static function SmartPalettes.JsonToOptions(options); to convert JSON string
// into 'options' object, sutable for SmartPalette creation. For example:
&lt;svg id="dashboard" ....
  &lt;g id="smart-widget">
  ....
&lt;/svg>
....
const el = document.getElementById("smart-widget");
if (el) {
  const options = {
	  context: document.getElementById('dashboard'),
	  opt: ${jstr};
  };
  // create an instance of SmartPolygon widget
  const pgn = new SmartPalette(jsn, options);
  // or in case you want to change any parameters, convert the JSON string into object
  const options = {
	  opt: SmartPalette.JsonToOptions(opt);
	  context: document.getElementById('dashboard'),
  }
  // change paramers as you want, for ex:
  options.xxxx = 120;
  // and create an instanse of SmartPalette widget
  const palette = new SmartPalette(jsn, options);
}
`;
                break;
            }
            case 'def-object-params_btn': {
				dtO = SmartPalettes.getOptions(opt);
				let optStr = '';
				for (let key in dtO) {
					if (typeof dtO[key] === 'string') {
						optStr += `  ${key}: '${dtO[key]}',\n`;
					} else {
						optStr += `  ${key}: ${dtO[key]},\n`;
					}
				}
				template +=
				`
const el = document.getElementById("jsn");
if (el) {
  const options = {
${optStr}  };
  // create an instanse
  const palette = new SmartPalette(jsn, options);
}
`;
				break;
			}
            case 'def-svg_widget_btn':
                template = '&ltsmart-ui-custom-element class="smart-ui-custom-elem">Yout browser does not support custom elements.&lt/smart-ui-custom-element>';
                break;
        }
        return template;
	}
    constructor(id, options = null) {
		if (!options) {
			console.error('must to be specified!');
			return;
		}
		let gId = id;
		// check for options in JSON format and convert its to object in this case
		const smartWidgetAlias = SmartWidgets.getAlias();
		// check input parameters
		const elem = document.getElementById(id);
		if (elem && elem.tagName === 'DIV') {
			const elemId = window.SmartPalettes.getId();
			const svgId = `${id}--${SmartPalettes.getAlias()}`;
			this._shadowDOM = elem.attachShadow({mode: 'open'});
			this._shadowDOM.innerHTML = `${SmartWidgets.getSVGContext(svgId, elemId)}`;
			options = {
				mode: 'html',
				context: this._shadowDOM.getElementById(svgId),
				opt: options
			};
			window.SmartPalettes.set(id, this);
			gId = elemId;
		}

		if (typeof options.opt === 'string' && options.opt.length && options.opt.includes(smartWidgetAlias)) {
			options.opt = SmartPalettes.JsonToOptions(options.opt);
		}

        // merge default options with specified
        this._o = Object.assign({}, SmartPalettes.defOptions(), options.opt || {});
        // validate all properties
        SmartPalettes.convertNumericProps(this._o);

        this._mode      = options.mode || null; // in case of 'custom elements' initialization the 'mode' equals 'html'
        this.id         = gId; // <g id> inside of <svg>
        this._root      = options.context; // svg root element
        this._svgroot   = this._root.getElementById(this.id); // reference on insertion node
        this._svgdoc    = this._svgroot.ownerDocument;

		this._data      = null; // last received from data provider (server + target)
		this._s2c       = new StateToColors();

		this._intervalCounter = 0;
		this._inited	= false;	// call to init() set this flag to true. after that we can build, rebuild and activate....

		this._body      = null; // the SmartPalette body

		// in case of html insertion, the options.mode == 'html' is defined and
		// the buiding process is divided on two parts:  constructor() and init() from connectedCallback.
		// in case of creating SmartPalette object from Javascript, lets do all needed work in one place...
		if (!this._mode) {
			// store containerId: ref on SmartPalette element inside SmartPalettes collection for JS access
			window.SmartPalettes.set(this.id, this);
			this.init();
		}
		if (elem && elem.tagName === 'DIV') {
			this.init(this._o);
		}
	}
	_build() {
		this._o.count = this._o.count || 9;
        // convert to numbers
		SmartPalettes.convertNumericProps(this._o);

		if (!this._body) {
				this._btnGrArr = [];
				this._buttonArr = [];
				this._paletteArr = [];
				const fontFamily = 'Arial, DIN Condensed, Noteworthy, sans-serif';
				const fontSize = '10px';
				const step = 12, gap = 10;
				let width = 66, height = 30, offsetX = gap, offsetY = gap;
				let themsGId = `${this.id}-themes`;
				this._containerG = SmartWidgets.addElement('g', {
					id: themsGId
				}, this._svgroot, this._svgdoc);

				this._bodyG = SmartWidgets.addElement('g', {
				}, this._svgroot, this._svgdoc);
				this._body = SmartWidgets.addElement('rect', {
				// visibility: 'hidden',
				x: 0,
				y: 0,
				width: `${(offsetX * 2) + (width * 3) + (step * 2)}`,
				height: `${(offsetY * 2) + (height * 3) + (step * 2)}`,
				fill: 'none',
				stroke: '#ffffff'
			}, this._bodyG, this._svgdoc);

			const offset = 36;
			const size = {
				w: +this._body.getAttribute('width') + offset + gap,
				h: +this._body.getAttribute('height')
			};
			this._bodyG.setAttribute('transform', `translate(${offset + gap}, 0)`);
			this._themes = new ScrollableContainer(themsGId, {width: offset, height: size.h, context: this._root});

			for (let n = 0; n < this._o.count; n++) {
				if (n && n % 3 == 0) {
					offsetX = gap;
					offsetY += step + height;
				}
				this._paletteArr.push(SmartWidgets.addElement('rect', {
					id: `state-${n}`,
					x: offsetX,
					y: offsetY,
					width: width,
					height: height,
					fill: '#ffffff',
					stroke: '#000000'
				}, this._bodyG, this._svgdoc));
				SmartWidgets.addElement('text', {
					text: `State ${n}`,
					x: offsetX + (width / 2),
					y: offsetY + (height / 2),
					fill: '#000000',
					'text-anchor': 'middle',
					'dominant-baseline': 'middle',
					'pointer-events': 'none',
					'font-family': fontFamily,
					'font-size': fontSize,
					// 'paint-order': 'stroke',
					// stroke: 'black',
					// 'stroke-width': "1",
					'stroke-linejoin': 'round'
				}, this._bodyG, this._svgdoc);

				this._btnGrArr.push(SmartWidgets.addElement('g', {}, this._bodyG, this._svgdoc));
				this._buttonArr.push(SmartWidgets.addElement('rect', {
					id: `btn-${n}`,
					x: offsetX,
					y: offsetY,
					width: width,
					height: height,
					fill: '#8f8f8f',
					stroke: '#ffffff'
				}, this._btnGrArr[n], this._svgdoc));
				SmartWidgets.addElement('text', {
					text: `${n} - default`,
					x: offsetX + (width / 2),
					y: offsetY + (height / 2),
					fill: '#ffffff',
					'text-anchor': 'middle',
					'dominant-baseline': 'middle',
					'alignment-baseline': 'middle',
					'pointer-events': 'none',
					'font-family': fontFamily,
					'font-size': fontSize
				}, this._btnGrArr[n], this._svgdoc);

				offsetX += step + width;
			}

			this._svgroot.setAttribute('height', size.h);
			this._svgroot.setAttribute('width', size.w);
			this._svgroot.setAttribute('viewBox', `0 0 ${size.w} ${size.h}`);

			if (1 /*this._mode != 'html'*/) {
				this._buttonArr.forEach((btn) => {
					btn.addEventListener('click', (evt) => {
						const n = Number(btn.id.replace('btn-', ''));
						this._btnGrArr[n].setAttribute('display', 'none');
						let cr = this._s2c.get(n);
						if (n && !cr) {
							cr = this._s2c.get(n - 1);
						}
						if (cr) {
							this._paletteArr[n].setAttribute('fill', cr);
						}
					});
				});
				this._paletteArr.forEach((sel) => {
					sel.addEventListener('click', (evt) => {
						const n = Number(sel.id.replace('state-', ''));
						this._s2c.delete(n);
						this._o.stateColors = this._s2c.get();
						this._btnGrArr[n].removeAttribute('display');
					});
					sel.addEventListener('wheel', (evt) => {
						evt.preventDefault();
						const stateN = Number(evt.target.id.split('-')[1]);

						const cr = evt.target.getAttribute('fill'); // `${this._colorBox.value}`;
						const c = w3color(cr);

						const P = evt.ctrlKey ? 'sat' : evt.shiftKey ? 'lightness' : 'hue';
						let K = evt.ctrlKey ? 0.01 : evt.shiftKey ? 0.01 : 1;
						if (evt.altKey) {
							K = K * 5;
						}
						const delta = evt.deltaY || evt.detail || evt.wheelDelta;
						if (delta > 0) {
							c[P] = c[P] + K;
						} else {
							c[P] = c[P] - K;
						}
						const h = c.hue > 359 ? 0 : c.hue < 0 ? 359 : c.hue;
						const s = c.sat; // > 100 ? 100 : c.sat < 0 ? 0 : c.sat;
						const l = c.lightness; // > 100 ? 100 : c.lightness < 0 ? 0 : c.lightness;

						const c2 = w3color(`hsl(${h},${s},${l})`);

						this._o.value = c2.valid ? c2.toHexString() : '#000000';
						evt.target.setAttribute('fill', this._o.value);

						this._s2c.set(stateN, this._o.value);
						this._o.stateColors = this._s2c.get();
					});
				});
			}
		}
		this._setStateColors();
		this._getTemplates();
	}
	_setStateColors() {
		this._s2c.set(this._o.stateColors);
		for (let n = 0; n < 9; n++) {
			const crDef = this._s2c.get(n);
			if (crDef) {
				this._btnGrArr[n].setAttribute('display', 'none');
				this._paletteArr[n].setAttribute('fill', crDef);
			} else {
				this._btnGrArr[n].removeAttribute('display');
			}
		}
	}
	_getTemplates() {
		for (let n = 0; n < SMART_WIDGETS.length; n++) {
			if (SMART_WIDGETS[n].match('stpal-')) {
				let theme = {
					id: `theme-${n}`,
					template: SMART_WIDGETS[n]
				};
				const themeElem = this._themes.add(theme);
				if (themeElem) {
					themeElem.addEventListener('click', (evt) => {
						const target = evt.target;
						// const ida = target.id.split('-');
						// const selId = ida[ida.length - 1];
						theme = this._themes.get(target.id);

						const opt = SmartPalettes.JsonToOptions(theme.template);
						this._o.stateColors = opt.stateColors;
						this._setStateColors();
					});
				}
			}
		}
	}

	// API
	getAlias() {
		return this._o.alias;
	}
    getCtrl() {
        return this;
	}
	isInited() {
		return this._inited;
	}
    init(options = null) {
        if (options) {
			// check for options in JSON format and convert its to object in this case
			const smartWidgetAlias = SmartWidgets.getAlias();
			if (typeof options === 'string' && options.length && options.startsWith(smartWidgetAlias)) {
				options = SmartPalettes.JsonToOptions(options);
			}

            // validate and merge with own _o
            SmartPalettes.convertNumericProps(options);
            this._o = Object.assign({}, this._o, options);
        }
        const rc = this._svgroot.firstElementChild;
        this._rect = rc.getBBox();
        rc.setAttribute('display', 'none');
        if (!this._mode) {
			if (this._rect.width == 0 || this._rect.height == 0) {
				this._rect.x = Number(rc.getAttribute('x'));
				this._rect.y = Number(rc.getAttribute('y'));
				// get size from attributes!
				this._rect.width = Number(rc.getAttribute('width'));
				// will be ignored. thickness will be used instead of height!
				this._rect.height = Number(rc.getAttribute('height'));
			}
        } else {
			// calculate svg rectangle and coordinates
			this._rect = {
				x: 0,
				y: 0,
				width:  200,  // options.length,
				height: 150   // options.thickness
			};
		}
		this._inited = true;
        this._build();

        this._data = new Set();
    }

    isRun() {
		return false;
	}
	run(isRun) {
		console.log('Runtime updates for this widget not applicable');
	}
	get intervalCounter() {
		return Infinity;
	}
	set intervalCounter(n) {
		console.log('Runtime updates for this widget not applicable');
	}
	isEmulate() {
		return false;
	}
	emulate(mode) {
		console.log('Runtime updates for this widget not applicable');
	}
	update(data = null) {
		console.log('Runtime updates for this widget not applicable');
	}
	generateExData() {
		console.log('Runtime updates for this widget not applicable');
	}
	/**
	 * Get parameters of Smart Widget
	 * @param {string} filter 'all', 'dirty', 'def', 'vars', 'names', 'css', 'json', 'cjson'
	 * @returns smart object parameters in form specified by filter
	 */
	getParams(filter = 'all') {
		let opt;
		const customProp = SmartPalettes.getCustomProperties();		// get an array of custom properties
		const defOptions = SmartPalettes.defOptions();
		switch (filter) {
			case 'cjson': // compressed json
				opt = SmartWidgets.getCustomParams(customProp, defOptions, this._o, 'dirty');
				delete opt.role;
				return SmartPalettes.getCompressedJSON(opt);
			case 'json':
				opt = SmartWidgets.getCustomParams(customProp, defOptions, this._o, 'dirty', 'none');
				return SmartPalettes.getJSON(opt);
			case 'css':
				opt = SmartWidgets.getCustomParams(customProp, defOptions, this._o, 'dirty', 'none');
				return SmartPalettes.getCSS(opt);
			case 'names':
				return SmartWidgets.getCustomParams(customProp, defOptions);
			case 'vars':
				return customProp;
			case 'def':
				return defOptions;
			case 'dirty':
			case 'all':
			default:
				return SmartWidgets.getCustomParams(customProp, defOptions, this._o, filter);
		}
	}
	setParam(name, value) {
		if (this.dontRespond) {	// don't respond on changing parameters when updating user panels in UI Builder (for example)
			return;
		}
		const opt = {};
		opt[name] = value;
		// convert to numbers specified by name property
		SmartPalettes.convertNumericProps(opt, name);

		if (this._body) {
			this.setParams(opt);
		}
	}
	resetParams(options = null) {
		if (options) {
			this._o = Object.assign({}, SmartPalettes.defOptions(), options);
			this._build();
		}
	}
	setParams(options = {}, rebuild = true) {
		let needRebuild = false;
		if (!options) {
			return false;
		}
		// convert all known properties to numbers
		SmartPalettes.convertNumericProps(options);
		this._o = Object.assign({}, this._o, options);

		// some properties changing requires rebuilding, lets find its!
		for (let key in this._o) {
			switch (key) {
				case 'stateColors':
					this._setStateColors();
					break;
				// default:
				// 	needRebuild++;
				// 	break;
			}
		}
		if (rebuild && needRebuild) {
            this._build();
		}
		return needRebuild;
	}
}

class SmartPaletteElement extends HTMLElement {
	constructor(id) {
		super();

		// create SmartPalettes collection only once!
		SmartPalettes.init();

		const txtStyle = `
			:host {
				all: initial;	/* 1st rule so subsequent properties are reset. */
				contain: content;	/* set containment to layout + style + paint for improving performance (see "css-containment") */
				opacity: 1;
				will-change: opacity;
				transition: opacity 500ms ease-in-out;
			}
		`;

		const supportsShadowDOMV1 = !!HTMLElement.prototype.attachShadow;
		if (!supportsShadowDOMV1) {
			throw new Error('This browser does not support shadow DOM v1. Think about switching to a Chrome browser that supports all new technologies!');
		}
		this._id = this.getAttribute('id') || id;
		this._o = {};

		this._root = this.attachShadow({mode: 'open'});
		// make unique ids for 'stpal' container g inside svg
		const elemId = window.SmartPalettes.getId();
		const svgId = `${this.id}--${SmartPalettes.getAlias()}`;
		this._root.innerHTML = `<style>${txtStyle}</style>${SmartWidgets.getSVGContext(svgId, elemId)}`;
		this._svgroot = this._root.querySelector('svg');
		// now create the smart palette control!
		this._stctrl = new SmartPalette(elemId, {
			context: this._svgroot,
			mode: 'html',
			opt: null
		});
		// store containerId: ref on SmartPieElement element inside SmartPies collection for JS access
		window.SmartPalettes.set(this._id, this);
	}
	getCtrl() {
		return this._stctrl;
	}

	// attributes changing processing
	static get observedAttributes() {
		return SmartPalettes.getCustomProperties();
	}
	attributeChangedCallback(name, oldValue, newValue) {
		// update own property
		const paramName = SmartWidgets.customProp2Param(name);
		this._o[paramName] = newValue;
		this._stctrl.setParam(paramName, newValue);
	}

	// connect and disconnect from html
	connectedCallback() {
		// getting properties in form 'stpal-XXX' and 'stpal-var-XXX' from styles
		const compStyle = getComputedStyle(this);
		const customProp = SmartPalettes.getCustomProperties();
		for (let n = 0; n < customProp.length; n++) {
			const prop = `--${SmartPalettes.getAlias()}-${customProp[n]}`;
			const propKey = SmartPalettes.customProp2Param(`${customProp[n]}`);
			let propVal = compStyle.getPropertyValue(prop);
			if (propVal) {
				propVal = propVal.trimLeft();
				this._o[propKey] = propVal;
			}
		}
		// all specific work will be done inside
		this._stctrl.init(this._o);

		// resize own svg
		// this._svgroot.setAttribute('height', size);
		// this._svgroot.setAttribute('width', size);
		// this._svgroot.setAttribute('viewBox', `0 0 ${size} ${size}`);

	}
	disconnectedCallback() {
		window.SmartPaletts.unset(this._id);
		this._stctrl = null;
		this._root = null;
		this._o = null;
	}

}
window.customElements.define('smart-ui-palette', SmartPaletteElement);
