/* eslint-disable */

/**
 * http://qaru.site/questions/45461/how-to-calculate-the-svg-path-for-an-arc-of-a-circle
 * https://codepen.io/dudleystorey/pen/LNdaZX
 * https://webformyself.com/krugovye-elementy-interfejsa-pri-pomoshhi-html5-css-js-i-svg-chast-1/
 *
 */
class SmartPies {
	constructor() {
		this._version = '1.0';
		this._heap = new Map();
		this._initialized = false;
		this._timeout = 100;
	}
	static isNewSite() {
		 return (typeof Ext != 'undefined' && typeof Site != 'undefined');
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
	static polarToCartesian(centerX, centerY, radius, angleInDegrees) {
		var angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;

		return {
			x: centerX + (radius * Math.cos(angleInRadians)),
			y: centerY + (radius * Math.sin(angleInRadians))
		};
	}
	static describeArc(isLarge, x, y, radius, startAngle, endAngle, isSector=true) {
		let largeArc = 1;
		let arcSweep = 0;

		let s = startAngle % 360;
		let e = endAngle % 360;

		// if (isLarge) {
		// 	largeArc = 0;
		// }

		const start = this.polarToCartesian(x, y, radius, s);
		const end = this.polarToCartesian(x, y, radius, e);

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

	static _describeArc(as=0, x, y, radius, startAngle, endAngle, isSector=true) {
		var start = SmartPies.polarToCartesian(x, y, radius, endAngle);
		var end = SmartPies.polarToCartesian(x, y, radius, startAngle);
		var arcSweep;
		if (!as)
			arcSweep = endAngle - startAngle <= 180 ? "0" : "1";
		else
			arcSweep = endAngle - startAngle <= 180 ? "1" : "0";

		if (isSector) {
			return [
				"M", start.x, start.y,
				"A", radius, radius, 0, arcSweep, 0, end.x, end.y,
				"L", x, y,
				"Z"
			].join(" ");
		} else {
			return [
				"M", start.x, start.y,
				"A", radius, radius, 0, arcSweep, 0, end.x, end.y
			].join(" ");
		}
	}

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
				let pie = entry[1];
				if (pie._run) { // realtime updates are enabled
					let ic = pie.intervalCounter;
					ic = ic - this._timeout;
					pie.intervalCounter = ic;	// it will restored automatically to _o.interval, if <= 0
					if (ic <= 0) {
						let data = null, updMode = pie.emulate;	// 1 - enabled, 0 - disabled, -1 - nulled
						if (updMode) {
							data = pie.generateExData();
							if (updMode === -1) {	// clear all data and stop emulation
								pie.emulate = 0;
							}
						}
						pie.update(data);
					}
				}
			}
		}, 100);
	}

	init(dashboardContext = {}) {
		this.lang = dashboardContext.lang || "ru";
		this.document = dashboardContext.document || document;
		this.editorAPI = dashboardContext.editorAPI || null;
		this.runtimeAPI = dashboardContext.runtimeAPI || null;
		this._initialized = true;
		// start continius interval timer
		this._intervalTimer();

	}


	get (id) {
		return this._heap.get(id);
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

	}

	emulate(id, mode) { // 0/-1/1 - disabled/nulled/enabled
		const pie = this.get(id);
		let emMode = 0;
		if (pie) {	// all checks inside setter "emulate"!
			pie.emulate = mode;
		}

	}
	run(id) {
		const pie = this.get(id);
		if (pie)
			pie.run = true;
	}
	stop(id) {
		const pie = this.get(id);
		if (pie)
			pie.run = false;
	}
	update(id, data={}) {	// JSON object with defined progress:[]. In case of cfg={}, or opt:{} defined
							// this section will be processed before progress=[]
							 // opt or cfg objects may contain any known optional attributes,
							 // such as: lang, type, sortby, opacity, lcolor (legend color), legend, interval (ms), run/stop, server, targets, user, ...
		const pie = this.get(id);
		if (pie)
			pie.update(data);
	}
	// get href link paramter to new or old site
	static getLink(link) {
		if (!SmartPies.isNewSite() || !link || link == '') {
			return link;
		}
		return window.location.pathname + link.replace('/grapher.cgi?', '?');
	}

};

