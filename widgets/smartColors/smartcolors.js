/* eslint-disable linebreak-style */
/* eslint-disable indent */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-multi-spaces) */
/* eslint-disable no-underscore-dangle */
/* eslint-disable guard-for-in */
/* eslint-disable no-multi-spaces */
/**
 * SmartColorSelectors
 * @copyright Copyright © 2018 ... All rights reserved.
 * @author Michael Goyberg
 * @license
 * @version   1.0

 */
class SmartColorSelectors extends SmartWidgets {
	static getAlias() {
		return 'stcrs';
	}
	static buidOptionsAndCssVars(opt, what = 'options') {
		const customProp = SmartPalettes.getCustomProperties();
		return SmartWidgets.buidOptionsAndCssVars(opt, customProp, what == 'options' ? '' : SmartColorSelectors.getAlias());
	}
	static getOptions(opt) {
		return SmartColorSelectors.buidOptionsAndCssVars(opt);
	}
	static getCSS(opt) {
		return SmartColorSelectors.buidOptionsAndCssVars(opt, 'css');
	}
	static getJSON(opt) {
		return `'${JSON.stringify(SmartColorSelectors.getOptions(opt))}'`;
	}
	static getCompressedJSON(opt) {
		const customProp = SmartColorSelectors.getCustomProperties();
		const defOptions = SmartColorSelectors.defOptions();
		const fullJson = SmartWidgets.getCustomParams(customProp, defOptions, opt, 'all', SmartColorSelectors.getAlias());
		return `'${JSON.stringify(fullJson)}'`;
	}
    static init(context = {}) {
        if (!window.SmartColorSelectors) {
            window.SmartColorSelectors = new SmartColorSelectors();
        }
        window.SmartColorSelectors.init(context);
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
				const customProp = SmartColorSelectors.getCustomProperties();
				let index = 1;
				for (let prop of customProp) {
					if (optArr[index] != '.') {
						options[SmartWidgets.customProp2Param(prop)] = optArr[index];
					}
					index++;
				}
				SmartColorSelectors.convertNumericProps(options);
				options.alias = optArr[0];
				return options;
			}
			const aliasKey = `--${SmartColorSelectors.getAlias()}-`;
			for (let key in tmpOpt) {
				const paramName = key.replace(aliasKey, '');
				options[SmartWidgets.customProp2Param(paramName)] = tmpOpt[key];
			}
			SmartColorSelectors.convertNumericProps(options);
			return options;
		}
		return null;
	}
	static getCustomProperties() {
		return [
			'role',				// in demo mode this parameter has value 'demoMode'
			'alias',			// 'stpal'
			'bkg-color',
			'border-color',
			'border-width',
			'border-radius',
			'body-opacity',
			'is-shadow'
        ];
    }
    static defOptions() {
        return {
			role: '',			// in demo mode this parameter has value 'demoMode'
			alias: SmartColorSelectors.getAlias(),
			bkgColor: '#404040',
			borderColor: 'none',
			borderWidth: 0,
			borderRadius: 2,
			bodyOpacity: 1,
			isShadow: 0
		};
	}
	static convertNumericProps(options = {}, propName) {
        const numericProps = [
			'border-width',
			'border-radius',
			'body-opacity',
			'is-shadow'
        ];
        return SmartWidgets.convertToNumbers(options, numericProps, propName);
	}

    constructor() {
		super();
		this._alias = SmartColorSelectors.getAlias();
		this.uniqueId = this._makeId(this._alias, 0);
	}
	initCtrl(id, options) {
		let ctrl = this.get(id);
		if (!ctrl) {
			ctrl = new SmartColorSelector(id, options);
			if (ctrl) {
				ctrl.init(options);
			}
		}
	}
	unInitCtrl(id) {
        // todo....  #E3D44D
	}
}
class SmartColorSelector {
    constructor(id, options = null) {
		if (!options) {
			console.error('must to be specified!');
			return;
		}
		const txtStyle = `
			svg {
				overflow: visible;
				--no-color:	none;
			}
			.stcrs.shadowed {
				filter: url(#drop-shadow);
			}
			.stcrs.linked {
				cursor: pointer;
			}
			.stcrs.animated {
				transition:all 1.5s;
			}
			.hue-range {
				background-image: url('data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4gPHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJncmFkIiBncmFkaWVudFVuaXRzPSJvYmplY3RCb3VuZGluZ0JveCIgeDE9IjAuMCIgeTE9IjAuNSIgeDI9IjEuMCIgeTI9IjAuNSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iI2ZmMDAwMCIvPjxzdG9wIG9mZnNldD0iMTIuNSUiIHN0b3AtY29sb3I9IiNmZmJmMDAiLz48c3RvcCBvZmZzZXQ9IjI1JSIgc3RvcC1jb2xvcj0iIzgwZmYwMCIvPjxzdG9wIG9mZnNldD0iMzcuNSUiIHN0b3AtY29sb3I9IiMwMGZmNDAiLz48c3RvcCBvZmZzZXQ9IjUwJSIgc3RvcC1jb2xvcj0iIzAwZmZmZiIvPjxzdG9wIG9mZnNldD0iNjIuNSUiIHN0b3AtY29sb3I9IiMwMDQwZmYiLz48c3RvcCBvZmZzZXQ9Ijc1JSIgc3RvcC1jb2xvcj0iIzdmMDBmZiIvPjxzdG9wIG9mZnNldD0iODcuNSUiIHN0b3AtY29sb3I9IiNmZjAwYmYiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNmZjAwMDAiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB4PSIwIiB5PSIwIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyYWQpIiAvPjwvc3ZnPiA=');
				background-size: 100%;
				background-image: -webkit-gradient(linear, 0% 50%, 100% 50%, color-stop(0%, #ff0000), color-stop(12.5%, #ffbf00), color-stop(25%, #80ff00), color-stop(37.5%, #00ff40), color-stop(50%, #00ffff), color-stop(62.5%, #0040ff), color-stop(75%, #7f00ff), color-stop(87.5%, #ff00bf), color-stop(100%, #ff0000));
				background-image: -moz-linear-gradient(left, #ff0000 0%, #ffbf00 12.5%, #80ff00 25%, #00ff40 37.5%, #00ffff 50%, #0040ff 62.5%, #7f00ff 75%, #ff00bf 87.5%, #ff0000 100%);
				/* background-image: -webkit-linear-gradient(left, #ff0000 0%, #ffbf00 12.5%, #80ff00 25%, #00ff40 37.5%, #00ffff 50%, #0040ff 62.5%, #7f00ff 75%, #ff00bf 87.5%, #ff0000 100%); */
				/* background-image: linear-gradient(to right, #ff0000 0%, #ffbf00 12.5%, #80ff00 25%, #00ff40 37.5%, #00ffff 50%, #0040ff 62.5%, #7f00ff 75%, #ff00bf 87.5%, #ff0000 100%); */
			}
		`;

		let gId = id;
		// check for options in JSON format and convert its to object in this case
		const smartWidgetAlias = SmartWidgets.getAlias();
		// check input parameters
		const elem = document.getElementById(id);
		if (elem && elem.tagName === 'DIV') {
			const elemId = window.SmartColorSelectors.getId();
			const svgId = `${id}--${SmartColorSelectors.getAlias()}`;
			this._shadowDOM = elem.attachShadow({mode: 'open'});
			this._shadowDOM.innerHTML = `${SmartWidgets.getSVGContext(svgId, elemId)}`;
			options = {
				mode: 'html',
				context: this._shadowDOM.getElementById(svgId),
				opt: options
			};
			window.SmartColorSelectors.set(id, this);
			gId = elemId;
		}

		if (typeof options.opt === 'string' && options.opt.length && options.opt.includes(smartWidgetAlias)) {
			options.opt = SmartColorSelectors.JsonToOptions(options.opt);
		}

        // merge default options with specified
        this._o = Object.assign({}, SmartColorSelectors.defOptions(), options.opt || {});
        // validate all properties
        SmartColorSelectors.convertNumericProps(this._o);

        this._mode      = options.mode || null; // in case of 'custom elements' initialization the 'mode' equals 'html'
        this.id         = gId; // <g id> inside of <svg>
        this._root      = options.context; // svg root element
        this._svgroot   = this._root.getElementById(this.id); // reference on insertion node
        this._svgdoc    = this._svgroot.ownerDocument;

		this._hueG		= null;
		this._satG		= null;
		this._lumG		= null;

		this._intervalCounter = 0;
		this._inited	= false;	// call to init() set this flag to true. after that we can build, rebuild and activate....

		this._body      = null; // the SmartColorSelector body

		let tmpId = `style--${SmartColorSelectors.getAlias()}`;
		if (!this._root.getElementById(tmpId)) {
			const style = SmartWidgets.addElement('style', {
				id: tmpId
			}, this._root, this._svgdoc);
			style.textContent = txtStyle;
		}
		tmpId = `defs--${SmartColorSelectors.getAlias()}`
		if (!this._root.getElementById(tmpId)) {
			this._defs = SmartWidgets.addElement('defs', {
				id: tmpId
			}, this._root, this._svgdoc);
			const hueRangeDef =
			`<linearGradient id="hueRange" x1="0%" y1="50%" x2="100%" y2="50%">
				<stop offset="0%" stop-color="#ff0000"/>
				<stop offset="12.5%" stop-color="#ffbf00"/>
				<stop offset="25%", stop-color="#80ff00"/>
				<stop offset="37.5%", stop-color="#00ff40"/>
				<stop offset="50%", stop-color="#00ffff"/>
				<stop offset="62.5%", stop-color="#0040ff"/>
				<stop offset="75%", stop-color="#7f00ff"/>
				<stop offset="87.5%", stop-color="#ff00bf"/>
				<stop offset="100%", stop-color="#ff0000"/>
			</linearGradient>`;
			const lumRangeDef =
			`<linearGradient id="lumRange" x1="0%" y1="0%" x2="0%" y2="100%">
				<stop offset="0%" stop-color="#000000"/>
				<stop offset="50%" stop-color="rgba(204, 154, 129, 0)"/>
				<stop offset="100%" stop-color="#FFFFFF"/>
			</linearGradient>`;
			const satRangeDef =
			`<linearGradient id="satRange" x1="0%" y1="0%" x2="100%" y2="0%">
				<stop offset="0%" stop-color="#ffffff"/>
				<stop offset="100%" stop-color="rgba(204, 154, 129, 0)"/>
			</linearGradient>`;
			this._defs.innerHTML = window.SmartColorSelectors.defs + hueRangeDef + lumRangeDef + satRangeDef;

		}


		// in case of html insertion, the options.mode == 'html' is defined and
		// the buiding process is divided on two parts:  constructor() and init() from connectedCallback.
		// in case of creating SmartColorSelector object from Javascript, lets do all needed work in one place...
		if (!this._mode) {
			// store containerId: ref on SmartPalette element inside SmartPalettes collection for JS access
			window.SmartColorSelectors.set(this.id, this);
			this.init();
		}
		if (elem && elem.tagName === 'DIV') {
			this.init(this._o);
		}
	}
	_build() {
		SmartColorSelectors.convertNumericProps(this._o);
		if (!this._body) {
			const fontFamily = 'Arial, DIN Condensed, Noteworthy, sans-serif';
			const fontSize = '10px';
			const gap = 6;
			let width = 200, height = 150;

			this._bodyG = SmartWidgets.addElement('g', {
				class: 'stcrs'
			}, this._svgroot, this._svgdoc);
			this._body = SmartWidgets.addElement('rect', {
				x: 0,
				y: 0,
				rx: this._o.borderRadius,
				width: `${width + (2 * gap)}`,
				height: `${height + (2 * gap)}`,
				fill: this._o.bkgColor,
				stroke: this._o.borderColor,
				'stroke-width': this._o.borderWidth,
				'stroke-opacity': this._o.opacity,
				'fill-opacity':  this._o.opacity
			}, this._bodyG, this._svgdoc);
			this._bodyG.classList.add(this._o.isShadow ? 'shadowed' : 'no-shadows');
			// stroke/fill selector includes 'selStroke' and 'selFill' circle buttons, 'noColor' button, 'color switcher' and 'setCurrentColor' button
			this._bfG = SmartWidgets.addElement('g', {
				class: 'bf-selector',
				transform: `translate(${gap}, ${gap})`
			}, this._bodyG, this._svgdoc);
			// group for stroke selector
			this._btnSelStroke = SmartWidgets.addElement('g', {
				class: 'stcrs sel-stroke-btn'
			}, this._bfG, this._svgdoc);
			this._btnSelStroke.classList.add(this._o.isShadow ? 'shadowed' : 'no-shadows');

			this._actStrokeColor = SmartWidgets.addElement('circle', {
				cx: 20,
				cy: 20,
				r: 12,
				stroke: this._strokeColor.color,
				'stroke-width': 6,
				fill: 'none',
				style: 'cursor:pointer;'
			}, this._btnSelStroke, this._svgdoc);
			this._actStrokeNoColor = SmartWidgets.addElement('path', {
				stroke: '#ff0000',
				'stroke-width': 1,
				fill: '#ff0000',
				d: 'M5,20 h6 M35,20 h-6',
				transform: 'rotate(-45, 20, 20)',
				'pointer-events': 'none',
				display: 'none'
			}, this._btnSelStroke, this._svgdoc);
			SmartWidgets.addElement('circle', {
				cx: 20,
				cy: 20,
				r: 15,
				stroke: '#000000',
				'stroke-width': 0.6,
				fill: 'none',
				'pointer-events': 'none',
			}, this._btnSelStroke, this._svgdoc);
			SmartWidgets.addElement('circle', {
				cx: 20,
				cy: 20,
				r: 9,
				stroke: '#000000',
				'stroke-width': 0.6,
				fill: 'none',
				'pointer-events': 'none',
			}, this._btnSelStroke, this._svgdoc);

			this._btnSelFill = SmartWidgets.addElement('g', {
				class: 'stcrs sel-fill-btn'
			}, this._bfG, this._svgdoc);
			this._btnSelFill.classList.add(this._o.isShadow ? 'shadowed' : 'no-shadows');

			this._actFillColor = SmartWidgets.addElement('circle', {
				cx: 30,
				cy: 30,
				r: 15,
				fill: this._fillColor.color,
				'stroke-width': 0.5,
				stroke: '#ffffff',
				style: 'cursor:pointer;'
			}, this._btnSelFill, this._svgdoc);
			this._actFillNoColor = SmartWidgets.addElement('path', {
				stroke: '#ff0000',
				'stroke-width': 1,
				fill: '#ff0000',
				d: 'M15,30 h30',
				transform: 'rotate(-45, 30, 30)',
				'pointer-events': 'none',
				display: 'none'
			}, this._btnSelFill, this._svgdoc);

			this._selNoColorBtn = SmartWidgets.addElement('circle', {
				cx: 10,
				cy: 39,
				r: 5,
				stroke: '#000000',
				'stroke-width': 0.6,
				fill: '#ffffff',
				style: 'cursor:pointer;'
			}, this._bfG, this._svgdoc);
			this._selNoColorLine =SmartWidgets.addElement('line', {
				x1: 5, y1: 39,
				x2: 15, y2: 39,
				stroke: '#ff0000',
				'stroke-width': 1,
				fill: '#ff0000',
				transform: 'rotate(-45, 10, 39)',
				'pointer-events': 'none'
			}, this._bfG, this._svgdoc);
			this._colorSwitch = SmartWidgets.addElement('path', {
				stroke: this._o.bkgColor,
				'stroke-width': 1,
				fill: this._o.bkgColor,
				d: 'M34,8 v-2 h10 v10 h-2 z',
				style: 'cursor:pointer;'
			}, this._bfG, this._svgdoc);
			SmartWidgets.addElement('path', {
				stroke: '#ffffff',
				'stroke-width': 1,
				fill: 'none',
				d: 'M35,7 l8,8 M37,6 h-3 v3 M44,13 v3 h-3',
				'pointer-events': 'none'
			}, this._bfG, this._svgdoc);

			this._setCurColor = SmartWidgets.addElement('circle', {
				cx: 56,
				cy: 14,
				r: 8,
				stroke: '#000000',
				'stroke-width': 1,
				fill: this._pipette.color,
				// 'fill-opacity': 0.3,
				style: 'cursor:pointer;'
			}, this._bfG, this._svgdoc);
			this._hslSliders = SmartWidgets.addElement('g', {
				class: 'hsl-sliders',
				transform: `translate(${gap}, 60)`
			}, this._bodyG, this._svgdoc);
			this._hueImage = SmartWidgets.addElement('rect', {
				class: 'draggable clickable hue-range',
				x: 0, y:0, width: 200, height:40,
				stroke: '#000000',
				'stroke-width': 0.6,
				fill: 'url(#hueRange)',
				style: 'cursor:pointer'
			}, this._hslSliders, this._svgdoc);

			this._satlumColor = SmartWidgets.addElement('rect', {
				x: 0, y:45, width: 200, height:40,
				class: 'draggable clickable sel-satlum',
				stroke: '#000000',
				'stroke-width': 0.6,
				fill: '#ff0000',
				style: 'cursor:pointer'
			}, this._hslSliders, this._svgdoc);
			SmartWidgets.addElement('rect', {
				class: 'sat-range',
				x: 0, y:45, width: 200, height:40,
				stroke: '#000000',
				'stroke-width': 0.6,
				fill: 'url(#satRange)',
				'pointer-events': 'none'
			}, this._hslSliders, this._svgdoc);
			SmartWidgets.addElement('rect', {
				class: 'lum-range',
				x: 0, y:45, width: 200, height:40,
				stroke: '#000000',
				'stroke-width': 0.6,
				fill: 'url(#lumRange)',
				'pointer-events': 'none'
			}, this._hslSliders, this._svgdoc);

			this._hueCtrl = SmartWidgets.addElement('rect', {
				id: 'hue-slider',
				class: '',
				r: 5,
				x: 0, y: 1, width: 6, height: 38,
				stroke: '#ffffff',
				fill: 'none',
				'pointer-events': 'none'
			}, this._hslSliders, this._svgdoc);
			this._slCtrl = SmartWidgets.addElement('circle', {
				id: 'sat-lum-slider',
				class: '',
				r: 5,
				cx: 0,
				cy: 0,
				stroke: '#ffffff',
				fill: 'none',
				'pointer-events': 'none'
			}, this._hslSliders, this._svgdoc);
		}
	}
	_set

