/* eslint-disable no-lonely-if */
/* eslint-disable linebreak-style */
/* eslint-disable indent */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-multi-spaces) */
/* eslint-disable no-underscore-dangle */
/* eslint-disable guard-for-in */
/* eslint-disable no-multi-spaces */
/* eslint-disable key-spacing */

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
		this._drawSliderMenuItem = this._drawSliderMenuItem.bind(this);
		this._onSelectSliderType = this._onSelectSliderType.bind(this);

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
		this._hslSliders = null;	// HSL Sliders reference group
		this._rgbSliders = null;	// RGB Sliders reference group
		this._hslWheel   = null;	// HSL Wheel reference group

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
			const rgbRangeDef =
			`<linearGradient id="rgbRange" x1="0%" y1="0%" x2="100%" y2="0%">
				<stop offset="0%" stop-color="#000000"/>
				<stop offset="100%" stop-color="rgba(204, 154, 129, 0)"/>
			</linearGradient>`;

			this._defs.innerHTML = window.SmartColorSelectors.defs + hueRangeDef + lumRangeDef + satRangeDef + rgbRangeDef;

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
	/**
	 * Callback function for creating item inside scrollable container (see ScrollableContainer.add(...))
	 * @param {object} root container <g> element into wich new item will be appended
	 * @param {object} data id, coordinates, color and other data of item that will be appended
	 * @returns reference on created item
	 */
	_drawSliderMenuItem(root, data) {
		const fontFamily = 'Arial, DIN Condensed, Noteworthy, sans-serif';
		const fontSize = '10px';

		const item = SmartWidgets.addElement('g', {}, root, this._svgdoc);
		SmartWidgets.addElement('rect', {
			id: data.id,
			x: data.x,
			y: data.y,
			width: data.width,
			height: data.height,
			stroke: 'none',
			'stroke-width': 0,
			fill: '#666666'
		}, item, this._svgdoc);
		SmartWidgets.addElement('text', {
			text: data.data,
			x: data.x,
			y: data.y + data.height / 2,
			fill: '#ffffff',
			'text-anchor': 'start',
			'dominant-baseline': 'middle',
			'pointer-events': 'none',
			'font-family': fontFamily,
			'font-size': fontSize,
			'stroke-linejoin': 'round'
		}, item, this._svgdoc);
		return item;
	}
	/**
	 *
	 */
	_onSelectSliderType(evt) {
		evt.stopPropagation();
		evt.preventDefault();
		// hide menu
		this._ssMenuG.setAttribute('display', 'none');
		// get selected index
		const index = Number(evt.target.id.replace('slider-', ''));
		// get reference on selected slider definition
		const slider = this._slidersTypes[index];
		// set it's name in title
		this._currentSliderTitle.textContent = slider.name;
		// get reference on current slider group
		const curSliderRef = this._slidersTypes[this._currentSliderIndex].ref;
		// if not null - hide it
		if (curSliderRef) {
			curSliderRef.setAttribute('display', 'none');
		}
		// show selected slider group in case of it is exists
		if (slider.ref) {
			slider.ref.setAttribute('display', 'inherit');
		}
		// store selected index
		this._currentSliderIndex = index;
	}

	_build() {
		let ctrls = null; // alias

		SmartColorSelectors.convertNumericProps(this._o);
		if (!this._body) {
			const fontFamily = 'Arial, DIN Condensed, Noteworthy, sans-serif';
			const fontSize = '10px';
			const gap = 6;
			const bodyWidth = 200, bodyHeight = 160;

			this._bodyG = SmartWidgets.addElement('g', {
				class: 'stcrs'
			}, this._svgroot, this._svgdoc);
			this._body = SmartWidgets.addElement('rect', {
				class: 'stcrs body',
				x: 0,
				y: 0,
				rx: this._o.borderRadius,
				width: `${bodyWidth + (2 * gap)}`,
				height: `${bodyHeight + (2 * gap)}`,
				fill: this._o.bkgColor,
				stroke: this._o.borderColor,
				'stroke-width': this._o.borderWidth,
				'stroke-opacity': this._o.bodyOpacity,
				'fill-opacity':  this._o.bodyOpacity
			}, this._bodyG, this._svgdoc);
			this._bodyG.classList.add(this._o.isShadow ? 'shadowed' : 'no-shadows');
			this._svgroot.setAttribute('width', this._body.getAttribute('width'));
			this._svgroot.setAttribute('height', this._body.getAttribute('height'));

			//
			/**
			 * Stroke/Fill parameter selector includes:
			 * - '_btnSelStroke' button
			 * - '_btnSelFill' buttons
			 * - '_selNoColorBtn' button
			 * - '_colorSwitch' button
			 * - '_setCurColor' button
			 */
			this._sfG = SmartWidgets.addElement('g', {
				class: 'stroke-fill-selector',
				transform: `translate(${gap}, ${gap})`
			}, this._bodyG, this._svgdoc);

			/**
			 * button 'set stroke as active parameter' structure
			 * <g>		 - reference on button (this._btnSelStroke)
			 * 	<circle> - 'active stroke color' element (this._actStrokeColor)
			 *  <path>	 - 'no color' indicator (this._actStrokeNoColor)
			 *  <circle> - external circle (black border)
			 *  <circle> - internal circle (black border)
			 * </g>
			 */
			this._btnSelStroke = SmartWidgets.addElement('g', {
				class: 'stcrs sel-stroke-btn'
			}, this._sfG, this._svgdoc);
			this._btnSelStroke.classList.add(this._o.isShadow ? 'shadowed' : 'no-shadows');
			this._actStrokeColor = SmartWidgets.addElement('circle', {
				class: 'act-stroke-color',
				cx: 20,
				cy: 20,
				r: 12,
				stroke: this._strokeColor.color,
				'stroke-width': 6,
				fill: 'none',
				style: 'cursor:pointer;'
			}, this._btnSelStroke, this._svgdoc);
			this._actStrokeNoColor = SmartWidgets.addElement('path', {
				class: 'stroke-no-color',
				stroke: '#ff0000',
				'stroke-width': 1,
				fill: '#ff0000',
				d: 'M5,20 h6 M35,20 h-6',
				transform: 'rotate(-45, 20, 20)',
				'pointer-events': 'none',
				display: 'none'
			}, this._btnSelStroke, this._svgdoc);
			SmartWidgets.addElement('circle', {
				class: 'ext-border',
				cx: 20,
				cy: 20,
				r: 15,
				stroke: '#000000',
				'stroke-width': 0.6,
				fill: 'none',
				'pointer-events': 'none',
			}, this._btnSelStroke, this._svgdoc);
			SmartWidgets.addElement('circle', {
				class: 'int-border',
				cx: 20,
				cy: 20,
				r: 9,
				stroke: '#000000',
				'stroke-width': 0.6,
				fill: 'none',
				'pointer-events': 'none',
			}, this._btnSelStroke, this._svgdoc);

			/**
			 * button 'set fill as active parameter' structure
			 * <g>		 - reference on button (this._btnSelFill)
			 * 	<circle> - 'active fill color' element (this._actFillColor)
			 *  <path>	 - 'no color' indicator (this._actFillNoColor)
			 * </g>
			 */
			this._btnSelFill = SmartWidgets.addElement('g', {
				class: 'stcrs sel-fill-btn'
			}, this._sfG, this._svgdoc);
			this._btnSelFill.classList.add(this._o.isShadow ? 'shadowed' : 'no-shadows');
			this._actFillColor = SmartWidgets.addElement('circle', {
				class: 'act-fill-color',
				cx: 30,
				cy: 30,
				r: 15,
				fill: this._fillColor.color,
				'stroke-width': 0.5,
				stroke: '#ffffff',
				style: 'cursor:pointer;'
			}, this._btnSelFill, this._svgdoc);
			this._actFillNoColor = SmartWidgets.addElement('path', {
				class: 'fill-no-color',
				stroke: '#ff0000',
				'stroke-width': 1,
				fill: '#ff0000',
				d: 'M15,30 h30',
				transform: 'rotate(-45, 30, 30)',
				'pointer-events': 'none',
				display: 'none'
			}, this._btnSelFill, this._svgdoc);

			/**
			 * button 'set no color to active parameter'
			 * <circle> - button (this._selNoColorBtn)
			 * <line>	- 'no color' indicator (this._selNoColorLine)
			 */
			this._selNoColorBtn = SmartWidgets.addElement('circle', {
				class: 'sel-no-color-btn',
				cx: 10,
				cy: 39,
				r: 5,
				stroke: '#000000',
				'stroke-width': 0.6,
				fill: '#ffffff',
				style: 'cursor:pointer;'
			}, this._sfG, this._svgdoc);
			this._selNoColorLine = SmartWidgets.addElement('line', {
				class: 'sel-no-color-line',
				x1: 5,
				y1: 39,
				x2: 15,
				y2: 39,
				stroke: '#ff0000',
				'stroke-width': 1,
				fill: '#ff0000',
				transform: 'rotate(-45, 10, 39)',
				'pointer-events': 'none'
			}, this._sfG, this._svgdoc);

			/**
			 * button 'switch colors between parameters'
			 * <path> - button (this._colorSwitch)
			 * <path> - bi-directional arrow icon
			 */
			this._colorSwitch = SmartWidgets.addElement('path', {
				class: 'color-switch',
				stroke: this._o.bkgColor,
				'stroke-width': 1,
				fill: this._o.bkgColor,
				d: 'M34,8 v-2 h10 v10 h-2 z',
				style: 'cursor:pointer;'
			}, this._sfG, this._svgdoc);
			SmartWidgets.addElement('path', {
				class: 'switch-icon',
				stroke: '#ffffff',
				'stroke-width': 1,
				fill: 'none',
				d: 'M35,7 l8,8 M37,6 h-3 v3 M44,13 v3 h-3',
				'pointer-events': 'none'
			}, this._sfG, this._svgdoc);

			/**
			 *	button 'set current color to active parameter'
			 *	<circle> - button (this._setCurColor)
			 */
			this._setCurColor = SmartWidgets.addElement('circle', {
				class: 'set-cur-color',
				cx: 56,
				cy: 14,
				r: 8,
				stroke: '#000000',
				'stroke-width': 1,
				fill: this._drop.color,
				style: 'cursor:pointer;'
			}, this._sfG, this._svgdoc);

			/**
			 * Hue Boxes group
			 */
			this._slidersTypes[0].ref = SmartWidgets.addElement('g', {
				id: 'hsl-sliders',
				class: 'hsl-sliders',
				transform: `translate(${gap}, 60)`
			}, this._bodyG, this._svgdoc);
			const hb = this._slidersTypes[0].ref;	// alias
			this._slidersTypes[0].ctrls = {
				hueSlider: null,
				hueDrag: null,
				satlumColor: null,
				satDrag: null,
				hueCtrl: null,
				slCtrl: null
			};
			ctrls = this._slidersTypes[0].ctrls; // alias on Hue Box UI controls

			/**
			 * HUE slider
			 */
			ctrls.hueSlider = SmartWidgets.addElement('rect', {
				id: 'hue-slider',
				class: 'draggable clickable hue-slider',
				x: 0,
				y:0,
				width: bodyWidth,
				height:40,
				stroke: '#000000',
				'stroke-width': 0.6,
				fill: 'url(#hueRange)',
				style: 'cursor:pointer'
			}, hb, this._svgdoc);

			/**
			 * 'sat + lightness' slider
			 */
			ctrls.satlumColor = SmartWidgets.addElement('rect', {
				id: 'sat-lum-slider',
				class: 'draggable clickable sat-lum-slider',
				x: 0,
				y:45,
				width: bodyWidth,
				height:40,
				stroke: '#000000',
				'stroke-width': 0.6,
				fill: '#ff0000',
				style: 'cursor:pointer'
			}, hb, this._svgdoc);
			SmartWidgets.addElement('rect', {
				class: 'sat-range',
				x: 0,
				y:45,
				width: bodyWidth,
				height:40,
				stroke: 'none',
				fill: 'url(#satRange)',
				'pointer-events': 'none'
			}, hb, this._svgdoc);
			SmartWidgets.addElement('rect', {
				class: 'lum-range',
				x: 0,
				y:45,
				width: bodyWidth,
				height:40,
				stroke: 'none',
				fill: 'url(#lumRange)',
				'pointer-events': 'none'
			}, hb, this._svgdoc);

			/**
			 * 'selected hue' indicator
			 */
			ctrls.hueCtrl = SmartWidgets.addElement('rect', {
				id: 'hue-ind',
				class: 'hue-ind',
				r: 5,
				x: 0,
				y: 1,
				width: 6,
				height: 38,
				stroke: '#ffffff',
				'stroke-width': 1.5,
				fill: 'none',
				'pointer-events': 'none'
			}, hb, this._svgdoc);

			/**
			 * 'selected sat + lightness' indicator
			 */
			ctrls.slCtrl = SmartWidgets.addElement('circle', {
				id: 'sat-lum-ind',
				class: 'sat-lum-ind',
				r: 5,
				cx: 0,
				cy: 0,
				stroke: '#ffffff',
				'stroke-width': 1.5,
				fill: 'none',
				'pointer-events': 'none'
			}, hb, this._svgdoc);

			// add others sliders groups here!
			/**
			 * RGB Sliders group
			 */
			this._slidersTypes[1].ref = SmartWidgets.addElement('g', {
				id: 'rgb-sliders',
				class: 'rgb-sliders',
				transform: `translate(${gap}, 60)`
			}, this._bodyG, this._svgdoc);
			const rgbSl = this._slidersTypes[1].ref;	// alias
			this._slidersTypes[1].ctrls = {
				rSlider: null,
				rSliderDrag: null,
				rSliderInd: null,
				rSliderVal: null,
				gSlider: null,
				gSliderDrag: null,
				gSliderInd: null,
				gSliderVal: null,
				bSlider: null,
				bSliderDrag: null,
				bSliderInd: null,
				bSliderVal: null,
				rgbBox:  null,
				rgbBoxDrag: null,
				rgbVal: null
			};
			ctrls = this._slidersTypes[1].ctrls;
			// let grOffset = 16;
			// let tOffset = grOffset + 1;
			/**
			 * R Slider
			 */
			SmartWidgets.addElement('text', {
				text: 'R',
				x: 2,
				y: 5,
				fill: '#ffffff',
				'text-anchor': 'middle',
				'dominant-baseline': 'middle',
				'font-family': fontFamily,
				'font-size': 12,
				'stroke-linejoin': 'round',
				'pointer-events': 'none'
			}, rgbSl, this._svgdoc);
			ctrls.rSliderVal = SmartWidgets.addElement('text', {
				text: '#00',
				x: 175,
				y: 5,
				fill: '#ffffff',
				'text-anchor': 'start',
				'dominant-baseline': 'middle',
				'font-family': fontFamily,
				'font-size': 12,
				'stroke-linejoin': 'round',
				'pointer-events': 'none'
			}, rgbSl, this._svgdoc);

			let gr = SmartWidgets.addElement('g', {
				id: 'r-sliders-g',
				class: 'r-sliders-g',
				transform: 'translate(14, 4)'
			}, rgbSl, this._svgdoc);
			ctrls.rSlider = SmartWidgets.addElement('path', {
				id: 'r-slider',
				class: 'r-slider draggable clickable',
				'stroke-width': 8,
				'stroke-linecap': 'round',
				stroke: '#ff0000',
				d: 'M0,0 h150',
				style: 'cursor:pointer'
			}, gr, this._svgdoc);
			SmartWidgets.addElement('rect', {
				class: 'r-slider',
				x: -4,
				y: -4,
				width: 154,
				height: 8,
				'stroke-width': 0,
				stroke: 'none',
				fill: 'url(#rgbRange)',
				'pointer-events': 'none'
			}, gr, this._svgdoc);
			ctrls.rSliderInd = SmartWidgets.addElement('circle', {
				id: 'rSliderInd',
				class: 'r-slider-ind',
				cx: 0,
				cy: 0,
				r: 4.8,
				stroke: '#ffffff',
				'stroke-width': 1.6,
				fill: 'none',
				'pointer-events': 'none'
			}, gr, this._svgdoc);
			/**
			 * G Slider
			 */
			SmartWidgets.addElement('text', {
				text: 'G',
				x: 2,
				y: 21,
				fill: '#ffffff',
				'text-anchor': 'middle',
				'dominant-baseline': 'middle',
				'font-family': fontFamily,
				'font-size': 12,
				'stroke-linejoin': 'round',
				'pointer-events': 'none'
			}, rgbSl, this._svgdoc);
			ctrls.gSliderVal = SmartWidgets.addElement('text', {
				text: '#00',
				x: 175,
				y: 21,
				fill: '#ffffff',
				'text-anchor': 'start',
				'dominant-baseline': 'middle',
				'font-family': fontFamily,
				'font-size': 12,
				'stroke-linejoin': 'round',
				'pointer-events': 'none'
			}, rgbSl, this._svgdoc);

			gr = SmartWidgets.addElement('g', {
				id: 'g-sliders-g',
				class: 'g-sliders-g',
				transform: 'translate(14, 20)'
			}, rgbSl, this._svgdoc);
			ctrls.gSlider = SmartWidgets.addElement('path', {
				id: 'g-slider',
				class: 'g-slider draggable clickable',
				'stroke-width': 8,
				'stroke-linecap': 'round',
				stroke: '#00ff00',
				d: 'M0,0 h150',
				style: 'cursor:pointer'
			}, gr, this._svgdoc);
			SmartWidgets.addElement('rect', {
				class: 'g-slider',
				x: -4,
				y: -4,
				width: 154,
				height: 8,
				'stroke-width': 0,
				stroke: 'none',
				fill: 'url(#rgbRange)',
				'pointer-events': 'none'
			}, gr, this._svgdoc);

			ctrls.gSliderInd = SmartWidgets.addElement('circle', {
				id: 'g-slider-ind',
				class: 'g-slider-ind',
				cx: 0,
				cy: 0,
				r: 4.8,
				stroke: '#ffffff',
				'stroke-width': 1.6,
				fill: 'none',
				'pointer-events': 'none'
			}, gr, this._svgdoc);
			/**
			 * B Slider
			 */
			SmartWidgets.addElement('text', {
				text: 'B',
				x: 2,
				y: 37,
				fill: '#ffffff',
				'text-anchor': 'middle',
				'dominant-baseline': 'middle',
				'font-family': fontFamily,
				'font-size': 12,
				'stroke-linejoin': 'round',
				'pointer-events': 'none'
			}, rgbSl, this._svgdoc);
			ctrls.bSliderVal = SmartWidgets.addElement('text', {
				text: '#00',
				x: 175,
				y: 37,
				fill: '#ffffff',
				'text-anchor': 'start',
				'dominant-baseline': 'middle',
				'font-family': fontFamily,
				'font-size': 12,
				'stroke-linejoin': 'round',
				'pointer-events': 'none'
			}, rgbSl, this._svgdoc);

			gr = SmartWidgets.addElement('g', {
				id: 'b-sliders-g',
				class: 'b-sliders-g',
				transform: 'translate(14, 36)'
			}, rgbSl, this._svgdoc);
			ctrls.bSlider = SmartWidgets.addElement('path', {
				id: 'b-slider',
				class: 'b-slider draggable clickable',
				'stroke-width': 8,
				'stroke-linecap': 'round',
				stroke: '#0000ff',
				d: 'M0,0 h150',
				style: 'cursor:pointer'
			}, gr, this._svgdoc);
			SmartWidgets.addElement('rect', {
				class: 'b-slider',
				x: -4,
				y: -4,
				width: 154,
				height: 8,
				'stroke-width': 0,
				stroke: 'none',
				fill: 'url(#rgbRange)',
				'pointer-events': 'none'
			}, gr, this._svgdoc);
			ctrls.bSliderInd = SmartWidgets.addElement('circle', {
				id: 'b-slider-ind',
				class: 'b-slider-ind',
				cx: 0,
				cy: 0,
				r: 4.8,
				stroke: '#ffffff',
				'stroke-width': 1.6,
				fill: 'none',
				'pointer-events': 'none'
			}, gr, this._svgdoc);
			/**
			 * RGB Box
			 */
			SmartWidgets.addElement('text', {
				text: 'RGB',
				x: -2,
				y: 53,
				fill: '#ffffff',
				'text-anchor': 'start',
				'dominant-baseline': 'middle',
				'font-family': fontFamily,
				'font-size': 12,
				'stroke-linejoin': 'round',
				'pointer-events': 'none'
			}, rgbSl, this._svgdoc);
			ctrls.rgbVal = SmartWidgets.addElement('text', {
				text: '#000000',
				x: 148,
				y: 53,
				fill: '#ffffff',
				'text-anchor': 'start',
				'dominant-baseline': 'middle',
				'font-family': fontFamily,
				'font-size': 12,
				'stroke-linejoin': 'round',
				'pointer-events': 'none'
			}, rgbSl, this._svgdoc);

			gr = SmartWidgets.addElement('g', {
				id: 'rgb-box-g',
				class: 'rgb-box-g',
				transform: 'translate(0, 60)'
			}, rgbSl, this._svgdoc);
			ctrls.rgbBox = SmartWidgets.addElement('rect', {
				id: 'rgb-box',
				class: 'rgb-box draggable clickable',
				x: 0,
				y: 0,
				width: 200,
				height: 25,
				'stroke-width': 0,
				stroke: '#000000',
				fill: 'url(#hueRange)',
				style: 'cursor:pointer'
			}, gr, this._svgdoc);
			SmartWidgets.addElement('rect', {
				class: 'rgb-box-lum',
				x: 0,
				y: 0,
				width: 200,
				height: 25,
				// 'stroke-width': 0,
				fill: 'url(#lumRange)',
				'pointer-events': 'none'
			}, gr, this._svgdoc);
			rgbSl.setAttribute('display', 'none');


			// endof groups insertion line

			/**
			 * Sliders selector pop-up menu
			 */
			const ssmId = `${this.id}-ssmenu`;
			this._ssMenuG = SmartWidgets.addElement('g', {
				id: ssmId,
				class: 'slider-selector-menu',
				transform: `translate(${100}, ${gap + 17})`
			}, this._bodyG, this._svgdoc);

			/**
			 * Currently Selected Slider Title
			 */
			this._currentSliderG = SmartWidgets.addElement('g', {
				class: 'current-slider',
				transform: `translate(${80}, ${gap})`
			}, this._bodyG, this._svgdoc);
			this._currentSliderTitle = SmartWidgets.addElement('text', {
				text: this._slidersTypes[this._currentSliderIndex].name,
				x: gap,
				y: 8,
				fill: '#ffffff',
				'text-anchor': 'start',
				'dominant-baseline': 'middle',
				// 'pointer-events': 'none',
				'font-family': fontFamily,
				'font-size': fontSize,
				'stroke-linejoin': 'round',
				tabindex: 1
			}, this._currentSliderG, this._svgdoc);
			this._enterColorBuffer = SmartWidgets.addElement('text', {
				text: '',
				x: gap,
				y: 28,
				fill: '#ffffff',
				'text-anchor': 'start',
				'dominant-baseline': 'middle',
				'pointer-events': 'none',
				'font-family': fontFamily,
				'font-size': fontSize,
				'stroke-linejoin': 'round'
			}, this._currentSliderG, this._svgdoc);

			/**
			 * show pop-up menu button
			 */
			this._selectSliders = SmartWidgets.addElement('g', {
				id: 'select-slider-btn',
				class: 'select-slider-btn',
				style: 'cursor:pointer;',
				transform: `translate(${190}, ${gap})`
			}, this._bodyG, this._svgdoc);
			SmartWidgets.addElement('rect', {
				x: 0,
				y: 0,
				width: 15,
				height: 14,
				rx: 2,
				fill: '#666666'
			}, this._selectSliders, this._svgdoc);
			SmartWidgets.addElement('path', {
				d: 'M2,4 h11 m-11,3 h11, m-11,3 h11',
				stroke: '#ffffff',
				'stroke-width': 1.6,
				fill: 'none',
				'pointer-events': 'none'
			}, this._selectSliders, this._svgdoc);

			this._sliders = new ScrollableContainer(ssmId, {
				width: 90,
				height: 110,
				gap: 2,
				row: 16,
				context: this._root
			});
			for (let i = 0; i < this._slidersTypes.length; i++) {
				const menuItem = {
					id: `slider-${i}`,
					data: this._slidersTypes[i].name,
					cb: this._drawSliderMenuItem,
					owner: this.id
				};
				let sliderItem = this._sliders.add(menuItem);
				if (sliderItem) {
					sliderItem.addEventListener('click', this._onSelectSliderType);
				}
			}
			this._ssMenuG.setAttribute('display', 'none');
		}
	}
	_updateSliders(what) {
		let cr = w3color('#000000');
		what = what || (this._strokeColor.active ? 'stroke' : 'fill');
		if (what === 'stroke') {
			cr = w3color(this._strokeColor.isnone ? '#000000' : this._strokeColor.color);
		}
		if (what === 'fill') {
			cr = w3color(this._strokeColor.isnone ? '#000000' : this._fillColor.color);
		}
		this.selHue = cr.hue;
		this.selSat = cr.sat;
		this.selLum = cr.lightness;

		this._updateHueBoxes(cr);
		this._updateRGBSliders(cr);
	}
	_updateRGBSliders(cr) {
		const ctrls = this._slidersTypes[1].ctrls;
		ctrls.rgbVal.textContent = cr.toHexString();
		ctrls.rSliderVal.textContent = cr.red.toFixed();
		ctrls.gSliderVal.textContent = cr.green.toFixed();
		ctrls.bSliderVal.textContent = cr.blue.toFixed();
		let w = Number(ctrls.rSlider.getTotalLength());
		let x = (w * cr.red) / 255;
		ctrls.rSliderInd.setAttribute('transform', `translate(${x}, 0)`);
		x = (w * cr.green) / 255;
		ctrls.gSliderInd.setAttribute('transform', `translate(${x}, 0)`);
		x = (w * cr.blue) / 255;
		ctrls.bSliderInd.setAttribute('transform', `translate(${x}, 0)`);
	}
	_updateHueBoxes(cr) {
		const ctrls = this._slidersTypes[0].ctrls;
		// update _hueSlider and _satlumColor here!
		let crImage = w3color(`hsl(${this.selHue},${1},${0.5})`);
		ctrls.satlumColor.setAttribute('fill', crImage.toHexString());

		let w = Number(ctrls.hueSlider.getAttribute('width'));
		let x = (w * this.selHue) / 360;

		ctrls.hueCtrl.setAttribute('transform', `translate(${x - 3}, 0)`);

		w = Number(ctrls.satlumColor.getAttribute('width'));
		const h = Number(ctrls.satlumColor.getAttribute('height'));
		x = (w * this.selSat);	// / 100;
		const y = (h * this.selLum);
		ctrls.slCtrl.setAttribute('transform', `translate(${x}, ${y + 45})`);
	}

	/**
	 * update user interface with fillColor and strokeColor data
	 *
	 */
	_updateUI(cr = null) {
		let sendEvent = true;
		if (typeof cr === 'string' && cr === 'internal') {
			sendEvent = false;
		}

		if (cr && typeof cr === 'object') {
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
		}

		if (this._strokeColor.active) {
			this._sfG.insertBefore(this._btnSelFill, this._btnSelStroke);
		} else {
			this._sfG.insertBefore(this._btnSelStroke, this._btnSelFill);
		}
		this._updateSliders();

		if (sendEvent) {
			// send changed data to control (SmartColorSelectr or custom element 'smart-ui-colorsel)
			// by firing event 'dataChanged' with data object inside detail
			const data = this.getData();
			const custEvent = new CustomEvent('dataChanged', {
				detail: Object.assign({}, data),
				bubbles: true,
				cancelable: false
			});
			let el = this.getCtrl();
			if (this._mode === 'html') {
				const root = this._root.getRootNode();
				el  = root ? root.host : null;
			}
			if (el) {
				el.dispatchEvent(custEvent);
				console.log(`sent event ${custEvent.type}: ${Object.getOwnPropertyNames(custEvent.detail).join(' and ')}`);
			}
		}
	}

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
	 *	In case of fillColor or strokeColor objects are not defined appropriated control will be disabled
	 */
	setData(colorData) {
		if (typeof colorData === 'object') {
			if (typeof colorData.fillColor === 'object') {
				this._fillColor.active = colorData.fillColor.active || 1;
				this._fillColor.isnone = colorData.fillColor.isnone || 0;
				this._fillColor.color  = colorData.fillColor.color || '#000000';
				this._fillColor.opacity = colorData.fillColor.opacity || 1;
				this._fillColor.prev = this._fillColor.color;
			} else {
				this._fillColor.disabled = 1;
			}
			if (typeof colorData.strokeColor === 'object') {
				this._strokeColor.active = colorData.strokeColor.active || 1;
				this._strokeColor.isnone = colorData.strokeColor.isnone || 0;
				this._strokeColor.color  = colorData.strokeColor.color || '#000000';
				this._strokeColor.opacity = colorData.strokeColor.opacity || 1;
				this._strokeColor.prev = this._strokeColor.color;
			} else {
				this._strokeColor.disabled = 1;
			}
		}
		this._updateUI('internal');
	}
	getData() {
		const colorData = {
			fillColor: {
				active: this._fillColor.active,
				isnon:  this._fillColor.isnone,
				color:	this._fillColor.color,
				opacity:this._fillColor.opacity
			},
			strokeColor: {
				active: this._strokeColor.active,
				isnon:  this._strokeColor.isnone,
				color:	this._strokeColor.color,
				opacity:this._strokeColor.opacity
			}
		};
		return colorData;
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
			disabled: 0,
			active: 1,
			isnone:	0,
			color: '#000000',
			prev: '#000000',
			opacity: 1
		};
		this._strokeColor = {
			disabled: 0,
			active: 0,
			isnone: 0,
			color: '#0000ff',
			prev: '#0000ff',
			opacity: 1
		};
		this._drop = {
			color: '#ffff14'	// this._o.bkgColor
		};
		// sliders array. references on sliders groups are filled inside _build() function!
		this._slidersTypes = [
			{ name:	'Hue Boxes', ref: null, ctrls: {} },
			{ name:	'RGB Sliders', ref: null, ctrls: {} },
			{ name:	'HSL Wheel', ref: null, ctrls: {} },
			{ name:	'Complementary', ref: null, ctrls: {} },
			{ name:	'Analogous', ref: null, ctrls: {} },
			{ name:	'Triadic', ref: null, ctrls: {} }
		];
		// set default slider to Hue Boxes
		this._currentSliderIndex = 0;
		/**
		 * How to enter color code from keyboard.
		 * Set focus on 'slider type' title by pressing 'TAB' button, or by clicking on it
		 * and start to enter the code. Full hexadecimal color code starts from '#' character
		 * while R/G/B component code starts from 'r','g' or 'b' character. This partial code may
		 * be in hexadecimal form ('#' after r/g/b), or in decimal form (code without '#').
		 * Use 'Backspace' for deleting last enetered symbol, or 'Esc' for canceling procedure.
		 * Hit 'Enter' at the end of entering color code for it's analizing and applying.
		 * Correctly entered and applyed code will be erased from displaing. In case of 'error'
		 * the color of the entered code will be  changed form 'white' to 'red'. Use 'Backspace' or 'Esc'
		 * in this case for starting new color code entering.
		 * Note: The procedure works regardless of the current localization language.
		 * Examples:
		 * #123456 - hex color code
		 * r#25    - hex color code for R-component
		 * g255	   - decimal color code for G-component
		 * bff#    - error. '#' character cannot be after digit, use 'backspace' or 'esc'
		 */
		// color code from keyboard will be shown in this line
		this._enterColorBuffer.textContent = '';

		this._build();
		this._updateUI('internal');

		// event listeners is here!
		if (this._slidersTypes[1].ref) { 	// RGB Slider exists
			const rgbUI = this._slidersTypes[1].ctrls;
			// r-slider
			rgbUI.rSliderDrag = new SmartDragElement(rgbUI.rSlider, {containment: rgbUI.rSlider});
			rgbUI.rSlider.addEventListener('onContinueDrag', (evt) => {
				evt.preventDefault();
				evt.stopPropagation();
				rgbUI.rSliderInd.setAttribute('transform', `translate(${evt.detail.x}, 0)`);
				const w = Number(rgbUI.rSlider.getTotalLength());
				const rV = +(((evt.detail.x / w) * 255).toFixed());
				const gV = Number(rgbUI.gSliderVal.textContent);
				const bV = Number(rgbUI.bSliderVal.textContent);
				let cr = w3color(`rgb(${(rV < 0 ? 0 : rV)},${gV},${bV})`);
				rgbUI.rgbVal.textContent = cr.toHexString();
				this._updateUI(cr);
			});
			rgbUI.rSlider.addEventListener('click', (evt) => {
				evt.preventDefault();
				evt.stopPropagation();
				const scroll = SmartWidgets.getScroll();
				const pt = SmartWidgets.svgPoint(rgbUI.rSlider, evt.clientX + scroll.X, evt.clientY + scroll.Y);
				rgbUI.rSliderInd.setAttribute('transform', `translate(${pt.x}, 0)`);

				const w = Number(rgbUI.rSlider.getTotalLength());
				const rV = +(((pt.x / w) * 255).toFixed());
				const gV = Number(rgbUI.gSliderVal.textContent);
				const bV = Number(rgbUI.bSliderVal.textContent);
				let cr = w3color(`rgb(${(rV < 0 ? 0 : rV)},${gV},${bV})`);
				rgbUI.rgbVal.textContent = cr.toHexString();
				this._updateUI(cr);
			});
			// g-slider
			rgbUI.gSliderDrag = new SmartDragElement(rgbUI.gSlider, {containment: rgbUI.gSlider});
			rgbUI.gSlider.addEventListener('onContinueDrag', (evt) => {
				evt.preventDefault();
				evt.stopPropagation();
				rgbUI.gSliderInd.setAttribute('transform', `translate(${evt.detail.x}, 0)`);

				const w = Number(rgbUI.rSlider.getTotalLength());
				const gV = +(((evt.detail.x / w) * 255).toFixed());
				const rV = Number(rgbUI.rSliderVal.textContent);
				const bV = Number(rgbUI.bSliderVal.textContent);
				let cr = w3color(`rgb(${rV},${(gV < 0 ? 0 : gV)},${bV})`);
				rgbUI.rgbVal.textContent = cr.toHexString();
				this._updateUI(cr);
			});
			rgbUI.gSlider.addEventListener('click', (evt) => {
				evt.preventDefault();
				evt.stopPropagation();
				const scroll = SmartWidgets.getScroll();
				const pt = SmartWidgets.svgPoint(rgbUI.gSlider, evt.clientX + scroll.X, evt.clientY + scroll.Y);
				rgbUI.gSliderInd.setAttribute('transform', `translate(${pt.x}, 0)`);

				const w = Number(rgbUI.gSlider.getTotalLength());
				const gV = +(((pt.x / w) * 255).toFixed());
				const rV = Number(rgbUI.rSliderVal.textContent);
				const bV = Number(rgbUI.bSliderVal.textContent);
				let cr = w3color(`rgb(${rV},${(gV < 0 ? 0 : gV)},${bV})`);
				rgbUI.rgbVal.textContent = cr.toHexString();
				this._updateUI(cr);

			});
			// b-slider
			rgbUI.bSliderDrag = new SmartDragElement(rgbUI.bSlider, {containment: rgbUI.bSlider});
			rgbUI.bSlider.addEventListener('onContinueDrag', (evt) => {
				evt.preventDefault();
				evt.stopPropagation();
				rgbUI.bSliderInd.setAttribute('transform', `translate(${evt.detail.x}, 0)`);

				const w = Number(rgbUI.bSlider.getTotalLength());
				const bV = +(((evt.detail.x / w) * 255).toFixed());
				const rV = Number(rgbUI.rSliderVal.textContent);
				const gV = Number(rgbUI.gSliderVal.textContent);
				let cr = w3color(`rgb(${rV},${gV},${(bV < 0 ? 0 : bV)})`);
				rgbUI.rgbVal.textContent = cr.toHexString();
				this._updateUI(cr);
			});
			rgbUI.bSlider.addEventListener('click', (evt) => {
				evt.preventDefault();
				evt.stopPropagation();
				const scroll = SmartWidgets.getScroll();
				const pt = SmartWidgets.svgPoint(rgbUI.bSlider, evt.clientX + scroll.X, evt.clientY + scroll.Y);
				rgbUI.bSliderInd.setAttribute('transform', `translate(${pt.x}, 0)`);

				const w = Number(rgbUI.bSlider.getTotalLength());
				const bV = +(((pt.x / w) * 255).toFixed());
				const rV = Number(rgbUI.rSliderVal.textContent);
				const gV = Number(rgbUI.gSliderVal.textContent);
				let cr = w3color(`rgb(${rV},${gV},${(bV < 0 ? 0 : bV)})`);
				rgbUI.rgbVal.textContent = cr.toHexString();
				this._updateUI(cr);
			});
			rgbUI.rgbBoxDrag = new SmartDragElement(rgbUI.rgbBox, {containment: rgbUI.rgbBox});
			rgbUI.rgbBox.addEventListener('onContinueDrag', (evt) => {
				evt.preventDefault();
				evt.stopPropagation();

				const w = Number(rgbUI.rgbBox.getAttribute('width'));
				const hV = +(((evt.detail.x / w) * 360).toFixed());
				const h = Number(rgbUI.rgbBox.getAttribute('height'));
				const lV = +((evt.detail.y / h).toFixed(2));
				// console.log(`move y: ${evt.detail.y} = ${lV}`);

				let cr = w3color(`hsl(${(hV < 0 ? 0 : hV)},1,${(lV < 0 ? 0 : lV)})`);
				rgbUI.rgbVal.textContent = cr.toHexString();
				this._updateUI(cr);
			});
			rgbUI.rgbBox.addEventListener('click', (evt) => {
				evt.preventDefault();
				evt.stopPropagation();
				const scroll = SmartWidgets.getScroll();
				const pt = SmartWidgets.svgPoint(rgbUI.rgbBox, evt.clientX + scroll.X, evt.clientY + scroll.Y);

				const w = Number(rgbUI.rgbBox.getAttribute('width'));
				const hV = +(((pt.x / w) * 360).toFixed());
				const h = Number(rgbUI.rgbBox.getAttribute('height'));
				const lV = +((pt.y / h).toFixed(2));
				// console.log(`click y: ${pt.y} = ${lV}`);

				let cr = w3color(`hsl(${(hV < 0 ? 0 : hV)},1,${(lV < 0 ? 0 : lV)})`);
				rgbUI.rgbVal.textContent = cr.toHexString();
				this._updateUI(cr);
			});
		}
		if (this._slidersTypes[0].ref) { 	// Hue Box exists
			const hueBoxUI = this._slidersTypes[0].ctrls;

			hueBoxUI.hueDrag = new SmartDragElement(hueBoxUI.hueSlider, {containment: hueBoxUI.hueSlider});
			hueBoxUI.satDrag = new SmartDragElement(hueBoxUI.satlumColor, {containment: hueBoxUI.satlumColor});
			// HSL slider hue is changed
			hueBoxUI.hueSlider.addEventListener('onContinueDrag', (evt) => {
				evt.preventDefault();
				evt.stopPropagation();

				hueBoxUI.hueCtrl.setAttribute('transform', `translate(${evt.detail.x - 3}, 0)`);
				const w = Number(hueBoxUI.hueSlider.getAttribute('width'));
				this.selHue = (evt.detail.x / w) * 360;

				let cr = w3color(`hsl(${this.selHue},${1},${0.5})`);
				hueBoxUI.satlumColor.setAttribute('fill', cr.toHexString());

				cr = w3color(`hsl(${this.selHue},${this.selSat},${this.selLum})`);
				this._updateUI(cr);
			});

			// HSL slider hue was clicked
			hueBoxUI.hueSlider.addEventListener('click', (evt) => {
				evt.preventDefault();
				const scroll = SmartWidgets.getScroll();
				const pt = SmartWidgets.svgPoint(hueBoxUI.hueSlider, evt.clientX + scroll.X, evt.clientY + scroll.Y);
				hueBoxUI.hueCtrl.setAttribute('transform', `translate(${pt.x - 3}, 0)`);

				const w = Number(evt.target.getAttribute('width'));
				this.selHue = (pt.x / w) * 360;
				let cr = w3color(`hsl(${this.selHue},${1},${0.5})`);
				hueBoxUI.satlumColor.setAttribute('fill', cr.toHexString());

				cr = w3color(`hsl(${this.selHue},${this.selSat},${this.selLum})`);
				this._updateUI(cr);
				// console.log(`Click on hew image at x = ${pt.x}, y = ${pt.y}, selected hue = ${this.selHue}`);
			});

			// HSL slider saturation + lightness is changed
			hueBoxUI.satlumColor.addEventListener('onContinueDrag', (evt) => {
				evt.preventDefault();
				evt.stopPropagation();
				hueBoxUI.slCtrl.setAttribute('transform', `translate(${evt.detail.x}, ${evt.detail.y})`);

				const w = Number(evt.target.getAttribute('width'));
				const h = Number(evt.target.getAttribute('height'));
				this.selLum = (evt.detail.y - 45) / h; // * 100;
				this.selSat = evt.detail.x / w; // * 100;
				const cr = w3color(`hsl(${this.selHue},${this.selSat},${this.selLum})`);
				this._updateUI(cr);
			});

			// HSL slider saturation + lightness was clicked
			hueBoxUI.satlumColor.addEventListener('click', (evt) => {
				evt.preventDefault();
				const scroll = SmartWidgets.getScroll();
				const pt = SmartWidgets.svgPoint(hueBoxUI.satlumColor, evt.clientX + scroll.X, evt.clientY + scroll.Y);
				hueBoxUI.slCtrl.setAttribute('transform', `translate(${pt.x}, ${pt.y})`);
				const w = Number(evt.target.getAttribute('width'));
				const h = Number(evt.target.getAttribute('height'));

				this.selLum = (pt.y - 45) / h;
				this.selSat = pt.x / w;
				const cr = w3color(`hsl(${this.selHue},${this.selSat},${this.selLum})`);
				this._updateUI(cr);
			});
		}

		this._currentSliderTitle.addEventListener('keydown', (evt) => {
			// console.log(`Key: ${evt.key}, KeyCode: ${evt.keyCode}`);
			switch (evt.keyCode) {
				case 27:	// 'Escape'
					this._enterColorBuffer.textContent = '';
					this._enterColorBuffer.setAttribute('fill', '#ffffff');
					break;
				case 8:		// 'Backspace'
					if (this._enterColorBuffer.textContent.length) {
						const len = this._enterColorBuffer.textContent.length;
						const str = this._enterColorBuffer.textContent.slice(0, len - 1);
						this._enterColorBuffer.textContent = str;
						this._enterColorBuffer.setAttribute('fill', '#ffffff');
					}
					break;

				case 49:	// '1':
				case 50:	// '2':
				case 51:	// '3':
					if (evt.shiftKey && evt.keyCode == 51) {	// key == '#'
						if ((this._enterColorBuffer.textContent.startsWith('r') ||
							this._enterColorBuffer.textContent.startsWith('g') ||
							this._enterColorBuffer.textContent.startsWith('b')) &&
							this._enterColorBuffer.textContent.charAt(1) != '#' &&
							!this._enterColorBuffer.textContent.includes('#')) {
								this._enterColorBuffer.textContent += '#';
						} else {
							this._enterColorBuffer.textContent = '#';
							this._enterColorBuffer.setAttribute('fill', '#ffffff');
						}
						break;
					}
				// eslint-disable-next-line no-fallthrough
				case 52:	// '4':
				case 53:	// '5':
				case 54:	// '6':
				case 55:	// '7':
				case 56:	// '8':
				case 57:	// '9':
				case 48:	// '0':
				case 65:	// 'a':
				case 66:	// 'b':
					if (evt.keyCode == 66 && this._enterColorBuffer.textContent === '') {
						this._enterColorBuffer.textContent = 'b';
						this._enterColorBuffer.setAttribute('fill', '#ffffff');
						break;
					}
				// eslint-disable-next-line no-fallthrough
				case 67:	// 'c':
				case 68:	// 'd':
				case 69:	// 'e':
				case 70:	// 'f':
					if (this._enterColorBuffer.textContent.startsWith('#')) {
						if (this._enterColorBuffer.textContent.length < 7) {
							this._enterColorBuffer.textContent += String.fromCharCode(evt.keyCode).toLowerCase();
						}
					} else if (this._enterColorBuffer.textContent.startsWith('r')) {
						if (this._enterColorBuffer.textContent.length < 4) {
							this._enterColorBuffer.textContent += String.fromCharCode(evt.keyCode).toLowerCase();
						}
					} else if (this._enterColorBuffer.textContent.startsWith('g')) {
						if (this._enterColorBuffer.textContent.length < 4) {
							this._enterColorBuffer.textContent += String.fromCharCode(evt.keyCode).toLowerCase();
						}
					} else if (this._enterColorBuffer.textContent.startsWith('b')) {
						if (this._enterColorBuffer.textContent.length < 4) {
							this._enterColorBuffer.textContent += String.fromCharCode(evt.keyCode).toLowerCase();
						}
					}
					break;
				case 82:	// 'r':
				case 71:	// 'g':
					if (this._enterColorBuffer.textContent === '') {
						this._enterColorBuffer.textContent = String.fromCharCode(evt.keyCode).toLowerCase();
						this._enterColorBuffer.setAttribute('fill', '#ffffff');
					}
					break;
				case 13: {	// 'Enter':
					const rgbUI = this._slidersTypes[1].ctrls;
					const rV = Number(rgbUI.rSliderVal.textContent);
					const gV = Number(rgbUI.gSliderVal.textContent);
					const bV = Number(rgbUI.bSliderVal.textContent);

					if (this._enterColorBuffer.textContent.startsWith('#')) {
						// try to convert it to color...
						const cr = w3color(this._enterColorBuffer.textContent);
						if (cr.valid) {
							this._updateUI(cr);
							this._enterColorBuffer.textContent = '';
							this._enterColorBuffer.setAttribute('fill', '#ffffff');
						} else {
							this._enterColorBuffer.setAttribute('fill', '#ff0000');
						}
					} else if (this._enterColorBuffer.textContent.startsWith('r')) {
						let value = this._enterColorBuffer.textContent.replace('r', '');
						if (value.startsWith('#')) {
							value = value.replace('#', '');
							value = parseInt(value, 16);
						}
						let cr = w3color(`rgb(${value},${gV},${bV})`);
						if (cr.valid) {
							this._updateUI(cr);
							this._enterColorBuffer.textContent = '';
							this._enterColorBuffer.setAttribute('fill', '#ffffff');
						} else {
							this._enterColorBuffer.setAttribute('fill', '#ff0000');
						}
					} else if (this._enterColorBuffer.textContent.startsWith('g')) {
						let value = this._enterColorBuffer.textContent.replace('g', '');
						if (value.startsWith('#')) {
							value = value.replace('#', '');
							value = parseInt(value, 16);
						}
						let cr = w3color(`rgb(${rV},${value},${bV})`);
						if (cr.valid) {
							this._updateUI(cr);
							this._enterColorBuffer.textContent = '';
							this._enterColorBuffer.setAttribute('fill', '#ffffff');
						} else {
							this._enterColorBuffer.setAttribute('fill', '#ff0000');
						}
					} else if (this._enterColorBuffer.textContent.startsWith('b')) {
						let value = this._enterColorBuffer.textContent.replace('b', '');
						if (value.startsWith('#')) {
							value = value.replace('#', '');
							value = parseInt(value, 16);
						}
						let cr = w3color(`rgb(${rV},${gV}),${value}`);
						if (cr.valid) {
							this._updateUI(cr);
							this._enterColorBuffer.textContent = '';
							this._enterColorBuffer.setAttribute('fill', '#ffffff');
						} else {
							this._enterColorBuffer.setAttribute('fill', '#ff0000');
						}
					} else {
						this._enterColorBuffer.textContent = '-error-';
					}
					break;
				}
				default:
					break;
			}
			evt.preventDefault();
		});

		// show popup menu was pressed
		this._selectSliders.addEventListener('click', (evt) => {
			this._ssMenuG.setAttribute('display', this._ssMenuG.getAttribute('display') === 'none' ? 'inherit' : 'none');
		});

		// set 'stroke as active' was pressed
		this._btnSelStroke.addEventListener('click', (evt) => {
			this._strokeColor.active = 1;
			this._fillColor.active = 0;
			this._sfG.insertBefore(this._btnSelFill, this._btnSelStroke);
			// this._updateSliders('stroke');
			this._updateUI();
		});
		// set 'fill as active' was pressed
		this._btnSelFill.addEventListener('click', (evt) => {
			this._strokeColor.active = 0;
			this._fillColor.active = 1;
			this._sfG.insertBefore(this._btnSelStroke, this._btnSelFill);
			// this._updateSliders('fill');
			this._updateUI();
		});

		// set active to 'none' color was pressed
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
			// this._updateSliders();
			this._updateUI();
		});

		// Switch color between stroke and fill was pressed
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
			// this._updateSliders();
			this._updateUI();
		});

		// Drop color button was precced
		this._setCurColor.addEventListener('click', (evt) => {
			if (this._strokeColor.active) {
				if (this._strokeColor.isnone) {
					this._strokeColor.isnone = 0;
					this._actStrokeNoColor.setAttribute('display', 'none');
				} else {
					this._strokeColor.prev = this._strokeColor.color;
				}
				this._strokeColor.color = this._drop.color;
				this._actStrokeColor.setAttribute('stroke', this._strokeColor.color);
			} else {
				if (this._fillColor.isnone) {
					this._fillColor.isnone = 0;
					this._actFillNoColor.setAttribute('display', 'none');
				} else {
					this._fillColor.prev = this._fillColor.color;
				}
				this._fillColor.color = this._drop.color;
				this._actFillColor.setAttribute('fill', this._fillColor.color);
			}
			// this._updateSliders();
			this._updateUI();
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