class SmartPie extends HTMLElement {
	static defOptions() {
		return {
			type:'flat' 		/* donut, rel(relatives), flat, zWhatch or 1.0, 1.1, 1.2, 1.3, 1.4, ..., 1.n, 1.all */,
			sortby:"asis" 		/* asis, states, values, colors, names */,
			radius: 0,
			innerRadius: 0,
			startAngle: 0,
			endAngle: 0,
			fill: 'lightgray',
			stroke: 'lightgray',
			width: 2,
			opacity: 1,
			legend: 1,
			legendColor: '#666',
			lang:	'ru',
			rootElement: null,	// in case of HTML - shadowDOM will be created, in case of SVG - SVGElement (container)
			server: '',
			targets: ['answer.json'],
			user: '',
			interval: 2000,
			animate: 1,
			emulate: 0,
			ttiptmpl: '',
			ttiptype: 'curTarget'
		}
	}
	static numericProp() {
		return [
			'radius',
			'width',
			'interval',
			'animate',
			'emulate',
			'legend',
			'innerRadius',
			'startAngle',
			'endAngle'
		];
	}

	constructor(id, options= { mode:'html' }) {
		super();

		// create SmartPies collection only once!
		if (!window.SmartPies) {
			window.SmartPies = new SmartPies();
			window.SmartPies.init();
		}

		this._root		= null; // must be initialized!
		this._svgroot	= null;	// svg root element with id = contId--SmartPie
		this._svgdoc	= null;
		this._data		= null;	// last data as Set
		this._legend	= null;	// reference on legend
		this._body		= null;	// body circle with id = contId--body
		this._activeG	= null;	// group of active segments with id = contId--actG
		this._passiveG	= null;	// group of passive elements, such as legend and etc, with id = contID--pasG
		this._run 		= false; // state of dinamic update parameter.
		this._normRadius= 0;
		this._intervalCounter = 0;

		// this._o = Object.assign({}, SmartPie.defOptions());
		// Shallow-cloning, using spread operator (excluding prototype)
		this._o = { ...SmartPie.defOptions() };

		for (let attr of this.attributes) {
			this._o[attr.name] = attr.value;
		}

		this._o.mode = options.mode;

		this.src = {};
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
				--smartwdg-ftm-fill: black;
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

			svg {
				overflow: visible;
				vector-effect: non-scaling-stroke;

				--smartwdg-legend-color: #9dc2de;
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
			path.main-target:hover, path.sub-target:hover {
				mask: url(#mask-stripe);
			}
			.selected {
				mask: url(#mask-stripe);
			}
		`;

		if (options.mode === 'html') {
			const supportsShadowDOMV1 = !!HTMLElement.prototype.attachShadow;
			if (!supportsShadowDOMV1) {
				throw new Error('Unfortunately, your browser does not support shadow DOM v1. Think about switching to a Chrome browser that supports all new technologies!');
			}
			this._o.id 		= this.getAttribute('id') || id;

			// this._o.type 		= this.getAttribute('type') || this._o.type;
			// this._o.sortby		= this.getAttribute('sortby') || this._o.sortby;
			// this._o.legend		= this.getAttribute('legend') || this._o.legend;
			// this._o.legendColor = this.getAttribute('legen-color') || this._o.legendColor;
			// this._o.ttiptmpl	= this.getAttribute('ttiptmpl') || this._o.ttiptmpl;
			// this._o.server		= this.getAttribute('server') || this._o.server;
			// this._o.targets		= this.getAttribute('targets') || this._o.targets;
			// this._o.user		= this.getAttribute('user') || this._o.user;
			// this._o.interval	= this.getAttribute('interval') || this._o.interval;
			// this._o.animate		= this.getAttribute('animate') || this._o.animate;
			// this._o.emulate		= this.getAttribute('emulate') || this._o.emulate;
			// this._o.ttiptype 	= this.getAttribute('ttiptype') || this._o.ttiptype;

			// this._o.radius = this.getAttribute('radius') || this._o.radius;
			// this._o.innerRadius = this.getAttribute('innerRadius') || this._o.innerRadius;
			// this._o.startAngle = this.getAttribute('startAngle') || this._o.startAngle;
			// this._o.endAngle = this.getAttribute('endAngle') || this._o.endAngle;
			// this._o.fill = this.getAttribute('fill') || this._o.fill;
			// this._o.stroke = this.getAttribute('stroke') || this._o.stroke;
			// this._o.width = this.getAttribute('width') || this._o.width;
			// this._o.opacity = this.getAttribute('opacity') || this._o.opacity;

			// convert to numbers known props
			for (let na of SmartPie.numericProp()) {
				this._o[na] = Number(this._o[na]);
			}

			// calculate normalized radius
			this._recalculteNormRadius();

			this._root = this.attachShadow({mode: 'open'});

			// calculate svg rectangle and coordinates
			this._o.rect = {
				x: 0,
				y: 0,
				width:  this._o.legend ? this._o.radius *2 + 220 : this._o.radius * 2,
				height: this._o.legend ? this._o.radius * 2 + 50 : this._o.radius * 2
			};

			this._root.innerHTML = `
			<style>${txtStyle}</style>
			<svg
				xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
				id="${this._o.id}--SmartPie"
				height="${this._o.rect.height}"
				width="${this._o.rect.width}"
				viewBox="0 0 ${this._o.rect.width} ${this._o.rect.height}"
			>
				<defs>${txtDefs}</defs>
			</svg>
			`;

			this._svgroot = this._root.querySelector('svg');
			this._svgdoc  = this._svgroot.ownerDocument;
		} else {
			this._o.id   		= id;
			this._o.type 		= options.type || this._o.type;
			this._o.sortby		= options.sortby || this._o.sortby;
			this._o.legend		= options.legend || this._o.legend;
			this._o.legendColor = options.legendColor || this._o.legendColor;
			this._o.ttiptmpl   = options.ttiptmpl || this._o.ttiptmpl;
			this._o.server		= options.server || this._o.server;
			this._o.targets		= options.targets || this._o.targets;
			this._o.user		= options.user || this._o.user;
			this._o.interval	= options.interval || this._o.interval;
			this._o.animate		= options.animate || this._o.animate;
			this._o.emulate		= options.emulate || this._o.emulate;
			this._o.ttiptype	= options.ttiptype || this._o.ttiptype;

			this._o.radius = options.radius || this._o.radius;
			this._o.innerRadius = options.innerRadius || this._o.innerRadius;
			this._o.startAngle = options.startAngle || this._o.startAngle;
			this._o.endAngle = options.endAngle || this._o.endAngle;
			this._o.fill = options.fill || this._o.fill;
			this._o.stroke = options.stroke || this._o.stroke;
			this._o.width = options.width || this._o.width;
			this._o.opacity = options.opacity || this._o.opacity;

			// convert to numbers known properties
			for (let na of SmartPie.numericProp()) {
				this._o[na] = Number(this._o[na]);
			}

			this._root = options.context || null;
			if (this._root) {
				this._svgroot = this._root.getElementById(this._o.id);
				this._svgdoc  = this._svgroot.ownerDocument;

				const style = SmartPies.addElement('style', {}, this._svgroot, this._svgdoc);
				const node = this._svgdoc.createTextNode(txtStyle);
				style.appendChild(node);

				const defs = SmartPies.addElement('defs', {}, this._svgroot, this._svgdoc);
				defs.innerHTML = `${txtDefs}`;

				// find coordinate for widget insertion
				const rc = this._svgroot.firstElementChild;
				this._o.rect = rc.getBBox();
				rc.setAttribute("display", "none");
				this._o.radius  = Math.min(this._o.rect.width, this._o.rect.height) / 2;
				// calculate normalized radius
				this._recalculteNormRadius();
			}
		};
		if (!this._root) {
			console.error('_root must tobe initialized!');
			return;
		}

		// append base elements to svg
		if (this._o.endAngle == this._o.startAngle) {
			this.asf = 0;
			this._body = SmartPies.addElement('circle', {
				id:   `${this._o.id}--body`,
				class:`body`,
				stroke: `${this._o.stroke}`,
				'stroke-width': `${this._o.width}`,
				'stroke-opacity': `${this._o.opacity}`,
				fill: `${this._o.fill}`,
				'fill-opacity': `${this._o.opacity}`,
				r: `${this._normRadius}`,
				cx: `${this._o.rect.x + this._o.radius}`,
				cy: `${this._o.rect.y + this._o.radius}`
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
				stroke: `${this._o.stroke}`,
				'stroke-width': `${this._o.width}`,
				'stroke-opacity': `${this._o.opacity}`,
				fill: `${this._o.fill}`,
				'fill-opacity': `${this._o.opacity}`,
				d: SmartPies.describeArc(this.asf, centerPt.x, centerPt.y, this._normRadius, this._o.startAngle, this._o.endAngle)
			}, this._svgroot, this._svgdoc);
			this._bodyShad = this._body.cloneNode();
			this._bodyShad.removeAttribute('id');
			this._bodyShad.setAttribute("class", "shadowed");
			this._svgroot.insertBefore(this._bodyShad, this._body);
		}

		if (this._o.animate) {
			this._body.classList.add('animated');
		}

		this._activeG	= SmartPies.addElement('g', {id: `${this._o.id}--actG`}, this._svgroot, this._svgdoc);
		this._passiveG	= SmartPies.addElement('g', {id: `${this._o.id}--pasG`}, this._svgroot, this._svgdoc);

		// passiveG group is a legend. hide it if no legend!
		this._passiveG.setAttribute('display', (this._o.legend ? 'block': 'none'));

		// store containerId: ref on SmartPie element inside SmartPies collection for JS access
		window.SmartPies.set(this._o.id, this);
	}
	init(options) {
		this._data = new Set();
		this._legend = new Array();
		this._body.addEventListener('click', this._onClick);
		this.setParams(options);

		if (this._o.ttiptmpl) {
			// call static function (it will instantinate SmartTooltip and load template)
			SmartTooltip.initTooltip(this._o.id, this._o.ttiptmpl);
		}

		// show SmartWidget Config window
		setTimeout(() => { window.SWConfig.show({x:200, y:350});}, 1000);

		this._body.addEventListener('transitionend', (ev) => {
			if (ev.propertyName === 'r') {
				// console.log(`${this._o.id}: anim ended`);
				this._body.setAttribute("r", this._normRadius);
				this._body.setAttribute("display", "none")
				this._body.setAttribute('stroke-opacity', 1);
				this._body.setAttribute('fill-opacity', 1);
				setTimeout(() => { this._body.setAttribute("display", "block") }, 50);
			}
		});

	}

	// connect and disconnect from html
    connectedCallback() {
		this._data = new Set();
		this._legend = new Array();
		this._body.addEventListener('click', this._onClick);
		// load specified tooltip template
		if (this._o.ttiptmpl) {
			// call static function (it will instantinate SmartTooltip and load template)
			SmartTooltip.initTooltip(this._o.id, this._o.ttiptmpl);
		}


		this._body.addEventListener('transitionend', (ev) => {
			if (ev.propertyName === 'r') {
				// console.log(`${this._o.id}: anim ended`);
				this._body.setAttribute("r", this._normRadius);
				this._body.setAttribute("display", "none")
				this._body.setAttribute('stroke-opacity', 1);
				this._body.setAttribute('fill-opacity', 1);
				setTimeout(() => { this._body.setAttribute("display", "block") }, 50);
			}
		});

    }
    disconnectedCallback() {
		// remove element from smartpies.heap!!
		//....todo

		this._data.clear();
		this._legend.length = 0;
		this._body.removeEventListener('click', this._onClick);
		this._body.removeEventListener('transitionend');

		this._activeG  	= null;
		this._passiveG 	= null;
		this._body 		= null;
    }
	// attributes changing processing
	static get observedAttributes() {
		return [
			'legend',					// 1/0 - show/hide legend
			'lcolor',				// defines legend color, default is #9dc2de
			'type',
			'sortby',
			'run',
			'interval',
			'animate',
			'server',
			'color', 'fill', 			// set fill color
			'stroke', 'border',			// set stroke color
			'width', 'stroke-width',	// set stroke width
			'opacity',					// set pie opacity
			'emulate',					// emulate updates enabled/disabled/nulled: 1/0/-1
		];
	}
	attributeChangedCallback(name, oldValue, newValue) {
		let val = 0;
		switch (name) {
			case 'emulate':
				this._o.emulate = Number(newValue);	//setter emulate
				break;
			case 'opacity':
				newValue = Number(newValue);
				this._body.setAttribute('stroke-opacity', newValue);
				this._body.setAttribute('fill-opacity', newValue);
				this._o.opacity = newValue;
				break;
			case 'color':
			case 'fill':
				this._body.setAttribute('fill', newValue);
				this._o.fill = newValue;
				break;
			case 'stroke':
			case 'border':
				this._body.setAttribute('stroke', newValue);
				this._o.stroke = newValue;
				break;
			case 'width':
			case 'stroke-width':
				newValue = Number(newValue);
				this._o.width = newValue;

				this._recalculteNormRadius();

				this._body.setAttribute('stroke-width', newValue);
				this._body.setAttribute('r', this._normRadius);

				this._buildActive(this._data);
				break;
			case 'type':
				this._o.type = newValue;
				this._buildActive(this._data);
				break;
			case 'sortby':
				this._o.sortby = newValue;
				this._buildActive(this._data);
				break;
			case 'legend':
				this._o.legend = +newValue;
				this._passiveG.setAttribute('display', (this._o.legend ? 'block': 'none'));
				break;
			case 'lcolor':
				this._o.legendColor = newValue;
				this._svgroot.style.setProperty('--smartwdg-legend-color', newValue);
				break;
			case 'run':
				this.run = (newValue ? newValue : false);
				break;
			case 'interval':
				val = (newValue ? Number(newValue) : 0);
				let minInterval = 500;
				let animAddText = 'This';
				if (this._o.animate) {
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
			case 'animate':
				val = (newValue ? Number(newValue) : 0);
				if (val) {	// in case of animation enabled, duration of interval must be greater than 3 sec!
					this._o.interval = (this._o.interval < 3000 ? 3000 : this._o.interval);
					this._recalculteNormRadius();
				}
				this._o.animate = val;
				this._o.animate ? this._body.classList.add('animated') : this._body.classList.remove('animated');
				break;
			case 'server':
				this._o.server = newValue;
				break;
		}
	}
	// use example: let isRun = this.run;
	get run() {
		return this._run;
	}
	// use example: this.run = true - to start rt updateds, this.run = !this.run - to trigger start/stop
	set run(isRun) {
		let emMode = 0;
		if (typeof isRun === 'string') {
			if (isRun === '1' || isRun === 'true') {
				emMode = 1;
			}
		} else {
			emMode = isRun;
		}

		this._run = emMode;
		this._setRunIndicator(this._run);
	}
	_setRunIndicator(isRun) {
		if(!this._runIndicator) {
			this._runIndicator = this._root.getElementById('runIndicator');
		}
		if (this._runIndicator) {
			this._runIndicator.classList.value = isRun ? 'run' : 'stop';
		}
	}
	_recalculteNormRadius() {
		this._normRadius = this._o.radius - this._o.width/2;
		this._normRadius = this._normRadius < 0 ? 0 : this._normRadius;
		if (this._o.animate) {
			this._normRadius -= this._normRadius / 5;
		}
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
	// use example: let eu = this.emulateUpdates;
	get emulate() {
		return this._o.emulate;
	}
	// use example: this.emulate = 1, or this.emulate = '1';
	set emulate(mode) {	// 1/0/-1 - enabled/disabled/nulled
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
		pie._o.emulate = emMode;
	}

	update(data = null) {	// JSON object with defined progress:[]. In case of cfg={}, or opt:{} defined
	// this section will be processed before progress=[]
	// opt or cfg objects may contain any known optional attributes,
	// such as: type, sortby, opacity, lcolor (legend color), legend, interval (ms), run/stop, server, targets, user, ...
		// console.log(`update data for ${this._o.id}`);
		if (!data) { // do realtime updates here!
			SmartPies._httpGet(this._o.server + this._o.targets[0])
			.then(response => {
				if (this._o.animate) {
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
				if (this._o.animate) {
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
		const params = {
			id: 		this._o.id,
			type:		this._o.type,
			sortby:		this._o.sortby,
			legend:		this._o.legend,
			lcolor:		this._o.legendColor,
			radius: 	this._o.radius,
			fill:		this._o.fill,
			stroke: 	this._o.stroke,
			width:  	this._o.width,
			opacity:	this._o.opacity,
			server:		this._o.server,
			targets:	this._o.targets,
			user:		this._o.user,
			interval:	this._o.interval,
			emulate:	this._o.emulate
		}
		return params;
	}
	setParams(options={}, rebuild=true) {
		let val, needRebuild = false;
		for (let key in options) {
			switch (key) {
				case 'emulate':
					this._o.emulate = options[key];
					break;
				case 'type':
					this._o.type = options[key];
					needRebuild++;
					break;
				case 'sortby':
					this._o.sortby = options[key];
					needRebuild++
					break;
				case 'fill':
					val = options[key];
					this._o.fill = val;
					this._body.setAttribute('fill', val);
					break;
				case 'stroke':
					val = options[key];
					this._o.stroke = val;
					this._body.setAttribute('stroke', val);
					break;
				case 'width':
				case 'stroke-width':
					val = Number(options[key]);
					this._o.width = val;
					this._recalculteNormRadius();
					this._body.setAttribute('stroke-width', val);
					this._body.setAttribute('r', this._normRadius);
					needRebuild++;
					break;
				case 'opacity':
					val = Number(options[key]);
					this._body.setAttribute('stroke-opacity', val);
					this._body.setAttribute('fill-opacity', val);
					this._o.opacity = val;
					break;
				case 'lcolor':
					val = options[key];
					let svgRoot = (this._o.mode === 'html' ? this._svgroot : this._root);
					svgRoot.style.setProperty('--smartwdg-legend-color', val);
					this._o.legendColor = val;
					break;
				case 'legend':
					this._o.legend = +options[key];
					this._passiveG.setAttribute('display', (this._o.legend ? 'block': 'none'));
					break;

				case 'interval':
					val = Number(options[key]);
					let minInterval = 500;
					let animAddText = 'This';
					if (this._o.animate) {
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
				case 'animate':
					val = Number(options[key]);
					if (val) {	// in case of animation enabled, duration of interval must be greater than 3 sec!
						this._o.interval = (this._o.interval < 3000 ? 3000 : this._o.interval);
						this._recalculteNormRadius();
					}
					this._o.animate = val;
					this._o.animate ? this._body.classList.add('animated') : this._body.classList.remove('animated');
					break;

				case 'run':
					this.run = Number(options[key]);
					break;
				case 'stop':
					this.run = 0;
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
			this._runIndicator = SmartPies.addElement('circle', {id: 'runIndicator', class: (this._run ? 'run':'stop'), r: 3, cx: 5, cy: 5}, g, this._svgdoc);

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
	/* be careful: this function changes an array data! */
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
	// filter data array by data.parent parameter and returns a new array with founded targets sorted by 'sortby' parameter
	_filterDataByParent(data=[], sortby='asis', parent='') {
		function filterByParent(item) {
			if (typeof item.parent !== 'undefined' && item.parent !== parent) {
				return false;
			}
			return true;
		}
		let filtered_data =  data.filter(filterByParent);
		this._sortDataByParam(filtered_data, sortby);

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
	 * @param {*} sortby 	sorting parameter
	 * @param {*} indexes 	indexes array
	 * 	filter for types such as: '1.0', '1.1', '1.n', '0.n', ..., (1.2.3) in future
		-==== NOT YET IMPLEMENTED ====-
	 */
	_filterDataByIndexes(data, sortby, indexes) {
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
		let mainTargets = this._filterDataByParent(data, this._o.sortby);
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
			let childTargets = this._filterDataByParent(data, this._o.sortby, mainTargets[i].uuid);
			// create group for main target and its children
			g_el = SmartPies.addElement('g', {class:'main-segment', id:`${this._o.id}--${i}--main-segment`}, this._activeG, this._svgdoc);
			g_el.addEventListener("click", this._onClick);
			g_el.addEventListener("mouseover", this._onShowTooltip);
			g_el.addEventListener("mousemove", this._onMoveTooltip);
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
				"stroke-width": this._o.width,
				stroke: (mainTargets > 1 ? val.color : this._o.stroke),
				fill: val.color,
				d: SmartPies.describeArc(this.asf, centerPt.x, centerPt.y, this._normRadius, startAngle, endAngle)
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
			let normRadius = this._normRadius - this._o.width;
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
					d: SmartPies.describeArc(this.asf, centerPt.x, centerPt.y, normRadius, startAngle, endAngle, true)
				}, g_el, this._svgdoc);
				if (childTargets.length === 1) {
					// draw additiional internal circle with main-target color
					normRadius = normRadius - segmentWidth;
					SmartPies.addElement('path', {
						id:`${this._o.id}--${i}--add-main-target`,
						class: 'main-target',
						'data-linkto': `${sLink.linkto}`,
						'data-uuid': `${val.uuid}`,
						"stroke-width": this._o.width,
						stroke: (childTargets.length > 1 ? val.color : this._o.stroke),
						fill: val.color,
						d: SmartPies.describeArc(this.asf, centerPt.x, centerPt.y, normRadius, startAngle, endAngle)
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
		this._sortDataByParam(data, this._o.sortby);

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
			g_el.addEventListener("mousemove", this._onMoveTooltip);
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
				"stroke-width": this._o.width,
				stroke: this._o.stroke,
				fill: val.color,
				d: SmartPies.describeArc(this.asf, centerPt.x, centerPt.y, this._normRadius, startAngle, endAngle)
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

		const filteredData = this._filterDataByIndexes(data, this._o.sortby, [mCounter, sCounter, 3, 4, 5]);

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
			g_el.addEventListener("mousemove", this._onMoveTooltip);
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
				"stroke-width": this._o.width,
				stroke: val.color,
				fill: val.color,
				d: SmartPies.describeArc(this.asf, centerPt.x, centerPt.y, this._normRadius, startAngle, endAngle)
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
					d: SmartPies.describeArc(this.asf, centerPt.x, centerPt.y, normRadius, startAngle, endAngle, true)
				}, g_el, this._svgdoc);
				if (saData.length === 1) {
					// draw additiional internal circle with main-target color
					normRadius = normRadius - segmentWidth;
					SmartPies.addElement('path', {
						id:`${this._o.id}--${i}--add-main-target`,
						class: 'main-target',
						'data-linkto': `${link.linkto}`,
						'data-uuid': `${val.uuid}`,
						"stroke-width": this._o.width,
						fill: val.color,
						d: SmartPies.describeArc(this.asf, centerPt.x, centerPt.y, normRadius, startAngle, endAngle)
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
		if (pie._o.ttiptype == 'allData') {
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
		data.options.isRun = pie._run;
		data.options.tRect = pie._bodyShad.getBoundingClientRect();
		data.options.sortby = pie._o.sortby;
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
		let aTarget = event.target.id.split('--');
		const pie = window.SmartPies.get(aTarget[0]);
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
			pie.setAttribute('type', pie._o.type);
			console.info('Set type to ' + pie._o.type);
		} else if (event.shiftKey) {
			let isRun = !pie._run;
			if (pie._o.mode === "html") {
				if (isRun) {
					pie.setAttribute('run', '1');
				} else {
					pie.removeAttribute('run');
				}
			} else if (pie._o.mode === "svg") {
				pie.run = isRun;
			}
			console.info('Update is' + (isRun ? ' started' : ' stoped'));
		} else {
			let elRef = null;
			let linkto = '';
			if (aTarget[aTarget.length-1] === 'legend-rect') {
				elRef = pie._legend[aTarget[1]].ref;
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
}
window.customElements.define('smart-pie', SmartPie);
