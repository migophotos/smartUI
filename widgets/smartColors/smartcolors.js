/* eslint-disable no-multi-assign */
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
		`;
		this._helpLayerDef = `
			<g id="show-help-layer" style="font-family:'ArialMT', 'Arial', sans-serif;font-size:7.678px;">
			<rect x="0" y="0" width="188" height="191" fill="none" stroke="none"></rect>
			<g>
				<rect x="53.054" y="75" width="75.891" height="14.173" fill="#5a6348"/>
				<path d="M40.908,76.071L54.985,87.071L124.985,87.071" fill="none" stroke="#fff" stroke-width="1"/>
				<text x="55.77" y="83.571" fill="#fff">Click to set &apos;ﬁll&apos; color</text>
			</g>
			<g>
				<rect x="24.054" y="90" width="75.891" height="14.173" fill="#5a6348"/>
				<path d="M15.811,86.638L27.985,102.071L97.985,102.071" fill="none" stroke="#fff" stroke-width="1"/>
				<text x="29.77" y="98.571" fill="#fff">Click to unset color</text>
			</g>
			<g>
				<rect x="58.054" y="167" width="75.891" height="14.173" fill="#5a6348"/>
				<path d="M51.547,189.937L59.985,178.638L129.985,178.638" fill="none" stroke="#fff" stroke-width="1"/>
				<text x="63.77" y="175.571" fill="#fff">Click to set opacity</text>
			</g>
			<g>
				<rect x="65" y="132" width="86.945" height="14.173" fill="#5a6348"/>
				<text x="73.77" y="141.571" fill="#fff">Click to select color</text>
			</g>
			<g>
				<rect x="0" y="0" width="87.498" height="39.394" fill="#5a6348"/>
				<path d="M13.449,54.912L1.985,12.071L85.985,12.071" fill="none" stroke="#fff" stroke-width="1"/>
				<text x="2.77" y="8.571" style="font-family:'ArialMT', 'Arial', sans-serif;font-size:7.678px;fill:#fff;">Click to set &apos;stroke&apos; color</text>
			</g>
			<g>
				<rect x="73.054" y="60" width="75.891" height="14.173" fill="#5a6348"/>
				<path d="M58.908,60.071L72.985,71.071L142.985,71.071" fill="none" stroke="#fff" stroke-width="1"/>
				<text x="73.77px" y="67.571px" fill="#fff">Click to use this color</text>
			</g>
			<g>
				<path d="M39.433,45.299L13.985,28.071L83.985,28.071" fill="none" stroke="#fff" stroke-width="1"/>
				<text x="13.77" y="24.571" fill="#fff">Click to switch colors</text>
			</g>
			<g>
				<rect x="105.054" y="45" width="74.061" height="14.173" fill="#5a6348"/>
				<path d="M184.709,51.205L177.908,57.071L107.908,57.071" fill="none" stroke="#fff" stroke-width="1"/>
				<text x="109.77" y="53.571" fill="#fff">Click to open menu</text>
			</g>
			<g>
				<rect x="87" y="0" width="100.363" height="39.394" fill="#5a6348"/>
				<path d="M87.306,40.575L98.528,12.26L183.528,12.26" fill="none" stroke="#fff" stroke-width="1"/>
				<text x="100.312" y="8.76" fill="#fff">Click to enter color code</text>
				<text x="100.312" y="20.76" fill="#fff">#XXXXXX&lt;enter&gt;</text>
				<text x="100.312" y="27.76" fill="#fff">r/g/b#XX&lt;enter&gt;</text>
				<text x="99.312" y="35.76" fill="#fff">r/g/bNNN&lt;enter&gt;</text>
			</g>
		</g>

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
				<stop offset="25%" stop-color="#80ff00"/>
				<stop offset="37.5%" stop-color="#00ff40"/>
				<stop offset="50%" stop-color="#00ffff"/>
				<stop offset="62.5%" stop-color="#0040ff"/>
				<stop offset="75%" stop-color="#7f00ff"/>
				<stop offset="87.5%" stop-color="#ff00bf"/>
				<stop offset="100%" stop-color="#ff0000"/>
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
			const opSliderDef = 
			`<pattern id="pats" x="0" y="0" width="0.04" height="1">
            <rect x="0" y="0" width="4" height="4" fill="#aaaaaa"/>
            <rect x="4" y="0" width="4" height="4" fill="#ffffff"/>
            <rect x="0" y="4" width="4" height="4" fill="#ffffff"/>
            <rect x="4" y="4" width="4" height="4" fill="#aaaaaa"/>
        	</pattern>
			<linearGradient id="maskGradient">
				<stop offset="0" stop-color="white" stop-opacity="0" />
				<stop offset="1" stop-color="white" stop-opacity="1" />
		    </linearGradient>
			<mask id="opacityMask">
				<rect x="0" y="0" width="192" height="8" fill="url(#maskGradient)"  />
			</mask>			
			<mask id="componentMask">
				<rect x="0" y="0" width="154" height="8" fill="url(#maskGradient)"  />
			</mask>`;			

			this._defs.innerHTML = window.SmartColorSelectors.defs + hueRangeDef + lumRangeDef + satRangeDef + rgbRangeDef + opSliderDef;

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
			x: data.x + (data.width / 2),
			y: data.y + (data.height / 2),
			fill: '#ffffff',
			'text-anchor': 'middle',
			'dominant-baseline': 'middle',
			'pointer-events': 'none',
			'font-family': fontFamily,
			'font-size': fontSize,
			'stroke-linejoin': 'round'
		}, item, this._svgdoc);
		return item;
	}
	/**
	 * Show or hide sliders menu. Changes button apperiance also
	 * @param {boolean*} state 
	 */
	_displaySliderTypeMenu(state) {
		let status = 'none';
		let btnCr = '#666';
		let textCr = '#fff';
		if (state) {
			status = 'inherit';
			btnCr = '#fff';
			textCr = '#666';
		}
		this._ssMenuG.setAttribute('display', status);
		SmartWidgets.setAttributes([this._root.getElementById('select-slider-btn')], {
			fill: btnCr,
			stroke: textCr
		});
		SmartWidgets.setAttributes([this._root.getElementById('select-slider-text')], {
			stroke: textCr
		});

		
	}
	/**
	 *
	 */
	_onSelectSliderType(evt) {
		evt.stopPropagation();
		evt.preventDefault();
		// hide menu
		this._displaySliderTypeMenu(false);
		// get selected index
		const index = Number(evt.target.id.replace('slider-', ''));
		// get reference on selected slider definition
		const slider = this._slTypes.get(this._slidersTypes[index]);
		// set it's name in title
		this._currentSliderTitle.textContent = slider.name;
		// get reference on current slider group
		const curSliderRef = this._slTypes.get(this._slidersTypes[this._currentSliderIndex]).ref;
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
			 * Opacity slider at the bottom of the window
			 */
			this._opacityG = SmartWidgets.addElement('g', {
				class: 'opacity-group',
				transform: `translate(${gap + 4}, ${155})`
			}, this._bodyG, this._svgdoc);
			SmartWidgets.addElement('rect', {	// for pattern
				class: 'op-slider patern',
				x: 0,
				y: 0,
				width: 192,
				height: 8,
				rx: 4,
				stroke: '#0000',
				'stroke-width': 0.6,
				fill: 'url(#pats)',
				'pointer-events': 'none'
			}, this._opacityG, this._svgdoc);
			this._opSlider = SmartWidgets.addElement('rect', {
				id: 'opacity-slider',
				class: 'op-slider draggable clickable',
				x: 0,
				y: 0,
				width: 192,
				height: 8,
				rx: 4,
				stroke: '#0000',
				'stroke-width': 0.6,
				fill: '#cc0000',	// temporary
				mask: 'url(#opacityMask)',
				style: 'cursor:pointer'
			}, this._opacityG, this._svgdoc);
			this._opInd = SmartWidgets.addElement('circle', {
				id: 'opacity-indicator',
				cx: 0,
				cy: 4,
				r: 8,
				stroke: '#ffffff',
				'stroke-width': 1.6,
				fill: '#cc0000',	// will be updated by active color
				'fill-opacity': 1,	// will be updated from 1 to 0, by draggin opacity slider
				'pointer-events': 'none'
			}, this._opacityG, this._svgdoc);

			/**
			 * Hue Boxes group
			 */
			this._slTypes.set('hue-boxes', {
				name: 'Hue Boxes',
				ctrls: {
					hueSlider: null,
					hueDrag: null,
					satlumColor: null,
					satDrag: null,
					hueCtrl: null,
					slCtrl: null
				},
				ref: SmartWidgets.addElement('g', {
					id: 'hue-boxes',
					class: 'hue-boxes',
					transform: `translate(${gap}, 60)`
				}, this._bodyG, this._svgdoc)
			});
			const hbUI = this._slTypes.get('hue-boxes');
			const hbG = hbUI.ref;	// reference on group
			ctrls = hbUI.ctrls;		// alias on Hue Box UI controls
			if (hbG) {
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
				}, hbG, this._svgdoc);

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
				}, hbG, this._svgdoc);
				SmartWidgets.addElement('rect', {
					class: 'sat-range',
					x: 0,
					y:45,
					width: bodyWidth,
					height:40,
					stroke: 'none',
					fill: 'url(#satRange)',
					'pointer-events': 'none'
				}, hbG, this._svgdoc);
				SmartWidgets.addElement('rect', {
					class: 'lum-range',
					x: 0,
					y:45,
					width: bodyWidth,
					height:40,
					stroke: 'none',
					fill: 'url(#lumRange)',
					'pointer-events': 'none'
				}, hbG, this._svgdoc);

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
				}, hbG, this._svgdoc);

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
				}, hbG, this._svgdoc);
			}

			/**
			 * RGB Sliders group
			 */
			this._slTypes.set('rgb-sliders', {
				name: 'RGB Sliders',
				ctrls: {
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
				},
				ref: SmartWidgets.addElement('g', {
					id: 'rgb-sliders',
					class: 'rgb-sliders',
					transform: `translate(${gap}, 60)`
				}, this._bodyG, this._svgdoc)
			});
			const rgbUI = this._slTypes.get('rgb-sliders');
			const rgbG = rgbUI.ref;
			ctrls = rgbUI.ctrls;
			if (rgbG) {
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
				}, rgbG, this._svgdoc);
				ctrls.rSliderVal = SmartWidgets.addElement('text', {
					text: '#00',
					x: 180,
					y: 5,
					fill: '#ffffff',
					'text-anchor': 'start',
					'dominant-baseline': 'middle',
					'font-family': fontFamily,
					'font-size': 12,
					'stroke-linejoin': 'round',
					'pointer-events': 'none'
				}, rgbG, this._svgdoc);

				let gr = SmartWidgets.addElement('g', {
					id: 'r-sliders-g',
					class: 'r-sliders-g',
					transform: 'translate(16, 0)'
				}, rgbG, this._svgdoc);

				// draw slider as two rectangles with mask.
				ctrls.rSlider = SmartWidgets.addElement('rect', {
					id: 'r-slider',
					class: 'r-slider-to draggable clickable',
					x: -2,
					y: -2,
					rx: 6,
					width: 158,
					height: 12,
					'stroke-width': 1,
					stroke: this._o.bkgColor,
					fill: this._o.bkgColor,
					style: 'cursor:pointer'
				}, gr, this._svgdoc);
				ctrls.rSlider.dataset['bisy'] = 'none';
				// bottom rectangle shows color 'from' and upper one - 'upto' color
				ctrls.rSliderFrom = SmartWidgets.addElement('rect', {
					class: 'r-slider-from',
					x: 0,
					y: 0,
					rx: 4,
					width: 154,
					height: 8,
					'stroke-width': 0,
					fill: '#000000',	// color 'from'
					'pointer-events': 'none'
				}, gr, this._svgdoc);
				// upper rectangle
				ctrls.rSliderTo = SmartWidgets.addElement('rect', {
					class: 'r-slider-to',
					x: 0,
					y: 0,
					rx: 4,
					width: 154,
					height: 8,
					'stroke-width': 0,
					fill: '#ff0000',	// color 'upto'
					mask: 'url(#componentMask)',
					'pointer-events': 'none'
				}, gr, this._svgdoc);

				ctrls.rSliderInd = SmartWidgets.addElement('circle', {
					id: 'rSliderInd',
					class: 'r-slider-ind',
					cx: 0,
					cy: 4,
					r: 6,
					stroke: '#ffffff',
					'stroke-width': 1.6,
					fill: '#ff0000',
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
				}, rgbG, this._svgdoc);
				ctrls.gSliderVal = SmartWidgets.addElement('text', {
					text: '#00',
					x: 180,
					y: 21,
					fill: '#ffffff',
					'text-anchor': 'start',
					'dominant-baseline': 'middle',
					'font-family': fontFamily,
					'font-size': 12,
					'stroke-linejoin': 'round',
					'pointer-events': 'none'
				}, rgbG, this._svgdoc);

				gr = SmartWidgets.addElement('g', {
					id: 'g-sliders-g',
					class: 'g-sliders-g',
					transform: 'translate(16, 16)'
				}, rgbG, this._svgdoc);

				// draw slider as two rectangles with mask.
				ctrls.gSlider = SmartWidgets.addElement('rect', {
					id: 'g-slider',
					class: 'g-slider-to draggable clickable',
					x: -2,
					y: -2,
					rx: 6,
					width: 158,
					height: 12,
					'stroke-width': 1,
					stroke: this._o.bkgColor,
					fill: this._o.bkgColor,
					style: 'cursor:pointer'
				}, gr, this._svgdoc);
				ctrls.gSlider.dataset['bisy'] = 'none';
				// bottom rectangle shows color 'from' and upper one - 'upto' color
				ctrls.gSliderFrom = SmartWidgets.addElement('rect', {
					class: 'g-slider-from',
					x: 0,
					y: 0,
					rx: 4,
					width: 154,
					height: 8,
					'stroke-width': 0,
					fill: '#000000',	// color 'from'
					'pointer-events': 'none'
				}, gr, this._svgdoc);
				// upper rectangle
				ctrls.gSliderTo = SmartWidgets.addElement('rect', {
					class: 'g-slider-to',
					x: 0,
					y: 0,
					rx: 4,
					width: 154,
					height: 8,
					'stroke-width': 0,
					fill: '#00ff00',	// color 'upto'
					mask: 'url(#componentMask)',
					'pointer-events': 'none'
				}, gr, this._svgdoc);

				ctrls.gSliderInd = SmartWidgets.addElement('circle', {
					id: 'g-slider-ind',
					class: 'g-slider-ind',
					cx: 0,
					cy: 4,
					r: 6,
					stroke: '#ffffff',
					'stroke-width': 1.6,
					fill: '#00ff00',
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
				}, rgbG, this._svgdoc);
				ctrls.bSliderVal = SmartWidgets.addElement('text', {
					text: '#00',
					x: 180,
					y: 37,
					fill: '#ffffff',
					'text-anchor': 'start',
					'dominant-baseline': 'middle',
					'font-family': fontFamily,
					'font-size': 12,
					'stroke-linejoin': 'round',
					'pointer-events': 'none'
				}, rgbG, this._svgdoc);

				gr = SmartWidgets.addElement('g', {
					id: 'b-sliders-g',
					class: 'b-sliders-g',
					transform: 'translate(16, 32)'
				}, rgbG, this._svgdoc);

				// draw slider as two rectangles with mask.
				ctrls.bSlider = SmartWidgets.addElement('rect', {
					id: 'b-slider',
					class: 'b-slider-to draggable clickable',
					x: -2,
					y: -2,
					rx: 6,
					width: 158,
					height: 12,
					'stroke-width': 1,
					stroke: this._o.bkgColor,
					fill: this._o.bkgColor,
					style: 'cursor:pointer'
				}, gr, this._svgdoc);
				ctrls.bSlider.dataset['bisy'] = 'none';
				// bottom rectangle shows color 'from' and upper one - 'upto' color
				ctrls.bSliderFrom = SmartWidgets.addElement('rect', {
					class: 'b-slider-from',
					x: 0,
					y: 0,
					rx: 4,
					width: 154,
					height: 8,
					'stroke-width': 0,
					fill: '#000000',	// color 'from'
					'pointer-events': 'none'
				}, gr, this._svgdoc);
				// upper rectangle
				ctrls.bSliderTo = SmartWidgets.addElement('rect', {
					class: 'b-slider-to',
					x: 0,
					y: 0,
					rx: 4,
					width: 154,
					height: 8,
					'stroke-width': 0,
					fill: '#0000ff',	// color 'upto'
					mask: 'url(#componentMask)',
					'pointer-events': 'none'
				}, gr, this._svgdoc);

				ctrls.bSliderInd = SmartWidgets.addElement('circle', {
					id: 'b-slider-ind',
					class: 'b-slider-ind',
					cx: 0,
					cy: 4,
					r: 6,
					stroke: '#ffffff',
					'stroke-width': 1.6,
					fill: '#0000ff',
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
				}, rgbG, this._svgdoc);
				ctrls.rgbVal = SmartWidgets.addElement('text', {
					text: '#000000',
					x: 153,
					y: 53,
					fill: '#ffffff',
					'text-anchor': 'start',
					'dominant-baseline': 'middle',
					'font-family': fontFamily,
					'font-size': 12,
					'stroke-linejoin': 'round',
					// 'pointer-events': 'none'
				}, rgbG, this._svgdoc);

				gr = SmartWidgets.addElement('g', {
					id: 'rgb-box-g',
					class: 'rgb-box-g',
					transform: 'translate(0, 60)'
				}, rgbG, this._svgdoc);
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
				rgbG.setAttribute('display', 'none');
			}

			/**
			 * Monochromatic Color Schemes group
			 */
			this._slTypes.set('mono-scheme', {
				name: 'Monochromatic',
				ctrls: {
					schemeG: null,
					rgbVal: null,
					rgbBox: null
				},
				ref: SmartWidgets.addElement('g', {
					id: 'mono-scheme',
					class: 'mono-scheme',
					transform: `translate(${gap}, 60)`
				}, this._bodyG, this._svgdoc)
			});
			const monoUI = this._slTypes.get('mono-scheme');
			const monoG = monoUI.ref;
			ctrls = monoUI.ctrls;
			if (monoG) {
				ctrls.schemeG = SmartWidgets.addElement('g', {
					class: 'mono-scheme-g',
					style: 'cursor:pointer;',
					transform: 'translate(0, 0)'
				}, monoG, this._svgdoc);
				for (let i = 0; i < 5; i++) {
					SmartWidgets.addElement('rect', {
						id: `mono-scheme-${i}`,
						class: 'mono-scheme',
						x: i * 40,
						y: 0,
						width: 40,
						height: 30,
						stroke: 'none',
						fill: `#${i * 4}${i * 4}${i * 4}`	// will be updated later
					}, ctrls.schemeG, this._svgdoc);
					SmartWidgets.addElement('text', {
						id: `mono-color-${i}`,
						class: 'mono-color',
						text: '#ffffff',
						x: (i * 40) + 20,
						y: 16,
						fill: '#ffffff',
						'text-anchor': 'middle',
						'dominant-baseline': 'middle',
						'font-family': fontFamily,
						'font-size': 8,
						'stroke-linejoin': 'round',
						// 'pointer-events': 'none'
					}, ctrls.schemeG, this._svgdoc);					

				}
				/**
				 * RGB Box
				 */
				SmartWidgets.addElement('text', {
					text: 'RGB',
					x: -2,
					y: 43,
					fill: '#ffffff',
					'text-anchor': 'start',
					'dominant-baseline': 'middle',
					'font-family': fontFamily,
					'font-size': 12,
					'stroke-linejoin': 'round',
					'pointer-events': 'none'
				}, monoG, this._svgdoc);
				ctrls.rgbVal = SmartWidgets.addElement('text', {
					text: '#000000',
					x: 148,
					y: 43,
					fill: '#ffffff',
					'text-anchor': 'start',
					'dominant-baseline': 'middle',
					'font-family': fontFamily,
					'font-size': 12,
					'stroke-linejoin': 'round',
					// 'pointer-events': 'none'
				}, monoG, this._svgdoc);

				const gr = SmartWidgets.addElement('g', {
					class: 'rgb-box-g',
					transform: 'translate(0, 50)'
				}, monoG, this._svgdoc);
				ctrls.rgbBox = SmartWidgets.addElement('rect', {
					class: 'rgb-box draggable clickable',
					x: 0,
					y: 0,
					width: 200,
					height: 35,
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
					height: 35,
					// 'stroke-width': 0,
					fill: 'url(#lumRange)',
					'pointer-events': 'none'
				}, gr, this._svgdoc);
				monoG.setAttribute('display', 'none');
			}

			/**
			 * Complementary Color Schemes group
			 */
			this._slTypes.set('comp-scheme', {
				name: 'Complementary',
				ctrls: {
					schemeG: null,
					rgbVal: null,
					rgbBox: null
				},
				ref: SmartWidgets.addElement('g', {
					id: 'comp-scheme',
					class: 'comp-scheme',
					transform: `translate(${gap}, 60)`
				}, this._bodyG, this._svgdoc)
			});
			const compUI = this._slTypes.get('comp-scheme');
			const compG = compUI.ref;
			ctrls = compUI.ctrls;
			if (compG) {
				ctrls.schemeG = SmartWidgets.addElement('g', {
					class: 'comp-scheme-g',
					style: 'cursor:pointer;',
					transform: 'translate(0, 0)'
				}, compG, this._svgdoc);
				for (let i = 0; i < 5; i++) {
					SmartWidgets.addElement('rect', {
						id: `comp-scheme-${i}`,
						class: 'comp-scheme',
						x: i * 40,
						y: 0,
						width: 40,
						height: 30,
						stroke: 'none',
						fill: `#${i * 4}${i * 4}${i * 4}`	// will be updated later
					}, ctrls.schemeG, this._svgdoc);
					SmartWidgets.addElement('text', {
						id: `comp-color-${i}`,
						class: 'comp-color',
						text: '#ffffff',
						x: (i * 40) + 20,
						y: 16,
						fill: '#ffffff',
						'text-anchor': 'middle',
						'dominant-baseline': 'middle',
						'font-family': fontFamily,
						'font-size': 10,
						'stroke-linejoin': 'round',
						// 'pointer-events': 'none'
					}, ctrls.schemeG, this._svgdoc);					
				}

				/**
				 * RGB Box
				 */
				SmartWidgets.addElement('text', {
					text: 'RGB',
					x: -2,
					y: 43,
					fill: '#ffffff',
					'text-anchor': 'start',
					'dominant-baseline': 'middle',
					'font-family': fontFamily,
					'font-size': 12,
					'stroke-linejoin': 'round',
					'pointer-events': 'none'
				}, compG, this._svgdoc);
				ctrls.rgbVal = SmartWidgets.addElement('text', {
					text: '#000000',
					x: 148,
					y: 43,
					fill: '#ffffff',
					'text-anchor': 'start',
					'dominant-baseline': 'middle',
					'font-family': fontFamily,
					'font-size': 12,
					'stroke-linejoin': 'round',
					// 'pointer-events': 'none'
				}, compG, this._svgdoc);

				const gr = SmartWidgets.addElement('g', {
					class: 'rgb-box-g',
					transform: 'translate(0, 50)'
				}, compG, this._svgdoc);
				ctrls.rgbBox = SmartWidgets.addElement('rect', {
					class: 'rgb-box draggable clickable',
					x: 0,
					y: 0,
					width: 200,
					height: 35,
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
					height: 35,
					// 'stroke-width': 0,
					fill: 'url(#lumRange)',
					'pointer-events': 'none'
				}, gr, this._svgdoc);
				compG.setAttribute('display', 'none');
			}


			/**
			 * Analogous Color Schemes group
			 */
			this._slTypes.set('analog-scheme', {
				name: 'Analogous Scheme',
				ctrls: {
					schemeG: null,
					rgbVal: null,
					rgbBox: null
				},
				ref: SmartWidgets.addElement('g', {
					id: 'analog-scheme',
					class: 'analog-scheme',
					transform: `translate(${gap}, 60)`
				}, this._bodyG, this._svgdoc)
			});
			const analogUI = this._slTypes.get('analog-scheme');
			const analogG = analogUI.ref;
			ctrls = analogUI.ctrls;
			if (analogG) {
				ctrls.schemeG = SmartWidgets.addElement('g', {
					class: 'analog-scheme-g',
					style: 'cursor:pointer;',
					transform: 'translate(0, 0)'
				}, analogG, this._svgdoc);
				for (let i = 0; i < 5; i++) {
					SmartWidgets.addElement('rect', {
						id: `analog-scheme-${i}`,
						class: 'analog-scheme',
						x: i * 40,
						y: 0,
						width: 40,
						height: 30,
						stroke: 'none',
						fill: `#${i * 4}${i * 4}${i * 4}`	// will be updated later
					}, ctrls.schemeG, this._svgdoc);
					SmartWidgets.addElement('text', {
						id: `analog-color-${i}`,
						class: 'analog-color',
						text: '#ffffff',
						x: (i * 40) + 20,
						y: 16,
						fill: '#ffffff',
						'text-anchor': 'middle',
						'dominant-baseline': 'middle',
						'font-family': fontFamily,
						'font-size': 10,
						'stroke-linejoin': 'round',
						// 'pointer-events': 'none'
					}, ctrls.schemeG, this._svgdoc);					

				}
				/**
				 * RGB Box
				 */
				SmartWidgets.addElement('text', {
					text: 'RGB',
					x: -2,
					y: 43,
					fill: '#ffffff',
					'text-anchor': 'start',
					'dominant-baseline': 'middle',
					'font-family': fontFamily,
					'font-size': 12,
					'stroke-linejoin': 'round',
					'pointer-events': 'none'
				}, analogG, this._svgdoc);
				ctrls.rgbVal = SmartWidgets.addElement('text', {
					text: '#000000',
					x: 148,
					y: 43,
					fill: '#ffffff',
					'text-anchor': 'start',
					'dominant-baseline': 'middle',
					'font-family': fontFamily,
					'font-size': 12,
					'stroke-linejoin': 'round',
					// 'pointer-events': 'none'
				}, analogG, this._svgdoc);

				const gr = SmartWidgets.addElement('g', {
					class: 'rgb-box-g',
					transform: 'translate(0, 50)'
				}, analogG, this._svgdoc);
				ctrls.rgbBox = SmartWidgets.addElement('rect', {
					class: 'rgb-box draggable clickable',
					x: 0,
					y: 0,
					width: 200,
					height: 35,
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
					height: 35,
					// 'stroke-width': 0,
					fill: 'url(#lumRange)',
					'pointer-events': 'none'
				}, gr, this._svgdoc);
				analogG.setAttribute('display', 'none');
			}

			/**
			 * Triadic Color Schemes group
			 */
			this._slTypes.set('triadic-scheme', {
				name: 'Triadic Scheme',
				ctrls: {
					schemeG: null,
					rgbVal: null,
					rgbBox: null
				},
				ref: SmartWidgets.addElement('g', {
					id: 'triadic-scheme',
					class: 'triadic-scheme',
					transform: `translate(${gap}, 60)`
				}, this._bodyG, this._svgdoc)
			});
			const triadicUI = this._slTypes.get('triadic-scheme');
			const triadicG = triadicUI.ref;
			ctrls = triadicUI.ctrls;
			if (triadicG) {
				ctrls.schemeG = SmartWidgets.addElement('g', {
					class: 'triadic-scheme-g',
					style: 'cursor:pointer;',
					transform: 'translate(0, 0)'
				}, triadicG, this._svgdoc);
				for (let i = 0; i < 5; i++) {
					SmartWidgets.addElement('rect', {
						id: `triadic-scheme-${i}`,
						class: 'triadic-scheme',
						x: i * 40,
						y: 0,
						width: 40,
						height: 30,
						stroke: 'none',
						fill: `#${i * 4}${i * 4}${i * 4}`,	// will be updated later
					}, ctrls.schemeG, this._svgdoc);
					SmartWidgets.addElement('text', {
						id: `triadic-color-${i}`,
						class: 'triadic-color',
						text: '#ffffff',
						x: (i	 * 40) + 20,
						y: 16,
						fill: '#ffffff',
						'text-anchor': 'middle',
						'dominant-baseline': 'middle',
						'font-family': fontFamily,
						'font-size': 10,
						'stroke-linejoin': 'round',
						// 'pointer-events': 'none'
					}, ctrls.schemeG, this._svgdoc);					

				}
				/**
				 * RGB Box
				 */
				SmartWidgets.addElement('text', {
					text: 'RGB',
					x: -2,
					y: 43,
					fill: '#ffffff',
					'text-anchor': 'start',
					'dominant-baseline': 'middle',
					'font-family': fontFamily,
					'font-size': 12,
					'stroke-linejoin': 'round',
					'pointer-events': 'none'
				}, triadicG, this._svgdoc);
				ctrls.rgbVal = SmartWidgets.addElement('text', {
					text: '#000000',
					x: 148,
					y: 43,
					fill: '#ffffff',
					'text-anchor': 'start',
					'dominant-baseline': 'middle',
					'font-family': fontFamily,
					'font-size': 12,
					'stroke-linejoin': 'round',
					// 'pointer-events': 'none'
				}, triadicG, this._svgdoc);

				const gr = SmartWidgets.addElement('g', {
					class: 'rgb-box-g',
					transform: 'translate(0, 50)'
				}, triadicG, this._svgdoc);
				ctrls.rgbBox = SmartWidgets.addElement('rect', {
					class: 'rgb-box draggable clickable',
					x: 0,
					y: 0,
					width: 200,
					height: 35,
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
					height: 35,
					// 'stroke-width': 0,
					fill: 'url(#lumRange)',
					'pointer-events': 'none'
				}, gr, this._svgdoc);
				triadicG.setAttribute('display', 'none');
			}

			// /**
			//  * HSL Wheel group
			//  */
			// this._slTypes.set('hsl-wheel', {
			// 	name: 'HSL Wheel',
			// 	ctrls: {},
			// 	ref: SmartWidgets.addElement('g', {
			// 		id: 'hsl-wheel',
			// 		class: 'hsl-wheel',
			// 		transform: `translate(${gap}, 60)`
			// 	}, this._bodyG, this._svgdoc)
			// });
			// const hslwUI = this._slTypes.get('hsl-wheel');
			// const hslwG = hslwUI.ref;
			// ctrls = hslwUI.ctrls;
			// if (hslwG) {
			// 	//
			// }

			// add others sliders groups here!

			// endof groups insertion line

			/**
			 * Sliders selector pop-up menu
			 */
			const ssmId = `${this.id}-ssmenu`;
			this._ssMenuG = SmartWidgets.addElement('g', {
				id: ssmId,
				class: 'slider-selector-menu',
				transform: `translate(${80}, ${gap + 17})`
			}, this._bodyG, this._svgdoc);

			/**
			 * Currently Selected Slider Title
			 */
			this._currentSliderG = SmartWidgets.addElement('g', {
				class: 'current-slider',
				transform: `translate(${80}, ${gap})`
			}, this._bodyG, this._svgdoc);
			const sliderUiId = this._slidersTypes[this._currentSliderIndex];
			const sliderUI = this._slTypes.get(sliderUiId);

			this._currentSliderTitle = SmartWidgets.addElement('text', {
				text: sliderUI.name,
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
				class: 'select-slider-btn',
				style: 'cursor:pointer;',
				transform: `translate(${190}, ${gap})`
			}, this._bodyG, this._svgdoc);
			SmartWidgets.addElement('rect', {
				id: 'select-slider-btn',
				x: 0,
				y: 0,
				width: 15,
				height: 14,
				rx: 2,
				fill: '#666666',
				stroke: '#ffffff',
				'stroke-width': 0.6
			}, this._selectSliders, this._svgdoc);
			SmartWidgets.addElement('path', {
				id: 'select-slider-text',
				d: 'M2,4 h11 m-11,3 h11, m-11,3 h11',
				stroke: '#ffffff',
				'stroke-width': 1.6,
				fill: 'none',
				'pointer-events': 'none'
			}, this._selectSliders, this._svgdoc);

			/**
			 * Show 'Help' button under 'show popup menu' button
			 */
			this._showHelp = SmartWidgets.addElement('g', {
				class: 'show-help-btn',
				style: 'cursor:pointer;',
				transform: `translate(${190}, ${gap + 18})`
			}, this._bodyG, this._svgdoc);
			SmartWidgets.addElement('rect', {
				id: 'show-help-btn',
				x: 0,
				y: 0,
				width: 15,
				height: 14,
				rx: 2,
				fill: '#666666',
				stroke: '#ffffff',
				'stroke-width': 0.6
			}, this._showHelp, this._svgdoc);
			SmartWidgets.addElement('text', {
				id: 'show-help-text',
				text: '?',
				x: 7.5,
				y: 8,
				fill: '#ffffff',
				'text-anchor': 'middle',
				'dominant-baseline': 'middle',
				'pointer-events': 'none',
				'font-family': fontFamily,
				'font-size': 10,
				'stroke-linejoin': 'round'
			}, this._showHelp, this._svgdoc);


			this._sliders = new ScrollableContainer(ssmId, {
				width: 110,
				height: 110,
				gap: 2,
				row: 16,
				context: this._root
			});
			for (let i = 0; i < this._slidersTypes.length; i++) {
				const slUI = this._slTypes.get(this._slidersTypes[i]);

				const menuItem = {
					id: `slider-${i}`,
					data: slUI.name,
					cb: this._drawSliderMenuItem,
					owner: this.id
				};
				let sliderItem = this._sliders.add(menuItem);
				if (sliderItem) {
					sliderItem.addEventListener('click', this._onSelectSliderType);
				}
			}
			this._displaySliderTypeMenu(false);

			this._helpLayer = SmartWidgets.addElement('g', {
				transform: 'translate(4, -36)'
			}, this._bodyG, this._svgdoc);
			this._helpLayer.innerHTML = this._helpLayerDef;
			this._helpLayer.setAttribute('display', 'none');
		}
	}
	_updateSliders(what = null, exclude = '') {
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
		
		this._updateAnalogScheme(cr, exclude);
		this._updateCompScheme(cr, exclude);
		this._updateMonoScheme(cr, exclude);
		this._updateTriadicScheme(cr, exclude);

		this._updateHSLWheel(cr);
	}

	_updateTriadicScheme(cr, excludeScheme) {
		if (excludeScheme != 'nothing') {
			if ((excludeScheme == 'exclude-schemes') || 
				(this._currentSliderIndex > 1 && this._currentSliderIndex < 6)) {
					return;
			}
		}

		const ctrls = this._slTypes.get(this._slidersTypes[5]).ctrls;
		ctrls.rgbVal.textContent = cr.toHexString();

		let newColor = w3color(cr.toHexString());
		const colors = [];
		colors[2] = newColor.toHexString();	// selected color
		let hue = newColor.hue + 120;
		hue = hue > 360 ? hue - 360 : hue;
		colors[3] = w3color(`hsl(${hue}, ${newColor.sat}, ${newColor.lightness})`).toHexString();
		hue = newColor.hue + 240;
		hue = hue > 360 ? hue - 360 : hue;
		colors[1] = w3color(`hsl(${hue}, ${newColor.sat}, ${newColor.lightness})`).toHexString();
		colors[4] = w3color(`hsl(${newColor.hue}, ${newColor.sat * 0.7}, ${0.2 * newColor.lightness})`).toHexString();	// very dark from selected
		colors[0] = w3color(`hsl(${hue}, ${newColor.sat * 0.7}, ${0.8 * 1})`).toHexString();	// 10% lighter from selected + 240

		for (let i = 0; i < 5; i++) {
			let el = this._root.getElementById(`triadic-scheme-${i}`);
			el.setAttribute('fill', colors[i]);
			el = this._root.getElementById(`triadic-color-${i}`);
			newColor = w3color(colors[i]);
			newColor.isDark() ? newColor.lighter(90) : newColor.darker(90);
			el.setAttribute('fill', newColor.toHexString());
			el.textContent = colors[i];
		}
	}
	_updateMonoScheme(cr, excludeScheme) {
		if (excludeScheme != 'nothing') {
			if ((excludeScheme == 'exclude-schemes') || 
				(this._currentSliderIndex > 1 && this._currentSliderIndex < 6)) {
					return;
			}
		}
		const ctrls = this._slTypes.get(this._slidersTypes[4]).ctrls;
		ctrls.rgbVal.textContent = cr.toHexString();

		let newColor = w3color(cr.toHexString());
		const colors = [];
		colors[0] = w3color(`hsl(${newColor.hue}, ${newColor.sat * 0.7}, ${0.93})`).toHexString();	// lighter, but near to selected
		colors[2] = newColor.toHexString();	// selected color
		newColor.lighter(20);
		colors[1] = newColor.toHexString();	// 20% lighter then selected

		newColor = w3color(cr.toHexString());
		colors[4] = w3color(`hsl(${newColor.hue}, ${newColor.sat * 0.7}, ${0.2})`).toHexString();	// very dark
		newColor.darker(20);
		colors[3] = newColor.toHexString();	// 20% darker from selected

		for (let i = 0; i < 5; i++) {
			let el = this._root.getElementById(`mono-scheme-${i}`);
			el.setAttribute('fill', colors[i]);
			el = this._root.getElementById(`mono-color-${i}`);
			newColor = w3color(colors[i]);
			newColor.isDark() ? newColor.lighter(90) : newColor.darker(90);
			el.setAttribute('fill', newColor.toHexString());
			el.textContent = colors[i];
		}
	}
	_updateCompScheme(cr, excludeScheme) {
		if (excludeScheme != 'nothing') {
			if ((excludeScheme == 'exclude-schemes') || 
				(this._currentSliderIndex > 1 && this._currentSliderIndex < 6)) {
					return;
			}
		}
		const ctrls = this._slTypes.get(this._slidersTypes[3]).ctrls;
		ctrls.rgbVal.textContent = cr.toHexString();

		let newColor = w3color(cr.toHexString());
		const colors = [];
		colors[2] = newColor.toHexString();	// selected color
		// find opposite (+180) color hue + 180
		let hue = newColor.hue + 180;
		hue = hue > 360 ? hue - 360 : hue;
		colors[1] = w3color(`hsl(${hue}, ${newColor.sat}, ${newColor.lightness})`).toHexString();	// opposite
		colors[0] = w3color(`hsl(${hue}, ${newColor.sat * 0.7}, ${0.9 * 1})`).toHexString();	// 10% lighter from opposite
		colors[3] = w3color(`hsl(${newColor.hue}, ${newColor.sat * 0.8}, ${0.4 * newColor.lightness})`).toHexString();	// 40% lighter from selected
		colors[4] = w3color(`hsl(${newColor.hue}, ${newColor.sat * 0.7}, ${0.2 * newColor.lightness})`).toHexString();	// very dark

		for (let i = 0; i < 5; i++) {
			let el = this._root.getElementById(`comp-scheme-${i}`);
			el.setAttribute('fill', colors[i]);
			el = this._root.getElementById(`comp-color-${i}`);
			newColor = w3color(colors[i]);
			newColor.isDark() ? newColor.lighter(90) : newColor.darker(90);
			el.setAttribute('fill', newColor.toHexString());
			el.textContent = colors[i];
		}
	}
	_updateAnalogScheme(cr, excludeScheme) {
		if (excludeScheme != 'nothing') {
			if ((excludeScheme == 'exclude-schemes') || 
				(this._currentSliderIndex > 1 && this._currentSliderIndex < 6)) {
					return;
			}
		}

		const ctrls = this._slTypes.get(this._slidersTypes[2]).ctrls;
		ctrls.rgbVal.textContent = cr.toHexString();

		let newColor = w3color(cr.toHexString());
		const colors = [];
		colors[2] = newColor.toHexString();	// selected color
		let hue = newColor.hue - 30;
		hue = hue < 0 ? hue + 360 : hue;
		colors[1] = w3color(`hsl(${hue}, ${newColor.sat}, ${newColor.lightness})`).toHexString();	// -30 from selected
		colors[0] = w3color(`hsl(${hue}, ${newColor.sat * 0.7}, ${0.9 * 1})`).toHexString();	// 10% lighter

		hue = newColor.hue + 30;
		hue = hue > 360 ? hue - 360 : hue;
		colors[3] = w3color(`hsl(${hue}, ${newColor.sat}, ${newColor.lightness})`).toHexString();	// +30 after selected
		colors[4] = w3color(`hsl(${hue}, ${newColor.sat * 0.7}, ${0.24 * newColor.lightness})`).toHexString();	// very dark
		
		for (let i = 0; i < 5; i++) {
			let el = this._root.getElementById(`analog-scheme-${i}`);
			el.setAttribute('fill', colors[i]);
			el = this._root.getElementById(`analog-color-${i}`);
			newColor = w3color(colors[i]);
			newColor.isDark() ? newColor.lighter(90) : newColor.darker(90);
			el.setAttribute('fill', newColor.toHexString());
			el.textContent = colors[i];
		}
	}
	_updateRGBSliders(cr) {	// 'rgb-sliders' - index 1 inside _slidersTypes
		const ctrls = this._slTypes.get(this._slidersTypes[1]).ctrls;
		ctrls.rgbVal.textContent = cr.toHexString();
		ctrls.rSliderVal.textContent = cr.red.toFixed();
		ctrls.gSliderVal.textContent = cr.green.toFixed();
		ctrls.bSliderVal.textContent = cr.blue.toFixed();
		let w = Number(ctrls.rSliderTo.getAttribute('width'));
		let x = (w * cr.red) / 255;
		x = Math.ceil(x);
		x = x < 1 ? 0 : x > w ? w : x;
		ctrls.rSliderInd.setAttribute('transform', `translate(${x}, 0)`);
		x = (w * cr.green) / 255;
		x = Math.ceil(x);
		x = x < 1 ? 0 : x > w ? w : x;
		ctrls.gSliderInd.setAttribute('transform', `translate(${x}, 0)`);
		x = (w * cr.blue) / 255;
		x = Math.ceil(x);
		x = x < 1 ? 0 : x > w ? w : x;
		ctrls.bSliderInd.setAttribute('transform', `translate(${x}, 0)`);
		// set predictable colors for each component
		let crFrom, crTo;
		if (ctrls.rSlider.dataset['bisy'] == 'none') {
			crFrom = w3color(`rgb(0, ${cr.green.toFixed()}, ${cr.blue.toFixed()})`);
			ctrls.rSliderFrom.setAttribute('fill', crFrom.toHexString());
			crTo = w3color(`rgb(255, ${cr.green.toFixed()}, ${cr.blue.toFixed()})`);
			ctrls.rSliderTo.setAttribute('fill', crTo.toHexString());
		}
		if (ctrls.gSlider.dataset['bisy'] == 'none') {
			crFrom = w3color(`rgb(${cr.red.toFixed()}, 0, ${cr.blue.toFixed()})`);
			ctrls.gSliderFrom.setAttribute('fill', crFrom.toHexString());
			crTo = w3color(`rgb(${cr.red.toFixed()}, 255, ${cr.blue.toFixed()})`);
			ctrls.gSliderTo.setAttribute('fill', crTo.toHexString());
		}
		if (ctrls.bSlider.dataset['bisy'] == 'none') {
			crFrom = w3color(`rgb(${cr.red.toFixed()}, ${cr.green.toFixed()}, 0)`);
			ctrls.bSliderFrom.setAttribute('fill', crFrom.toHexString());
			crTo = w3color(`rgb(${cr.red.toFixed()}, ${cr.green.toFixed()}, 255)`);
			ctrls.bSliderTo.setAttribute('fill', crTo.toHexString());
		}

	}
	_updateHueBoxes(cr) { // 'hue-boxes' - index 0 inside _slidersTypes
		const ctrls = this._slTypes.get(this._slidersTypes[0]).ctrls;
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
	_updateHSLWheel(cr) {

	}
	/**
	 * update opacity for active color and move opacity indicator
	 */
	_updateOpacity(opacity = null) {
		if (opacity) {
			// specified opacity says that opacity value was changed by user
			this._strokeColor.active ? (this._strokeColor.opacity = opacity) : (this._fillColor.opacity = opacity);
		} else {
			// not specified opacity occures, so set the 'active color inside opacity slider also!
			const color = this._strokeColor.active ? this._strokeColor.color : this._fillColor.color;
			this._opInd.setAttribute('fill', color);
			this._opSlider.setAttribute('fill', color);
			opacity = this._strokeColor.active ? this._strokeColor.opacity : this._fillColor.opacity;
		}
		if (this._opInd) {
			const w = Number(this._opSlider.getAttribute('width'));
			this._opInd.setAttribute('transform', `translate(${(w * opacity) - 4}, 0)`);
			this._opInd.setAttribute('fill-opacity', opacity);
		}
	}

	/**
	 * update user interface with fillColor and strokeColor data
	 * @param {*} cr - w3color object in case of color was changed, 
	 * 					number in case of opacity was changed, 
	 * 					string 'internal - ui was changed
	 */
	_updateUI(cr = null, exclude) {
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
		this._updateSliders('', exclude);
		const opacity = ((cr && typeof cr === 'number') ? cr : null);
		this._updateOpacity(opacity);

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
		this._updateUI('internal', 'nothing');
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
		// sliders array. names, references and controls are filled inside _build() function!
		this._slidersTypes = ['hue-boxes', 'rgb-sliders', 'analog-scheme', 'comp-scheme', 'mono-scheme', 'triadic-scheme'];
		this._slTypes = new Map();

		// set default slider to Hue Boxes
		this._currentSliderIndex = 0;

		this._build();
		this._updateUI('internal', 'nothing');

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

		// event listeners is here!
		this._showHelp.addEventListener('click', (evt) => {
			let status = 'none';
			let btnCr = '#666';
			let textCr = '#fff';
			if (this._helpLayer.getAttribute('display') === 'none') {
				status = 'inherit';
				btnCr = '#fff';
				textCr = '#666';
			}
			this._helpLayer.setAttribute('display',  status);
			SmartWidgets.setAttributes([this._root.getElementById('show-help-btn')], {
				fill: btnCr,
				stroke: textCr
			});
			SmartWidgets.setAttributes([this._root.getElementById('show-help-text')], {
				fill: textCr
			});
		});
		this._opSliderDrag = new SmartDragElement(this._opSlider, {containment: this._opSlider});
		this._opSlider.addEventListener('onContinueDrag', (evt) => {
			evt.preventDefault();
			evt.stopPropagation();
			const w = Number(this._opSlider.getAttribute('width'));
			const opacity = +((evt.detail.x / w).toFixed(2));
			this._updateUI(opacity);
		});
		this._opSlider.addEventListener('click', (evt) => {
			evt.preventDefault();
			evt.stopPropagation();
			const scroll = SmartWidgets.getScroll();
			const pt = SmartWidgets.svgPoint(triadicUI.rgbBox, evt.clientX + scroll.X, evt.clientY + scroll.Y);

			const w = Number(this._opSlider.getAttribute('width'));
			const opacity = +((pt.x / w).toFixed(2));
			this._updateUI(opacity);
		});

		const triadicUI = this._slTypes.get('triadic-scheme').ctrls;
		if (triadicUI) {
			// rgb box
			triadicUI.rgbBoxDrag = new SmartDragElement(triadicUI.rgbBox, {containment: triadicUI.rgbBox});
			triadicUI.rgbBox.addEventListener('onContinueDrag', (evt) => {
				evt.preventDefault();
				evt.stopPropagation();

				const w = Number(triadicUI.rgbBox.getAttribute('width'));
				const hV = +(((evt.detail.x / w) * 360).toFixed());
				const h = Number(triadicUI.rgbBox.getAttribute('height'));
				const lV = +((evt.detail.y / h).toFixed(2));

				let cr = w3color(`hsl(${(hV < 0 ? 0 : hV)},1,${(lV < 0 ? 0 : lV)})`);
				this._updateUI(cr, 'nothing');
			});
			triadicUI.rgbBox.addEventListener('click', (evt) => {
				evt.preventDefault();
				evt.stopPropagation();
				const scroll = SmartWidgets.getScroll();
				const pt = SmartWidgets.svgPoint(triadicUI.rgbBox, evt.clientX + scroll.X, evt.clientY + scroll.Y);

				const w = Number(triadicUI.rgbBox.getAttribute('width'));
				const hV = +(((pt.x / w) * 360).toFixed());
				const h = Number(triadicUI.rgbBox.getAttribute('height'));
				const lV = +((pt.y / h).toFixed(2));

				let cr = w3color(`hsl(${(hV < 0 ? 0 : hV)},1,${(lV < 0 ? 0 : lV)})`);
				this._updateUI(cr, 'nothing');
			});
			triadicUI.schemeG.addEventListener('click', (evt) => {
				const target = evt.target.nodeName == 'text' ? evt.target.previousElementSibling : 
							   evt.target.nodeName == 'g' ? evt.target.firstElementChild : 
							   evt.target;
				const cr = w3color(target.getAttribute('fill'));
				this._updateUI(cr, 'exclude-schemes');
			});
		}
		const monoUI = this._slTypes.get('mono-scheme').ctrls;
		if (monoUI) {
			// rgb box
			monoUI.rgbBoxDrag = new SmartDragElement(monoUI.rgbBox, {containment: monoUI.rgbBox});
			monoUI.rgbBox.addEventListener('onContinueDrag', (evt) => {
				evt.preventDefault();
				evt.stopPropagation();

				const w = Number(monoUI.rgbBox.getAttribute('width'));
				const hV = +(((evt.detail.x / w) * 360).toFixed());
				const h = Number(monoUI.rgbBox.getAttribute('height'));
				const lV = +((evt.detail.y / h).toFixed(2));

				let cr = w3color(`hsl(${(hV < 0 ? 0 : hV)},1,${(lV < 0 ? 0 : lV)})`);
				this._updateUI(cr, 'nothing');
			});
			monoUI.rgbBox.addEventListener('click', (evt) => {
				evt.preventDefault();
				evt.stopPropagation();
				const scroll = SmartWidgets.getScroll();
				const pt = SmartWidgets.svgPoint(monoUI.rgbBox, evt.clientX + scroll.X, evt.clientY + scroll.Y);

				const w = Number(monoUI.rgbBox.getAttribute('width'));
				const hV = +(((pt.x / w) * 360).toFixed());
				const h = Number(monoUI.rgbBox.getAttribute('height'));
				const lV = +((pt.y / h).toFixed(2));

				let cr = w3color(`hsl(${(hV < 0 ? 0 : hV)},1,${(lV < 0 ? 0 : lV)})`);
				this._updateUI(cr, 'nothing');
			});
			monoUI.schemeG.addEventListener('click', (evt) => {
				const target = evt.target.nodeName == 'text' ? evt.target.previousElementSibling : 
							   evt.target.nodeName == 'g' ? evt.target.firstElementChild : 
							   evt.target;
				const cr = w3color(target.getAttribute('fill'));
				this._updateUI(cr, 'exclude-schemes');
			});
		}
		const compUI = this._slTypes.get('comp-scheme').ctrls;
		if (compUI) {
			// rgb box
			compUI.rgbBoxDrag = new SmartDragElement(compUI.rgbBox, {containment: compUI.rgbBox});
			compUI.rgbBox.addEventListener('onContinueDrag', (evt) => {
				evt.preventDefault();
				evt.stopPropagation();

				const w = Number(compUI.rgbBox.getAttribute('width'));
				const hV = +(((evt.detail.x / w) * 360).toFixed());
				const h = Number(compUI.rgbBox.getAttribute('height'));
				const lV = +((evt.detail.y / h).toFixed(2));
				// console.log(`move y: ${evt.detail.y} = ${lV}`);

				let cr = w3color(`hsl(${(hV < 0 ? 0 : hV)},1,${(lV < 0 ? 0 : lV)})`);
				this._updateUI(cr, 'nothing');
			});
			compUI.rgbBox.addEventListener('click', (evt) => {
				evt.preventDefault();
				evt.stopPropagation();
				const scroll = SmartWidgets.getScroll();
				const pt = SmartWidgets.svgPoint(compUI.rgbBox, evt.clientX + scroll.X, evt.clientY + scroll.Y);

				const w = Number(compUI.rgbBox.getAttribute('width'));
				const hV = +(((pt.x / w) * 360).toFixed());
				const h = Number(compUI.rgbBox.getAttribute('height'));
				const lV = +((pt.y / h).toFixed(2));

				let cr = w3color(`hsl(${(hV < 0 ? 0 : hV)},1,${(lV < 0 ? 0 : lV)})`);
				this._updateUI(cr, 'nothing');
			});
			compUI.schemeG.addEventListener('click', (evt) => {
				const target = evt.target.nodeName == 'text' ? evt.target.previousElementSibling : 
							   evt.target.nodeName == 'g' ? evt.target.firstElementChild : 
							   evt.target;
				const cr = w3color(target.getAttribute('fill'));
				this._updateUI(cr, 'exclude-schemes');
			});
		}
		const analogUI = this._slTypes.get('analog-scheme').ctrls;
		if (analogUI) {
			// rgb box
			analogUI.rgbBoxDrag = new SmartDragElement(analogUI.rgbBox, {containment: analogUI.rgbBox});
			analogUI.rgbBox.addEventListener('onContinueDrag', (evt) => {
				evt.preventDefault();
				evt.stopPropagation();

				const w = Number(analogUI.rgbBox.getAttribute('width'));
				const hV = +(((evt.detail.x / w) * 360).toFixed());
				const h = Number(analogUI.rgbBox.getAttribute('height'));
				const lV = +((evt.detail.y / h).toFixed(2));
				// console.log(`move y: ${evt.detail.y} = ${lV}`);

				let cr = w3color(`hsl(${(hV < 0 ? 0 : hV)},1,${(lV < 0 ? 0 : lV)})`);
				this._updateUI(cr, 'nothing');
			});
			analogUI.rgbBox.addEventListener('click', (evt) => {
				evt.preventDefault();
				evt.stopPropagation();
				const scroll = SmartWidgets.getScroll();
				const pt = SmartWidgets.svgPoint(analogUI.rgbBox, evt.clientX + scroll.X, evt.clientY + scroll.Y);

				const w = Number(analogUI.rgbBox.getAttribute('width'));
				const hV = +(((pt.x / w) * 360).toFixed());
				const h = Number(analogUI.rgbBox.getAttribute('height'));
				const lV = +((pt.y / h).toFixed(2));

				let cr = w3color(`hsl(${(hV < 0 ? 0 : hV)},1,${(lV < 0 ? 0 : lV)})`);
				this._updateUI(cr, 'nothing');
			});
			analogUI.schemeG.addEventListener('click', (evt) => {
				const target = evt.target.nodeName == 'text' ? evt.target.previousElementSibling : 
							   evt.target.nodeName == 'g' ? evt.target.firstElementChild : 
							   evt.target;
				const cr = w3color(target.getAttribute('fill'));
				this._updateUI(cr, 'exclude-schemes');
			});
		}
		const rgbUI = this._slTypes.get('rgb-sliders').ctrls;
		if (rgbUI) {
			// r-slider
			rgbUI.rSliderDrag = new SmartDragElement(rgbUI.rSlider, {containment: rgbUI.rSlider});
			rgbUI.rSlider.addEventListener('onContinueDrag', (evt) => {
				evt.preventDefault();
				evt.stopPropagation();
				rgbUI.rSliderInd.setAttribute('transform', `translate(${evt.detail.x}, 0)`);
				// const w = Number(rgbUI.rSlider.getTotalLength());
				const w = Number(rgbUI.rSliderTo.getAttribute('width'));
				let rV = +((evt.detail.x / w) * 255); // .toFixed());
				rV = Math.ceil(rV);
				const gV = Number(rgbUI.gSliderVal.textContent);
				const bV = Number(rgbUI.bSliderVal.textContent);
				let cr = w3color(`rgb(${(rV < 0 ? 0 : rV)},${gV},${bV})`);
				rgbUI.rSlider.dataset['bisy'] = 'bisy';
				this._updateUI(cr);
				rgbUI.rSlider.dataset['bisy'] = 'none';
			});
			rgbUI.rSlider.addEventListener('click', (evt) => {
				evt.preventDefault();
				evt.stopPropagation();
				const scroll = SmartWidgets.getScroll();
				const pt = SmartWidgets.svgPoint(rgbUI.rSlider, evt.clientX + scroll.X, evt.clientY + scroll.Y);
				rgbUI.rSliderInd.setAttribute('transform', `translate(${pt.x}, 0)`);

				const w = Number(rgbUI.rSliderTo.getAttribute('width'));
				let rV = +((pt.x / w) * 255); // .toFixed());
				rV = Math.ceil(rV);

				const gV = Number(rgbUI.gSliderVal.textContent);
				const bV = Number(rgbUI.bSliderVal.textContent);
				let cr = w3color(`rgb(${(rV < 0 ? 0 : rV)},${gV},${bV})`);
				rgbUI.rSlider.dataset['bisy'] = 'bisy';
				this._updateUI(cr);
				rgbUI.rSlider.dataset['bisy'] = 'none';
			});
			// g-slider
			rgbUI.gSliderDrag = new SmartDragElement(rgbUI.gSlider, {containment: rgbUI.gSlider});
			rgbUI.gSlider.addEventListener('onContinueDrag', (evt) => {
				evt.preventDefault();
				evt.stopPropagation();
				rgbUI.gSliderInd.setAttribute('transform', `translate(${evt.detail.x}, 0)`);

				const w = Number(rgbUI.gSliderTo.getAttribute('width'));
				let gV = +((evt.detail.x / w) * 255);
				gV = Math.ceil(gV);
				const rV = Number(rgbUI.rSliderVal.textContent);
				const bV = Number(rgbUI.bSliderVal.textContent);
				let cr = w3color(`rgb(${rV},${(gV < 0 ? 0 : gV)},${bV})`);
				rgbUI.gSlider.dataset['bisy'] = 'bisy';
				this._updateUI(cr);
				rgbUI.gSlider.dataset['bisy'] = 'none';
			});
			rgbUI.gSlider.addEventListener('click', (evt) => {
				evt.preventDefault();
				evt.stopPropagation();
				const scroll = SmartWidgets.getScroll();
				const pt = SmartWidgets.svgPoint(rgbUI.gSlider, evt.clientX + scroll.X, evt.clientY + scroll.Y);
				rgbUI.gSliderInd.setAttribute('transform', `translate(${pt.x}, 0)`);

				const w = Number(rgbUI.gSliderTo.getAttribute('width'));
				let gV = +((pt.x / w) * 255);
				gV = Math.ceil(gV);
				const rV = Number(rgbUI.rSliderVal.textContent);
				const bV = Number(rgbUI.bSliderVal.textContent);
				let cr = w3color(`rgb(${rV},${(gV < 0 ? 0 : gV)},${bV})`);
				rgbUI.gSlider.dataset['bisy'] = 'bisy';
				this._updateUI(cr);
				rgbUI.gSlider.dataset['bisy'] = 'none';
			});
			// b-slider
			rgbUI.bSliderDrag = new SmartDragElement(rgbUI.bSlider, {containment: rgbUI.bSlider});
			rgbUI.bSlider.addEventListener('onContinueDrag', (evt) => {
				evt.preventDefault();
				evt.stopPropagation();
				rgbUI.bSliderInd.setAttribute('transform', `translate(${evt.detail.x}, 0)`);

				const w = Number(rgbUI.bSliderTo.getAttribute('width'));
				let bV = +((evt.detail.x / w) * 255);
				bV = Math.ceil(bV);
				const rV = Number(rgbUI.rSliderVal.textContent);
				const gV = Number(rgbUI.gSliderVal.textContent);
				let cr = w3color(`rgb(${rV},${gV},${(bV < 0 ? 0 : bV)})`);
				rgbUI.bSlider.dataset['bisy'] = 'bisy';
				this._updateUI(cr);
				rgbUI.bSlider.dataset['bisy'] = 'none';
			});
			rgbUI.bSlider.addEventListener('click', (evt) => {
				evt.preventDefault();
				evt.stopPropagation();
				const scroll = SmartWidgets.getScroll();
				const pt = SmartWidgets.svgPoint(rgbUI.bSlider, evt.clientX + scroll.X, evt.clientY + scroll.Y);
				rgbUI.bSliderInd.setAttribute('transform', `translate(${pt.x}, 0)`);

				const w = Number(rgbUI.bSliderTo.getAttribute('width'));
				let bV = +((pt.x / w) * 255);
				bV = Math.ceil(bV);
				const rV = Number(rgbUI.rSliderVal.textContent);
				const gV = Number(rgbUI.gSliderVal.textContent);
				let cr = w3color(`rgb(${rV},${gV},${(bV < 0 ? 0 : bV)})`);
				rgbUI.bSlider.dataset['bisy'] = 'bisy';
				this._updateUI(cr);
				rgbUI.bSlider.dataset['bisy'] = 'none';
			});
			// rgb box
			rgbUI.rgbBoxDrag = new SmartDragElement(rgbUI.rgbBox, {containment: rgbUI.rgbBox});
			rgbUI.rgbBox.addEventListener('onContinueDrag', (evt) => {
				evt.preventDefault();
				evt.stopPropagation();

				const w = Number(rgbUI.rgbBox.getAttribute('width'));
				const hV = +(((evt.detail.x / w) * 360).toFixed());
				const h = Number(rgbUI.rgbBox.getAttribute('height'));
				const lV = +((evt.detail.y / h).toFixed(2));

				let cr = w3color(`hsl(${(hV < 0 ? 0 : hV)},1,${(lV < 0 ? 0 : lV)})`);
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

				let cr = w3color(`hsl(${(hV < 0 ? 0 : hV)},1,${(lV < 0 ? 0 : lV)})`);
				this._updateUI(cr);
			});
		}
		const hueBoxUI = this._slTypes.get('hue-boxes').ctrls;
		if (hueBoxUI) {
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
		// capture keyboard input
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
					const rV = Number(rgbUI.rSliderVal.textContent);
					const gV = Number(rgbUI.gSliderVal.textContent);
					const bV = Number(rgbUI.bSliderVal.textContent);

					if (this._enterColorBuffer.textContent.startsWith('#')) {
						// try to convert it to color...
						const cr = w3color(this._enterColorBuffer.textContent);
						if (cr.valid) {
							this._updateUI(cr, 'nothing');
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
							this._updateUI(cr, 'nothing');
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
							this._updateUI(cr, 'nothing');
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
							this._updateUI(cr, 'nothing');
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

		// 'show popup menu' was pressed
		this._selectSliders.addEventListener('click', (evt) => {
			this._displaySliderTypeMenu(this._ssMenuG.getAttribute('display') === 'none' ? true : false);
		});

		// set 'stroke as active' was pressed
		this._btnSelStroke.addEventListener('click', (evt) => {
			this._strokeColor.active = 1;
			this._fillColor.active = 0;
			this._sfG.insertBefore(this._btnSelFill, this._btnSelStroke);
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
