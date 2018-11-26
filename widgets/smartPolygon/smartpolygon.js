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

class SmartPolygons extends SmartWidgets {
	static getAlias() {
		return 'stpgn';
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
     *   stpgn-param-key: value,		// custom property is param-key
     *   stpgn-var-param-key: value,	// custom property is var-param-key
     * }
     *
     * @param {object} opt options object to be converted
	 * @param {boolean} what the flag that enables (if it has any string exclude 'options' to convert all properties to css vars (used in web-components)
     * @returns {object} options in form siutable for using
     *
     */
    static buidOptionsAndCssVars(opt, what = 'options') {
		const customProp = SmartPolygons.getCustomProperties();
		return SmartWidgets.buidOptionsAndCssVars(opt, customProp, what == 'options' ? '' : SmartPolygons.getAlias());
	}

	static getOptions(opt) {
		return SmartPolygons.buidOptionsAndCssVars(opt);
	}
	static getCSS(opt) {
		return SmartPolygons.buidOptionsAndCssVars(opt, 'css');
	}
	static getJSON(opt) {
		return `'${JSON.stringify(SmartPolygons.getOptions(opt))}'`;
	}
	static getCompressedJSON(opt) {
		const customProp = SmartPolygons.getCustomProperties();
		const defOptions = SmartPolygons.defOptions();
		const fullJson = SmartWidgets.getCustomParams(customProp, defOptions, opt, 'all', SmartPolygons.getAlias());
		return `'${JSON.stringify(fullJson)}'`
	}
	/**
	 * converts JSON representation of options into the options parameters object siutable for show() call
	 */
	static JsonToOptions(jsonOpt) {
		const options = {
		};
		if (typeof jsonOpt === 'string' && jsonOpt.length) {
			const tmpOpt = JSON.parse(jsonOpt);
			const smartWidgetAlias = SmartWidgets.getAlias();
			if (typeof tmpOpt[smartWidgetAlias] != 'undefined') {
				// lets decompress options...
				const optArr = tmpOpt[smartWidgetAlias].split('-');
				const customProp = SmartPolygons.getCustomProperties();
				let index = 1;
				for (let prop of customProp) {
					if (optArr[index] != '.') {
						options[SmartWidgets.customProp2Param(prop)] = optArr[index];
					}
					index++;
				}
				SmartPolygons.convertNumericProps(options);
				options.alias = optArr[0];
				return options;
			}
			const aliasKey = `--${SmartPolygons.getAlias()}-`;
			for (let key in tmpOpt) {
				const paramName = key.replace(aliasKey, '');
				options[SmartWidgets.customProp2Param(paramName)] = tmpOpt[key];
			}
			SmartPolygons.convertNumericProps(options);
			return options;
		}
		return null;
	}
	/**
	 * Returns an array of custom properties. Each of the custom property has corresponding declarative attribute in form first-second == prefix-first-second
	 * and option parameter with name "firstSecond".
	 * for example: '--sttip-title-format' property equals to attribute 'title-format' and options.titleFormat parameter, but
	 * '--sttip-template' property equals to TEMPLATE attribute and options.template parameter.
	 */
	static getCustomProperties() {
		return [
			'role',				// in demo mode this parameter has value 'demoMode'
			'alias',			// 'stpgn'
            'orient',			// Orientation of widget. 'hor' - horizontal, or 'vert' - vertical. Default is 'hor'
            'aligning',			// Direction of axis "value". Depends on the parameter "orientation". May have values: "up", "down", "right", "left". Default is 'right'
            'rotation',			// Degrees. Positive values rotate the widget in the direction of the clockwise movement. Default is '-90'
            'start-angle',		// Degrees. Default is 45
			'radius',			// This parameter sets the radius of inscribed circle. It should not be more than half the
								// height or width of the widget. During initialization or installation of parameters,
                                // all disputed parameters are checked and corrected automatically. Default is 50
            'inner-radius',		// radius for stars in percents from radius
			'width',			// The width of the widget. The value of the “radius” parameter will be corrected if it
								// exceeds half the value of this parameter, or the parameter “height” if its value is less than this parameter.
			'height',			// The height of the widget. The value of the “radius” parameter will be corrected if it exceeds half the value
                                // of this parameter, or the parameter “width” if its value is less than this parameter.
            'angles-number',	// The number of corners of a regular polygon. Default is 4
			'position',			// The value describes location of tooltip or legend window Default value is 'rt' which means right-top conner of element.
			'ttip-template',	// Default value for this property is 'pie', wich means the using of internal SmartTooltip pie template definition.
								// Currently only 4 types of templates are implemented: 'pie', 'simple', 'image' and 'iframe'.
			'ttip-type',		// Use own (limited) settings for the tooltip or use the SmartToolеip global (full) settings.
								// Possible values are: 'own' and 'global'. Default is 'own'.
			'title-format',
			'descr-format',

            'max-value',		// the maximum value. If 0 then 100% is a maximum.
            'is-star',			// Enables drawing start instead of regular polygon
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

			'color-rule',		// Same as 'value-rule', but set color only, do not use value at all.
			'value-rule',		// Specifies what will be painted when the value is drawn: line or background
								// Possible values are: 'stroke', 'fill', 'both'. Default is 'fill'.
								// The following four parameters also affect rendering.
								// The following addition rule is used: the missing parameter is drawn.
								// That is, if it is indicated that the value affects the background ('rule'='fill'),
								// then for the lines, the color of the line and the corresponding flag are used.
								// Conversely, if the value affects the line ('rule'='stroke'),
								// then the corresponding color and flag are used to fill the background.
								// In the case of 'rule'='both', additional parameters are not used.
			'is-fill-bkg',		// Enables fill and color the background of polygon. Default is 1
			'is-fill-stroke',	// Enables draw colored stroke around of polygon. Default is 0
			'var-stroke-color',
			'var-fill-color',
			'var-is-shadow',	// Allows shadow for widget and tooltip
            'var-stroke-width',	// Sets the width of the widget's stroke, and tooltip, which also depend on the template. Default is 1
			'var-opacity',		// Sets the transparency of the widget, the legend (and hints, which also depend on the template)
			'is-global-colors', // use global state to color definition instead of 'state-colors'
			'state-colors'		// State to color interpretator. String in comma-separated format 'state''hex color', for example: 1#00ff00,2#00aabb,3#ff0000,...
								// by default (currently) is empty, what means not in use
        ];
    }
    static defOptions() {
        return {
			role: '',			// in demo mode this parameter has value 'demoMode'
			alias: SmartPolygons.getAlias(),
            orient: 'hor',		// Orientation of widget. 'hor' - horizontal, or 'vert' - vertical. Default is 'hor'
            aligning: 'right',	// Direction of axis "value". Depends on the parameter "orientation". May have values: "up", "down", "right", "left". Default is 'right'
            rotation: 0,		// Degrees. Positive values rotate the widget in the direction of the clockwise movement. Default is '-90'
            startAngle: 0,		// Degrees. Default is 45
			radius: 50,			// This parameter sets the radius of inscribed circle. It should not be more than half the
								// height or width of the widget. During initialization or installation of parameters,
                                // all disputed parameters are checked and corrected automatically. Default is 50
            innerRadius: 50,	// inner radius for starts in percents
			width: 0,			// The width of the widget. The value of the “radius” parameter will be corrected if it
								// exceeds half the value of this parameter, or the parameter “height” if its value is less than this parameter.
			height: 0,			// The height of the widget. The value of the “radius” parameter will be corrected if it exceeds half the value
                                // of this parameter, or the parameter “width” if its value is less than this parameter.
            anglesNumber: 0,	// The number of corners of a regular polygon. Default is 0 and must be specified!
			position: 'rt',		// The value describes location of tooltip window Default value is 'rt' which means right-top conner of element.
			ttipTemplate: 'simple', // Default value for this property is 'simple, wich means the using of internal SmartTooltip pie template definition.
								// Currently only 4 types of templates are implemented: 'pie', 'simple', 'image' and 'iframe'.
			ttipType: 'own',	// Use own (limited) settings for the tooltip or use the SmartToolеip global (full) settings.
								// Possible values are: 'own' and 'global'. Default is 'own'.
			titleFormat: '$TITLE$, value = $VALUE$',
			descrFormat: '$DESCR$, color = $COLOR$',

            maxValue: 0,		// the maximum value. If 0 then 100% is a maximum.
            isStar: 0,			// Enables drawing start instead of regular polygon
			isAnimate: 1,		// Allows to animate the moment of receiving the data array.
			isLink: 1,			// Allows to disable going to the link by ckick on the sector. Used in example. The default is 1
			isTooltip: 1,		// Allows displaying a tooltip next to the mouse pointer. Reproducing legends, hints are not displayed and vice versa.
			isEmulate: 0,		// Allows automatic emulation of the process of data receiving.
			isRun: 1,			// Starts the internal mechanism of sending requests to the server, if there are parameters: “server”, “target”, “user”
			interval: 3000,		// Determines the interval of sending requests to the server in seconds (if the value is less than 2000)
								// or in milliseconds (if the value is greater than 1999)
            server: '',
            target: '',
            user: '',

			colorRule: 'stroke',
			valueRule: 'fill',
			isFillBkg: 0,		// Enables fill and color the background of polygon. Default is 1
            isFillStroke: 0,	// Enables draw stroke around of polygon. Default is 1
            varStrokeColor: '#000000',
            varFillColor: 	'#ffcd88',
			varIsShadow: 1,		// Allows shadow for widget, legend and tooltip
            varStrokeWidth: 3,	// Sets the width of the widget's stroke, and tooltip, which also depend on the template. Default is 1
			varOpacity: 1,		// Sets the transparency of the widget, the legend (and hints, which also depend on the template)
			isGlobalColors: 1,
			stateColors: ''		// State to color interpretator. String in comma-separated format 'state''hex color', for example: 1#00ff00,2#00aabb,3#ff0000,...
								 // by default is ''Empty parameter means not in use in case of isGlobalColors == 0.
        };
    }
    static convertNumericProps(options = {}, propName) {
        const numericProps = [
            'rotation',
            'startAngle',
            'radius',
            'innerRadius',
            'anglesNumber',
            'width',
            'height',
            'isStar',
            'isAnimate',
            'isLink',
            'isEmulate',
            'isRun',
            'isTooltip',
            'interval',
            'isFillBkg',
            'isFillStroke',
			'maxValue',
			'varIsShadow',
            'varStrokeWidth',
			'varOpacity',
			'isGlobalColors'
        ];
        return SmartWidgets.convertToNumbers(options, numericProps, propName);
    }

    static init(context = {}) {
        if (!window.SmartPolygons) {
            window.SmartPolygons = new SmartPolygons();
        }
        window.SmartPolygons.init(context);
    }
    static addElement(type, params, parent = null, doc = null) {
        return super.addElement(type, params, parent, doc);
    }

    constructor() {
        super();
		this._alias = SmartPolygons.getAlias();
		this.uniqueId = this._makeId(SmartPolygons.getAlias(), 0);
	}

	initCtrl(id, options) {
		let ctrl = this.get(id);
		if (!ctrl) {
			ctrl = new SmartPolygon(id, options);
			if (ctrl) {
				ctrl.init(options);
			}
		}
	}
	unInitCtrl(id) {
        // todo....
	}
}

class SmartPolygon {

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

