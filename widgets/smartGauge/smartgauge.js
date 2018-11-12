/* eslint-disable indent */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-multi-spaces) */
/* eslint-disable no-underscore-dangle */


/**
 * @copyright Copyright © 2018 ... All rights reserved.
 * @author Michael Goyberg
 * @license
 * @version   1.0

 */

class SmartGauges extends SmartWidgets {
    static initSmartGauges(context = {}) {
        if (!window.SmartGauges) {
            window.SmartGauges = new SmartGauges();
        }
        window.SmartGauges.init(context);
    }
    static addElement(type, params, parent = null, doc = null) {
        return super.addElement(type, params, parent, doc);
    }

    constructor() {
        super();
	}

	initCtrl(id, options) {
		let ctrl = this.get(id);
		if (!ctrl) {
			ctrl = new SmartGauge(id, options);
			if (ctrl) {
				ctrl.init(options);
			}
		}
	}
	unInitCtrl(id) {
        // todo....
	}
}

class SmartGauge {
	/**
	 * converts JSON representation of options into the options parameters object siutable for show() call
	 */
	static JsonToOptions(jsonOpt) {
		const options = {
		};
		if (typeof jsonOpt === 'string' && jsonOpt.length) {
			const tmpOpt = JSON.parse(jsonOpt);
			for (let key in tmpOpt) {
				const paramName = key.replace('--stgauge-', '');
				options[SmartWidgets.customProp2Param(paramName)] = tmpOpt[key];
			}
			this.convertNumericProps(options);
			return options;
		}
		return null;
	}
    /**
     * build and returns an options object siutable for 'show()' function
	 *
	 * input: {
	 * 	paramKey: value,	// custom prop is param-key
	 *  paramKey: value		// custorm property is var-param-key
	 * }
	 * what = 'options';
     * output: {
     *  paramKey: value,	// custom prop is param-key
     *  varParamKey: value,	// custom property is var-param-key
     * }
	 * what = 'any';
     * output: {
     *   stgauge-param-key: value,		// custom property is param-key
     *   stgauge-var-param-key: value,	// custom property is var-param-key
     * }
     *
     * @param {object} opt options object to be converted
	 * @param {boolean} what the flag that enables (if it has any string exclude 'options' to convert all properties to css vars (used in web-components)
     * @returns {object} options in form siutable for using
     *
     */
    static buidOptionsAndCssVars(opt, what = 'options') {
		const customProp = SmartGauge.getCustomProperties();
		return SmartWidgets.buidOptionsAndCssVars(opt, customProp, 'stgauge');
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
	static getCustomParams(options = null, filter = 'all') {
		const custProp = SmartGauge.getCustomProperties();		// get an array of custom properties
		const origOpt = SmartGauge.defOptions();
		return SmartWidgets.getCustomParams(custProp, origOpt, options, filter);
    }
	/**
	 * Build text representation of changed options for specific templates
	 * @param {object} opt Options
	 * @param {string} templateId Specific template name.
	 * The one from next: 'def-custom-elem_btn', 'def-json_btn', 'def-object-params_btn', 'def-svg_widget_btn'
	 */
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
				dtO = this.buidOptionsAndCssVars(opt, 'css');

                template = '&lt;style>\n';
                template += `  .${className} {\n`;
                // template += `    `
                for (let key in dtO) {
                    template += `    ${key}:${dtO[key]};\n`;
                }
                template += '  }\n';
                template += '&lt;/style>\n';
				template += `&lt;smart-ui-gauge class="${className}" id="ANY_UNIQUE_NUMBER">This browser does not support custom elements.&lt/smart-ui-gauge>\n`;
                break;
			case 'def-json_btn': {
				dtO = this.buidOptionsAndCssVars(opt);
				const jstr = `'${JSON.stringify(dtO)}'`;
				template = `${jstr}`;
				template += '\n\n';
				template +=
				`// later, use static function SmartGauge.JsonToOptions(options); to convert JSON string
// into 'options' object, sutable for SmartGauge creation. For example:

const el = document.getElementById("jsn");
if (el) {
  const opt = ${jstr};
  const options = SmartGauge.JsonToOptions(opt);
  // change the radius of polygon as you want, for ex:
  options.radius = 50;
  // create an instanse
  const gauge = new SmartGauge(jsn, options);
}
`;
                break;
            }
            case 'def-object-params_btn': {
				dtO = this.buidOptionsAndCssVars(opt);
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
  // change the radius of polygon as you want, for ex:
  options.radius = 50;
  // create an instanse
  const gauge = new SmartGauge(jsn, options);
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

	/**
	 * Build the compact version of gauge parameters, by contactination similar parameters group into the one string.
	 * for example the next group:
			dialType: 1,
			dialRadius: 99,
			dialBorderWidth: 0,
			dialBorderColor: '#000000',
			dialFillColor: '#ababab',
			dialFillPatern: '',
			dialOpacity: 1,
		will be stored as: d:'1-99-0-#000000-#ababab--1'
	 *
	 */
	static getCompactProperties() {
		return [
			'b',	// all body parameters concatenited by '-'
			'c',	// all center parameters concatenited by '-'
			'd',	// all dial parameters concatenited by '-'
			'p',	// all pointer parameters concatenited by '-'
			's',	// all scale parameters concatenited by '-'
			'mj',	// all major parameters concatenited by '-'
			'mn',	// all minor parameters concatenited by '-'
			'th'	// all thresholds parameters concatenited by '-'

		];
	}
	/**
	 * Returns an array of custom properties. Each of the custom property has corresponding declarative attribute in form first-second == prefix-first-second
	 * and option parameter with name "firstSecond".
	 * for example: '--sttip-title-format' property equals to attribute 'title-format' and options.titleFormat parameter, but
	 * '--sttip-template' property equals to TEMPLATE attribute and options.template parameter.
	 */
	static getCustomProperties() {
		return [
			'role',					// In demo mode this parameter has value 'demoMode'
			'alias',
            'body-type',			// The type of gauge body
            'body-radius',			// Absolute value, describes the size of gauge widget
            'body-border-width',	// all othe sizes are in percentage to body radius
            'body-border-color',
            'body-fill-color',
            'body-fill-gradient',
			'body-opacity',
			'body-shadow',

            'center-type',
            'center-radius',
            'center-border-width',
            'center-border-color',
            'center-fill-color',
            'center-fill-gradient',
			'center-opacity',
			'center-shadow',

			'dial-type',
			'dial-radius',
			'dial-border-width',
			'dial-border-color',
			'dial-fill-color',
			'dial-fill-patern',
			'dial-opacity',

			'pointer-type',			// 'dauphine', 'baton', 'alfa', 'sword', 'brequet', 'simple', 'skeleton', 'circle', 'zwatch'
            'pointer-radius',
            'pointer-border-width',
            'pointer-border-color',
            'pointer-fill-color',
			'pointer-opacity',
			'pointer-width',
			'pointer-shadow',

			'scale-start-angle',
			'scale-end-angle',			// '0'
			'scale-rotation',			// angle
			'scale-direction',			// '+' - clockwise, '-' - counterclockwise

			'major-type',
			'major-weight',
			'major-radius',
			'major-length',
			'major-border-width',
			'major-border-color',
			'major-fill-color',
			'major-opacity',
			'major-text-size',
			'major-text-offset',

			'minor-type',
			'minor-weight',
			'minor-radius',
			'minor-length',
			'minor-border-width',
			'minor-border-color',
			'minor-fill-color',
			'minor-opacity',

			'threshold-type',
			'threshold-radius',
			'threshold-length',
			'threshold-border-width',
			'threshold-border-color',
			'threshold-fill-color',
			'threshold-opacity',

            'width', 'height',	// the size of gauge may be specified by this parameters

			'position',			// The value describes location of tooltip or legend window Default value is 'rt' which means right-top conner of element.
			'ttip-template',	// Default value for this property is 'pie', wich means the using of internal SmartTooltip pie template definition.
								// Currently only 4 types of templates are implemented: 'pie', 'simple', 'image' and 'iframe'.
			'ttip-type',		// Use own (limited) settings for the tooltip or use the SmartToolip global (full) settings.
								// Possible values are: 'own' and 'global'. Default is 'own'.
			'title-format',
			'descr-format',

            'max-value',		// the maximum value. If 0 then 100% is a maximum.
			'is-animate',		// Allows to animate the moment of receiving the data array.
			'is-link',			// Allows to disable going to the link by ckick on the sector. Used in example. The default is 1
			'is-tooltip',		// Allows internal dispetching of smarttooltip next to the mouse pointer.
			'is-emulate',		// Allows automatic emulation of the process of data receiving.
			'is-run',			// Starts the internal mechanism of sending requests to the server, if there are parameters: “server”, “target”, “user”
			'interval',			// Determines the interval of sending requests to the server in seconds (if the value is less than 2000)
								// or in milliseconds (if the value is greater than 1999)
            'server',
            'target',
            'user',				// These parameters determine the URL of the request to the server

			'color-rule',		// Same as 'value-rule', but set color only, not use the value at all.
								// contains an array of parts of gauge: 'bb', 'bf', 'cb', 'cf', 'pb', 'pf', 'db', 'df', where each one value is an abreviature of
								// part, for example: 'bb' is a 'body-border' and 'pf' - 'pointer-fill'
			'value-rule',		// Specifies what will be painted when the value is drawn: line or background
								// Possible values are: 'stroke', 'fill', 'both', 'none'. Default is 'fill'.
								// The following four parameters also affect rendering.
								// The following addition rule is used: the missing parameter is drawn.
								// That is, if it is indicated that the value affects the background ('rule'='fill'),
								// then for the lines, the color of the line and the corresponding flag are used.
								// Conversely, if the value affects the line ('rule'='stroke'),
								// then the corresponding color and flag are used to fill the background.
								// In the case of 'rule'='both', additional parameters are not used.

			'var-font-family',	// Scale font definitions
			'var-font-stretch'
			// ATTENTION: all future additional parameters must to be placed only after this comment!
        ];
    }
    static defOptions() {
        return {
			role: '',			// in demo mode this parameter has value 'demoMode'
			alias: 'stgauge',
            bodyType: 1,			// The type of gauge body
            bodyRadius: 70,			// Absolute value, describes the size of gauge widget
            bodyBorderWidth: 2,	// all othe sizes are in percentage to body radius
            bodyBorderColor: '#000000',
            bodyFillColor: '#929292',
            bodyFillGradient: '',
			bodyOpacity: 1,
			bodyShadow: 1,

            centerType: 0,
            centerRadius: 2,
            centerBorderWidth: 0,
            centerBorderColor: 'none',
            centerFillColor: 'none',
            centerFillGradient: '',
			centerOpacity: 1,
			centerShadow: 1,

            pointerType: 'simple',
            pointerRadius: 80,
            pointerBorderWidth: 0.5,
            pointerBorderColor: '#000000',
            pointerFillColor: 'fbfbfb',
			pointerOpacity: 1,
			pointerWidth: 2,
			pointerShadow: 1,

			dialType: 1,
			dialRadius: 99,
			dialBorderWidth: 0,
			dialBorderColor: '#000000',
			dialFillColor: '#ababab',
			dialFillPatern: '',
			dialOpacity: 1,

			scaleStartAngle: 225,
			scaleEndAngle: 135,
			scaleRotation: 0,
			scaleDirection: '+',			// '+' - clockwise, '-' - counterclockwise

			majorType: 'digit',				// 'none' - no digits
			majorWeight: 25,
			majorRadius: 90,
			majorLength: 10,
			majorBorderWidth: 0,
			majorBorderColor: '#ffffff',
			majorFillColor: '#000000',
			majorOpacity: 1,
			majorTextSize: 10,
			majorTextOffset: 80,

			minorType: 'lines',
			minorWeight: 5,
			minorRadius: 90,
			minorLength: 5,
			minorBorderWidth: 0,
			minorBorderColor: '#ffffff',
			minorFillColor: '#000000',
			minorOpacity: 1,

			thresholdType: '1',
			thresholdRadius: 96,
			thresholdLength: 6,
			thresholdBorderWidth: 0,
			thresholdBorderColor: '#ffffff',
			thresholdFillColor: 'status',
			thresholdOpacity: 1,

			width: 100,
			height: 100,		// the size of gauge may be specified by this parameters

			position: 'rt',		// The value describes location of tooltip window Default value is 'rt' which means right-top conner of element.
			ttipTemplate: 'simple', // Default value for this property is 'simple, wich means the using of internal SmartTooltip pie template definition.
								// Currently only 4 types of templates are implemented: 'pie', 'simple', 'image' and 'iframe'.
			ttipType: 'own',	// Use own (limited) settings for the tooltip or use the SmartToolеip global (full) settings.
								// Possible values are: 'own' and 'global'. Default is 'own'.
			titleFormat: '$TITLE$, value = $VALUE$',
			descrFormat: '$DESCR$, color = $COLOR$',

            maxValue: 0,		// the maximum value. If 0 then 100% is a maximum.
			isAnimate: 0,		// Allows to animate the moment of receiving the data array.
			isLink: 1,			// Allows to disable going to the link by ckick on the sector. Used in example. The default is 1
			isTooltip: 1,		// Allows displaying a tooltip next to the mouse pointer. Reproducing legends, hints are not displayed and vice versa.
			isEmulate: 0,		// Allows automatic emulation of the process of data receiving.
			isRun: 0,			// Starts the internal mechanism of sending requests to the server, if there are parameters: “server”, “target”, “user”
			interval: 3000,		// Determines the interval of sending requests to the server in seconds (if the value is less than 2000)
								// or in milliseconds (if the value is greater than 1999)
            server: '',
            target: '',
            user: '',

			colorRule: 'stroke',
			valueRule: 'fill',

			varFontFamily:	'Arial, DIN Condensed, Noteworthy, sans-serif',
			varFontStretch:	'condensed'
        };
    }
    static convertNumericProps(options = {}, propName) {
        const numericProps = [
            'isAnimate',
            'isLink',
            'isEmulate',
            'isRun',
            'isTooltip',
            'interval',
            'isFillBkg',
            'isFillStroke',
			'maxValue',
			'width',
			'gap',
			'thickness',
			'scaleOffset',
			'majorMLength',
			'minorMLength',
			'varIsShadow',
            'varStrokeWidth',
			'varOpacity',
			'varFontSize'
        ];
        return SmartWidgets.convertToNumbers(options, numericProps, propName);
    }
    constructor(id, options = null) {
		this._onShowTooltip = this._onShowTooltip.bind(this);
		this._onMoveTooltip = this._onMoveTooltip.bind(this);
		this._onHideTooltip = this._onHideTooltip.bind(this);
		this._onClick       = this._onClick.bind(this);
        const txtStyle = `
            svg {
                overflow: visible;
				--no-color:	none;
            }
			.run {
				fill: var(--run-color);
			}
			.stop {
				fill: var(--stop-color);
			}
			.shadowed {
				filter: url(#drop-shadow);
			}
			.linked {
				cursor: pointer;
			}
			.animated {
				transition:all 1.5s;
			}
			.animated:hover {
				r: 0;
			}
        `;
        // merge default options with specified
        this._o = Object.assign({}, SmartGauge.defOptions(), options || {});
        // validate all properties
        SmartGauge.convertNumericProps(this._o);

        this._mode      = options.mode || null; // in case of 'custom elements' initialization the 'mode' equals 'html'
        this.id         = id;   // <g id> inside of <svg>
        this._root      = options.context || null;  // svg root element
        this._svgroot   = this._root.getElementById(this.id);    // reference on insertion node
        this._svgdoc    = this._svgroot.ownerDocument;

        this._data      = null; // last received from data provider (server + target)
		this._body      = null; // the SmartGauge body
		this._bodyActive= null;	// active element path
		this._bodyScale = null; // body scale element (group) includes line, and texts
		this._active    = null; // the active clip element
		this._scaleTextA= [];	// the references on scale texts (0, 50, max)
		this._intervalCounter = 0;
		this._inited	= false;	// call to init() set this flag to true. after that we can build, rebuild and activate....

        const style = SmartGauges.addElement('style', {}, this._root, this._svgdoc);
        style.textContent = txtStyle;
        this._defs = SmartGauges.addElement('defs', {}, this._root, this._svgdoc);
		this._defs.innerHTML = window.SmartPolygons.defs;
		this._active = SmartPolygons.addElement('clipPath', {id: `${this.id}-activeRect`}, this._root, this._svgdoc);
		// in case of html insertion, the options.mode == 'html' is defined and
		// the buiding process is divided on two parts:  constructor() and init() from connectedCallback.
		// in case of creating SmartPolygon object from Javascript, lets do all needed work in one place...
		if (!this._mode) {
			// store containerId: ref on SmartPolygon element inside SmartPolygons collection for JS access
			window.SmartGauges.set(this.id, this);
			this.init();
		}
    }

	_buildActive(data = null) {
		if (!this._inited) {
			console.log('_build() -> Nothing todo, not yet initialized!');
			return;
		}
        if (this._active) {
			// remove old clip rectangle
			const elem = this._active.firstElementChild;
			if (elem) {
				this._active.removeChild(this._active.firstElementChild);
			}
		}
		const activeRect = {
			x: this._gaugeBody.active.x,
			y: this._gaugeBody.active.y,
			width: this._gaugeBody.active.w,
			height: this._gaugeBody.active.h
		};
		// calculte the value
		if (data) {
			let dta = Array.from(data);
			if (dta.length) {
				const dt = dta[0];

				if (this._o.ttipType == 'global') {
					// store data in data-set attributes (for global SmartTooltip)
					for (let key in dt) {
						this._svgroot.setAttribute(`data-sttip-${key}`, dt[key]);
					}
				}

				const maxValue = parseInt(dt.max, 10) || this._o.maxValue;
				const max100 = this._o.orient === 'hor' ? activeRect.width : activeRect.height;
				let onePCT = maxValue ? max100 / maxValue : max100 / 100;
				if (this._o.orient === 'hor') {
					activeRect.width = parseFloat(dt.value) * onePCT;
					if (this._o.aligning === 'left') {
						activeRect.x = (this._gaugeBody.active.x + this._gaugeBody.active.w) - activeRect.width;
					}
				} else {
					activeRect.height = parseFloat(dt.value) * onePCT;
					if (this._o.aligning == 'up') {
						activeRect.y = (this._gaugeBody.active.y + this._gaugeBody.active.h) - activeRect.height;
					}
				}
				this._o.valueRule = this._o.valueRule || 'fill';
				this._bodyActive.setAttribute('fill', this._o.valueRule === 'fill' ? dt.color : (this._o.isFillBkg ? this._o.varFillColor : 'none'));
				this._bodyActive.setAttribute('stroke', this._o.valueRule === 'stroke' ? dt.color : (this._o.isFillStroke ? this._o.varStrokeColor : 'none'));

				if (this._o.valueRule === 'both') {
					this._bodyActive.setAttribute('fill', dt.color);
					this._bodyActive.setAttribute('stroke', dt.color);
				}

				if (this._o.colorRule == 'stroke' || this._o.colorRule == 'both') {
					this._body.setAttribute('stroke', dt.color);
				}
				if (this._o.colorRule == 'fill' || this._o.colorRule == 'both') {
					this._body.setAttribute('fill', dt.color);
				}
				// and last corection here
				if (this._o.valueRule === 'stroke' || this._o.valueRule === 'none') {
					this._bodyActive.setAttribute('fill', 'none');
				}
				let valsA,
					maxV = maxValue ? maxValue : 100;
				if (this._o.aligning === 'left' || this._o.aligning === 'up') {
					valsA = [maxV, maxV / 2, 0];
				} else {
					valsA = [0, maxV / 2, maxV];
				}
				if (this._o.scalePosition !== 'none') {
					for (let i = 0; i < 3; i++) {
						let el = this._scaleTextA[i];
						if (el) {
							el.textContent = valsA[i];
						}
					}
				}

			}
		}
		if (this._o.valueRule !== 'none' || this._o.colorRule !== 'none') {
			// build the clip rectangle here...
			SmartWidgets.addElement('rect', {
				x: activeRect.x,
				y: activeRect.y,
				width: activeRect.width,
				height: activeRect.height,

			}, this._active, this._svgdoc);

			this._bodyActive.setAttribute('clip-path', `url(#${this.id}-activeRect)`);
		} else {
			this._bodyActive.removeAttribute('clip-path');
		}
	}
    _build() {
		if (!this._inited) {
			console.log('_build() -> Nothing todo, not yet initialized!');
			return;
		}
        if (this._body) {
			this._body.removeEventListener('click', this._onClick);
			this._body.removeEventListener('mouseover', this._onShowTooltip);
			this._body.removeEventListener('mousemove', this._onMoveTooltip);
			this._body.removeEventListener('mouseout', this._onHideTooltip);
			if (this._bodyActive) {
				this._bodyActive.removeEventListener('click', this._onClick);
				this._bodyActive.removeEventListener('mouseover', this._onShowTooltip);
				this._bodyActive.removeEventListener('mousemove', this._onMoveTooltip);
				this._bodyActive.removeEventListener('mouseout', this._onHideTooltip);
				this._svgroot.removeChild(this._bodyActive);
				this._svgroot.removeChild(this._bodyActiveBasis);
				this._bodyActive = null;
				if (this._bodyScale) {
					this._svgroot.removeChild(this._bodyScale);
					this._bodyScale = null;	// may be I don't need it
				}
			}
			this._svgroot.removeChild(this._body);
		}
		// very important: check and set the right maxValue aligning!
		if (this._o.orient == 'hor') {
			if (this._o.aligning != 'left' && this._o.aligning != 'right') {
				this._o.aligning = 'right';
			}
		}
		if (this._o.orient == 'ver') {
			if (this._o.aligning != 'down' && this._o.aligning != 'up') {
				this._o.aligning = 'down';
			}
		}

		// calculate body size
		this._gaugeBody = {
			x: this._rect.x,
			y: this._rect.y,
			width: this._rect.width,
			height: this._o.thickness, // in percents: (this._rect.width / 100) * this._o.thickness,
			active: {x: 0, y: 0, w: 0, h: 0},
			scale: {x1:0, y1: 0, x2: 0, y2: 0}
		};
		// calc and move active part
		let gap = this._o.gap;

		this._gaugeBody.active.x = this._gaugeBody.x + gap;
		this._gaugeBody.active.y = this._gaugeBody.y + gap;
		this._gaugeBody.active.w = this._gaugeBody.width;
		this._gaugeBody.active.h = this._gaugeBody.height;

		// append gaps
		if (this._o.isFillBkg || this._o.isFillStroke) {
			// expand body
			this._gaugeBody.width += gap * 2;
			this._gaugeBody.height += gap * 2;
		}

		if (this._o.scalePosition !== 'none') {
			this._gaugeBody.height += this._o.scaleOffset + this._o.varFontSize + 2;

			this._gaugeBody.scale.x1 = this._gaugeBody.active.x;
			this._gaugeBody.scale.x2 = this._gaugeBody.active.x + this._gaugeBody.active.w;
			this._gaugeBody.scale.y1 = this._gaugeBody.active.y + this._gaugeBody.active.h + this._o.scaleOffset;
			this._gaugeBody.scale.y2 = this._gaugeBody.scale.y1;
			// very important: correct the scale width for 'discrete' type
			if (this._o.type == 'discrete') {
				this._gaugeBody.scale.x2 -= 3;
			}


			if (this._o.orient === 'hor' && this._o.scalePosition === 'top') {
				// move active down
				this._gaugeBody.active.y = (this._gaugeBody.y + this._gaugeBody.height) - gap - this._gaugeBody.active.h;
				this._gaugeBody.scale.y1 = this._gaugeBody.active.y - this._o.scaleOffset;
				this._gaugeBody.scale.y2 = this._gaugeBody.scale.y1;
			}
		}
		let tv;
		if (this._o.orient == 'ver') {
			tv = this._gaugeBody.width;
			this._gaugeBody.width = this._gaugeBody.height;
			this._gaugeBody.height = tv;

			tv = this._gaugeBody.active.w;
			this._gaugeBody.active.w = this._gaugeBody.active.h;
			this._gaugeBody.active.h = tv;

			this._gaugeBody.scale.x1 = this._gaugeBody.active.x + this._gaugeBody.active.w + this._o.scaleOffset;
			this._gaugeBody.scale.x2 = this._gaugeBody.scale.x1;
			this._gaugeBody.scale.y1 = this._gaugeBody.active.y;
			this._gaugeBody.scale.y2 = this._gaugeBody.active.y + this._gaugeBody.active.h;
			// very important: correct the scale height for 'discrete' type
			if (this._o.type == 'discrete') {
				this._gaugeBody.scale.y2 -= 3;
			}

			if (this._o.scalePosition === 'left') {
				// move active right
				this._gaugeBody.active.x = (this._gaugeBody.x + this._gaugeBody.width) - gap - this._gaugeBody.active.w;
				this._gaugeBody.scale.x1 = this._gaugeBody.active.x - this._o.scaleOffset;
				this._gaugeBody.scale.x2 = this._gaugeBody.scale.x1;
			}
		}

		this._body = SmartGauges.addElement('rect', {
			// id: 'body',
			class: 'body',
			stroke: `${this._o.isFillStroke ? this._o.varStrokeColor : 'none'}`,
			fill: `${this._o.isFillBkg ? this._o.varFillColor : 'none'}`,
			'stroke-width': this._o.varStrokeWidth,
			'stroke-opacity': this._o.varOpacity,
			'fill-opacity': this._o.varOpacity,
			x: this._rect.x,
			y: this._rect.y,
			width: this._gaugeBody.width,
			height: this._gaugeBody.height
		}, this._svgroot, this._svgdoc);
		// build active path
		let path = '';
		if (this._o.type == 'solid') {
			const ra = this._gaugeBody.active;
			path = `M${ra.x},${ra.y} h${ra.w} v${ra.h} h-${ra.w} z`;
		} else {
			let startX = this._gaugeBody.active.x;
			let startY = this._gaugeBody.active.y;
			let partW, partH;
			if (this._o.orient == 'ver') {
				partH = (this._gaugeBody.active.h / 10) - 3;
				partW = this._gaugeBody.active.w;
			} else {
				partW = (this._gaugeBody.active.w / 10) - 3;
				partH = this._gaugeBody.active.h;
			}
			for (let n = 0; n < 10; n++) {
				path += `M${startX},${startY} h${partW} v${partH} h-${partW} v-${partH} `;
				if (this._o.orient == 'ver') {
					startY += partH + 3;
				} else {
					startX += partW + 3;
				}
			}
		}
		this._bodyActiveBasis = SmartGauges.addElement('path', {
            // id: 'bodyActiveBasis',
            class: 'bodyActiveBasis',
            stroke: this._o.varStrokeColor,
            fill: 'none',
            'stroke-width': this._o.varStrokeWidth > 1 ? 1 : this._o.varStrokeWidth,
			'fill-opacity':  this._o.varOpacity,
			'stroke-linejoin': 'miter',
			d: path
		}, this._svgroot, this._svgdoc);
		this._bodyActive = SmartGauges.addElement('path', {
            // id: 'bodyActive',
            class: 'bodyActive',
            stroke: this._o.varStrokeColor,
            fill: '#ffffff',
            'stroke-width': this._o.varStrokeWidth > 1 ? 1 : this._o.varStrokeWidth,
			'fill-opacity':  this._o.varOpacity,
			'stroke-linejoin': 'miter',
			d: path
		}, this._svgroot, this._svgdoc);
		// draw scale if enabled
		if (this._o.scalePosition !== 'none') {
			this._bodyScale = SmartGauges.addElement('g', {}, this._svgroot, this._svgdoc);
			SmartGauges.addElement('line', {
				x1: this._gaugeBody.scale.x1,
				y1: this._gaugeBody.scale.y1,
				x2: this._gaugeBody.scale.x2,
				y2: this._gaugeBody.scale.y2,
				'stroke-width': 1,
				stroke: this._o.varStrokeColor
			}, this._bodyScale, this._svgdoc);

			let xPosA, yPosA, anchorsA, cxA, cyA, baselineA;
			if (this._o.orient == 'hor') {
				xPosA = [this._gaugeBody.scale.x1, this._gaugeBody.scale.x1 + (this._gaugeBody.active.w / 2), this._gaugeBody.scale.x2];
				tv = this._o.scalePosition == 'top' ? this._gaugeBody.scale.y1 - 2 : this._gaugeBody.scale.y1 + this._o.varFontSize + 2;
				yPosA = [tv, tv, tv];
				anchorsA = ['left', 'middle', 'end'];
				cxA = xPosA;
				tv = this._gaugeBody.scale.y1;
				cyA = [tv, tv, tv];
				baselineA = this._o.scalePosition == 'top' ? ['after', 'after', 'after'] : ['after', 'after', 'after'];
			} else {
				tv = this._o.scalePosition == 'left' ? this._gaugeBody.scale.x1 - 2 : this._gaugeBody.scale.x1 + 2;
				xPosA = [tv, tv, tv];
				tv = this._o.varFontSize / 2;
				yPosA = [this._gaugeBody.scale.y1 + this._o.varFontSize, this._gaugeBody.scale.y1 + (this._gaugeBody.active.h / 2), this._gaugeBody.scale.y2];
				anchorsA = this._o.scalePosition == 'left' ? ['end', 'end', 'end'] : ['left', 'left', 'left'];
				cxA = [this._gaugeBody.scale.x1, this._gaugeBody.scale.x1, this._gaugeBody.scale.x1];
				cyA = [this._gaugeBody.scale.y1, this._gaugeBody.scale.y1 + (this._gaugeBody.active.h / 2), this._gaugeBody.scale.y2]; // [this._gaugeBody.scale.y1 + this._o.varFontSize, this._gaugeBody.scale.y1 + (this._gaugeBody.active.h / 2) + tv, this._gaugeBody.scale.y2 - this._o.varFontSize]
				baselineA = ['after', 'middle', 'before'];
			}

			for (let i = 0; i < 3; i++) {
				let numb = 50;
				SmartGauges.addElement('circle', {
					'stroke-width': 1,
					stroke: this._o.varStrokeColor,
					cx: cxA[i],
					cy: cyA[i],
					r: 1
				}, this._bodyScale, this._svgdoc);
				this._scaleTextA[i] = SmartGauges.addElement('text', {
					// id: `${this.id}-V${i}`,
					'text-anchor': anchorsA[i],
					'pointer-events': 'none',
					'font-family': this._o.varFontFamily,
					'font-size': this._o.varFontSize,
					'dominant-baseline': baselineA[i],
					fill: this._o.varStrokeColor,
					text: `${numb * i}`,
					x: xPosA[i],
					y: yPosA[i]
				}, this._bodyScale, this._svgdoc);
			}
		}
		// build active clip rect
		this._buildActive(this._data);
		// add shadow if enabled
		this._body.classList.add(this._o.varIsShadow ? 'shadowed' : 'no-shadows');
		this._bodyActiveBasis.classList.add(this._o.varIsShadow ? 'shadowed' : 'no-shadows');
		// uppend events
		this._body.addEventListener('click', this._onClick);
		this._body.addEventListener('mouseover', this._onShowTooltip);
		this._body.addEventListener('mousemove', this._onMoveTooltip);
		this._body.addEventListener('mouseout', this._onHideTooltip);
		this._bodyActive.addEventListener('click', this._onClick);
		this._bodyActive.addEventListener('mouseover', this._onShowTooltip);
		this._bodyActive.addEventListener('mousemove', this._onMoveTooltip);
		this._bodyActive.addEventListener('mouseout', this._onHideTooltip);
	}
	// event listeners
	_onShowTooltip(evt) {
		if (!this._o.isTooltip || this._o.ttipType !== 'own') {
			return;
		}
		let tta = Array.from(this._data)
        const data = {
            id: this.id,
            x: evt.clientX,
            y: evt.clientY,
            title: tta[0],
            options: {
                // isRun:  this._o.isRun,
                location: this._body.getBoundingClientRect(),
				delayOut: 1000,
                showMode: 'pinned',
				template: this._o.ttipTemplate,
				titleFormat: this._o.titleFormat,
				descrFormat: this._o.descrFormat,
                position: this._o.position
            }
        };
        SmartTooltip.showTooltip(data, evt);
    }
	_onMoveTooltip(evt) {
		if (!this._o.isTooltip || this._o.ttipType !== 'own') {
			return;
		}
		// not work properly. why? SmartTooltip.moveTooltip(evt);
	}
	_onHideTooltip(evt) {
		if (!this._o.isTooltip || this._o.ttipType !== 'own') {
			return;
		}
		SmartTooltip.hideTooltip(evt);
	}
	_onClick(event) {
        event.preventDefault();
        if (this._o.isLink) {
			let linkto = this._data.link;
            if (linkto) {
                linkto = SmartPolygons.getLink(linkto);
                window.open(linkto, '');
            }
        }
    }

    // API
    getCtrl() {
        return this;
	}
	isInited() {
		return this._inited;
	}
    init(options = null) {
        if (options) {
            // validate and merge with own _o
            SmartGauge.convertNumericProps(options);
            this._o = Object.assign({}, this._o, options);
        }
        const rc = this._svgroot.firstElementChild;
        this._rect = rc.getBBox();
        rc.setAttribute('display', 'none');
        if (!this._mode) {
			if (this._rect.width == 0 || this._rect.height == 0) {
				// get size from attributes!
				this._rect.width = Number(rc.getAttribute('width'));
				this._rect.height = Number(rc.getAttribute('height'));
				this._rect.x = Number(rc.getAttribute('x'));
				this._rect.y = Number(rc.getAttribute('y'));
			}
        } else {
			// calculate svg rectangle and coordinates
			this._rect = {
				x: 0,
				y: 0,
				width:  options.width,
				height: options.height || options.thickness
			};
		}
		this._inited = true;
        this._build();

        this._data = new Set();
		if (this._o.ttipType == 'own' && this._o.ttipTemplate) {
			// call static function (it will instantinate SmartTooltip and load template)
			SmartTooltip.initTooltip(this.id, this._o.ttipTemplate);
		}
    }
    isRun() {
		return this._o.isRun;
	}
	run(isRun) {
		let emMode = 0;
		if (typeof isRun === 'string') {
			if (isRun === '1' || isRun === 'true') {
				emMode = 1;
			}
		} else {
			emMode = isRun ? 1 : 0;
		}
		this._o.isRun = emMode;
	}
	get intervalCounter() {
		return this._intervalCounter;
	}
	set intervalCounter(n) {
		if (n <= 0) {
			this._intervalCounter = this._o.interval;
		} else {
			this._intervalCounter = n;
		}
	}
	isEmulate() {
		return this._o.isEmulate;
	}
	emulate(mode) {	// 1/0/-1 - enabled/disabled/nulled
		let emMode = 0;
		if (typeof mode === 'string') {
			if (mode === '1' || mode === 'true') {
				emMode = 1;
			} else if (mode === '-1') {
				emMode = -1;
			}
		} else {
			emMode = mode;
		}
		this._o.isEmulate = emMode;
	}
	update(data = null) {	// JSON object with defined progress:[]. In case of cfg={}, or opt:{} defined
							// this section will be processed before progress=[]
							// opt or cfg objects may contain any known optional attributes,
							// such as: opacity, lcolor (legend color), interval (ms), run/stop, server, targets, user, ...
		if (!data) { // do realtime updates here!
			if (this._o.server != '' && this._o.target != '') {
				SmartWidgets._httpGet(this._o.server + this._o.target)
				.then((response) => {
					// if (this._o.isAnimate) {
					// 	this._body.setAttribute('style', `/* r:${this._normRadius}; */`);

					// 	this._body.setAttribute("r", this._normRadius + this._normRadius/5);
					// 	this._body.setAttribute('fill-opacity', 0);
					// 	this._body.setAttribute('stroke-opacity', 0);
					// }
					data = JSON.parse(response);
					this._data.clear();
					this._data = new Set(data.target);
					for (let value of this._data) {
						if (value.type === 'description') {
							this._data.delete(value);
							break;
						}
					}
					this._buildActive(this._data);
					if (this._o.role === 'demoMode') {
						window.SmartSmartGauges.update('gauge-wdg', data);
					}
				})
				.catch((error) => {
					console.error(error); // Error: Not Found
				});
			} else { // generate fake data
				const fakeData = {
					"target": {
						"uuid": "uuid",
						"name": "Name",
						"descr":"Description",
						"value":"85",
						"max":	"100",
						"color":"crimson",
						"link": "http://www.google.com/"
					}
				};
				this._data.clear();
				this._data = new Set([fakeData.target]);
				this._buildActive(this._data);
				if (this._o.role === 'demoMode') {
					window.SmartGauges.update('gauge-wdg', data);
				}
			}
		} else { // show external or emulated data
			let options = null;
			if (typeof data.cfg === 'object') {
				options = data.cfg;
			}
			if (typeof data.opt === 'object') {
				options = data.opt;
			}
			// don't rebuld on set params!
			let needRebuild = this.setParams(options, false);
			if (typeof data.target === 'object') {
				// if (this._o.isAnimate) {
				// 	this._body.setAttribute('style', `/* r:${this._normRadius}; */`);

				// 	this._body.setAttribute("r", this._normRadius + this._normRadius/5);
				// 	this._body.setAttribute('fill-opacity', 0);
				// 	this._body.setAttribute('stroke-opacity', 0);
				// }
				this._data = new Set([data.target]);
				// needRebuild++
			}
			if (needRebuild) {
				this._build();
			} else {
				this._buildActive(this._data);
				if (this._o.role === 'demoMode') {
					window.SmartGauges.update('gauge-wdg', data);
				}
			}
		}
	}
	generateExData() {
		const max = 250;
		const value = Math.abs(Math.floor(Math.random() * (max + 1)) + 0);
		const color = value < max/4 ? 'blue' : (value < max/2 ? 'green' : (value < (max/4)*3 ? 'yellow' : 'red'));
		const dataEx = {
			"target": {
					"uuid": "uuid_ex_Target1",
					// "tooltip":  "Missing at work",
					"descr": "Значение параметра 'descr' в объекте 'data'",
					"name": "Значение параметра 'name' в объекте 'data'",
					"value": `${value}`,
					"color": `${color}`,
					"link": "http://www.google.com/index.html",
					"max": `${max}`
                },
			"error": {
				"message": "null",
				"code": "0"
			}
		}
		return dataEx;
	}
	getParams(filter = 'all') {
		return SmartGauge.getCustomParams(this._o, filter);	// 'dirty' means: get only changed parameters
	}
	setParam(name, value) {
		if (this.dontRespond) {	// don't respond on changing parameters when updating user panels in UI Builder (for example)
			return;
		}
		const opt = {};
		opt[name] = value;
		// convert to numbers specified by name property
		SmartGauge.convertNumericProps(opt, name);

		if (this._body) {
			this.setParams(opt);
		}
	}
	/**
	 * Instead of uppending new options, to own,
	 * this functions sets new and alwase rebuild the polygon.
	 * @param {object} options
	 */
	resetParams(options = null) {
		if (options) {
			this._o = Object.assign({}, SmartGauge.defOptions(), options);
			this._build();
		}
	}
	setParams(options = {}, rebuild = true) {
		let needRebuild = false;
		if (!options) {
			return false;
		}
		// convert all known properties to numbers
		SmartGauge.convertNumericProps(options);
		this._o = Object.assign({}, this._o, options);

		// some properties changing requires rebuilding, lets find its!
		for (let key in options) {
			switch (key) {
				case 'position':
				case 'ttipTemplate':
				case 'isLink':
				case 'isTooltip':
				case 'isEmulate':
				case 'isRun':
				case 'interval':
				case 'server':
				case 'target':
				case 'user':
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
}

class SmartGaugeElement extends HTMLElement {
	constructor(id) {
		super();

		// create SmartGauges collection only once!
		SmartGauges.initSmartGauges();

		const txtStyle = `
			:host {
				all: initial;	/* 1st rule so subsequent properties are reset. */
				contain: content;	/* set containment to layout + style + paint for improving performance (see "css-containment") */
				opacity: 1;
				will-change: opacity;
				transition: opacity 500ms ease-in-out;
			}
			:host([background]) { /* custom property for 'slotted' hook == background */
				background: var(--smartwdg-bgk, #9E9E9E);

			}
			:host(:hover) {
				--smartwdg-ftm-fill: var(--smartwdg-over-fill, white);
			}
			:host([disabled]) { /* style when host has disabled attribute. */
				pointer-events: none;
				opacity: 0.4;
			}
			/* I don't know what can I do with this */
			:host(.blue) {
				color: blue; /* color host when it has class="blue" */
			}
			:host(.pink) > #tabs {
				color: pink; /* color internal #tabs node when host has class="pink". */
			}
		`;

		const supportsShadowDOMV1 = !!HTMLElement.prototype.attachShadow;
		if (!supportsShadowDOMV1) {
			throw new Error('This browser does not support shadow DOM v1. Think about switching to a Chrome browser that supports all new technologies!');
		}
		this._id = this.getAttribute('id') || id;
		this._o = {};

		this._root = this.attachShadow({mode: 'open'});

		const svgId = `${this.id}--stgauge`;
		this._root.innerHTML = `
			<style>${txtStyle}</style>
			<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" id="${svgId}">
				<g id="mainG">
					<rect id="fakeR" x="10" y="10" width="150" height="150" fill="#eee" stroke="black" stroke-dasharray="4 4"></rect>
				</g>
			</svg>
		`;
		this._svgroot = this._root.querySelector('svg');
		// now create the smart polygon!
		this._stgauge = new SmartGauge('mainG', {context: this._svgroot, mode: 'html'});
		// store containerId: ref on SmartPieElement element inside SmartPies collection for JS access
		window.SmartGauges.set(this._id, this);
	}
	getCtrl() {
		return this._stgauge;
	}

	// attributes changing processing
	static get observedAttributes() {
		return SmartGauge.getCustomProperties();
	}
	attributeChangedCallback(name, oldValue, newValue) {
		// update own property
		const paramName = SmartWidgets.customProp2Param(name);
		this._o[paramName] = newValue;
		this._stgauge.setParam(paramName, newValue);
	}

	// connect and disconnect from html
    connectedCallback() {
		// getting properties in form 'stgauge-XXX' and 'stgauge-var-XXX' from styles
		const compStyle = getComputedStyle(this);
		const customProp = SmartGauge.getCustomProperties();
		for (let n = 0; n < customProp.length; n++) {
			const prop = `--stgauge-${customProp[n]}`;
			const propKey = SmartWidgets.customProp2Param(`${customProp[n]}`);
			let propVal = compStyle.getPropertyValue(prop);
			if (propVal) {
				propVal = propVal.trimLeft();
				this._o[propKey] = propVal;
			}
		}
		// all specific work will be done inside
		this._stgauge.init(this._o);

		// resize own svg
		let size = Math.max(this._stgauge._gaugeBody.height, this._stgauge._gaugeBody.width);
		if (this.classList.contains('demoMode')) {
			size = 130;
		}
		this._svgroot.setAttribute('height', size);
		this._svgroot.setAttribute('width', size);
		this._svgroot.setAttribute('viewBox', `0 0 ${size} ${size}`);

    }
    disconnectedCallback() {
		window.SmartGauges.unset(this._id);
		this._stgauge = null;
		this._root = null;
		this._o = null;
    }

}
window.customElements.define('smart-ui-gauge', SmartGaugeElement);
// thanks 'https://online.flippingbook.com/view/302153/676/'