	// API

	/**
	 *
	 * @param {object} colorData stroke and fill colors definition object in from:
	 * 	{
	 * 		fillColor = {
	 *			active: 1,			// set selector as active
	 *			isnone:	0,			// set to 1 for 'none' color
	 *			color: '#000000',	// rgb color
	 *			opacity: 1			// opacity, from 0 upto 1
	 *		},
	 *		strokeColor = {
	 *			active: 0,			// set selector as active
	 *			isnone: 0,			// set to 1 for 'none' color
	 *			color: '#0000ff',	// rgb color
	 *			opacity: 1			// opacity, from 0 upto 1
	 *		}
	 *	}
	 *
	 */
	setColorData(colorData) {

	}
	getAlias() {
		return this._o.alias;
	}
    getCtrl() {
        return this;
	}
	getSize() {
		const size = {
			width: this._svgroot.getAttribute('width') || this._rect.width,
			height: this._svgroot.getAttribute('height') || this._rect.height
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
				options = SmartColorSelectors.JsonToOptions(options);
			}

            // validate and merge with own _o
            SmartColorSelectors.convertNumericProps(options);
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

		this._fillColor = {
			active: 1,
			isnone:	0,
			color: '#000000',
			prev: '#000000',
			opacity: 1
		};
		this._strokeColor = {
			active: 0,
			isnone: 0,
			color: '#0000ff',
			prev: '#0000ff',
			opacity: 1
		};
		this._pipette = {
			color: '#ffff14'	//this._o.bkgColor
		};

		this._build();

		// event listeners is here!
		if (!this.hueDrag) {
			this.hueDrag = new SmartDragElement(this._hueImage, {containment: this._hueImage});
			this.satDrag = new SmartDragElement(this._satlumColor, {containment: this._satlumColor});
			this._hueImage.addEventListener('onStartDrag', (evt) => {
				evt.preventDefault();
				evt.stopPropagation();
				// console.log(`Start dragging x = ${evt.detail.x}, y = ${evt.detail.y}`);
			});
			this._hueImage.addEventListener('onContinueDrag', (evt) => {
				evt.preventDefault();
				evt.stopPropagation();

				this._hueCtrl.setAttribute('transform', `translate(${evt.detail.x - 3}, 0)`);
				const w = Number(this._hueImage.getAttribute('width'));
				this.selHue = (evt.detail.x / w) * 360;

				let cr = w3color(`hsl(${this.selHue},${1},${0.5})`);
				this._satlumColor.setAttribute('fill', cr.toHexString());
				cr = w3color(`hsl(${this.selHue},${this.selSat},${this.selLum})`);
				if (this._strokeColor.active) {
					this._strokeColor.color = cr.toHexString();
					this._actStrokeColor.setAttribute('stroke', this._strokeColor.color);
					this._actStrokeNoColor.setAttribute('display', 'none');
					this._strokeColor.isnone = 0;
				} else {
					this._fillColor.color = cr.toHexString();
					this._actFillColor.setAttribute('fill', this._fillColor.color);
					this._actFillNoColor.setAttribute('display', 'none');
					this._fillColor.isnone = 0;
				}

			});
			this._hueImage.addEventListener('onEndDrag', (evt) => {
				evt.preventDefault();
				evt.stopPropagation();
				// console.log('End dragging');
			});
			this._hueImage.addEventListener('click', (evt) => {
				evt.preventDefault();
				const scroll = SmartWidgets.getScroll();
				const pt = SmartWidgets.svgPoint(this._hueImage, evt.clientX + scroll.X, evt.clientY + scroll.Y);
				this._hueCtrl.setAttribute('transform', `translate(${pt.x - 3}, 0)`);
				const w = Number(evt.target.getAttribute('width'));
				this.selHue = (pt.x / w) * 360;
				let cr = w3color(`hsl(${this.selHue},${1},${0.5})`);
				this._satlumColor.setAttribute('fill', cr.toHexString());
				cr = w3color(`hsl(${this.selHue},${this.selSat},${this.selLum})`);
				if (this._strokeColor.active) {
					this._strokeColor.color = cr.toHexString();
					this._actStrokeColor.setAttribute('stroke', this._strokeColor.color);
					this._actStrokeNoColor.setAttribute('display', 'none');
					this._strokeColor.isnone = 0;
				} else {
					this._fillColor.color = cr.toHexString();
					this._actFillColor.setAttribute('fill', this._fillColor.color);
					this._actFillNoColor.setAttribute('display', 'none');
					this._fillColor.isnone = 0;
				}
				// console.log(`Click on hew image at x = ${pt.x}, y = ${pt.y}, selected hue = ${this.selHue}`);
			});

			this._satlumColor.addEventListener('onContinueDrag', (evt) => {
				evt.preventDefault();
				evt.stopPropagation();
				this._slCtrl.setAttribute('transform', `translate(${evt.detail.x}, ${evt.detail.y})`);
				const w = Number(evt.target.getAttribute('width'));
				const h = Number(evt.target.getAttribute('height'));

				this.selLum = (evt.detail.y - 45) / h; // * 100;
				this.selSat = evt.detail.x / w; // * 100;
				const cr = w3color(`hsl(${this.selHue},${this.selSat},${this.selLum})`);
				if (this._strokeColor.active) {
					this._strokeColor.color = cr.toHexString();
					this._actStrokeColor.setAttribute('stroke', this._strokeColor.color);
					this._actStrokeNoColor.setAttribute('display', 'none');
					this._strokeColor.isnone = 0;
				} else {
					this._fillColor.color = cr.toHexString();
					this._actFillColor.setAttribute('fill', this._fillColor.color);
					this._actFillNoColor.setAttribute('display', 'none');
					this._fillColor.isnone = 0;
				}
			});
			this._satlumColor.addEventListener('click', (evt) => {
				evt.preventDefault();
				const scroll = SmartWidgets.getScroll();
				const pt = SmartWidgets.svgPoint(this._satlumColor, evt.clientX + scroll.X, evt.clientY + scroll.Y);
				this._slCtrl.setAttribute('transform', `translate(${pt.x}, ${pt.y})`);
				const w = Number(evt.target.getAttribute('width'));
				const h = Number(evt.target.getAttribute('height'));

				this.selLum = (pt.y - 45) / h; // * 100;
				this.selSat = pt.x / w; // * 100;
				const cr = w3color(`hsl(${this.selHue},${this.selSat},${this.selLum})`);
				if (this._strokeColor.active) {
					this._strokeColor.color = cr.toHexString();
					this._actStrokeColor.setAttribute('stroke', this._strokeColor.color);
					this._actStrokeNoColor.setAttribute('display', 'none');
					this._strokeColor.isnone = 0;
				} else {
					this._fillColor.color = cr.toHexString();
					this._actFillColor.setAttribute('fill', this._fillColor.color);
					this._actFillNoColor.setAttribute('display', 'none');
					this._fillColor.isnone = 0;
				}
				// console.log(`Click on satlum image at x = ${pt.x}, y = ${pt.y}`);
			});
		}

		this._btnSelStroke.addEventListener('click', (evt) => {
			this._strokeColor.active = 1;
			this._fillColor.active = 0;
			this._bfG.insertBefore(this._btnSelFill, this._btnSelStroke);
			if (!this._strokeColor.isnone) {
				const cr = w3color(this._strokeColor.color);
				this.selHue = cr.hue;
				this.selSat = cr.sat;
				this.selLum = cr.lightness;
				// update _hueImage and _satlumColor here!
			}
		});
		this._btnSelFill.addEventListener('click', (evt) => {
			this._strokeColor.active = 0;
			this._fillColor.active = 1;
			this._bfG.insertBefore(this._btnSelStroke, this._btnSelFill);
			if (!this._fillColor.isnone) {
				const cr = w3color(this._fillColor.color);
				this.selHue = cr.hue;
				this.selSat = cr.sat;
				this.selLum = cr.lightness;
				// update _hueImage and _satlumColor here!
			}
		});
		this._selNoColorBtn.addEventListener('click', (evt) => {
			if (this._strokeColor.active) {
				if (!this._strokeColor.isnone) {
					this._strokeColor.prev = this._strokeColor.color;	// store current color as previous and set current to 'none'
					this._strokeColor.color = '#ffffff';
					this._actStrokeColor.setAttribute('stroke', this._strokeColor.color);
					this._actStrokeNoColor.setAttribute('display', 'inherit');
					this._strokeColor.isnone = 1;
				} else { // restore color from previous
					this._strokeColor.color = this._strokeColor.prev;
					this._actStrokeColor.setAttribute('stroke', this._strokeColor.color);
					this._actStrokeNoColor.setAttribute('display', 'none');
					this._strokeColor.isnone = 0;
				}
			} else {
				if (!this._fillColor.isnone) {
					this._fillColor.prev = this._fillColor.color;	// store current color as previous and set current to 'none'
					this._fillColor.color = '#ffffff';
					this._actFillColor.setAttribute('fill', this._fillColor.color);
					this._actFillNoColor.setAttribute('display', 'inherit');
					this._fillColor.isnone = 1;
				} else { // restore color from previous
					this._fillColor.color = this._fillColor.prev;
					this._actFillColor.setAttribute('fill', this._fillColor.color);
					this._actFillNoColor.setAttribute('display', 'none');
					this._fillColor.isnone = 0;
				}
			}
		});
		this._colorSwitch.addEventListener('click', (evt) => {
			let tmp = this._fillColor.color;
			this._fillColor.color = this._strokeColor.color;
			this._strokeColor.color = tmp;

			tmp = this._fillColor.prev;
			this._fillColor.prev = this._strokeColor.prev;
			this._strokeColor.prev = tmp;

			tmp = this._fillColor.isnone;
			this._fillColor.isnone = this._strokeColor.isnone;
			this._strokeColor.isnone = tmp;

			this._actFillColor.setAttribute('fill', this._fillColor.color);
			this._actStrokeColor.setAttribute('stroke', this._strokeColor.color);
			this._actFillNoColor.setAttribute('display', this._fillColor.isnone ? 'inherit' : 'none');
			this._actStrokeNoColor.setAttribute('display', this._strokeColor.isnone ? 'inherit' : 'none');
		});
		this._setCurColor.addEventListener('click', (evt) => {
			if (this._strokeColor.active) {
				if (this._strokeColor.isnone) {
					this._strokeColor.isnone = 0;
					this._actStrokeNoColor.setAttribute('display', 'none');
				} else {
					this._strokeColor.prev = this._strokeColor.color;
				}
				this._strokeColor.color = this._pipette.color;
				this._actStrokeColor.setAttribute('stroke', this._strokeColor.color);
			} else {
				if (this._fillColor.isnone) {
					this._fillColor.isnone = 0;
					this._actFillNoColor.setAttribute('display', 'none');
				} else {
					this._fillColor.prev = this._fillColor.color;
				}
				this._fillColor.color = this._pipette.color;
				this._actFillColor.setAttribute('fill', this._fillColor.color);
			}
		});
    }