		className = `${opt.isStar ? 'star' : 'polygon'}-${opt.anglesNumber}`;
		switch (templateId) {
			case 'def-custom-elem_btn':
				// convert all options into css vars
				dtO = SmartPolygons.getCSS(opt);

                template = '&lt;style>\n';
                template += `  .${className} {\n`;
                // template += `    `
                for (let key in dtO) {
                    template += `    ${key}:${dtO[key]};\n`;
                }
                template += '  }\n';
                template += '&lt;/style>\n';
				template += `&lt;smart-ui-polygon class="${className}" id="ANY_UNIQUE_NUMBER">browser not support custom elements.&lt/smart-ui-polygon>\n`;
                break;
			case 'def-json_btn': {
				// const jstr = SmartPolygons.getJSON(opt);	// get dirty parameters in json format
				const jstr = SmartPolygons.getCompressedJSON(opt); // get all parameters in compressed json format
				template = `${jstr}`;
				template += '\n\n';
				template +=
				`// later, use static function SmartPolygons.JsonToOptions(options); to convert JSON string
// into 'options' object, sutable for SmartPolygon creation. For example:
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
  const pgn = new SmartPolygon(jsn, options);
  // or in case you want to change any parameters, convert the JSON string into object
  const options = {
	  opt: SmartPolygons.JsonToOptions(opt);
	  context: document.getElementById('dashboard'),
  }
  // change the radius of polygon as you want, for ex:
  options.opt.radius = 50;

  // and create an instanse of SmartPolygon widget
  const pgn = new SmartPolygon(jsn, options);
}
`;
                break;
            }
            case 'def-object-params_btn': {
				dtO = SmartPolygons.getOptions(opt);
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
  const pgn = new SmartPolygon(jsn, options);
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
	 *
	 * @param {string} id
	 * @param {object} options contains context, mode and opt
	 */
    constructor(id, options = null) {
		if (!options) {
			console.error('must to be specified!');
			return;
		}
		this.dontRespond 	= false; // An external application may set this flag for disabling responding on setting changing. It must to clear this flag after that.
		this._onShowTooltip = this._onShowTooltip.bind(this);
		this._onMoveTooltip = this._onMoveTooltip.bind(this);
		this._onHideTooltip = this._onHideTooltip.bind(this);
		this._onClick       = this._onClick.bind(this);
        const txtStyle = `
            svg {
                overflow: visible;
				--no-color:	none;
            }
			.stpgn.shadowed {
				filter: url(#drop-shadow);
			}
			.stpgn.linked {
				cursor: pointer;
			}
			.stpgn.animated {
				transition:all 1.5s;
			}
		`;
		let gId = id;
		// check for options in JSON format and convert its to object in this case
		const smartWidgetAlias = SmartWidgets.getAlias();
		// check input parameters
		const elem = document.getElementById(id);
		if (elem && elem.tagName === 'DIV') {
			const elemId = window.SmartPolygons.getId();
			const svgId = `${id}--${SmartPolygons.getAlias()}`;
			this._shadowDOM = elem.attachShadow({mode: 'open'});
			this._shadowDOM.innerHTML = `${SmartWidgets.getSVGContext(svgId, elemId)}`;
			options = {
				mode: 'html',
				context: this._shadowDOM.getElementById(svgId),
				opt: options
			};
			window.SmartBars.set(id, this);
			gId = elemId;
		}

		if (typeof options.opt === 'string' && options.opt.length && options.opt.startsWith(smartWidgetAlias)) {
			options.opt = SmartPolygons.JsonToOptions(options.opt);
		}

        // merge default options with specified
        this._o = Object.assign({}, SmartPolygons.defOptions(), options.opt || {});
        // validate all properties
        SmartPolygons.convertNumericProps(this._o);

        this._mode      = options.mode || null; // in case of 'custom elements' initialization the 'mode' equals 'html'
        this.id         = gId; // <g id> inside of <svg>
        this._root      = options.context; // svg root element
        this._svgroot   = this._root.getElementById(this.id); // reference on insertion node
        this._svgdoc    = this._svgroot.ownerDocument;

        this._data      = null; // last received from data provider (server + target)
        this._body      = null; // the polygons body
		this._active    = null; // the active element (rect in clip)
		this._s2c		= new StateToColors(); // custom defines state to colors mapping, by default is empty and in not in use (currently)
		this._intervalCounter = 0;
		this._inited	= false;	// call to init() set this flag to true. after that we can build, rebuild and activate....

		let tmpId = `style--${SmartPolygons.getAlias()}`;
		if (!this._root.getElementById(tmpId)) {
			const style = SmartWidgets.addElement('style', {
				id: tmpId
			}, this._root, this._svgdoc);
			style.textContent = txtStyle;
		}
		tmpId = `defs--${SmartPolygons.getAlias()}`;
		if (!this._root.getElementById(tmpId)) {
			this._defs = SmartWidgets.addElement('defs', {
				id: tmpId
			}, this._root, this._svgdoc);
			this._defs.innerHTML = window.SmartPolygons.defs;
		}
		this._active = SmartWidgets.addElement('clipPath', {id: 'activeRect'}, this._root, this._svgdoc);
		// in case of html insertion, the options.mode == 'html' is defined and
		// the buiding process is divided on two parts:  constructor() and init() from connectedCallback.
		// in case of creating SmartPolygon object from Javascript, lets do all needed work in one place...
		if (!this._mode) {
			// store containerId: ref on SmartPolygon element inside SmartPolygons collection for JS access
			window.SmartPolygons.set(this.id, this);
			this.init();
		}
		if (elem && elem.tagName === 'DIV') {
			this.init(this._o);
		}
    }
	// Internal functions. Please don't use from outside!
	// The normalized radius of regular polygon must be recalculated after changing some optional parameters, such as: radius and stroke-width
	_recalculateNormRadius() {
		this._normRadius = this._o.radius - (this._o.varStrokeWidth / 2);
		this._normRadius = this._normRadius < 0 ? 0 : this._normRadius;
	}

    _buildActive(data = null, rebuildActive = 'none') {
		if (!this._inited) {
			console.log('_build() -> Nothing todo, not yet initialized!');
			return;
		}

        if (this._active && rebuildActive !== 'none') {
			// remove old clip rectangle
			const elem = this._active.firstElementChild;
			if (elem) {
				this._active.removeChild(this._active.firstElementChild);
			}
		}
		const activeRect = {
			x: this._rect.x,
			y: this._rect.y,
			width: this._rect.width,
			height: this._rect.height
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

				let cr = -1;
				if (typeof dt.state === 'string') {
					if (this._o.isGlobalColors && window.StateToColors && this._o.role !== 'demoMode') {
						// try to interpret color of state from global Map
						cr = window.StateToColors.get(dt.state);
					} else {
						// try to get it from local Map
						cr = this._s2c.get(dt.state);
					}
					// if color was found use it, instead of property 'color'
					if (typeof cr != 'undefined') {
						dt.color = cr;
					}
				}

				const maxValue = parseInt(dt.max, 10) || this._o.maxValue;
				const max100 = this._o.orient === 'hor' ? activeRect.width : activeRect.height;
				let onePCT = maxValue ? max100 / maxValue : max100 / 100;
				if (this._o.orient === 'hor') {
					activeRect.width = parseFloat(dt.value) * onePCT;
					if (this._o.aligning === 'left') {
						activeRect.x = (activeRect.x + this._rect.width) - activeRect.width;
					}
				} else {
					activeRect.height = parseFloat(dt.value) * onePCT;
					if (this._o.aligning == 'up') {
						activeRect.y = (activeRect.y + this._rect.height) - activeRect.height;
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
				// and last coorection here
				if (this._o.valueRule === 'stroke' || this._o.valueRule === 'none') {
					this._bodyActive.setAttribute('fill', 'none');
				}

			}
		}
		if (this._o.valueRule !== 'none' || this._o.colorRule !== 'none') {
			// build the clip rectangle here, or chang it's size
			if (rebuildActive !== 'none') {
				SmartWidgets.addElement('rect', {
					class: this._o.isAnimate ? 'stpgn animated' : 'stpgn',
					x: activeRect.x,
					y: activeRect.y,
					width: activeRect.width,
					height: activeRect.height
				}, this._active, this._svgdoc);
				this._bodyActive.setAttribute('clip-path', 'url(#activeRect)');
			} else {
				this._active.firstElementChild.setAttribute('x', activeRect.x);
				this._active.firstElementChild.setAttribute('y', activeRect.y);
				this._active.firstElementChild.setAttribute('width', activeRect.width);
				this._active.firstElementChild.setAttribute('height', activeRect.height);
			}
		} else {
			this._bodyActive.removeAttribute('clip-path');
		}
	}
    _build() {
		this._s2c.init(this._o.stateColors, this._o.isGlobalColors);

		if (!this._inited) {
			console.log('_build() -> Nothing todo, not yet initialized!');
			return;
		}
        if (this._body) {
			this._body.removeEventListener('click', this._onClick);
			this._body.removeEventListener('mouseover', this._onShowTooltip);
			this._body.removeEventListener('mousemove', this._onMoveTooltip);
            this._body.removeEventListener('mouseout', this._onHideTooltip);
			this._bodyActive.removeEventListener('click', this._onClick);
			this._bodyActive.removeEventListener('mouseover', this._onShowTooltip);
			this._bodyActive.removeEventListener('mousemove', this._onMoveTooltip);
            this._bodyActive.removeEventListener('mouseout', this._onHideTooltip);

			if (this._boundary) {
				this._svgroot.removeChild(this._boundary);
				this._boundary = null;
			}
			this._svgroot.removeChild(this._bodyActive);
            this._svgroot.removeChild(this._body);
        }
        const centerPt = {
            x: this._rect.x + this._normRadius,
            y: this._rect.y + this._normRadius
		};
		if (this._o.role === 'demoMode') {
			this._boundary = SmartWidgets.addElement('g', {}, this._svgroot, this._svgdoc);
			if (this._boundary) {
				SmartWidgets.addElement('rect', {
					x: this._rect.x,
					y: this._rect.y,
					width: this._rect.width,
					height: this._rect.height,
					stroke: 'gray',
					'stroke-dasharray': '4 2',
					fill: 'none'
				}, this._boundary, this._svgdoc);
				SmartWidgets.addElement('circle', {
					cx: centerPt.x,
					cy: centerPt.y,
					r: this._normRadius,
					stroke: 'gray',
					'stroke-dasharray': '4 2',
					fill: 'none'
				}, this._boundary, this._svgdoc);
				SmartWidgets.addElement('line', {
					x1: this._rect.x,
					y1: this._rect.y,
					x2: this._rect.x + this._rect.width,
					y2: this._rect.y + this._rect.height,
					stroke: 'gray',
					'stroke-dasharray': '4 2'
				}, this._boundary, this._svgdoc);
				SmartWidgets.addElement('line', {
					x1: this._rect.x + this._rect.width,
					y1: this._rect.y,
					x2: this._rect.x,
					y2: this._rect.y + this._rect.height,
					stroke: 'gray',
					'stroke-dasharray': '4 2'
				}, this._boundary, this._svgdoc);
				SmartWidgets.addElement('line', {
					x1: this._rect.x + this._rect.width / 2,
					y1: this._rect.y,
					x2: this._rect.x + this._rect.width / 2,
					y2: this._rect.y + this._rect.height,
					stroke: 'gray',
					'stroke-dasharray': '4 2'
				}, this._boundary, this._svgdoc);
				SmartWidgets.addElement('line', {
					x1: this._rect.x,
					y1: this._rect.y + this._rect.height / 2,
					x2: this._rect.x + this._rect.width,
					y2: this._rect.y + this._rect.height / 2,
					stroke: 'gray',
					'stroke-dasharray': '4 2'
				}, this._boundary, this._svgdoc);
			}
		}
        // add base element to svg
        this._body = SmartWidgets.addElement('polygon', {
            // id: 'body',
            class: this._o.isAnimate ? 'stpgn animated' : 'stpgn',
            stroke: `${this._o.isFillStroke ? this._o.varStrokeColor : 'none'}`,
            fill: `${this._o.isFillBkg ? this._o.varFillColor : 'none'}`,
            'stroke-width': this._o.varStrokeWidth,
            'stroke-opacity': this._o.varOpacity,
            'fill-opacity':  this._o.varOpacity,
			points: SmartWidgets.buildPolygon(this._o.anglesNumber, centerPt.x, centerPt.y,
				this._normRadius, this._o.startAngle,
				this._o.rotation, 0, this._o.isStar ? this._o.innerRadius : 0)
		}, this._svgroot, this._svgdoc);

		this._bodyActive = SmartWidgets.addElement('polygon', {
            // id: 'bodyActive',
            class: this._o.isAnimate ? 'stpgn animated' : 'stpgn',
            stroke: this._o.varStrokeColor,
            fill: this._o.varFillColor,
            'stroke-width': this._o.varStrokeWidth,
			'fill-opacity':  this._o.varOpacity,
			'stroke-linejoin': 'miter',
			'stroke-miterlimit': '50',
			points: SmartWidgets.buildPolygon(this._o.anglesNumber, centerPt.x, centerPt.y,
				this._normRadius, this._o.startAngle,
				this._o.rotation, 1, this._o.isStar ? this._o.innerRadius : 0)
		}, this._svgroot, this._svgdoc);
		if (this._o.colorRule != 'none') {
			this._svgroot.insertBefore(this._bodyActive, this._body);
		}
		this._buildActive(this._data, 'rebuild');
		this._body.classList.add(this._o.varIsShadow ? 'shadowed' : 'no-shadows');

		if (this._o.isLink) {
			this._body.classList.add('linked');
			this._bodyActive.classList.add('linked');
			this._body.addEventListener('click', this._onClick);
			this._bodyActive.addEventListener('click', this._onClick);
		}
		this._body.addEventListener('mouseover', this._onShowTooltip);
		this._body.addEventListener('mousemove', this._onMoveTooltip);
		this._body.addEventListener('mouseout', this._onHideTooltip);
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
        if (this._o.isLink && this._o.role != 'demoMode') {
			let data = Array.from(this._data);
			let linkto = data[0].link;
            if (typeof linkto === 'string') {
                linkto = SmartPolygons.getLink(linkto);
                window.open(linkto, '');
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
				options = SmartPolygons.JsonToOptions(options);
			}
            // validate and merge with own _o
            SmartPolygons.convertNumericProps(options);
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
			this._o.radius = Math.min(this._rect.width, this._rect.height) / 2;
        } else {
			// calculate svg rectangle and coordinates
			// to do: check radius and correct it with width and height parameters if they exists!
			this._rect = {
				x: 0,
				y: 0,
				width:  this._o.radius * 2,
				height: this._o.radius * 2
			};
		}
		this._inited = true;

		// calculate normalized radius
        this._recalculateNormRadius();
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
						window.SmartPolygons.update('pgn-wdg', data);
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
						"descr": "Description",
						"value": "15",
						"max": "100",
						"color": "gray",
						"state": "0",
						"link": "http://www.google.com/"
					}
				};
				this._data.clear();
				this._data = new Set([fakeData.target]);
				this._buildActive(this._data);
				if (this._o.role === 'demoMode') {
					window.SmartPolygons.update('pgn-wdg', data);
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
					window.SmartPolygons.update('pgn-wdg', data);
				}
			}
		}
	}
	generateExData() {
		const max = 100;
		const value = Math.abs(Math.floor(Math.random() * (100 + 1)) + 0);
		const color = value < 30 ? 'blue' : (value < 50 ? 'green' : (value < 70 ? 'yellow' : 'red'));
		const state = Math.abs(Math.floor(Math.random() * 7));	// from 0 up to 7

		const dataEx = {
			"target": {
					"uuid": "uuid_ex_Target1",
					// "tooltip":  "Missing at work",
					"descr": "Значение параметра 'descr' в объекте 'data'",
					"name": "Значение параметра 'name' в объекте 'data'",
					"value": `${value}`,
					"color": `${color}`,
					"state": `${state}`,
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
	/**
	 * Get parameters of Smart Widget
	 * @param {string} filter 'all', 'dirty', 'def', 'vars', 'names', 'css', 'json', 'cjson'
	 * @returns smart object parameters in form specified by filter
	 */
	getParams(filter = 'all') {
		let opt;
		const customProp = SmartPolygons.getCustomProperties();		// get an array of custom properties
		const defOptions = SmartPolygons.defOptions();
		switch (filter) {
			case 'cjson': // compressed json
				opt = SmartWidgets.getCustomParams(customProp, defOptions, this._o, 'dirty');
				delete opt.role;
				return SmartPolygons.getCompressedJSON(opt);
			case 'json':
				opt = SmartWidgets.getCustomParams(customProp, defOptions, this._o, 'dirty', 'none');
				return SmartPolygons.getJSON(opt);
			case 'css':
				opt = SmartWidgets.getCustomParams(customProp, defOptions, this._o, 'dirty', 'none');
				return SmartPolygons.getCSS(opt);
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
		SmartPolygons.convertNumericProps(opt, name);

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
			this._o = Object.assign({}, SmartPolygons.defOptions(), options);
			this._build();
		}
	}
	setParams(options = {}, rebuild = true) {
		let needRebuild = false;
		if (!options) {
			return false;
		}
		// convert all known properties to numbers
		SmartPolygons.convertNumericProps(options);
		this._o = Object.assign({}, this._o, options);

		// some properties changing requires rebuilding, lets find its!
		for (let key in options) {
			switch (key) {
				case 'position':
				case 'ttipTemplate':
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

class SmartPolygonElement extends HTMLElement {
	constructor(id) {
		super();

		// create SmartPolygons collection only once!
		SmartPolygons.init();

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

		const elemId = window.SmartPolygons.getId();
		const svgId = `${this.id}--${SmartPolygons.getAlias()}`;
		this._root.innerHTML = `
			<style>${txtStyle}</style>
			<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" id="${svgId}">
				<g id="${elemId}">
					<rect id="fakeR" x="10" y="10" width="150" height="150" fill="#eee" stroke="black" stroke-dasharray="4 4"></rect>
				</g>
			</svg>
		`;
		this._svgroot = this._root.querySelector('svg');
		// now create the smart polygon!
		this._stpgn = new SmartPolygon(elemId, {
			context: this._svgroot,
			mode: 'html',
			opt: null
		});
		// store containerId: ref on SmartPieElement element inside SmartPies collection for JS access
		window.SmartPolygons.set(this._id, this);
	}
	getCtrl() {
		return this._stpgn;
	}

	// attributes changing processing
	static get observedAttributes() {
		return SmartPolygons.getCustomProperties();
	}
	attributeChangedCallback(name, oldValue, newValue) {
		// update own property
		const paramName = SmartWidgets.customProp2Param(name);
		this._o[paramName] = newValue;
		this._stpgn.setParam(paramName, newValue);
	}

	// connect and disconnect from html
    connectedCallback() {
		// getting properties in form 'stpgn-XXX' and 'sttip-var-XXX' from styles
		const compStyle = getComputedStyle(this);
		const customProp = SmartPolygons.getCustomProperties();
		for (let n = 0; n < customProp.length; n++) {
			const prop = `--${SmartPolygons.getAlias()}-${customProp[n]}`;
			const propKey = SmartPolygons.customProp2Param(`${customProp[n]}`);
			let propVal = compStyle.getPropertyValue(prop);
			if (propVal) {
				propVal = propVal.trimLeft();
				this._o[propKey] = propVal;
			}
		}
		// all specific work will be done inside
		this._stpgn.init(this._o);

		// resize own svg
		this._svgroot.setAttribute('height', this._stpgn._rect.height);
		this._svgroot.setAttribute('width', this._stpgn._rect.width);
		this._svgroot.setAttribute('viewBox', `0 0 ${this._stpgn._rect.width} ${this._stpgn._rect.height}`);

    }
    disconnectedCallback() {
		window.SmartPolygons.unset(this._id);
		this._stpgn = null;
		this._root = null;
		this._o = null;
    }

}
window.customElements.define('smart-ui-polygon', SmartPolygonElement);
// thanks 'https://online.flippingbook.com/view/302153/676/'

