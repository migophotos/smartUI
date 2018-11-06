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

class SmartBars extends SmartWidgets {
    static initSmartBars(context = {}) {
        if (!window.SmartBars) {
            window.SmartBars = new SmartBars();
        }
        window.SmartBars.init(context);
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
			ctrl = new SmartBar(id, options);
			if (ctrl) {
				ctrl.init(options);
			}
		}
	}
	unInitCtrl(id) {
        // todo....
	}
}

class SmartBar {
	/**
	 * converts JSON representation of options into the options parameters object siutable for show() call
	 */
	static JsonToOptions(jsonOpt) {
		const options = {
		};
		if (typeof jsonOpt === 'string' && jsonOpt.length) {
			const tmpOpt = JSON.parse(jsonOpt);
			for (let key in tmpOpt) {
				const paramName = key.replace('--stbar-', '');
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
		const customProp = SmartBar.getCustomProperties();
		return SmartWidgets.buidOptionsAndCssVars(opt, customProp, 'stbar');
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
		const custProp = SmartBar.getCustomProperties();		// get an array of custom properties
		const origOpt = SmartBar.defOptions();
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

		className = `${opt.isStar ? 'star' : 'polygon'}-${opt.anglesNumber}`;
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
				template += `&lt;smart-ui-bar class="${className}" id="ANY_UNIQUE_NUMBER">This browser does not support custom elements.&lt/smart-ui-bar>\n`;
                break;
			case 'def-json_btn': {
				dtO = this.buidOptionsAndCssVars(opt);
				const jstr = `'${JSON.stringify(dtO)}'`;
				template = `${jstr}`;
				template += '\n\n';
				template +=
				`// later, use static function SmartBar.JsonToOptions(options); to convert JSON string
// into 'options' object, sutable for SmartBar creation. For example:

const el = document.getElementById("jsn");
if (el) {
  const opt = ${jstr};
  const options = SmartBar.JsonToOptions(opt);
  // change the radius of polygon as you want, for ex:
  options.radius = 50;
  // create an instanse
  const pgn = new SmartBar(jsn, options);
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
  const pgn = new SmartBar(jsn, options);
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
	 * Returns an array of custom properties. Each of the custom property has corresponding declarative attribute in form first-second == prefix-first-second
	 * and option parameter with name "firstSecond".
	 * for example: '--sttip-title-format' property equals to attribute 'title-format' and options.titleFormat parameter, but
	 * '--sttip-template' property equals to TEMPLATE attribute and options.template parameter.
	 */
	static getCustomProperties() {
		return [
			'role',				// in demo mode this parameter has value 'demoMode'
			'type',				// The type of bar bady: 'solid' or 'discrete'
            'orient',			// Orientation of widget. 'hor' - horizontal, or 'vert' - vertical. Default is 'hor'
			'aligning',			// Direction of axis "value". Depends on the parameter "orientation". May have values: "up", "down", "right", "left". Default is 'right'
			'thickness',		// The height or width of the element, depending on its orientation, as a percentage of its length or height, respectively.
			'is-scale',			// Enables scale drawing, default is 1.
			'scale-position',	// Depends from 'orient', 'alighing'. May contain one from next values: 'top','right','bottom', or 'left'
			'scale-offset',		// An offset of scale base line from center axe of SmartBar. Depends from 'orient'
			'major-m-length', 	// The length of marks on the scale in percentage of 'thickness'
			'minor-m-length',

			'position',			// The value describes location of tooltip or legend window Default value is 'rt' which means right-top conner of element.
			'ttip-template',	// Default value for this property is 'pie', wich means the using of internal SmartTooltip pie template definition.
								// Currently only 4 types of templates are implemented: 'pie', 'simple', 'image' and 'iframe'.
			'ttip-type',		// Use own (limited) settings for the tooltip or use the SmartToolеip global (full) settings.
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
			'var-font-family',	// Scale font definitions
			'var-font-size',
			'var-font-stretch',
			'var-font-color'

        ];
    }
    static defOptions() {
        return {
			role: '',			// in demo mode this parameter has value 'demoMode'
			type: 'solid',		// The type of bar bady: 'solid' or 'discrete'
            orient: 'hor',		// Orientation of widget. 'hor' - horizontal, or 'vert' - vertical. Default is 'hor'
            aligning: 'right',	// Direction of axis "value". Depends on the parameter "orient". May have values: "up", "down", "right", "left". Default is 'right'
			thickness: 10,		// The height or width of the element, depending on its orientation, as a percentage of its length or height, respectively.
			isScale: 1,			// Enables scale drawing, default is 1.
			scalePosition: 'bottom',	// Depends from 'orient', 'alighing'. May contain one from next values: 'top','right','bottom', or 'left'
			scaleOffset:15,		// An offset of scale base line from center axe of SmartBar. Depends from 'orient and thickness'
			majorMLength: 3, 	// The length of main marks on the scale in percentage of 'thickness'. Default is 3
			minorMLength: 1.5, 	// The length of additional marks on the scale in percentage of 'thickness'. Default is 1.5

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

			varFontFamily:	'Arial, DIN Condensed, Noteworthy, sans-serif',
			varFontSize:	'12px',
			varFontStretch:	'condensed',
			varFontColor:	'#666666',
			varStrokeColor: 'red', // The default is stroke color!
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
			'isScale',
			'scaleOffset',
			'majorMLength',
			'minorMLength',
			'varIsShadow',
            'varStrokeWidth',
            'varOpacity'
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
        this._o = Object.assign({}, SmartBar.defOptions(), options || {});
        // validate all properties
        SmartBar.convertNumericProps(this._o);

        this._mode      = options.mode || null; // in case of 'custom elements' initialization the 'mode' equals 'html'
        this.id         = id;   // <g id> inside of <svg>
        this._root      = options.context || null;  // svg root element
        this._svgroot   = this._root.getElementById(this.id);    // reference on insertion node
        this._svgdoc    = this._svgroot.ownerDocument;

        this._data      = null; // last received from data provider (server + target)
        this._body      = null; // the SmartBar body
        this._active    = null; // the active element
		this._intervalCounter = 0;
		this._inited	= false;	// call to init() set this flag to true. after that we can build, rebuild and activate....

        const style = SmartBars.addElement('style', {}, this._root, this._svgdoc);
        style.textContent = txtStyle;
        this._defs = SmartBars.addElement('defs', {}, this._root, this._svgdoc);
		this._defs.innerHTML = window.SmartPolygons.defs;
		// in case of html insertion, the options.mode == 'html' is defined and
		// the buiding process is divided on two parts:  constructor() and init() from connectedCallback.
		// in case of creating SmartPolygon object from Javascript, lets do all needed work in one place...
		if (!this._mode) {
			// store containerId: ref on SmartPolygon element inside SmartPolygons collection for JS access
			window.SmartBars.set(this.id, this);
			this.init();
		}
    }

	_buildActive(data = null) {
		if (!this._inited) {
			console.log('_build() -> Nothing todo, not yet initialized!');
			return;
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
			this._bodyActive.removeEventListener('click', this._onClick);
			this._bodyActive.removeEventListener('mouseover', this._onShowTooltip);
			this._bodyActive.removeEventListener('mousemove', this._onMoveTooltip);
			this._bodyActive.removeEventListener('mouseout', this._onHideTooltip);

			this._svgroot.removeChild(this._bodyActive);
            this._svgroot.removeChild(this._body);
		}
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
            SmartBar.convertNumericProps(options);
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
			// todo: check radius and correct it with width and height parameters if they exists!
			this._rect = {
				x: 0,
				y: 0,
				width:  this._o.radius * 2,
				height: this._o.radius * 2
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
						window.SmartSmartBars.update('bar-wdg', data);
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
						"link": "http://www.google.com/"
					}
				};
				this._data.clear();
				this._data = new Set([fakeData.target]);
				this._buildActive(this._data);
				if (this._o.role === 'demoMode') {
					window.SmartBars.update('bar-wdg', data);
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
					window.SmartBars.update('bar-wdg', data);
				}
			}
		}
	}
	generateExData() {
		const max = 100;
		const value = Math.abs(Math.floor(Math.random() * (100 + 1)) + 0);
		const color = value < 30 ? 'blue' : (value < 50 ? 'green' : (value < 70 ? 'yellow' : 'red'));
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
		return SmartBar.getCustomParams(this._o, filter);	// 'dirty' means: get only changed parameters
	}
	setParam(name, value) {
		if (this.dontRespond) {	// don't respond on changing parameters when updating user panels in UI Builder (for example)
			return;
		}
		const opt = {};
		opt[name] = value;
		// convert to numbers specified by name property
		SmartBar.convertNumericProps(opt, name);

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
			this._o = Object.assign({}, SmartBar.defOptions(), options);
			this._build();
		}
	}
	setParams(options = {}, rebuild = true) {
		let needRebuild = false;
		if (!options) {
			return false;
		}
		// convert all known properties to numbers
		SmartBar.convertNumericProps(options);
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

class SmartBarElement extends HTMLElement {
	constructor(id) {
		super();

		// create SmartBars collection only once!
		SmartBars.initSmartPolygons();

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

		const svgId = `${this.id}--stbar`;
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
		this._stbar = new SmartBar('mainG', {context: this._svgroot, mode: 'html'});
		// store containerId: ref on SmartPieElement element inside SmartPies collection for JS access
		window.SmartBars.set(this._id, this);
	}
	getCtrl() {
		return this._stbar;
	}

	// attributes changing processing
	static get observedAttributes() {
		return SmartBar.getCustomProperties();
	}
	attributeChangedCallback(name, oldValue, newValue) {
		// update own property
		const paramName = SmartWidgets.customProp2Param(name);
		this._o[paramName] = newValue;
		this._stbar.setParam(paramName, newValue);
	}

	// connect and disconnect from html
    connectedCallback() {
		// getting properties in form 'stpgn-XXX' and 'sttip-var-XXX' from styles
		const compStyle = getComputedStyle(this);
		const customProp = SmartBar.getCustomProperties();
		for (let n = 0; n < customProp.length; n++) {
			const prop = `--stpgn-${customProp[n]}`;
			const propKey = SmartWidgets.customProp2Param(`${customProp[n]}`);
			let propVal = compStyle.getPropertyValue(prop);
			if (propVal) {
				propVal = propVal.trimLeft();
				this._o[propKey] = propVal;
			}
		}
		// all specific work will be done inside
		this._stbar.init(this._o);

		// resize own svg
		this._svgroot.setAttribute('height', this._stbar._rect.height);
		this._svgroot.setAttribute('width', this._stbar._rect.width);
		this._svgroot.setAttribute('viewBox', `0 0 ${this._stbar._rect.width} ${this._stbar._rect.height}`);

    }
    disconnectedCallback() {
		window.SmartPolygons.unset(this._id);
		this._stbar = null;
		this._root = null;
		this._o = null;
    }

}
window.customElements.define('smart-ui-bar', SmartBarElement);
// thanks 'https://online.flippingbook.com/view/302153/676/'



