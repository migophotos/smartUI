/**
 * @copyright Copyright © 2018 ... All rights reserved.
 * @author Michael Goyberg
 * @license
 * @version   1.0
 
 */

class SmartPolygons extends SmartWidgets {
    static initSmartPolygons(context = {}) {
        if (!window.SmartPolygons) {
            window.SmartPolygons = new SmartPolygons();
        }
        window.SmartPolygons.init(context);
    }
    static addElement(type, params, parent=null, doc=null) {
        return super.addElement(type, params, parent, doc);
    }

    constructor() {
        super();

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
        /// todo....
	}
}

class SmartPolygon {
	/**
	 * Returns an array of custom properties. Each of the custom property has corresponding declarative attribute in form first-second == prefix-first-second
	 * and option parameter with name "firstSecond".
	 * for example: '--sttip-title-format' property equals to attribute 'title-format' and options.titleFormat parameter, but
	 * '--sttip-template' property equals to TEMPLATE attribute and options.template parameter.
	 */
	static getCustomProperties() {
		return [
            'orient',           // Orientation of widget. 'hor' - horizontal, or 'vert' - vertical. Default is 'hor'
            'align',            // Direction of axis "value". Depends on the parameter "orientation". May have values: "up", "down", "right", "left". Default is 'right'
            'rotation',         // Degrees. Positive values rotate the widget in the direction of the clockwise movement. Default is '-90'
            'start-angle',      // Degrees. Default is 45
			'radius',			// This parameter sets the radius of inscribed circle. It should not be more than half the
								// height or width of the widget. During initialization or installation of parameters,
                                // all disputed parameters are checked and corrected automatically. Default is 50
            'inner-radius',     // radius for stars
			'width',			// The width of the widget. The value of the “radius” parameter will be corrected if it
								// exceeds half the value of this parameter, or the parameter “height” if its value is less than this parameter.
			'height',			// The height of the widget. The value of the “radius” parameter will be corrected if it exceeds half the value
                                // of this parameter, or the parameter “width” if its value is less than this parameter.
            'angles-number',    // The number of corners of a regular polygon. Default is 4
			'position',			// The value describes location of tooltip or legend window Default value is 'rt' which means right-top conner of element.
			'ttip-template',	// Default value for this property is 'pie', wich means the using of internal SmartTooltip pie template definition.
								// Currently only 4 types of templates are implemented: 'pie', 'simple', 'image' and 'iframe'.
            'max-value',        // the maximum value. If 0 then 100% is a maximum.
            'is-star',          // Enables drawing start instead of regular polygon
			'is-animate',		// Allows to animate the moment of receiving the data array.
			'is-link',			// Allows to disable going to the link by ckick on the sector. Used in example. The default is 1
			'is-tooltip',		// Allows displaying a tooltip next to the mouse pointer. Reproducing legends, hints are not displayed and vice versa.
			'is-emulate',		// Allows automatic emulation of the process of receiving an array of data.
			'is-run',			// Starts the internal mechanism of sending requests to the server, if there are parameters: “server”, “provider”, “user”
			'interval',			// Determines the interval of sending requests to the server in seconds (if the value is less than 2000)
								// or in milliseconds (if the value is greater than 1999)
            'server',
            'provider',
            'user',				// These parameters determine the URL of the request to the server

            'is-fill-bkg',      // Enables fill and color the background of polygon. Default is 1
            'if-fill-stroke',   // Enables draw colored stroke around of polygon. Default is 0
			'var-is-shadow',	// Allows shadow for widget, legend and tooltip
            'var-stroke-width',	// Sets the width of the widget's stroke, and tooltip, which also depend on the template. Default is 1
			'var-opacity'		// Sets the transparency of the widget, the legend (and hints, which also depend on the template)
        ];
    }
    static defOptions() {
        return {
            orient: 'hor',      // Orientation of widget. 'hor' - horizontal, or 'vert' - vertical. Default is 'hor'
            align: 'right',     // Direction of axis "value". Depends on the parameter "orientation". May have values: "up", "down", "right", "left". Default is 'right'
            rotation: 0,      // Degrees. Positive values rotate the widget in the direction of the clockwise movement. Default is '-90'
            startAngle: 45,     // Degrees. Default is 45
			radius: 50,			// This parameter sets the radius of inscribed circle. It should not be more than half the
								// height or width of the widget. During initialization or installation of parameters,
                                // all disputed parameters are checked and corrected automatically. Default is 50
            innerRadius: 0,     // inner radius for starts
			width: 0,			// The width of the widget. The value of the “radius” parameter will be corrected if it
								// exceeds half the value of this parameter, or the parameter “height” if its value is less than this parameter.
			height: 0,			// The height of the widget. The value of the “radius” parameter will be corrected if it exceeds half the value
                                // of this parameter, or the parameter “width” if its value is less than this parameter.
            anglesNumber: 4,    // The number of corners of a regular polygon. Default is 4
			position: 'rt',     // The value describes location of tooltip window Default value is 'rt' which means right-top conner of element.
			ttipTemplate: 'simple',// Default value for this property is 'simple, wich means the using of internal SmartTooltip pie template definition.
								// Currently only 4 types of templates are implemented: 'pie', 'simple', 'image' and 'iframe'.
            maxValue: 0,        // the maximum value. If 0 then 100% is a maximum.
            isStar: 0,          // Enables drawing start instead of regular polygon
			isAnimate: 1,		// Allows to animate the moment of receiving the data array.
			isLink: 1,			// Allows to disable going to the link by ckick on the sector. Used in example. The default is 1
			isTooltip: 1,		// Allows displaying a tooltip next to the mouse pointer. Reproducing legends, hints are not displayed and vice versa.
			isEmulate: 1,		// Allows automatic emulation of the process of data receiving.
			isRun: 1,			// Starts the internal mechanism of sending requests to the server, if there are parameters: “server”, “provider”, “user”
			interval: 2000,     // Determines the interval of sending requests to the server in seconds (if the value is less than 2000)
								// or in milliseconds (if the value is greater than 1999)
            server: './widgets/smartPie/',
            targets: ['answer.json'],
            user: '',
                    
            isFillBkg: 1,       // Enables fill and color the background of polygon. Default is 1
            isFillStroke: 0,    // Enables draw colored stroke around of polygon. Default is 0
            varStrokeColor: 'red',
            varFillColor: 'rgb(255, 205, 136)',
			varIsShadow: 1,     // Allows shadow for widget, legend and tooltip
            varStrokeWidth: 1,	// Sets the width of the widget's stroke, and tooltip, which also depend on the template. Default is 1
			varOpacity: 1		// Sets the transparency of the widget, the legend (and hints, which also depend on the template)
        }
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
            'varStrokeWidth',
            'varOpacity',
        ];
        return SmartWidgets.convertToNumbers(options, numericProps, propName);
    }

	/**
	 * Returns an array of custom properties in form of parameter names in case of options equals null.
	 * If 'options' is specified, then this functions returns the filled object.
	 * for example, each property in form 'first-second-third' will be converter to parameter name 'firstSecondThird'
	 * and in case of specified options:
	 * params = {
	 * 	firstSecondThird: options.firstSecondThird
	 * } will be returned
	 */
	static getCustomParams(options = null) {
		const props = SmartPolygon.getCustomProperties();		// get an array of custom properties
		const paramsArray = [];
		for (let prop of props) {
			paramsArray.push(SmartPolygons.customProp2Param(prop));
		}
		if (!options) {
			return paramsArray;
		}
		const params = {};
		for (let prop of paramsArray) {
			if (typeof options[prop] !== 'undefined') {
				params[prop] = options[prop];
			}
		}
		return params;
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
        this._o = Object.assign({}, SmartPolygon.defOptions(), options || {});
        // validate all properties
        SmartPolygon.convertNumericProps(this._o);

        this._mode      = options.mode || null; // in case of 'custom elements' initialization the 'mode' equals 'html'
        this._o.id      = id;   // <g id> inside of <svg>
        this._root      = options.context || null;  // svg root element
        this._svgroot   = this._root.getElementById(this._o.id);    // reference on insertion node
        this._svgdoc    = this._svgroot.ownerDocument;

        this._data      = null; // last received from data provider
        this._body      = null; // the polygons body
        this._active    = null; // the active element (circle in clip)
        this._intervalCounter = 0;

        const style = SmartPolygons.addElement('style', {}, this._root, this._svgdoc);
        style.textContent = txtStyle;
        this._defs = SmartPolygons.addElement('defs', {}, this._root, this._svgdoc);
        this._defs.innerHTML = window.SmartPolygons.defs;
		// in case of html insertion, the options.mode == 'html' is defined and
		// the buiding process is divided on two parts:  constructor() and init() from connectedCallback.
		// in case of creating SmartPolygon object from Javascript, lets do all needed work in one place...
		if (!this._mode) {
			// store containerId: ref on SmartPolygon element inside SmartPolygons collection for JS access
			window.SmartPolygons.set(this._o.id, this);
			this.init();
		}
    }
	/// Internal functions. Please don't use from outside!
	// The normalized radius of regular polygon must be recalculated after changing some optional parameters, such as: radius and stroke-width
	_recalculateNormRadius() {
		this._normRadius = this._o.radius - this._o.varStrokeWidth/2;
		this._normRadius = this._normRadius < 0 ? 0 : this._normRadius;
		if (this._o.isAnimate) {
			this._normRadius -= this._normRadius / 5;
		}
	}
    _buildActive(data = null) {
        if (!this._active) {    // yet not ready
            return;
        }
        const elem = this._active.firstElementChild;
        if (elem) {
			elem.removeEventListener("click", this._onClick);
			elem.removeEventListener("mouseover", this._onShowTooltip);
			elem.removeEventListener("mousemove", this._onMoveTooltip);
            elem.removeEventListener("mouseout", this._onHideTooltip);
            this._active.removeChild(this._activeG.firstElementChild);
        }
        
    }
    _buildBody() {
        if (this._body) {
            this._svgroot.removeChild(this._body);
        }
        const centerPt = {
            x: this._o.rect.x + this._o.radius,
            y: this._o.rect.y + this._o.radius,
        }

        // add base element to svg
        this._body = SmartPolygons.addElement('polygon', {
            id: 'body',
            class: 'body',
            stroke: `${this._o.varStrokeColor}`,
            fill: `${this._o.varFillColor}`,
            'stroke-width': `${this._o.varStrokeWidth}`,
            'stroke-opacity': `${this._o.varOpacity}`,
            'fill-opacity':  `${this._o.varOpacity}`,
            points: this._buildPolygon(this._o.anglesNumber, centerPt.x, centerPt.y, this._normRadius, this._o.startAngle, this._o.rotation, 1, this._o.isStar ? this._o.innerRadius : 0)
        }, this._svgroot, this._svgdoc);
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
     * @param {number} star Inner radius for star 
     */
	_buildPolygon(n, x, y, r, angle, rotate, counterclockwise, star) {
        counterclockwise = counterclockwise || 0;
        star = star || 0;
        angle = angle || 0;
        if (star) {
            angle /= 2;
            n *= 2;
        }
        angle = (angle + rotate) * Math.PI / 180;  // convert degrees to radians
        let i = 0;
        let points;
        if (star) {
            points = `${x + star * Math.sin(angle)},${y - star * Math.cos(angle)}`;
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
                    points += ` ${x + star * Math.sin(angle)},${y - star * Math.cos(angle)}`;
                }
            } else {
                points += ` ${x + r * Math.sin(angle)},${y - r * Math.cos(angle)}`;
            }
		}
        return points;
    }

	// event listeners
	_onShowTooltip(evt) {
		if (!this._o.isTooltip) {
			return;
        }
        const data = {
            id: this._o.id,
            x: evt.clientX,
            y: evt.clientY,
            title: this._data,
            options: {
                isRun:  this._o.isRun,
                location: this._body.getBoundingRect(),
                delayOut: 1000,
                showMode: 'pinned',
                position: this._o.position
            }
        };
        SmartTooltip.showTooltip(data, evt);
    }
	_onMoveTooltip(evt) {
		SmartTooltip.moveTooltip(evt);
	}
	_onHideTooltip(evt) {
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

    /// API
    getCtrl() {
        return this;
    }
    init(options = null) {
        if (options) {
            // validate and merge with own _o
            SmartPolygon.convertNumericProps(options);
            this._o = Object.assign({}, this._o, options);
        }
        const rc = this._svgroot.firstElementChild;
        this._o.rect = rc.getBBox();
        rc.setAttribute('display', 'none');
        if (!this._mode) {
			this._o.radius  = Math.min(this._o.rect.width, this._o.rect.height) / 2;
        } else {
			// calculate svg rectangle and coordinates
			// todo: check radius and correct it with width and height parameters if they exists!
			this._o.rect = {
				x: 0,
				y: 0,
				width:  this._o.isLegend ? this._o.radius *2 + 220 : this._o.radius * 2,
				height: this._o.isLegend ? this._o.radius * 2 + 50 : this._o.radius * 2
			};

        }
		// calculate normalized radius
        this._recalculateNormRadius();
        this._buildBody();

        this._data = new Set();
		if (this._o.ttipTemplate) {
			// call static function (it will instantinate SmartTooltip and load template)
			SmartTooltip.initTooltip(this._o.id, this._o.ttipTemplate);
		}
		this._body.addEventListener('click', this._onClick);
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
			SmartWidgets._httpGet(this._o.server + this._o.targets[0])
			.then(response => {
				// if (this._o.isAnimate) {
				// 	this._body.setAttribute('style', `/* r:${this._normRadius}; */`);

				// 	this._body.setAttribute("r", this._normRadius + this._normRadius/5);
				// 	this._body.setAttribute('fill-opacity', 0);
				// 	this._body.setAttribute('stroke-opacity', 0);
				// }
				var data = JSON.parse(response);
				this._data.clear();
				this._data = new Set(data.targets);
				for(let value of this._data) {
					if (value.type === 'description') {
						this._data.delete(value);
						break;
					}
				}
				this._buildActive(this._data);
			})
			.catch(error => {
				console.error(error); // Error: Not Found
			});
		} else { // show external or emulated data
			let options = null;
			if (typeof data.cfg === 'object') {
				options = data.cfg;
			}
			if (typeof data.opt === 'object') {
				options = data.opt;
			}
			let needRebuild = this.setParams(options, false);
			if (typeof data.targets === 'object' && typeof data.targets.length === 'number' && data.targets.length) {
				// if (this._o.isAnimate) {
				// 	this._body.setAttribute('style', `/* r:${this._normRadius}; */`);

				// 	this._body.setAttribute("r", this._normRadius + this._normRadius/5);
				// 	this._body.setAttribute('fill-opacity', 0);
				// 	this._body.setAttribute('stroke-opacity', 0);
				// }
				this._data = new Set(data.targets);
				needRebuild++
			}
			if (needRebuild) {
				this._buildActive(this._data);
			}
		}
	}
	generateExData() {
		var dataEx = {
			"opt": {
				"lcolor": "red",
				"width": "3"
			},
			"targets": [
				{
					"uuid": "uuid_ex_Target1",
					"tooltip":  "Missing at work",
					"value": "42",
					"color": "green",
					"link": "http://www.google.com/?target1",
                }
			],
			"error": {
				"message": "null",
				"code": "0"
			}
		}
		return dataEx;
	}
	getParams() {
		return SmartPolygon.getCustomParams(this._o);
	}
	setParam(name, value) {
		const opt = {};
		opt[name] = value;
		// convert to numbers known properties
		SmartPolygon.convertNumericProps(opt, name);

		if (this._body) {
			this.setParams(opt);
		}
	}
	setParams(options={}, rebuild=true) {
		let val, needRebuild = false;
		for (let key in options) {
			switch (key) {
				case 'inner-radius':
					this._o.innerRadius = option[key];
					needRebuild++;
					break;
				case 'rotation':
					this._o.rotation = options[key];
					needRebuild++;
					break;
				case 'startAngle':
					this._o.startAngle = options[key];
					needRebuild++;
					break;
				case 'isEmulate':
					this._o.isEmulate = options[key];
					break;
				case 'varFillColor':
					val = options[key];
					this._o.varFillColor = val;
					this._body.setAttribute('fill', val);
					break;
				case 'varStrokeColor':
					val = options[key];
					this._o.varStrokeColor = val;
					this._body.setAttribute('stroke', val);
					break;
				case 'radius':
					val = Number(options[key]);
					this._recalculteNormRadius();
					needRebuild++;
					break;
				case 'varStrokeWidth':
					val = Number(options[key]);
					this._o.varStrokeWidth = val;
					this._recalculteNormRadius();
					needRebuild++;
					break;
				case 'varOpacity':
					val = Number(options[key]);
					this._body.setAttribute('stroke-opacity', val);
					this._body.setAttribute('fill-opacity', val);
					this._o.varOpacity = val;
					break;
				case 'interval':
					val = Number(options[key]);
					let minInterval = 500;
					let animAddText = 'This';
					if (this._o.isAnimate) {
						minInterval = 3000
						animAddText = 'In case of animation this';
					}
					if (val < minInterval) {
						val = minInterval;
						console.log(`It is not recommended to set the data update interval too short.
						${animAddText} value was forcibly limited to ${minInterval} ms!!`);
					}
					this._o.interval = val;
					break;
				case 'isAnimate':
					val = Number(options[key]);
					if (val) {	// in case of animation enabled, duration of interval must be greater than 3 sec!
						this._o.interval = (this._o.interval < 3000 ? 3000 : this._o.interval);
						this._recalculteNormRadius();
					}
					this._o.isAnimate = val;
					this._o.isAnimate ? this._body.classList.add('animated') : this._body.classList.remove('animated');
					break;
				case 'isRun':
					this.run(Number(options[key]));
					break;
				case 'stop':
					this.run(0);
					break;
				case 'server':
					this._o.server = options[key];
					break;
				case 'targets':
					this._o.targets = options[key];
					break;
				case 'user':
					this._o.user = options[key];
					break;
			}
		}
		if (rebuild && needRebuild) {
            this._buildBody();
			this._buildActive(this._data);
		}
		return needRebuild;
	}
}