	/**
	 * Get parameters of Smart Widget
	 * @param {string} filter 'all', 'dirty', 'def', 'vars', 'names', 'css', 'json', 'cjson'
	 * @returns smart object parameters in form specified by filter
	 */
	getParams(filter = 'all') {
		let opt;
		const customProp = SmartColorSelectors.getCustomProperties();		// get an array of custom properties
		const defOptions = SmartColorSelectors.defOptions();
		switch (filter) {
			case 'cjson': // compressed json
				opt = SmartWidgets.getCustomParams(customProp, defOptions, this._o, 'dirty');
				delete opt.role;
				return SmartColorSelectors.getCompressedJSON(opt);
			case 'json':
				opt = SmartWidgets.getCustomParams(customProp, defOptions, this._o, 'dirty', 'none');
				return SmartColorSelectors.getJSON(opt);
			case 'css':
				opt = SmartWidgets.getCustomParams(customProp, defOptions, this._o, 'dirty', 'none');
				return SmartColorSelectors.getCSS(opt);
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
		SmartColorSelectors.convertNumericProps(opt, name);

		if (this._body) {
			this.setParams(opt);
		}
	}
	resetParams(options = null) {
		if (options) {
			this._o = Object.assign({}, SmartColorSelectors.defOptions(), options);
			this._build();
		}
	}
	setParams(options = {}, rebuild = true) {
		let needRebuild = false;
		if (!options) {
			return false;
		}
		// convert all known properties to numbers
		SmartColorSelectors.convertNumericProps(options);
		this._o = Object.assign({}, this._o, options);

		// some properties changing requires rebuilding, lets find its!
		for (let key in this._o) {
			switch (key) {
				case 'stateColors':
					break;
				default:
					needRebuild++;
					break;
			}
		}
		if (rebuild && needRebuild) {
            this._build();
		}
		return needRebuild;
	}

    isRun() {
		console.log('Runtime updates for this widget not applicable');
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

}

class SmartColorSelectorElement extends HTMLElement {
	constructor(id) {
		super();

		// create SmartColorSelector collection only once!
		SmartColorSelectors.init();

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
		const elemId = window.SmartColorSelectors.getId();
		const svgId = `${this.id}--${SmartColorSelectors.getAlias()}`;
		this._root.innerHTML = `<style>${txtStyle}</style>${SmartWidgets.getSVGContext(svgId, elemId)}`;
		this._svgroot = this._root.querySelector('svg');
		// now create the smart palette control!
		this._stctrl = new SmartColorSelector(elemId, {
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
		return SmartColorSelectors.getCustomProperties();
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
		const customProp = SmartColorSelectors.getCustomProperties();
		for (let n = 0; n < customProp.length; n++) {
			const prop = `--${SmartColorSelectors.getAlias()}-${customProp[n]}`;
			const propKey = SmartColorSelectors.customProp2Param(`${customProp[n]}`);
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
		// window.SmartColorSelectors.unset(this._id);
		this._stctrl = null;
		this._root = null;
		this._o = null;
	}

}
window.customElements.define('smart-ui-colorsel', SmartColorSelectorElement);
