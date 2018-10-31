/* eslint-disable */

/**
 * http://qaru.site/questions/45461/how-to-calculate-the-svg-path-for-an-arc-of-a-circle
 * https://codepen.io/dudleystorey/pen/LNdaZX
 * https://webformyself.com/krugovye-elementy-interfejsa-pri-pomoshhi-html5-css-js-i-svg-chast-1/
 *
 */
class SmartPies {
	constructor() {
		this._version = '2.0';
		this._heap = new Map();
		this._initialized = false;
		this._timeout = 100;
	}
	static isNewSite() {
		 return (typeof Ext != 'undefined' && typeof Site != 'undefined');
	}
	// get href link paramter to new or old site
	static getLink(link) {
		if (!SmartPies.isNewSite() || !link || link == '') {
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
			legend: '$TARGET_NAME',
		}
		return df;
	}

	static initSmartPies(context = {}) {
		if (!window.SmartPies) {
			window.SmartPies = new SmartPies();
		}
		window.SmartPies.init(context);
	}

	// creates svg element, sets attributes and append it to parent, if it not null
	// the new element returned
	// usage example: createElement('circle',{cx:50,cy:50,r:10})
	// special case for 'text' element creation: uppend pair text:'any text...' into params object
	// and this text will be automathically appended to 'text' element
	static addElement(type, params, parent=null, doc=null) {
		if (!doc) { // try to main document in case of doc not specified
			if (parent) {
				doc = parent.ownerDocument;
			} else {
				doc = window.document;
			}
		}
			// Fix for error: <circle> attribute r: A negative value is not valid!
		if (type == 'circle' && params.r < 0) {
			params.r = 0;
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
	};

	// calculate and draw segment by center. radius, start and end angles
	static polarToCartesian(centerX, centerY, radius, angleInDegrees, rotation) {
		var angleInRadians = ((angleInDegrees + rotation) * Math.PI) / 180.0;

		return {
			x: centerX + (radius * Math.cos(angleInRadians)),
			y: centerY + (radius * Math.sin(angleInRadians))
		};
	}
	static describeArc(isLarge, x, y, radius, startAngle, endAngle, rotation, isSector=true) {
		let largeArc = 1;
		let arcSweep = 0;

		let s = startAngle % 360;
		let e = endAngle % 360;

		// if (isLarge) {
		// 	largeArc = 0;
		// }

		const start = SmartPies.polarToCartesian(x, y, radius, s, rotation);
		const end = SmartPies.polarToCartesian(x, y, radius, e, rotation);

		arcSweep = (e - s + (s > e) * 360 >= 180) * 1; //isLarge ? (e - s + (s > e) * 360 < 180) * 1 : (e - s + (s > e) * 360 >= 180) * 1;
		if (isSector) {
			return [
				"M", start.x, start.y,
				"A", radius, radius, 0, arcSweep, largeArc, end.x, end.y,
				"L", x, y,
				"Z"
			].join(" ");
		} else {
			return [
				"M", start.x, start.y,
				"A", radius, radius, 0, arcSweep, largeArc, end.x, end.y
			].join(" ");
		}
		return d;
	};

	// static _describeArc(as=0, x, y, radius, startAngle, endAngle, isSector=true) {
	// 	var start = SmartPies.polarToCartesian(x, y, radius, endAngle);
	// 	var end = SmartPies.polarToCartesian(x, y, radius, startAngle);
	// 	var arcSweep;
	// 	if (!as)
	// 		arcSweep = endAngle - startAngle <= 180 ? "0" : "1";
	// 	else
	// 		arcSweep = endAngle - startAngle <= 180 ? "1" : "0";

	// 	if (isSector) {
	// 		return [
	// 			"M", start.x, start.y,
	// 			"A", radius, radius, 0, arcSweep, 0, end.x, end.y,
	// 			"L", x, y,
	// 			"Z"
	// 		].join(" ");
	// 	} else {
	// 		return [
	// 			"M", start.x, start.y,
	// 			"A", radius, radius, 0, arcSweep, 0, end.x, end.y
	// 		].join(" ");
	// 	}
	// }

	// http get promis
	static 	_httpGet(url) {
		return new Promise(function(resolve, reject) {
			var xhr = new XMLHttpRequest();
			xhr.open('GET', url, true);

			xhr.onload = function() {
				if (this.status == 200) {
					resolve(this.response);
				} else {
					var error = new Error(this.statusText);
					error.code = this.status;
					reject(error);
				}
			};

			xhr.onerror = function() {
				reject(new Error("Network Error"));
			};
			xhr.send();
		});
	}

	_intervalTimer() {
		this._interval = setInterval(() => {
			for (let entry of this._heap.entries()) {
				let pie = entry[1].getCtrl();
				if (pie && pie._o.isRun) { // realtime updates are enabled
					let ic = pie.intervalCounter;
					ic = ic - this._timeout;
					pie.intervalCounter = ic;	// it will restored automatically to _o.interval, if <= 0
					if (ic <= 0) {
						let data = null, updMode = pie.isEmulate();	// 1 - enabled, 0 - disabled, -1 - nulled
						if (updMode) {
							data = pie.generateExData();
							if (updMode === -1) {	// clear all data and stop emulation
								pie.emulate(0);
							}
						}
						pie.update(data);
					}
				}
			}
		}, 100);
	}

	init(dashboardContext = {}) {
		if (dashboardContext) {
			this.lang = dashboardContext.lang || "ru";
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

	get (id) {
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
	initCtrl(id, options) {
		let pie = this.get(id);
		if (!pie) {
			pie = new SmartPie(id, options);
			if (pie) {
				pie.init(options);
			}
		}
	}
	unInitCtrl(id) {

	}

	getDataFormat(id) {
		return SmartPies.defaultDataFormat;
	}

	getParams(id) {
		const pie = this.get(id);
		if (pie) {
			return pie.getParams()
		}
		return null;
	}
	setParams(id, options) {
		const pie = this.get(id);
		if (pie) {
			return pie.setParams(options);
		}
		return false;
	}
	showParams(id, options, callbackInfo) {
		console.log('Function deprecated. Please dont use it more!');
	}

	emulate(id, mode) { // 0/-1/1 - disabled/nulled/enabled
		const pie = this.get(id);
		if (pie) {	// all checks inside!
			pie.emulate(mode);
		}
	}
	run(id) {
		const pie = this.get(id);
		if (pie)
			pie.run(true);
	}
	stop(id) {
		const pie = this.get(id);
		if (pie)
			pie.run(0);
	}
	update(id, data={}) {	// JSON object with defined progress:[]. In case of cfg={}, or opt:{} defined
							// this section will be processed before progress=[]
							 // opt or cfg objects may contain any known optional attributes,
							 // such as: lang, type, sortBy, varOpacity, lcolor (legend color), legend, interval (ms), run/stop, server, targets, user, ...
		const pie = this.get(id);
		if (pie)
			pie.update(data);
	}
};

class SmartPie {
	/**
	 * Returns an array of custom properties. Each of the custom property has corresponding declarative attribute in form first-second == prefix-first-second
	 * and option parameter with name "firstSecond".
	 * for example: '--sttip-title-format' property equals to attribute 'title-format' and options.titleFormat parameter, but
	 * '--sttip-template' property equals to TEMPLATE attribute and options.template parameter.
	 */
	static getCustomProperties() {
		return [
			'type',				// temporary for backward compatibility vith v1.0
			'input-data',		// the type of input data. 'percents', 'value', 'auto'. The 'auto' is default
			'input-mode',		// how to interpret an input data. 'flat', 'rel', p-ch ('0.1, 0.2,...1.0, 1.1, ...), 'json' equivalent to 'rel'
			'view-type',		// 'donut', 'zwatch, 'pie'
			'view-mode',		// 'comp', 'comp-100'

			'rotation',			// Positive values rotate the widget in the direction of the clockwise movement,
			'start-angle',		// The starting angle to start drawing the widget segment. 0 degrees are at 12 o'clock. Segment drawing direction - clockwise.
			'end-angle',		// End angle of the widget segment rendering. When the starting and ending angles are equal, a full circle is drawn.
			'inner-radius',		// Inner radius of a donut hole. A value of 0 replaces the value of the “viewType”
								// parameter from “donut” to “pie”! Any non-zero parameter value switches the
								// “viewType” parameter value to “donut”. The maximum value of the parameter must
								// not exceed the value of the “radius” parameter.
								// negative values - in the counterclockwise direction.
			'radius',			// This parameter sets the radius of the widget. It should not be more than half the
								// height or width of the widget. During initialization or installation of parameters,
								// all disputed parameters are checked and corrected automatically.
			'width',			// The width of the widget. The value of the “radius” parameter will be corrected if it
								// exceeds half the value of this parameter, or the parameter “height” if its value is less than this parameter.
			'height',			// The height of the widget. The value of the “radius” parameter will be corrected if it exceeds half the value
								// of this parameter, or the parameter “width” if its value is less than this parameter.
			'sort-by',			// Sort parameter for multiple data. May contains one of the data parameters name: 'asis', 'name', 'value', 'color', 'state'. the default is 'value'
			'sort-dir',			// sorting direction parameter. the default value is '1', wich means from low to high. Possible values: 0, 1.
			'is-animate',		// Allows to animate the moment of receiving the data array.
			'is-link',			// Allows to disable going to the link by ckick on the sector. Used in example. The default is 1
			'is-legend',		// Allows to display the legend on the defined side of the widget
			'is-tooltip',		// Allows displaying a tooltip next to the mouse pointer. Reproducing legends, hints are not displayed and vice versa.
			'position',			// The value describes location of tooltip or legend window Default value is 'rt' which means right-top conner of element.
			'ttip-template',	// Default value for this property is 'pie', wich means the using of internal SmartTooltip pie template definition.
								// Currently only 4 types of templates are implemented: 'pie', 'simple', 'image' and 'iframe'.
			'ttip-type',		// 'alldata' or 'curtarget'
			'is-emulate',		// Allows automatic emulation of the process of receiving an array of data.
			'is-run',			// Starts the internal mechanism of sending requests to the server, if there are parameters: “server”, “provider”, “user”
			'interval',			// Determines the interval of sending requests to the server in seconds (if the value is less than 2000)
								// or in milliseconds (if the value is greater than 1999)
			'server',
			'provider',
			'user',				// These parameters determine the URL of the request to the server

			'var-is-shadow',	// Allows shadow for widget, legend and tooltip
			'var-font-family',
			'var-font-size',
			'var-font-stretch',
			'var-font-color',	// Are the font definition parameters. Will be derived from host elemet in case if not specified.
			'var-stroke-color',	// Sets the widget's stroke color, legend and tooltip.
			'var-stroke-width',	// Sets the width of the widget's stroke, legend (and hints, which also depend on the template).
			'var-fill-color',	// Sets the fill color for the widget's background, legend (and hints, which also depend on the template).
			'var-opacity'		// Sets the transparency of the widget, the legend (and hints, which also depend on the template)
		];
	}
	static defOptions() {	// see getCustomProperties() for descriptions
		return {
			type:			'flat' 		/* donut, rel(relatives), flat, zWhatch or 1.0, 1.1, 1.2, 1.3, 1.4, ..., 1.n, 1.all */,

			inputData:		'auto',
			inputMode:		'rel',		// as type
			viewType:		'pie',
			viewMode:		'comp',

			rotation: 		-90,
			startAngle: 	0,
			endAngle: 		0,
			innerRadius: 	0,
			radius: 		50,
			width:			0,
			height:			0,
			sortBy:			"asis", 		/* asis, states, values, colors, names */
			sortDir: 		1,
			isAnimate: 		1,
			isLink:			1,
			isLegend: 		0,

			isTooltip:		1,
			ttipTemplate: 	'pie',
			ttipType: 		'curTarget',
			isEmulate: 		0,
			isRun:			0,
			interval: 		3500,

			server: 		'./widgets/smartPie/',
			targets: 		['answer.json'],
			user: 			'',

			varFontFamily:	'Arial, DIN Condensed, Noteworthy, sans-serif',
			varFontSize:	'12px',
			varFontStretch:	'condensed',
			varFontColor:	'#666666',
			varStrokeColor: 'red',
			varStrokeWidth: 2,
			varFillColor: 	'rgb(255, 205, 136)',
			varOpacity: 	1
		}
	}
	/**
	 * Converts known numeric property (ies) to numbers
	 * @param {object} optObj reference to an options object
	 * @param {string} prop the property name which value needs (in case of it known) to be validated. If null, all properties will be validated.
	 */
	static convertNumericProps(optObj = {}, prop = null) {
		if (typeof optObj !== 'object') {
			throw new ReferenceError("options object hasn't been initialized!");
		}

		const numericProps =  [
			'rotation',
			'startAngle',
			'endAngle',
			'innerRadius',
			'radius',
			'width',
			'height',
			'sortDir',
			'isAnimate',
			'isLink',
			'isLegend',
			'isEmulate',
			'isRun',
			'isTooltip',
			'interval',
			'varStrokeWidth',
			'varOpacity'
		];
		let count = 0;
		for (let np of numericProps) {
			if (prop) {
				if (np === prop && optObj.hasOwnProperty(prop)) {
					optObj[prop] = Number(optObj[prop]);
					count++;
					break;
				}
			} else if (optObj.hasOwnProperty(np)) {
					optObj[np] = Number(optObj[np]);
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
	 * Returns an array of custom properties in form of parameter names in case of options equals null.
	 * If 'options' is specified, then this functions returns the filled object.
	 * for example, each property in form 'first-second-third' will be converter to parameter name 'firstSecondThird'
	 * and in case of specified options:
	 * params = {
	 * 	firstSecondThird: options.firstSecondThird
	 * } will be returned
	 */
	static getCustomParams(options = null) {
		const props = SmartPie.getCustomProperties();		// get an array of custom properties
		const paramsArray = [];
		for (let prop of props) {
			paramsArray.push(SmartPie.customProp2Param(prop));
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
		this._onLegendOver = this._onLegendOver.bind(this);
		this._onLegendOut = this._onLegendOut.bind(this);
		this._onClick = this._onClick.bind(this);
		this._transitionEnd = this._transitionEnd.bind(this);


		// init SmartPies and store dashboard context parameters
		SmartPies.initSmartPies(options ? options.dashboardContext || null : null);
		const txtDefs = `
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
		const txtStyle = `
			svg {
				overflow: visible;
				vector-effect: non-scaling-stroke;

				--smartwdg-legend-color: black;
				--smartwdg-run-color: green;
				--smartwdg-stop-color: red;

				--no-color:	none;
				--run-color: var(--smartwdg-run-color, green);
				--stop-color: var(--smartwdg-stop-color, red);
				--legend-frm-border-color: var(--smartwdg-legend-color, #9dc2de);
				--legend-frm-fill: var(--smartwdg-ftm-fill, white);
				--legend-frm-border-width: 2;
				--legend-frm-border-radius: 2;
				--legend-text-color: var(--legend-frm-border-color);
				--legend-text-size: 12px;
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
				transition:all 1s;
			}
			.animated:hover {
				r: 0;
			}

			text {
				font-family: Avenir, Helvetica, sans-serif;
				font-size: var(--legend-text-size);
				font-weight: normal;
				fill: var(--legend-text-color);
			}
			rect.legend-frame {
				fill: var(--legend-frm-fill);
				stroke: var(--legend-frm-border-color);
				stroke-width: var(--legend-frm-border-width);
				rx:	var(--legend-frm-border-radius);
				ry: var(--legend-frm-border-radius);
			}
			rect.legend-rect {
				fill: var(--legend-frm-fill);
				stroke: var(--no-color);
				stroke-width: calc(var(--legend-frm-border-width) / 2);
			}
			rect.legend-rect:hover {
				stroke-dasharray: 2 2;
				stroke: var(--legend-frm-border-color);
			}
			// path.main-target:hover, path.sub-target:hover {
			// 	mask: url(#mask-stripe);
			// }
			.selected {
				mask: url(#mask-stripe);
			}
		`;
		// merge default options with specified
		const opt = options || {};
		this._o = Object.assign({}, SmartPie.defOptions(), opt);
		// validate all properties
		SmartPie.convertNumericProps(this._o);

		this._mode 		= options.mode || null;
		this._o.id 		= id;	// <g id> inside of <svg>
		this._root		= options.context || null;	// svg root element with id = contId--stpie
		this._svgroot	= this._root.getElementById(this._o.id);
		this._svgdoc	= this._svgroot.ownerDocument;

		this._data		= null;	// last data as Set
		this._legend	= null;	// reference on legend
		this._body		= null;	// body circle with id = contId--body
		this._activeG	= null;	// group of active segments with id = contId--actG
		this._passiveG	= null;	// group of passive elements, such as legend and etc, with id = contID--pasG
		this._normRadius= 0;
		this._intervalCounter = 0;

		const style = SmartPies.addElement('style', {}, this._root, this._svgdoc);
		const node = this._svgdoc.createTextNode(txtStyle);
		style.appendChild(node);
		const defs = SmartPies.addElement('defs', {}, this._root, this._svgdoc);
		defs.innerHTML = `${txtDefs}`;
		// in case of html insertion, the options.mode == 'html' is defined and
		// the buiding process is divided on two parts:  constructor() and init() from connectedCallback.
		// in case of creating SmartPie object from Javascript, lets do all needed work in one place...
		if (!this._mode) {
			// store containerId: ref on SmartPie element inside SmartPies collection for JS access
			window.SmartPies.set(this._o.id, this);
			this.init();
		}
	}

	/// Internal functions. Please don't use from outside!

	// Enable/Disable 'run indicator'. isRun waits for 0/1
	_setRunIndicator(isRun) {
		if(!this._runIndicator) {
			this._runIndicator = this._root.getElementById('runIndicator');
		}
		if (this._runIndicator) {
			this._runIndicator.classList.value = isRun ? 'run' : 'stop';
		}
	}
	// The normalized radius of pie must be recalculated after changing some optional parameters, such as: radius and stroke-width
	_recalculteNormRadius() {
		this._normRadius = this._o.radius - this._o.varStrokeWidth/2;
		this._normRadius = this._normRadius < 0 ? 0 : this._normRadius;
		if (this._o.isAnimate) {
			this._normRadius -= this._normRadius / 5;
		}
	}
	_clearLegend() {
		if (this._legend) {
			this._legend.length = 0;
			let g = this._root.getElementById(`${this._o.id}--legend-group`);
			if (g) {
				g.removeEventListener("mouseover", this._onLegendOver);
				g.removeEventListener("mouseout", this._onLegendOut);
				g.removeEventListener("click", this._onClick);
				g.remove();
			}
			g = SmartPies.addElement('g', {
				id: `${this._o.id}--legend-group`,
				class: 'legend-group'
			}, this._passiveG, this._svgdoc);
			SmartPies.addElement('rect', {
				id: `${this._o.id}--legend-frame`,
				class: 'legend-frame shadowed',
				x: 0, y:0, width:0, height:0
			}, g, this._svgdoc);
			this._runIndicator = SmartPies.addElement('circle', {id: 'runIndicator', class: (this._o.isRun ? 'run' : 'stop'), r: 3, cx: 5, cy: 5}, g, this._svgdoc);

			g.addEventListener("click", this._onClick);
			g.addEventListener("mouseover", this._onLegendOver);
			g.addEventListener("mouseout", this._onLegendOut);
		}
	}
	_layoutLegend() {
		let g = this._root.getElementById(`${this._o.id}--legend-group`);
		if (g) {
			const rect_g = g.getBoundingClientRect();
			const fr_r = this._root.getElementById(`${this._o.id}--legend-frame`);
			fr_r.setAttribute('width', rect_g.width + 5);
			fr_r.setAttribute('height', rect_g.height + 10);

			const centerPt = {
				x: this._o.rect.x + this._o.radius * 2,
				y: this._o.rect.y + this._o.radius * 2,
			}

			g.setAttribute('transform', `translate(${centerPt.x}, ${this._o.rect.y+30})`);
		}

	}
	_addLegend(legdef) {/*
		class: 'sub-target',
		name: sVal.legend || sVal.name,
		color: sVal.color,
		value: sVal.value,
		ext:   sVal.ext, 		// '%' or ''
		ref: el
		*/

		legdef.ext = legdef.ext || '';
		this._legend.push(legdef);
		let index = this._legend.length-1;
		let y = index * 22 + 10;
		let l_g = this._root.getElementById(`${this._o.id}--legend-group`);
		let ls_g = SmartPies.addElement('g', {class:"legend-stroke", id:`${this._o.id}--${index}--legend-stroke`, transform:`translate(8 ${y})`}, l_g, this._svgdoc);
		let ls_r = SmartPies.addElement('rect', {class:'legend-rect', id:`${this._o.id}--${index}--legend-rect`, width:200, height:20, x:0, y:0}, ls_g, this._svgdoc);
		if (legdef.ref.dataset['linkto']) {
			ls_r.classList.add('linked');
		}

		let aTrgId = legdef.id.split('--');
		let rx = 3, rw = 14;
		if (aTrgId[aTrgId.length-1] === "sub-target") {
			rx = 9;
			rw = 8;
		}
		let ls_rc= SmartPies.addElement('rect', {width:rw, height:14, x:rx, y:3, fill:`${legdef.color}`, 'pointer-events':'none'}, ls_g, this._svgdoc)
		let ls_tn= SmartPies.addElement('text', {'text-anchor':'left', x:24, y:14, 'pointer-events':'none', text:`${legdef.name}`}, ls_g, this._svgdoc)
		let ls_tv= SmartPies.addElement('text', {'text-anchor':'left', x:180, y:14, 'pointer-events':'none', text:`${legdef.value}${legdef.ext}`}, ls_g, this._svgdoc)
	}
	/* be careful: this function changes an array of data! */
	_sortDataByParam(data = [], sortParam="asis") {
		const me = this;
		switch (sortParam) {
			case 'asis':
				break;
			case 'name':  	 // sort by name and ignore lower and upper case
			case 'names': {  // sort by name and ignore lower and upper case
				data.sort(function(a, b) {
					let aName = a.legend || a.name;
					let bName = b.legend || b.name;
					const nameA = aName.toUpperCase(); // ignore upper and lowercase
					const nameB = bName.toUpperCase(); // ignore upper and lowercase
					if (nameA < nameB) {
						return -1;
					}
					if (nameA > nameB) {
						return 1;
					}
					return 0;
				});
				break;
			}
			case 'value':
			case 'values': {
				data.sort(function(a, b) {
					if(Number(a.value) > Number(b.value)) {
						return 1;
					}
					if(Number(a.value) < Number(b.value)) {
						return -1;
					}
					return 0;
				});
				break
			}
			case 'color':
			case 'colors': {
				data.sort(function(a, b) {
					if (a.color > b.color) return 1;
					if (a.color < b.color) return -1
					return 0;
				});
				break;
			}
			case 'state':
			case 'states': {
				data.sort(function(a, b) {
					if (!a.state || !b.state) {
						if (a.color > b.color) return 1;
						if (a.color < b.color) return -1
					} else {
						if (a.state > b.state) return 1;
						if (a.state < b.state) return -1
					}
					return 0;
				});
				break;
			}
			default: {
				data.sort(function(a, b) {
					if(a[sortParam] > b[sortParam]) return 1;
					if(a[sortParam] < b[sortParam]) return -1;
					return 0;
				});
			}
		}
	}
	// filter data array by data.parent parameter and returns a new array with founded targets sorted by 'sortBy' parameter
	_filterDataByParent(data=[], sortBy='asis', parent='') {
		function filterByParent(item) {
			if (typeof item.parent !== 'undefined' && item.parent !== parent) {
				return false;
			}
			return true;
		}
		let filtered_data =  data.filter(filterByParent);
		this._sortDataByParam(filtered_data, sortBy);

		return filtered_data;
	}
	/**
	 * Filter 'data' by specified indexes and returns an ierarchical array of filtered data
	 * in form [
	 * 	{item 0, [data]},
	 * 	{item 1, [data]},
	 * 	...
	 * ]
	 * @param {*} data 		input array of data objects for each target
	 * @param {*} sortBy 	sorting parameter
	 * @param {*} indexes 	indexes array
	 * 	filter for types such as: '1.0', '1.1', '1.n', '0.n', ..., (1.2.3) in future
		-==== NOT YET IMPLEMENTED ====-
	 */
	_filterDataByIndexes(data, sortBy, indexes) {
		const a = 0;
		const fda = [];
		for (let i = 0; i < indexes.length; i++) {
			let fa = [];

			fda.push(fa);
		}

		return fda;
	}
	_renderZeeWhatch(data=[]) {

	}
	_renderRelativesPie(data=[], extention='') {
		// find all targets without parent
		let el, g_el, onePCT, startAngle = 0;
		let mainTargets = this._filterDataByParent(data, this._o.sortBy);
		// calc one percent weight
		if (mainTargets.length === 1) {
			onePCT = 3.6;	// grads for one percent
		} else {
			const sum = mainTargets.reduce((acc, cur) => acc + Number(cur.value),0);
			onePCT = 360 / sum;
		}
		const centerPt = {
			x: this._o.rect.x + this._o.radius,
			y: this._o.rect.y + this._o.radius,
		}
		const link = {
			linkto: '',
			islinked: ''
		};
		const sLink = {
			linkto: '',
			islinked: ''
		};

		for (let i = 0; i < mainTargets.length; i++) {
			// get childrens array
			let childTargets = this._filterDataByParent(data, this._o.sortBy, mainTargets[i].uuid);
			// create group for main target and its children
			g_el = SmartPies.addElement('g', {class:'main-segment', id:`${this._o.id}--${i}--main-segment`}, this._activeG, this._svgdoc);
			g_el.addEventListener("click", this._onClick);
			g_el.addEventListener("mouseover", this._onShowTooltip);
			// g_el.addEventListener("mousemove", this._onMoveTooltip);
			g_el.addEventListener("mouseout", this._onHideTooltip);

			// create 'main' segment and its legend stroke
			let val = mainTargets[i];
			link.linkto =  val.link || '';
			link.islinked = (val.link ? 'linked' : '');

			let endAngle = val.value * onePCT + startAngle;
			el = SmartPies.addElement('path', {
				name: val.legend || val.name,
				class: `main-target ${link.islinked}`,
				'data-uuid': `${val.uuid}`,
				'data-linkto': `${link.linkto}`,
				id:`${this._o.id}--${i}--main-target`,
				"stroke-width": this._o.varStrokeWidth,
				stroke: (mainTargets > 1 ? val.color : this._o.varStrokeColor),
				fill: val.color,
				d: SmartPies.describeArc(this.asf, centerPt.x, centerPt.y, this._normRadius, startAngle, endAngle, this._o.rotation)
			}, g_el, this._svgdoc);
			this._addLegend({
				class: 'main-target',
				id:`${this._o.id}--${i}--main-target`,
				name: val.legend || val.name,
				color: val.color,
				value: val.value,
				ext: (mainTargets.length === 1 ? '%' : extention),
				ref: el
			});
			// calculate secondary targets value sum
			let ssum = childTargets.reduce((acc, cur) => acc + Number(cur.value), 0);
			let normRadius = this._normRadius - this._o.varStrokeWidth;
			let secOnePCT = childTargets.length > 1 ? normRadius / ssum : normRadius / 100;

			for (let n = 1; n <= childTargets.length; n++) {
				let sVal = childTargets[n-1];
				sLink.linkto =  sVal.link || '';
				sLink.islinked = (sVal.link ? 'linked' : '');

				let segmentWidth = sVal.value * secOnePCT;
				el = SmartPies.addElement('path', {
					name: sVal.legend || sVal.name,
					class: `sub-target ${sLink.islinked}`,
					'data-linkto': `${sLink.linkto}`,
					'data-uuid': `${sVal.uuid}`,
					id:`${this._o.id}--${i+n}--sub-target`,
					stroke: sVal.color,
					"stroke-width": 2,
					fill: sVal.color,
					d: SmartPies.describeArc(this.asf, centerPt.x, centerPt.y, normRadius, startAngle, endAngle, this._o.rotation, true)
				}, g_el, this._svgdoc);
				if (childTargets.length === 1) {
					// draw additiional internal circle with main-target color
					normRadius = normRadius - segmentWidth;
					SmartPies.addElement('path', {
						id:`${this._o.id}--${i}--add-main-target`,
						class: 'main-target',
						'data-linkto': `${sLink.linkto}`,
						'data-uuid': `${val.uuid}`,
						"stroke-width": this._o.varStrokeWidth,
						stroke: (childTargets.length > 1 ? val.color : this._o.varStrokeColor),
						fill: val.color,
						d: SmartPies.describeArc(this.asf, centerPt.x, centerPt.y, normRadius, startAngle, endAngle, this._o.rotation)
					}, g_el, this._svgdoc);
				}
				this._addLegend({
					class: 'sub-target',
					id:`${this._o.id}--${i+n}--sub-target`,
					name: sVal.legend || sVal.name,
					color: sVal.color,
					value: sVal.value,
					ext: (childTargets.length === 1 ? '%' : extention),
					ref: el
				});
				normRadius = normRadius - segmentWidth;
			}
			startAngle =+ endAngle;
		}

	}
	_renderFlatPie(data = [], onePCT, extention='') {
		this._sortDataByParam(data, this._o.sortBy);

		let el, g_el;
		let startAngle = 0;
		const centerPt = {
			x: this._o.rect.x + this._o.radius,
			y: this._o.rect.y + this._o.radius,
		}
		const link = {
			linkto: '',
			islinked: ''
		};

		for(let i = 0; i < data.length; i++) {
			// create individual group for each target
			g_el = SmartPies.addElement('g', {class:'main-segment', id:`${this._o.id}--${i}--main-segment`}, this._activeG, this._svgdoc);
			g_el.addEventListener("click", this._onClick);
			g_el.addEventListener("mouseover", this._onShowTooltip);
			// g_el.addEventListener("mousemove", this._onMoveTooltip);
			g_el.addEventListener("mouseout", this._onHideTooltip);

			let val = data[i];
			link.linkto =  val.link || '';
			link.islinked = (val.link ? 'linked' : '');

			let endAngle = val.value * onePCT + startAngle;
			el = SmartPies.addElement('path', {
				class: `main-target ${link.islinked}`,
				'data-linkto': `${link.linkto}`,
				'data-uuid': `${val.uuid}`,
				id: `${this._o.id}--${i}--main-target`,
				name: val.legend || val.name,
				"stroke-width": this._o.varStrokeWidth,
				stroke: this._o.varStrokeColor,
				fill: val.color,
				d: SmartPies.describeArc(this.asf, centerPt.x, centerPt.y, this._normRadius, startAngle, endAngle, this._o.rotation)
			}, g_el, this._svgdoc);
			startAngle =+ endAngle;
			this._addLegend({
				class: 'main-target',
				id: `${this._o.id}--${i}--main-target`,
				name: val.legend || val.name,
				color: val.color,
				value: val.value,
				ext: (data.length === 1 ? '%' : extention),
				ref: el
			});
		}
	}
	_renderMainSubPie(data, onePCT, extention='') {
		const sCounter = Number(this._o.type.split('.')[1]);
		const mCounter = Number(this._o.type.split('.')[0]);

		const filteredData = this._filterDataByIndexes(data, this._o.sortBy, [mCounter, sCounter, 3, 4, 5]);

		// render main targets
		let el, g_el;
		let aData = data.slice();
		let startAngle = 0;
		const centerPt = {
			x: this._o.rect.x + this._o.radius,
			y: this._o.rect.y + this._o.radius,
		}
		const link = {
			linkto: '',
			islinked: ''
		};
		const sLink = {
			linkto: '',
			isLinked: ''
		};

		for(let i = 0; i < aData.length; i=i+mCounter+sCounter) {
			// create group for main target and its children
			g_el = SmartPies.addElement('g', {class:'main-segment', id:`${this._o.id}--${i}--main-segment`}, this._activeG, this._svgdoc);
			g_el.addEventListener("click", this._onClick);
			g_el.addEventListener("mouseover", this._onShowTooltip);
			// g_el.addEventListener("mousemove", this._onMoveTooltip);
			g_el.addEventListener("mouseout", this._onHideTooltip);

			let val = aData[i];
			link.linkto =  val.link || '';
			link.islinked = (val.link ? 'linked' : '');

			let endAngle = val.value * onePCT + startAngle;
			el = SmartPies.addElement('path', {
				name: val.legend || val.name,
				class: `main-target ${link.islinked}`,
				'data-linkto': `${link.linkto}`,
				'data-uuid': `${val.uuid}`,
				id:`${this._o.id}--${i}--main-target`,
				"stroke-width": this._o.varStrokeWidth,
				stroke: val.color,
				fill: val.color,
				d: SmartPies.describeArc(this.asf, centerPt.x, centerPt.y, this._normRadius, startAngle, endAngle, this._o.rotation)
			}, g_el, this._svgdoc);
			this._addLegend({
				class: 'main-target',
				id:`${this._o.id}--${i}--main-target`,
				name: val.legend || val.name,
				color: val.color,
				value: val.value,
				ext: (aData.length === 1 ? '%' : extention),
				ref: el
			});
			// render secondary targets
			let saData = aData.slice(i+mCounter, i+mCounter+sCounter);
			let initialValue = 0;
			// calculate secondary targets value sum
			let ssum = saData.reduce(
				(accumulator, currentValue) => accumulator + Number(currentValue.value)
				,initialValue
			);
			let normRadius = this._normRadius;
			let secOnePCT = saData.length > 1 ? this._normRadius / ssum : this._normRadius / 100;

			for (let n = 1; n <= saData.length; n++) {
				let sVal = saData[n-1];
				sLink.linkto =  sVal.link || '';
				sLink.islinked = (sVal.link ? 'linked' : '');
				let segmentWidth = sVal.value * secOnePCT;
				el = SmartPies.addElement('path', {
					name: sVal.legend || sVal.name,
					class: `sub-target ${sLink.islinked}`,
					'data-linkto': `${sLink.linkto}`,
					'data-uuid': `${sVal.uuid}`,
					id:`${this._o.id}--${i+n}--sub-target`,
					fill: sVal.color,
					d: SmartPies.describeArc(this.asf, centerPt.x, centerPt.y, normRadius, startAngle, endAngle, this._o.rotation, true)
				}, g_el, this._svgdoc);
				if (saData.length === 1) {
					// draw additiional internal circle with main-target color
					normRadius = normRadius - segmentWidth;
					SmartPies.addElement('path', {
						id:`${this._o.id}--${i}--add-main-target`,
						class: 'main-target',
						'data-linkto': `${link.linkto}`,
						'data-uuid': `${val.uuid}`,
						"stroke-width": this._o.varStrokeWidth,
						fill: val.color,
						d: SmartPies.describeArc(this.asf, centerPt.x, centerPt.y, normRadius, startAngle, endAngle, this._o.rotation)
					}, g_el, this._svgdoc);
				}
				this._addLegend({
					class: 'sub-target',
					id:`${this._o.id}--${i+n}--sub-target`,
					name: sVal.legend || sVal.name,
					color: sVal.color,
					value: sVal.value,
					ext: (saData.length === 1 ? '%' : extention),
					ref: el
				});
				normRadius = normRadius - segmentWidth;
			}
			startAngle =+ endAngle;
		}
	}
	_buildActive(data = null) {
		if (!this._activeG) { // yet not ready
			return;
		}
		while(this._activeG.childNodes.length) {
			this._activeG.firstElementChild.removeEventListener("click", this._onClick);
			this._activeG.firstElementChild.removeEventListener("mouseover", this._onShowTooltip);
			this._activeG.firstElementChild.removeEventListener("mousemove", this._onMoveTooltip);
			this._activeG.firstElementChild.removeEventListener("mouseout", this._onHideTooltip);

			this._activeG.removeChild(this._activeG.firstElementChild);
		}
		this._clearLegend();
		if (data) {
			// create temporary array for working with it
			let _targets_data_ = Array.from(data);
			let onePCT;

			switch (this._o.type) {
				case 'donut':		// draw donut with target sorting by 'data.parent' parameter. use 'innerRadius' attribute as radius of donut hole
					break;
				case 'comp100':		// compound 100% - divide the diagramm to same segments, by count of main targets.
					break;
				case 'zWhatch':		// draw colored path for each target. don't take a parentness (aka flat). the value is an angle of segment. sort segments by any input parameter
					this._renderZeeWhatch(_targets_data_);
					break;
				case 'rel': // sort targets by 'data.parent' parameter. target that haven't parent is a main. sub-target's data.parent contains the name of it's parent target
					this._renderRelativesPie(_targets_data_);
					break;
				case "flat":	// one percent is 360 / 100. each target value must be specified in percent and the summary of all values cannot be greater than 100%
					this._renderFlatPie(_targets_data_, 3.6, '%');
					break;
				case "1.0":		// one percent is 360 / sum of targets val. this type not sutable for one target. In that case its value will be calculated as percents from 100
					//onePCT;
					if (_targets_data_.length === 1) {
						onePCT = 3.6;	// grads for one percent
					} else {
						const sum = _targets_data_.reduce((acc, cur) => acc + Number(cur.value),0);
						onePCT = 360 / sum;
					}
					this._renderFlatPie(_targets_data_, onePCT);
					break;
				default: { // from 1.1 upto 1.n (see _onClick function for type iterations)
					const sCounter = Number(this._o.type.split('.')[1]);
					const mCounter = Number(this._o.type.split('.')[0]);
					// calculate summ of main target values (mt_sum) and recognize one main target situation (mt_counter)
					let mt_counter = 0, mt_sum = 0;
					for(let i = 0; i < _targets_data_.length; i=i+mCounter+sCounter) {
						mt_counter++;
						mt_sum += +_targets_data_[i].value;
					}
					// one percent weight
					let onePCT = mt_counter > 1 ? 360 / mt_sum : 3.6;
					this._renderMainSubPie(_targets_data_, onePCT);
					break;
				}
			}
			this._layoutLegend();
		}
	}
	_getDataItem(uniqParam, uniqParamValue) {

		for(let item of this._data) {
			if (typeof item[uniqParam] !== 'undefined' && item[uniqParam] === uniqParamValue) {
				return item;
			}
		}
		return null;
	}

	// event listeners
	_onShowTooltip(evt) {
		if (!this._o.isTooltip) {
			return;
		}
		let target = evt.target;
		const ta = target.id.split('--');
		const pie = window.SmartPies.get(ta[0]);
		const data = {
			id: ta[0],
			x: evt.clientX,
			y: evt.clientY,
			targets: [],
			title: {},
			options: {}
		};

		// for test only: show all data for element with id = g1-dbSVG
		if (pie._o.ttipType == 'allData') {
			data.targets = Array.from(pie._data);
		} else {
			for(var item of target.parentElement.children) {
				let uuid = (item.dataset ? item.dataset['uuid'] : null);
				if (uuid) {
					let isCurrent = (uuid === target.dataset['uuid']);
					let dd = pie._getDataItem('uuid', uuid);
					if (dd) {
						dd.current = isCurrent;	// currently pointed target will be shown as selected in tooltip!
						if (item.id.match("--add-")) { // not intrested!!!
							continue;
						}
						if (item.id.lastIndexOf("--main-target") == -1) { // I don't want to see main target here, only it's subs!!!
							data.targets.push(dd);
						} else { // the 'main-target' item goes to title!
							data.title = dd;
							continue;
						}
					}
				}
			}
		}
		data.options.isRun = pie._o.isRun;
		data.options.location = pie._bodyShad.getBoundingClientRect();
		data.options.sortBy = pie._o.sortBy;
		data.options.delayOut = 2000;
		data.options.showMode = 'pinned';
		data.options.cssVars = {
			'--sttip-var-tooltip-max-width': '290',
		};
		data.options.position = 'rt';
		// Call static function, that will instantinate SmartTooltip if needed.
		// In this case the default template will be used. In case you want to use
		// the custom template for SmartTooltip, you must to call static function
		// SmartTooltip.initTooltip(idElement, template) before first call of showTooltip function
		// Note: the custom tooltip will be load asynchronously and this process may take a time!
		//       In case of custom template don't loaded the default one will be used instead of it.
		SmartTooltip.showTooltip(data, evt);
	}
	_onMoveTooltip(evt) {
		SmartTooltip.moveTooltip(evt);
	}
	_onHideTooltip(evt) {
		// This.static function have not any effect if it will be called before  showTooltip or initTooltip!
		SmartTooltip.hideTooltip(evt);
	}

	_onClick(event) {
		event.preventDefault();
		const pie = this;
		if (event.metaKey || event.ctrlKey) {
			switch (pie._o.type) {
				case 'donut':
					pie._o.type = 'rel';
					break;
				case 'rel':
					pie._o.type = 'flat';
					break;
				case 'flat':
					pie._o.type = 'zWhatch';
					break;
				case 'zWhatch':
					pie._o.type = "1.0";
					break;
				case '1.9':
					pie._o.type = 'donut';
					break;
				default:
					const sn = Number(pie._o.type.split('.')[1]);
					const mn = Number(pie._o.type.split('.')[0]);

					let sec = sn + 1;
					pie._o.type = mn + '.' + sec;
					break;
			}
			pie.setParam('type', pie._o.type);
			console.info('Set type to ' + pie._o.type);
		} else if (event.shiftKey) {
			let isRun = !pie._o.isRun;
			pie.run(isRun);

			// if (pie._o.mode === "html") {
			// 	if (isRun) {
			// 		pie.setAttribute('is-run', '1');
			// 	} else {
			// 		pie.removeAttribute('is-run');
			// 	}
			// } else if (pie._o.mode === "svg") {
			// 	pie.run(isRun);
			// }
			console.info('Update is' + (isRun ? ' started' : ' stoped'));
		} else if (this._o.isLink) {
			let elRef = null;
			let linkto = '';
			// don't use id to targeting, use dataset attributes instead. 
			const legendIndex  = this.target.dataset['legendIndex'];
			if (legendIndex) {
				elRef = pie._legend[legendIndex].ref;
			} else {
				elRef = event.target;
			}
			if (elRef) {
				// check 'data-linkto and open specified (if exists) link in new window
				let linkto = elRef.dataset['linkto'];
				if (linkto) {
					linkto = SmartPies.getLink(linkto);
					window.open(linkto, '');
				}
			}
		}
	}
	_onLegendOver(event) {
		if (event.fromElement) {
			const pie = window.SmartPies.get(event.target.id.split('--')[0]);
			let target = event.target;
			if (!target.classList.contains('legend-frame')) {
				if (pie) {
					pie._currentLegendFor  = pie._legend[target.id.split('--')[1]].id;
					pie._root.getElementById(pie._currentLegendFor).classList.add('selected');
				}
			}
		}
	}
	_onLegendOut(event) {
		let target = event.target;
		if (!target.classList.contains('legend-frame')) {
			const pie = window.SmartPies.get(event.target.id.split('--')[0]);
			if (pie && pie._currentLegendFor) {
				pie._root.getElementById(pie._currentLegendFor).classList.remove('selected');
				pie._currentLegendFor = 0;
			}
		}
	}
	_transitionEnd(ev) {
		if (ev.propertyName === 'r') {
			console.log(`${this._o.id}: anim ended`);
			this._body.setAttribute("r", this._normRadius);
			this._body.setAttribute("display", "none")
			this._body.setAttribute('stroke-opacity', 1);
			this._body.setAttribute('fill-opacity', 1);
			setTimeout(() => { this._body.setAttribute("display", "block") }, 50);
		}
	}


	/// API
	getCtrl() {
		return this;
	}

	init(options = null) {
		if (options) {
			// validate and merge with own options
			SmartPie.convertNumericProps(options);
			this._o = Object.assign({}, this._o, options);
		}

		const rc = this._svgroot.firstElementChild;
		this._o.rect = rc.getBBox();
		rc.setAttribute("display", "none");
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
		this._recalculteNormRadius();

		// append base elements to svg
		if (this._o.endAngle == this._o.startAngle) {
			this.asf = 0;
			this._body = SmartPies.addElement('circle', {
				id:   `${this._o.id}--body`,
				class:`body`,
				stroke: `${this._o.varStrokeColor}`,
				'stroke-width': `${this._o.varStrokeWidth}`,
				'stroke-opacity': `${this._o.varOpacity}`,
				fill: `${this._o.varFillColor}`,
				'fill-opacity': `${this._o.varOpacity}`,
				r: `${this._normRadius}`,
				cx: `${this._o.rect.x + this._o.radius}`,
				cy: `${this._o.rect.y + this._o.radius}`,
				style: `r:${this._normRadius};`
			}, this._svgroot, this._svgdoc);
			this._bodyShad = this._body.cloneNode();
			this._bodyShad.removeAttribute('id');
			this._bodyShad.setAttribute("class", "shadowed");
			this._svgroot.insertBefore(this._bodyShad, this._body);
		} else {
			this.asf = (this._o.startAngle > this._o.endAngle ? 1 : 0);
			// draw segment from startAngle to endAngle
			const centerPt = {
				x: this._o.rect.x + this._o.radius,
				y: this._o.rect.y + this._o.radius,
			}

			this._body = SmartPies.addElement('path', {
				id:   `${this._o.id}--body`,
				class: `body`,
				stroke: `${this._o.varStrokeColor}`,
				'stroke-width': `${this._o.varStrokeWidth}`,
				'stroke-opacity': `${this._o.varOpacity}`,
				fill: `${this._o.varFillColor}`,
				'fill-opacity': `${this._o.varOpacity}`,
				d: SmartPies.describeArc(this.asf, centerPt.x, centerPt.y, this._normRadius, this._o.startAngle, this._o.endAngle, this._o.rotation)
			}, this._svgroot, this._svgdoc);
			this._bodyShad = this._body.cloneNode();
			this._bodyShad.removeAttribute('id');
			this._bodyShad.setAttribute("class", "shadowed");
			this._svgroot.insertBefore(this._bodyShad, this._body);
		}
		this._body.addEventListener('transitionend', (ev) => {
			// if (ev.propertyName === 'r') {
				console.log(`${this._o.id}: anim ended`);
				this._body.setAttribute("r", this._normRadius);
				this._body.setAttribute("display", "none")
				this._body.setAttribute('stroke-opacity', 1);
				this._body.setAttribute('fill-opacity', 1);
				setTimeout(() => { this._body.setAttribute("display", "block") }, 150);
			// }
	
		});// this._transitionEnd);

		if (this._o.isAnimate) {
			this._body.classList.add('animated');
		}

		this._activeG	= SmartPies.addElement('g', {id: `${this._o.id}--actG`}, this._svgroot, this._svgdoc);
		this._passiveG	= SmartPies.addElement('g', {id: `${this._o.id}--pasG`}, this._svgroot, this._svgdoc);

		// passiveG group is a legend. hide it if no legend!
		this._passiveG.setAttribute('display', (this._o.isLegend ? 'block': 'none'));

		this._data = new Set();
		this._legend = new Array();

		if (this._o.ttipTemplate) {
			// call static function (it will instantinate SmartTooltip and load template)
			SmartTooltip.initTooltip(this._o.id, this._o.ttipTemplate);
		}

		this._body.addEventListener('click', this._onClick);
	}

	/**
	 * Returns the run state of SmartPie object
	 */
	isRun() {
		return this._o.isRun;
	}
	/**
	 * Changes the 'run' state ob SmartPie object
	 * @param {*} isRun
	 */
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
		this._setRunIndicator(emMode);
	}
	// use example: let ic = this.intervalCounter;
	get intervalCounter() {
		return this._intervalCounter;
	}
	// use example: this.intervalCounter -= 100;
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
							// such as: type, sortBy, opacity, lcolor (legend color), legend, interval (ms), run/stop, server, targets, user, ...
		if (!data) { // do realtime updates here!
			SmartPies._httpGet(this._o.server + this._o.targets[0])
			.then(response => {
				if (this._o.isAnimate) {
					this._body.setAttribute('style', `/* r:${this._normRadius}; */`);
					
					this._body.setAttribute("r", this._normRadius + this._normRadius/5);
					this._body.setAttribute('fill-opacity', 0);
					this._body.setAttribute('stroke-opacity', 0);
				}
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
				if (this._o.isAnimate) {
					this._body.setAttribute('style', `/* r:${this._normRadius}; */`);

					this._body.setAttribute("r", this._normRadius + this._normRadius/5);
					this._body.setAttribute('fill-opacity', 0);
					this._body.setAttribute('stroke-opacity', 0);
				}
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
					"legend":  "Missing at work",
					"value": "42",
					"color": "green",
					"link": "http://www.google.com/?target1",
					"parent": ""
				},
				{
					"uuid": "uuid_ex_Target2",
					"legend":  "On sick-list (people)",
					"value": "27",
					"color": "yellow",
					"link": "http://www.google.com/?target2",
					"parent": "uuid_ex_Target1"
				},
				{
					"uuid": "uuid_ex_Target3",
					"legend":  "On a business trip (people)",
					"value": "15",
					"color": "red",
					"link": "http://www.google.com/?target3",
					"parent": "uuid_ex_Target1"
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
		return SmartPie.getCustomParams(this._o);
	}
	setParam(name, value) {
		const opt = {};
		opt[name] = value;
		// convert to numbers known properties
		SmartPie.convertNumericProps(opt, name);

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
				case 'endAngle':
					this._o.endAngle = options[key];
					needRebuild++;
					break;
				case 'isEmulate':
					this._o.isEmulate = options[key];
					break;
				case 'type':
					this._o.type = options[key];
					needRebuild++;
					break;
				case 'sortBy':
					this._o.sortBy = options[key];
					needRebuild++
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
					let svgRoot = (this._o.mode === 'html' ? this._svgroot : this._root);
					svgRoot.style.setProperty('--smartwdg-legend-color', val);
					break;
				case 'radius':
					val = Number(options[key]);
					this._recalculteNormRadius();
					this._body.setAttribute('stroke-width', val);
					this._body.setAttribute('r', this._normRadius);
					needRebuild++;
					break;
				case 'varStrokeWidth':
					val = Number(options[key]);
					this._o.varStrokeWidth = val;
					this._recalculteNormRadius();
					this._body.setAttribute('stroke-width', val);
					this._body.setAttribute('r', this._normRadius);
					needRebuild++;
					break;
				case 'varOpacity':
					val = Number(options[key]);
					this._body.setAttribute('stroke-opacity', val);
					this._body.setAttribute('fill-opacity', val);
					this._o.varOpacity = val;
					break;
				case 'isLegend':
					this._o.isLegend = +options[key];
					if (this._passiveG) {
						this._passiveG.setAttribute('display', (this._o.isLegend ? 'block': 'none'));
					}
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
			this._buildActive(this._data);
		}
		return needRebuild;
	}
}

class SmartPieElement extends HTMLElement {
	constructor(id, options= { mode:'html' }) {
		super();

		// create SmartPies collection only once!
		SmartPies.initSmartPies();

        // overwrite by external styles!
        // this._o.isLegend = Number(getComputedStyle(this).getPropertyValue('--smartpie-is-legend').trimLeft());

		// for (let attr of this.attributes) {
		// 	this._o[attr.name] = attr.value;
        // }
		// this._o.mode = options.mode;
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

		// // convert to numbers known props
		// SmartPie.convertNumericProps(this._o);

		// // calculate normalized radius
		// this._recalculteNormRadius();

		this._root = this.attachShadow({mode: 'open'});

		const svgId = `${this.id}--stpie`;
		this._root.innerHTML = `
			<style>${txtStyle}</style>
			<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" id="${svgId}">
				<g id="${svgId}-g">
					<rect id="${svgId}-g-r" x="10" y="10" width="150" height="150" fill="#eee" stroke="black" stroke-dasharray="4 4"></rect>
				</g>
			</svg>
		`;
		this._svgroot = this._root.querySelector('svg');
		// now create the smart pie!
		this._stpie = new SmartPie(`${svgId}-g`, {context: this._svgroot, mode: 'html'});
		// store containerId: ref on SmartPieElement element inside SmartPies collection for JS access
		window.SmartPies.set(this._id, this);

		// } else {
		// 	this._o.id   			= id;
		// 	this._o.type 			= options.type || this._o.type;

		// 	this._o.rotation 		= options.rotation || this._o.rotation;
		// 	this._o.startAngle 		= options.startAngle || this._o.startAngle;
		// 	this._o.endAngle 		= options.endAngle || this._o.endAngle;
		// 	this._o.innerRadius 	= options.innerRadius || this._o.innerRadius;
		// 	this._o.radius 			= options.radius || this._o.radius;
		// 	this._o.width 			= options.width || this._o.width;
		// 	this._o.height 			= options.height || this._o.height;
		// 	this._o.sortBy			= options.sortBy || this._o.sortBy;
		// 	this._o.sortDir			= options.sortDir || this._o.sortDir;
		// 	this._o.isAnimate		= options.isAnimate || this._o.isAnimate;
		// 	this._o.isLegend		= options.isLegend || this._o.isLegend;

		// 	this._o.ttipTemplate	= options.ttipTemplate || this._o.ttipTemplate;
		// 	this._o.ttipType		= options.ttipType || this._o.ttipType;
		// 	this._o.isEmulate		= options.isEmulate || this._o.isEmulate;
		// 	this._o.isRun 			= options.isRun || this._o.isRun;
		// 	this._o.interval		= options.interval || this._o.interval;

		// 	this._o.server			= options.server || this._o.server;
		// 	this._o.targets			= options.targets || this._o.targets;
		// 	this._o.user			= options.user || this._o.user;

		// 	this._o.varStrokeColor	= options.varStrokeColor || this._o.varStrokeColor;
		// 	this._o.varStrokeWidth	= options.varStrokeWidth || this._o.varStrokeWidth;
		// 	this._o.varFillColor	= options.varFillColor || this._o.varFillColor;
		// 	this._o.varOpacity		= options.varOpacity || this._o.varOpacity;

		// 	// convert to numbers known properties
		// 	SmartPie.convertNumericProps(this._o);

		// 	this._root = options.context || null;
		// 	if (this._root) {
		// 		this._svgroot = this._root.getElementById(this._o.id);
		// 		this._svgdoc  = this._svgroot.ownerDocument;

		// 		const style = SmartPies.addElement('style', {}, this._svgroot, this._svgdoc);
		// 		const node = this._svgdoc.createTextNode(txtStyle);
		// 		style.appendChild(node);

		// 		const defs = SmartPies.addElement('defs', {}, this._svgroot, this._svgdoc);
		// 		defs.innerHTML = `${txtDefs}`;

		// 		// find coordinate for widget insertion
		// 		const rc = this._svgroot.firstElementChild;
		// 		this._o.rect = rc.getBBox();
		// 		rc.setAttribute("display", "none");
		// 		this._o.radius  = Math.min(this._o.rect.width, this._o.rect.height) / 2;
		// 		// calculate normalized radius
		// 		this._recalculteNormRadius();
		// 	}
		// };
		// if (!this._root) {
		// 	console.error('_root must tobe initialized!');
		// 	return;
		// }

		// // append base elements to svg
		// if (this._o.endAngle == this._o.startAngle) {
		// 	this.asf = 0;
		// 	this._body = SmartPies.addElement('circle', {
		// 		id:   `${this._o.id}--body`,
		// 		class:`body`,
		// 		stroke: `${this._o.varStrokeColor}`,
		// 		'stroke-width': `${this._o.varStrokeWidth}`,
		// 		'stroke-opacity': `${this._o.varOpacity}`,
		// 		fill: `${this._o.varFillColor}`,
		// 		'fill-opacity': `${this._o.varOpacity}`,
		// 		r: `${this._normRadius}`,
		// 		cx: `${this._o.rect.x + this._o.radius}`,
		// 		cy: `${this._o.rect.y + this._o.radius}`
		// 	}, this._svgroot, this._svgdoc);
		// 	this._bodyShad = this._body.cloneNode();
		// 	this._bodyShad.removeAttribute('id');
		// 	this._bodyShad.setAttribute("class", "shadowed");
		// 	this._svgroot.insertBefore(this._bodyShad, this._body);
		// } else {
		// 	this.asf = (this._o.startAngle > this._o.endAngle ? 1 : 0);
		// 	// draw segment from startAngle to endAngle
		// 	const centerPt = {
		// 		x: this._o.rect.x + this._o.radius,
		// 		y: this._o.rect.y + this._o.radius,
		// 	}

		// 	this._body = SmartPies.addElement('path', {
		// 		id:   `${this._o.id}--body`,
		// 		class: `body`,
		// 		stroke: `${this._o.varStrokeColor}`,
		// 		'stroke-width': `${this._o.varStrokeWidth}`,
		// 		'stroke-opacity': `${this._o.varOpacity}`,
		// 		fill: `${this._o.varFillColor}`,
		// 		'fill-opacity': `${this._o.varOpacity}`,
		// 		d: SmartPies.describeArc(this.asf, centerPt.x, centerPt.y, this._normRadius, this._o.startAngle, this._o.endAngle, this._o.rotation)
		// 	}, this._svgroot, this._svgdoc);
		// 	this._bodyShad = this._body.cloneNode();
		// 	this._bodyShad.removeAttribute('id');
		// 	this._bodyShad.setAttribute("class", "shadowed");
		// 	this._svgroot.insertBefore(this._bodyShad, this._body);
		// }

		// if (this._o.isAnimate) {
		// 	this._body.classList.add('animated');
		// }

		// this._activeG	= SmartPies.addElement('g', {id: `${this._o.id}--actG`}, this._svgroot, this._svgdoc);
		// this._passiveG	= SmartPies.addElement('g', {id: `${this._o.id}--pasG`}, this._svgroot, this._svgdoc);

		// // passiveG group is a legend. hide it if no legend!
		// this._passiveG.setAttribute('display', (this._o.isLegend ? 'block': 'none'));

	}
	getCtrl() {
		return this._stpie;
	}

	// attributes changing processing
	static get observedAttributes() {
		return SmartPie.getCustomProperties();
	}
	attributeChangedCallback(name, oldValue, newValue) {
		// update own property
		const paramName = SmartPie.customProp2Param(name);
		this._o[paramName] = newValue;
		this._stpie.setParam(paramName, newValue);
	}

	// connect and disconnect from html
    connectedCallback() {
		// all specific work will be done inside
		this._stpie.init(this._o);
		// resize own svg
		this._svgroot.setAttribute('height', this._stpie._o.rect.height);
		this._svgroot.setAttribute('width', this._stpie._o.rect.width);
		this._svgroot.setAttribute('viewBox', `0 0 ${this._stpie._o.rect.width} ${this._stpie._o.rect.height}`);

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
window.customElements.define('smart-pie', SmartPieElement);

class Poligons {
	/**
	 * Draw poligon
	 */
	poligon(c, n, x, y, r, angel, counterclockwise) {
		angle = ange || 0;
		counterclockwise = counterclockwise || 0;
		c.moveTo(x + r * Math.sin(angle), y - r * Math.cos(angle));
		let delta = 2 * Math.PI / n;
		for (let i = 1; i < n; i++) {
			angle += counterclockwise ? -delta : delta; // correct an angle
			c.lineTo(x + r * Math.sin(angel), y - Math.cos(angel));
		}
		c.closePath();
	}
	draw(id) {
		const canvas = document.getElementById(id);
		const c = canvas.msGetInputContext('2d');
		// create new contur
		c.beginPath();
		poligon(c, 3, 50, 70, 50);
		poligon(c, 4, 150, 60, Math.PI / 4);
		poligon(c, 5, 255, 55, 50);
		poligon(c, 6, 365, 53, 50, Math.PI / 6);
		poligon(c, 4, 365, 53, 20, Math.PI / 4, true);

		c.fillStyle = '#ccc';
		c.strokeStyle = '#008';
		c.lineWidth = 5;

		c.fill();
		c.stroke();
		'https://online.flippingbook.com/view/302153/676/'
	}
}
