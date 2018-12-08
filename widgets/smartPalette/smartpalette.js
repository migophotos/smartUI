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
			'state-colors'		// State to color interpretator string in comma-separated format. There are two versions of formatted strings are supported.
								// Old format: state:color,state:color,... where state is a number from 0 upto 9 and color is in hex representation whith '#' character
								// New format: statecolor,statecolor,... where state is a number from 0 upto 9 and color is in hex representation whith '#' character
								// by default (currently) is empty, what means not in use
        ];
    }
    static defOptions() {
        return {
			role: '',			// in demo mode this parameter has value 'demoMode'
			alias: SmartPalettes.getAlias(),
			isGlobalColors: 1,
			stateColors: '0#0080c0,1#008000,2#ffff15,3#ff2f2f,4#9f0000,5#f0f0f0'
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
		this._s2c_2		= new StateToColors();
		this._setValueCallback = options.cb || null;

		this._hueG		= null;
		this._satG		= null;
		this._lumG		= null;

		this._satCtrl	= null;	// saturations slider with role = 'ctrl'
		this._lumCtrl	= null;	// luminance slider with role = 'ctrl'

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
			this._paletteBtnArr = [];
			this._paletteSelState = -1;

			this._hueCtrlArr = [];
			this._satCtrlArr = [];
			this._lumCtrlArr = [];

			const fontFamily = 'Arial, DIN Condensed, Noteworthy, sans-serif';
			const fontSize = '10px';
			const step = 6, gap = 6;
			let width = 60, height = 50, offsetX = gap, offsetY = gap;
			const bodyHeight = `${(offsetY * 2) + (height * 3) + (step * 2)}`;
			const bodyWidth  = `${(offsetX * 2) + (width * 3) + (step * 2)}`;
			let themsGId = `${this.id}-themes`;
			this._containerG = SmartWidgets.addElement('g', {
				id: themsGId
			}, this._svgroot, this._svgdoc);

			this._bodyG = SmartWidgets.addElement('g', {
			}, this._svgroot, this._svgdoc);
			this._body = SmartWidgets.addElement('rect', {
				x: 0,
				y: 0,
				width: `${(offsetX * 2) + (width * 3) + (step * 2)}`,
				height: `${(offsetY * 2) + (height * 3) + (step * 2)}`,
				fill: '#666666',
				stroke: '#ffffff'
			}, this._bodyG, this._svgdoc);
			if (this._o.role !== 'demoMode') {
				// create container for Hue control
				this._hueG =  SmartWidgets.addElement('g', {
					id: 'hue-g',
					style: 'cursor: pointer;'
				}, this._svgroot, this._svgdoc);
				let cell = +(((bodyHeight - 40) / 24).toFixed(0));
				for (let nh = 0; nh < 24; nh++) {
					const h = nh * 15;
					const cr = w3color(`hsl(${h}, 100%, 50%)`);
					this._hueCtrlArr.push(SmartWidgets.addElement('rect', {
						id: `hue-${nh}`,
						x: 0,
						y: nh * (cell + 0.6),
						width: 20,
						height: cell,
						fill: cr.toHexString(),
						// 'paint-order': 'stroke'
					}, this._hueG, this._svgdoc));
				}
				SmartWidgets.addElement('text', {
					text: 'H',
					x: 10,
					y: bodyHeight - 4,
					fill: '#ffffff',
					'text-anchor': 'middle',
					'dominant-baseline': 'middle',
					'pointer-events': 'none',
					'font-family': fontFamily,
					'font-size': 16,
					'stroke-linejoin': 'round'
				}, this._hueG, this._svgdoc);

				// create container for Saturation control
				this._satG =  SmartWidgets.addElement('g', {
					id: 'sat-g',
					style: 'cursor: pointer;'
				}, this._svgroot, this._svgdoc);

				cell = +(((bodyHeight - 38) / 21).toFixed(0));
				for (let ns = 0; ns < 21; ns++) {
					this._satCtrlArr.push(SmartWidgets.addElement('rect', {
						id: `sat-${ns}`,
						x: 0,
						y: ns * (cell + 1.6),
						width: 20,
						height: cell
					}, this._satG, this._svgdoc));
				}
				SmartWidgets.addElement('text', {
					text: 'S',
					x: 10,
					y: bodyHeight - 4,
					fill: '#ffffff',
					'text-anchor': 'middle',
					'dominant-baseline': 'middle',
					'pointer-events': 'none',
					'font-family': fontFamily,
					'font-size': 16,
					'stroke-linejoin': 'round'
				}, this._satG, this._svgdoc);

				// create container for Luminance control
				this._lumG =  SmartWidgets.addElement('g', {
					id: 'lum-g',
					style: 'cursor: pointer;'
				}, this._svgroot, this._svgdoc);
				for(let nl = 0; nl < 21; nl++) {
					this._lumCtrlArr.push(SmartWidgets.addElement('rect', {
						id: `lum-${nl}`,
						x: 0,
						y: nl * (cell + 1.6),
						width: 20,
						height: cell
					}, this._lumG, this._svgdoc));
				}
				SmartWidgets.addElement('text', {
					text: 'L',
					x: 12,
					y: bodyHeight - 4,
					fill: '#ffffff',
					'text-anchor': 'middle',
					'dominant-baseline': 'middle',
					'pointer-events': 'none',
					'font-family': fontFamily,
					'font-size': 16,
					// 'paint-order': 'stroke',
					// stroke: 'black',
					// 'stroke-width': "1",
					'stroke-linejoin': 'round'
				}, this._lumG, this._svgdoc);
				this._hueG.setAttribute('visibility', 'hidden');
				this._satG.setAttribute('visibility', 'hidden');
				this._lumG.setAttribute('visibility', 'hidden');
			}

			const offset = 50;
			const distance = gap + offset + step;
			const size = {
				w: +this._body.getAttribute('width') + (this._o.role !== 'demoMode' ? distance + 150 + (gap * 2) : 0),
				h: +this._body.getAttribute('height')
			};

			if (this._o.role !== 'demoMode') {
				this._bodyG.setAttribute('transform', `translate(${distance}, 0)`);
				// if (this._mode !== 'html') {
					this._hueG.setAttribute('transform', `translate(${274}, 0)`);
					this._satG.setAttribute('transform', `translate(${300}, 0)`);
					this._lumG.setAttribute('transform', `translate(${326}, 0)`);
				// }
				this._themes = new ScrollableContainer(themsGId, {
					width: offset,
					height: size.h,
					gap: gap,
					row: 32,
					context: this._root
				});
			}

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
					stroke: '#ffffff',
					tabindex: n,
					style: 'cursor:pointer;'
				}, this._bodyG, this._svgdoc));
				this._paletteBtnArr.push(SmartWidgets.addElement('path', {
					id: `statebtn-${n}`,
					// x: offsetX,
					// y: offsetY,
					// width: 10,
					// height: 10,
					d: `M${offsetX},${offsetY} h10 v10 h-10 v-9 L${offsetX + 10},${offsetY + 10} M${offsetX + 10},${offsetY} L${offsetX},${offsetY + 10}`,
					fill: '#ffffff',
					stroke: '#0b0b0b',
					'stroke-width': 1.4,
					style: 'cursor:pointer;'
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
				SmartWidgets.addElement('rect', {
					// id: `btn-${n}`,
					x: offsetX,
					y: offsetY,
					width: width,
					height: height,
					fill: '#8f8f8f',
					stroke: '#ffffff',
				}, this._btnGrArr[n], this._svgdoc);
				this._buttonArr.push(SmartWidgets.addElement('rect', {
					id: `btn-${n}`,
					x: offsetX,
					y: offsetY,
					width: 10,
					height: 10,
					fill: '#ffffff',
					stroke: '#ffffff',
					style: 'cursor:pointer;'
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

			if (1) {
				if (this._hueG) {
					this._hueG.addEventListener('wheel', (evt) => {
						evt.preventDefault();
						if (this._paletteSelState >= 0) {
							const delta = evt.deltaY || evt.detail || evt.wheelDelta;
							const K = delta < 0 ? -1 : 1;
							const curColor = this._getSelColor();
							const cr = w3color(curColor);
							let cellHue = cr.hue + K;
							cellHue = cellHue > 359 ? 0 : cellHue < 0 ? 359 : cellHue;

							const cr2 = w3color(`hsl(${cellHue},${cr.sat},${cr.lightness})`);
							const newColor = cr2.toHexString();
							this._setSelColor(newColor);
						}
					});
					this._satG.addEventListener('wheel', (evt) => {
						evt.preventDefault();
						if (this._paletteSelState >= 0) {
							const delta = evt.deltaY || evt.detail || evt.wheelDelta;
							const K = delta < 0 ? -0.01 : 0.01;
							const curColor = this._getSelColor();
							const cr = w3color(curColor);
							let cellSat = cr.sat + K;
							cellSat = cellSat > 0 ? (cellSat < 1 ? cellSat : 1) : 0;

							const cr2 = w3color(`hsl(${cr.hue},${cellSat},${cr.lightness})`);
							const newColor = cr2.toHexString();
							this._setSelColor(newColor);
						}
					});
					this._lumG.addEventListener('wheel', (evt) => {
						evt.preventDefault();
						if (this._paletteSelState >= 0) {
							const delta = evt.deltaY || evt.detail || evt.wheelDelta;
							const K = delta < 0 ? -0.01 : 0.01;
							const curColor = this._getSelColor();
							const cr = w3color(curColor);
							let cellLum = cr.lightness + K;
							cellLum = cellLum > 0 ? (cellLum < 1 ? cellLum : 1) : 0;

							const cr2 = w3color(`hsl(${cr.hue},${cr.sat},${cellLum})`);
							const newColor = cr2.toHexString();
							this._setSelColor(newColor);
						}
					});


					this._hueG.addEventListener('click', (evt) => {
						evt.preventDefault();
						if (this._paletteSelState >= 0) {
							const cellHue = Number(evt.target.id.replace('hue-', '')) * 15;
							if (isNaN(cellHue)) {
								return;
							}
							const curColor = this._getSelColor();
							const cr = w3color(curColor);
							const cr2 = w3color(`hsl(${cellHue},${cr.sat},${cr.lightness})`);
							const newColor = cr2.toHexString();
							this._setSelColor(newColor);
						}
					});
					this._satG.addEventListener('click', (evt) => {
						evt.preventDefault();
						if (this._paletteSelState >= 0) {
							const cellSat = Number(evt.target.id.replace('sat-', '')) * 5;
							if (isNaN(cellSat)) {
								return;
							}
							const cr = w3color(this._getSelColor());
							const cr2 = w3color(`hsl(${cr.hue}, ${cellSat}%, ${cr.lightness})`);
							this._setSelColor(cr2.toHexString());
						}
					});
					this._lumG.addEventListener('click', (evt) => {
						evt.preventDefault();
						if (this._paletteSelState >= 0) {
							const cellLum = Number(evt.target.id.replace('lum-', '')) * 5;
							if (isNaN(cellLum)) {
								return;
							}
							const cr = w3color(this._getSelColor());
							const cr2 = w3color(`hsl(${cr.hue}, ${cr.sat}, ${cellLum}%)`);
							this._setSelColor(cr2.toHexString());
						}
					});
				}
				this._buttonArr.forEach((btn) => {
					btn.addEventListener('click', (evt) => {
						evt.preventDefault();
						this._paletteSelState = Number(btn.id.replace('btn-', ''));
						this._setSelectedState();

						this._btnGrArr[this._paletteSelState].setAttribute('display', 'none');
						let cr = this._s2c.get(this._paletteSelState);
						if (!cr) {
							const ownColor = this._paletteArr[this._paletteSelState].getAttribute('fill')
							cr = this._paletteSelState ? this._s2c.get(this._paletteSelState - 1) : ownColor;
							if (!cr) {
								cr = ownColor;
							}
						}
						if (cr) {
							this._setSelColor(cr);
						}
					});
				});
				this._paletteBtnArr.forEach((sel) => {
					sel.addEventListener('click', (evt) => {
						evt.preventDefault();
						const n = Number(sel.id.replace('statebtn-', ''));
						this._s2c.delete(n);
						this._o.stateColors = this._s2c.get();
						this._btnGrArr[n].removeAttribute('display');
						this._paletteSelState = n > 0 ? n - 1 : -1;
						this._setSelectedState();

						this._showSliders(this._paletteSelState >= 0);

						if (this._setValueCallback) {
							this._setValueCallback(this._o.stateColors);
						}
					});
				});
				this._paletteArr.forEach((sel) => {
					sel.addEventListener('click', (evt) => {
						evt.preventDefault();
						const n = Number(sel.id.replace('state-', ''));
						this._paletteSelState = n;
						this._setSelectedState();

						this._showSliders(this._paletteSelState >= 0);

						const cr = evt.target.getAttribute('fill');
						if (this._hueG && this._satG && this._lumG) {
							this._setHue(cr);
							this._setLum(cr);
							this._setSat(cr);
						}
					});
					sel.addEventListener('wheel', (evt) => {
						evt.preventDefault();
						const stateN = Number(evt.target.id.split('-')[1]);
						if (stateN != this._paletteSelState) {
							return;
						}
						const cr = evt.target.getAttribute('fill');
						const c = w3color(cr);

						const P = evt.ctrlKey ? 'sat' : evt.shiftKey ? 'lightness' : 'hue';
						let K = evt.ctrlKey || evt.shiftKey ? 0.01 : 1;
						if (evt.altKey) {
							K = K * 3;
						}
						const delta = evt.deltaY || evt.detail || evt.wheelDelta;
						K = delta < 0 ? -K : K;
						c[P] += K;
						const h = c.hue > 359 ? 0 : c.hue < 0 ? 359 : c.hue;
						const l = c.lightness > 0 ? (c.lightness < 1 ? c.lightness : 1) : 0;
						const s = c.sat > 0 ? (c.sat < 1 ? c.sat : 1) : 0;
						const c2 = w3color(`hsl(${h},${s},${l})`);

						this._setSelColor(c2.toHexString());
					});
				});
			}
		}
		this._setStateColors();
		if (this._o.role !== 'demoMode') {
			this._getTemplates();
		}
	}
	_showSliders(enable) {
		if (this._hueG && this._satG && this._lumG) {
			this._hueG.setAttribute('visibility', enable ? 'visible' : 'hidden');
			this._satG.setAttribute('visibility', enable ? 'visible' : 'hidden');
			this._lumG.setAttribute('visibility', enable ? 'visible' : 'hidden');
		}
	}
	_setSelectedState() {
		for (let n = 0; n < 9; n++) {
			let strokeColor = '#ffffff';
			if (n == this._paletteSelState) {
				strokeColor = '#0b0b0b';
			}
			this._paletteArr[n].setAttribute('stroke', strokeColor);
		}
	}
	_setStateColors(s2c = null) {
		const s2cRef = s2c || this._s2c;
		s2cRef.set(this._o.stateColors, '', this._o.isGlobalColors);
		for (let n = 0; n < 9; n++) {
			const crDef = s2cRef.get(n);
			if (crDef) {
				this._btnGrArr[n].setAttribute('display', 'none');
				this._paletteArr[n].setAttribute('fill', crDef);
			} else {
				this._btnGrArr[n].removeAttribute('display');
			}
		}
	}
	_setLum(color) {
		const c = w3color(color);
		let curLum = null, cellLum, Lum = c.lightness * 100;
		for (let n = 0; n < 21; n++) {
			cellLum = n * 5;
			const c2 = w3color(`hsl(${c.hue}, ${c.sat * 100}%, ${cellLum}%)`);
			this._lumCtrlArr[n].setAttribute('fill', c2.toHexString());
			let strokeColor = 'none', strokeWidth = 0;
			if (Math.abs(cellLum - Lum) < 2.5) {
				strokeColor = '#ffffff';
				strokeWidth = 2;
				curLum = cellLum;
			}
			this._lumCtrlArr[n].setAttribute('stroke', strokeColor);
			this._lumCtrlArr[n].setAttribute('stroke-width', strokeWidth);
		}
		this._lumG.dataset['curLum'] = curLum;
	}
	_setSat(color) {
		const c = w3color(color);
		let curSat = null, cellSat, Sat = c.sat * 100;
		for (let n = 0; n < 21; n++) {
			cellSat = n * 5;
			const c2 = w3color(`hsl(${c.hue}, ${cellSat}%, ${c.lightness * 100}%)`);
			this._satCtrlArr[n].setAttribute('fill', c2.toHexString());
			let strokeColor = 'none', strokeWidth = 0;
			if (Math.abs(cellSat - Sat) < 2.5) {
				strokeColor = '#ffffff';
				strokeWidth = 2;
				curSat = cellSat;
			}
			this._satCtrlArr[n].setAttribute('stroke', strokeColor);
			this._satCtrlArr[n].setAttribute('stroke-width', strokeWidth);
		}
		this._satG.dataset['curSat'] = curSat;
	}
	_setHue(color) {
		const c = w3color(color);
		let curHue = null, cellHue, Hue = c.hue, invHue;
		for (let n = 0; n < 24; n++) {
			cellHue = n * 15;
			let strokeColor = 'none', strokeWidth = 0;
			// invHue = n;
			if (Math.abs(cellHue - Hue) < 7.5) {
				strokeColor = '#ffffff';
				strokeWidth = 2;
				curHue = cellHue;
				// console.log(`curHue = ${cellHue}`);
			}
			this._hueCtrlArr[n].setAttribute('stroke', strokeColor);
			this._hueCtrlArr[n].setAttribute('stroke-width', strokeWidth);
		}
		this._hueG.dataset['curHue'] = curHue;
		// if (!curHue) {
		// 	console.log(`invalid = ${invHue}, orig = ${c.hue}`);
		// }
	}
	_setSelColor(color) {
		if (this._paletteSelState > -1) {
			const stateElem = this._paletteArr[this._paletteSelState];
			stateElem.setAttribute('fill', color);

			this._s2c.set(this._paletteSelState, color);
			this._o.stateColors = this._s2c.get();
			if (this._setValueCallback) {
				this._setValueCallback(this._o.stateColors);
			}
			if (this._hueG && this._satG && this._lumG) {
				this._setHue(color);
				this._setLum(color);
				this._setSat(color);
			}
		}
	}
	_getSelColor() {
		if (this._paletteSelState > -1) {
			const stateElem = this._paletteArr[this._paletteSelState];
			const cr = stateElem.getAttribute('fill');
			const c = w3color(cr);
			return c.toHexString();
		}
		return '#000000';
	}
	_getTemplates() {
		for (let n = 0; n < SMART_WIDGETS.length; n++) {
			if (SMART_WIDGETS[n].match('stpal-')) {
				let theme = {
					id: `theme-${n}`,
					data: SMART_WIDGETS[n],
					cb: this._drawItem,
					owner: this._mode === 'html' ? this._root.getRootNode().host.id : this.id
				};
				const themeElem = this._themes.add(theme);
				if (themeElem) {
					themeElem.addEventListener('click', (evt) => {
						evt.preventDefault();
						const target = evt.target;
						// const ida = target.id.split('-');
						// const selId = ida[ida.length - 1];
						theme = this._themes.get(target.id);

						const opt = SmartPalettes.JsonToOptions(theme.data);
						this._o.stateColors = opt.stateColors;
						this._setStateColors(this._s2c_2);

						// callback to owner about changing value
						if (this._setValueCallback) {
							this._setValueCallback(opt.stateColors);
						}
					});
				}
			}
		}
	}
	/**
	 * Callback function for creating item inside scrollable container (see ScrollableContainer.add(...))
	 * @param {object} root container <g> element into wich new item will be appended
	 * @param {object} data id, coordinates, color and other data of item that will be appended
	 * @returns reference on created item
	 */
	_drawItem(root, data) {
		const ownerRef = window.SmartPalettes.get(data.owner);
		const opt = SmartPalettes.JsonToOptions(data.data);
		ownerRef._s2c_2.set(opt.stateColors);

		const item = SmartWidgets.addElement('g', {}, root, ownerRef._svgdoc);
		SmartWidgets.addElement('rect', {
			id: data.id,
			x: data.x,
			y: data.y,
			width: data.width,
			height: data.height,
			stroke: data.stroke,
			'stroke-width': data['stroke-width'],
			fill: '#666666',
			tabindex: data.tabindex
		}, item, ownerRef._svgdoc);

		let w = (data.width - data['stroke-width']) / 3;
		let h = (data.height - data['stroke-width']) / 3;
		let dx = data.x + data['stroke-width']/2, dy = data.y + data['stroke-width']/2;
		for (let n = 0; n < 9; n++) {
			const crDef = ownerRef._s2c_2.get(n)
			if (n && n % 3 == 0) {
				dx = data.x + data['stroke-width']/2;
				dy += h;
			}
			SmartWidgets.addElement('rect', {
				x: dx,
				y: dy,
				width: w,
				height: h,
				stroke: 'none',
				'stroke-width': 0,
				fill: crDef || 'none',
				'pointer-events': 'none'
			}, item, ownerRef._svgdoc);
			dx += w;
		}
		return item;
	}

	// API
	getAlias() {
		return this._o.alias;
	}
    getCtrl() {
        return this;
	}
	getSize() {
		const size = {
			width: this._svgroot.getAttribute('width'),
			height: this._svgroot.getAttribute('height')
		};
		return size;
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
		if (rc) {
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
			}
		}
		if (this._mode) {
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

		const size = this._stctrl.getSize();
		// resize own svg
		SmartWidgets.setAttributes([this._svgroot], {
			width: size.width,
			height: size.height,
			viewbox: `0 0 ${size.width} ${size.height}`
		});
	}
	disconnectedCallback() {
		// window.SmartPaletts.unset(this._id);
		this._stctrl = null;
		this._root = null;
		this._o = null;
	}

}
window.customElements.define('smart-ui-palette', SmartPaletteElement);