class SmartPolygonElement extends HTMLElement {
	constructor(id, options= { mode:'html' }) {
		super();

		// create SmartPolygons collection only once!
		SmartPolygons.initSmartPolygons();

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
			throw new Error('Unfortunately, your browser does not support shadow DOM v1. Think about switching to a Chrome browser that supports all new technologies!');
		}
		this._id = this.getAttribute('id') || id;
		this._o = {};

		this._root = this.attachShadow({mode: 'open'});

		const svgId = `${this.id}--stpolygon`;
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
		this._stpgn = new SmartPolygon(`mainG`, {context: this._svgroot, mode: 'html'});
		// store containerId: ref on SmartPieElement element inside SmartPies collection for JS access
		window.SmartPolygons.set(this._id, this);
	}
	getCtrl() {
		return this._stpgn;
	}

	// attributes changing processing
	static get observedAttributes() {
		return SmartPolygon.getCustomProperties();
	}
	attributeChangedCallback(name, oldValue, newValue) {
		// update own property
		const paramName = SmartWidgets.customProp2Param(name);
		this._o[paramName] = newValue;
		this._stpgn.setParam(paramName, newValue);
	}

	// connect and disconnect from html
    connectedCallback() {
		// all specific work will be done inside
		this._stpgn.init(this._o);
		// resize own svg
		this._svgroot.setAttribute('height', this._stpgn._o.rect.height);
		this._svgroot.setAttribute('width', this._stpgn._o.rect.width);
		this._svgroot.setAttribute('viewBox', `0 0 ${this._stpgn._o.rect.width} ${this._stpgn._o.rect.height}`);

    }
    disconnectedCallback() {
		// remove element from smartpies.heap!!
		//....todo

		// this._data.clear();
		// this._legend.length = 0;
		// this._body.removeEventListener('click', this._onClick);
		// this._body.removeEventListener('transitionend');

		// this._activeG  	= null;
		// this._passiveG 	= null;
		// this._body 		= null;
    }

}
window.customElements.define('smart-polygon', SmartPolygonElement);
// thanks 'https://online.flippingbook.com/view/302153/676/'

