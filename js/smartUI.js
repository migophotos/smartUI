/* eslint-disable linebreak-style */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-multi-spaces */
/* eslint-disable no-prototype-builtins */
/* eslint-disable indent */
/* eslint-disable nonblock-statement-body-position */
/* eslint-disable no-multi-assign */

/**
 * Utilitts
 */
class utils {
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
			'max',
			'min',
			'step',
			'count',
			'value'
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
}

/**
 * smartUI - семейство UI элементов, позволяющих строить пользовательские интерфейсы.
 * Каждый элемент представляет собой custom control
 *
 */
class SmartUiSelector extends HTMLElement {
    constructor() {
        super();
        this._shadowDOM = this.attachShadow({mode: 'open'});
		if (!this._shadowDOM) {
            throw new Error('Unfortunately, your browser does not support shadow DOM v1.');
        }
        this._shadowDOM.innerHTML = `
            <style>
                :host {
                    all: initial;
                    color: rgba( 102,227,255, 0.4 );
                }
                :host([disabled]) { /* style when host has disabled attribute. */
                    pointer-events: none;
                    opacity: 0.2;
                }

                .iconfill {
                    fill: #ffffff;
                    opacity: 0.8;
                }
                .iconfill:hover {
                    opacity: 1;
                }
                .title:hover {
                    opacity: 1;
                }

                .smartcontainer {
                    font-family: Helvetica, sans-serif;
                    color: rgba( 255,255,255, 0.8 );

                }
                .smartcontainer .title {
                    text-transform: uppercase;
                    font-size: 9px;
                    -webkit-font-smoothing: subpixel-antialiased;
                    height: 12px;
                }

                .smartcontainer .controls {
                    display: inline-block;
                    margin-bottom: 3px;
                    margin-left: 2px;
                    vertical-align: top;
                }

                .svgcontainer {
                    position: relative;
                    display: inline-block;
                    overflow: hidden;
                    margin-bottom: 3px;
                    vertical-align: top;
                }

                .smartcontainer input {
                    color: rgba( 255,255,255, 1 );
                    display: block;
                    float: left;
                    width: 190px;
                    background: none;
                    border: 1px solid;
                    margin: 2px 4px 2px 8px;
                    padding: 1px 3px 2px 3px;
                    font-size: 11px;
                    text-align: left;
                    opacity: 0.8;
                }
                .smartcontainer input:hover {
                    opacity: 1;
                }

                select {
                    min-width: 65px;
                    height: 20px;
                }
                select:focus {
                    outline: none;
                }
            </style>
            <div class="smartcontainer">
                <div class="icon svgcontainer">
                    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
                    overflow="scroll" xml:space="preserve" x="0px" y="0px" width="35px" height="34px" viewBox="0 0 35 34">
                        <g class="iconfill">
                        <image xlink:href="${this.getAttribute('image')}" x="0" y="0" width="35px" height="34px"/>
                        </g>
                    </svg>
                </div>
                <div class="controls">
                    <div class="title">${_(this.getAttribute('title'))}</div>
                    <select id="IC" />
                </div>
            </div>

        `;
    }
    static get observedAttributes() {
		return 	['value'];
    }
    attributeChangedCallback(name, oldValue, newValue) {
        if (!this._o || oldValue == newValue) {
            return;
        }

        switch (name) {
            case 'value': {
                this._o.value = newValue;
                this._input.value = newValue;
                break;
            }
        }
    }

	connectedCallback() {
        // get all attributes into _o (options)
        this._o = {};
        for (let attr of this.attributes) {
			this._o[attr.name] = attr.value;
        }
        // convert to numbers
        utils.convertNumericProps(this._o);
        // get references to controls
        this._input  = this._shadowDOM.getElementById('IC');    // input
        const values = this._o.valuelist.split(',');
        const labels  = typeof this._o.labellist !== 'undefined' ? this._o.labellist.split(',') : values;

        for (let n = 0; n < values.length; n++) {
            let value = values[n];
            let label = _(labels[n]);
            let optionEl = this._shadowDOM.ownerDocument.createElement('option');
            optionEl.label = label;
            optionEl.value = value;
            this._input.add(optionEl);
        }

        this._input.addEventListener('change', (evt) => {
            this._o.value = this._input.value;
            this.setAttribute('value', `${this._o.value}`);
        });

	}
	disconnectedCallback() {
        this.className = this.className;
    }


}
if (!customElements.get('smart-ui-selector')) {
    customElements.define('smart-ui-selector', SmartUiSelector);
}


class SmartUiEditText extends HTMLElement {
    constructor() {
        super();
        this._shadowDOM = this.attachShadow({mode: 'open'});
		if (!this._shadowDOM) {
            throw new Error('Unfortunately, your browser does not support shadow DOM v1.');
        }
        this._shadowDOM.innerHTML = `
            <style>
                :host {
                    all: initial;
                    color: rgba( 102,227,255, 0.4 );
                }
                :host([disabled]) { /* style when host has disabled attribute. */
                    pointer-events: none;
                    opacity: 0.2;
                }

                .iconfill {
                    fill: #ffffff;
                    opacity: 0.8;
                }
                .iconfill:hover {
                    opacity: 1;
                }
                .title:hover {
                    opacity: 1;
                }

                .smartcontainer {
                    font-family: Helvetica, sans-serif;
                    color: rgba( 255,255,255, 0.8 );

                }
                .smartcontainer .title {
                    text-transform: uppercase;
                    font-size: 9px;
                    -webkit-font-smoothing: subpixel-antialiased;
                    height: 12px;
                }

                .smartcontainer .controls {
                    display: inline-block;
                    margin-bottom: 3px;
                    margin-left: 2px;
                    vertical-align: top;
                }

                .svgcontainer {
                    position: relative;
                    display: inline-block;
                    overflow: hidden;
                    margin-bottom: 3px;
                    vertical-align: top;
                }

                /* plus and minus buttons */
                .plusminus {
                    display: block;
                    float: left;
                    /* width: 33px; */
                    height: 16px;
                    overflow: hidden;
                    margin-top: 3px;
                }

                .slider {
                    display: block;
                    float: left;
                    overflow: unset;
                    margin: 6px 12px 0 0;
                }
                .smartcontainer input {
                    color: rgba( 255,255,255, 1 );
                    display: block;
                    float: left;
                    width: 190px;
                    background: none;
                    border: 1px solid;
                    margin: 2px 4px 2px 0px;
                    padding: 1px 3px 2px 3px;
                    font-size: 11px;
                    text-align: left;
                    opacity: 0.8;
                }
                .smartcontainer input:hover {
                    opacity: 1;
                }


                /* styling input[type-range] */
                input[type=range] {
                    -webkit-appearance: none; /* Hides the slider so that custom slider can be made */
                    height:2px;
                    width:100%;
                    cursor: pointer;
                    background: transparent;
                    margin-bottom: 10px;
                }
                input[type=range]::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    border: 1px solid #fff;
                    height: 16px;
                    width: 16px;
                    border-radius: 8px;
                    background: #009fff;
                    cursor: pointer;
                    margin-top: 0px; /* You need to specify a margin in Chrome, but in Firefox and IE it is automatic */
                }
                input:focus {
                    outline: none;
                }

            </style>
            <div class="smartcontainer">
                <div class="icon svgcontainer">
                    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
                    overflow="scroll" xml:space="preserve" x="0px" y="0px" width="35px" height="34px" viewBox="0 0 35 34">
                        <g class="iconfill">
                        <image xlink:href="${this.getAttribute('image')}" x="0" y="0" width="35px" height="34px"/>
                        </g>
                    </svg>
                </div>
                <div class="controls">
                    <div class="title">${_(this.getAttribute('title'))}</div>
                    <div class="plusminus">
                    </div>

                    <input id="IC" type="text" value="${this.getAttribute('value')}" />
                </div>
            </div>

        `;
    }
    static get observedAttributes() {
		return 	['value'];
    }
    attributeChangedCallback(name, oldValue, newValue) {
        if (!this._o) {
            return;
        }

        switch (name) {
            case 'value': {
                this._o.value = newValue;
                this._input.value = `${this._o.value}`;
                break;
            }
        }
    }

	connectedCallback() {
        // get all attributes into _o (options)
        this._o = {};
        for (let attr of this.attributes) {
			this._o[attr.name] = attr.value;
        }
        // convert to numbers
        utils.convertNumericProps(this._o);
        // get references to controls
        this._input  = this._shadowDOM.getElementById('IC');    // input

        this._input.addEventListener('input', (evt) => {
            this._o.value = this._input.value;
            this.setAttribute('value', `${this._o.value}`);
        });
        this._input.addEventListener('change', (evt) => {
            this._o.value = this._input.value;
            this.setAttribute('value', `${this._o.value}`);
        });

	}
	disconnectedCallback() {
        this.className = this.className;
    }


}
if (!customElements.get('smart-ui-edittext')) {
    customElements.define('smart-ui-edittext', SmartUiEditText);
}


 class SmartUiEditSlider extends HTMLElement {
    constructor() {
        super();
        this._shadowDOM = this.attachShadow({mode: 'open'});
		if (!this._shadowDOM) {
            throw new Error('Unfortunately, your browser does not support shadow DOM v1.');
        }
        this._shadowDOM.innerHTML = `
            <style>
                :host {
                    all: initial;
                    color: rgba( 102,227,255, 0.4 );
                }
                :host([disabled]) { /* style when host has disabled attribute. */
                    pointer-events: none;
                    opacity: 0.2;
                }

                .iconfill {
                    fill: #ffffff;
                    opacity: 0.8;
                }
                .iconfill:hover {
                    opacity: 1;
                }
                .title:hover {
                    opacity: 1;
                }

                .smartcontainer {
                    font-family: Helvetica, sans-serif;
                    color: rgba( 255,255,255, 0.8 );

                }
                .smartcontainer .title {
                    text-transform: uppercase;
                    font-size: 9px;
                    -webkit-font-smoothing: subpixel-antialiased;
                    height: 12px;
                }

                .smartcontainer .controls {
                    display: inline-block;
                    margin-bottom: 3px;
                    margin-left: 2px;
                    vertical-align: top;
                }

                .svgcontainer {
                    position: relative;
                    display: inline-block;
                    overflow: hidden;
                    margin-bottom: 3px;
                    vertical-align: top;
                }

                /* plus and minus buttons */
                .plusminus {
                    display: block;
                    float: left;
                    /* width: 33px; */
                    height: 16px;
                    overflow: hidden;
                    margin-top: 3px;
                }
                .plusminus .btn path {
                    opacity: 0.8;
                }
                .plusminus .btn:hover path {
                    cursor: pointer;
                    opacity: 1;
                }


                .slider {
                    display: block;
                    float: left;
                    overflow: unset;
                    margin: 6px 12px 0 0;
                }
                .smartcontainer input {
                    color: rgba( 255,255,255, 1 );
                    display: block;
                    float: left;
                    max-width: 62px;
                    min-width: 40px;
                    // width: 40px;
                    background: none;
                    border: 1px solid;
                    margin: 2px 4px 2px 8px;
                    padding: 1px 3px 2px 3px;
                    font-size: 11px;
                    text-align: right;
                    opacity: 0.8;
                }
                .smartcontainer input:hover {
                    opacity: 1;
                }


                /* styling input[type-range] */
                input[type=range] {
                    -webkit-appearance: none; /* Hides the slider so that custom slider can be made */
                    height:2px;
                    width:100%;
                    cursor: pointer;
                    background: transparent;
                    margin-bottom: 10px;
                }
                input[type=range]::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    border: 1px solid #fff;
                    height: 16px;
                    width: 16px;
                    border-radius: 8px;
                    background: #009fff;
                    cursor: pointer;
                    margin-top: 0px; /* You need to specify a margin in Chrome, but in Firefox and IE it is automatic */
                }
                input:focus {
                    outline: none;
                }

            </style>
            <div class="smartcontainer">
                <div class="icon svgcontainer">
                    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
                    overflow="scroll" xml:space="preserve" x="0px" y="0px" width="35px" height="34px" viewBox="0 0 35 34">
                        <g class="iconfill">
                        <image xlink:href="${this.getAttribute('image')}" x="0" y="0" width="35px" height="34px"/>
                        </g>
                    </svg>
                </div>
                <div class="controls">
                    <div class="title">${_(this.getAttribute('title'))}</div>
                    <div class="plusminus">
                        <div class="svgcontainer btn" id="MB">
                            <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
                            overflow="scroll" xml:space="preserve" x="0px" y="0px" width="17px" height="16px" viewBox="0 0 17 16">
                                <g class="iconfill">
                                    <path d="M8,0C3.582,0,0,3.582,0,8s3.582,8,8,8h8V0H8z M5,9V7h8v2H5z"></path>
                                </g>
                            </svg>
                        </div>
                        <div class="svgcontainer btn" id="PB">
                            <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
                            overflow="scroll" xml:space="preserve" x="0px" y="0px" width="16px" height="16px" viewBox="0 0 16 16">
                                <g class="iconfill">
                                    <path d="M8,0H0v16h8c4.418,0,8-3.582,8-8S12.418,0,8,0z M11,9H8v3H6V9H3V7h3V4h2v3h3V9z"></path>
                                </g>
                            </svg>
                        </div>
                    </div>

                    <input id="IC" type="text"
                        value="${this.getAttribute('value')} ${this.getAttribute('units')}"
                        max="${this.getAttribute('max')}"
                        min="${this.getAttribute('min')}"
                        step="${this.getAttribute('step')}"
                        multi="${this.getAttribute('multi')}" />
                    <div class="slider" style="width:90px; height:16px;">
                        <input name="slider" class="slider-bar" id="SL" type="range"
                        max="${this.getAttribute('max')}"
                        value="${this.getAttribute('value')}"
                        min="${this.getAttribute('min')}"
                        step="${this.getAttribute('step')}"
                        multi="${this.getAttribute('multi')}" />
                    </div>
                </div>
            </div>

        `;
    }
    static get observedAttributes() {
		return 	['value'];
    }
    attributeChangedCallback(name, oldValue, newValue) {
        if (!this._o || oldValue == newValue) {
            return;
        }

        switch (name) {
            case 'value': {
                let result = this.convertAndValidate(newValue);
                // the first value is a default. Double click on slider will restore the current value to it
                if (typeof this._firstValue === 'undefined') {
                    this._firstValue = result;
                }
                this._o.value = result;
                this._input.value = `${result} ${this._o.units}`;
                this._slider.value = this._o.value;
                break;
            }
        }
    }

    clear() {
        delete this._firstValue;
    }
    convertAndValidate(val) {
        let result = null;
        if (parseFloat(this._o.step) - parseInt(this._o.step, 10) != 0) {
            result = parseFloat(parseFloat(val).toFixed(1));    // for example: let val = "1.245"; parseFloat(parseFloat(val).toFixed(1)) == 1.2
        } else {
            result = parseInt(val, 10);
        }
        if (isNaN(result)) {
            result = this._o.min;
        }
        if (result < this._o.min) {
            result = this._o.min;
        }
        if (result > this._o.max) {
            result = this._o.max;
        }
        return result;
    }

	connectedCallback() {
        // get all attributes into _o (options)
        this._o = {};
        for (let attr of this.attributes) {
			this._o[attr.name] = attr.value;
        }
        // convert to numbers
        utils.convertNumericProps(this._o);
        if (this._o.value != '') {
            this._firstValue = this._o.value;
        }
        // get references to controls
        this._input  = this._shadowDOM.getElementById('IC');    // input
        this._minus  = this._shadowDOM.getElementById('MB');    // buttton '-'
        this._plus   = this._shadowDOM.getElementById('PB');    // button '+'
        this._slider = this._shadowDOM.getElementById('SL');    // range input

		this._slider.addEventListener('wheel', (e) => {
			let K = e.ctrlKey ? 10 : e.shiftKey ? 5 : 1;
			let delta = e.deltaY || e.detail || e.wheelDelta;
			if (delta > 0) {
				this._slider.value = Number(this._slider.value) + (this._o.step * K);
			} else if (delta < 0) {
				this._slider.value = Number(this._slider.value) - (this._o.step * K);
			}
			this._o.value = Number(this._slider.value);
			this.setAttribute('value', `${this._o.value}`);
			this._input.value = `${this._o.value} ${this._o.units}`;
			e.preventDefault();
		});

		this._slider.addEventListener('input', (evt) => {
            this._o.value = Number(this._slider.value);
            this.setAttribute('value', `${this._o.value}`);

            this._input.value = `${this._o.value} ${this._o.units}`;
        });

		this._slider.addEventListener('dblclick', (evt) => {
            if (typeof this._firstValue !== 'undefined') {
                this._o.value = this._firstValue;
                this.setAttribute('value', `${this._o.value}`);
                this._input.value = `${this._o.value} ${this._o.units}`;
            }
        });
		// input edit control
		this._input.addEventListener('wheel', (e) => {
			let K = e.ctrlKey ? 10 : e.shiftKey ? 5 : 1;
			let delta = e.deltaY || e.detail || e.wheelDelta;
			let value = this._o.step < 1 ? parseFloat(this._input.value) : parseInt(this._input.value, 10);

			let result;

			if (delta > 0) {
				result = value + (this._o.step * K);
			} else if (delta < 0) {
				result = value - (this._o.step * K);
			}
			result = result.toFixed(2);
			result = result < this._o.min ? this._o.min : result;
			result = result > this._o.max ? this._o.max : result;
			this._o.value = result;
            this.setAttribute('value', `${this._o.value}`);
			this._input.value = `${result} ${this._o.units}`;
			this._slider.value = this._o.value;
			e.preventDefault();
		});

        this._input.addEventListener('change', (evt) => {
            let result = this.convertAndValidate(this._input.value);
            this._o.value = result;
            this.setAttribute('value', `${this._o.value}`);

            this._input.value = `${result} ${this._o.units}`;
            this._slider.value = this._o.value;

        });

        this._plus.addEventListener('click', (evt) => {
            if (typeof this._o.value === 'number' && typeof this._o.max === 'number' && typeof this._o.step === 'number') {
                if (this._o.value + this._o.step > this._o.max) {
                    this._o.value = this._o.max;
                } else {
                    this._o.value += this._o.step;
                }
                let result = this.convertAndValidate(this._o.value);
                this.setAttribute('value', `${result}`);

                this._input.value = `${result} ${this._o.units}`;
                this._slider.value = this._o.value;
            }
        });
        this._minus.addEventListener('click', (evt) => {
            if (typeof this._o.value === 'number' && typeof this._o.min === 'number' && typeof this._o.step === 'number') {
                if (this._o.value - this._o.step < this._o.min) {
                    this._o.value = this._o.min;
                } else {
                    this._o.value -= this._o.step;
                }
                let result = this.convertAndValidate(this._o.value);
                this.setAttribute('value', `${result}`);

                this._input.value = `${result} ${this._o.units}`;
                this._slider.value = this._o.value;
            }
        });
	}
	disconnectedCallback() {
        this.className = this.className;
    }


}
if (!customElements.get('smart-ui-editslider')) {
    customElements.define('smart-ui-editslider', SmartUiEditSlider);
}
/** SmartUiButton realizes button, checkbox, radiobutton in group
 *  <smart-ui-button
 *      class="widgets-btn" - class name of radiobuttons group in case of type equal 'radio', in other cases just a class name
 *      id="btn-01"         - unique id
 *      targets="comma-separated list of targets" - not in use
 *      type="radio or checkbox (if not exist)"   - if attribute empty, or not exist the type of button is checkbox or just a button (see images description)
 *      state="on or off"   - initial state for checkbox or radio-button, toggles on click (on / off)
 *      image-width="WW"    - set width of images, default is 35
 *      image-height="HH"   - set height of images, default is 34
 *      imageOn=""          - visualization for 'on' state, in case of not specified 'image' attribute will be used instead it
 *      imageOff=""         - visualization for 'off' state, in case of not specified 'image' attribute will be used instead it
 *      (or image="" if not needed switch effect) - may be specified instead of 'imageOn' and/or 'imageOff' attributes
 *      label="any text"    - show label after icon if specified
 *      data-sttip-tooltip="tooltip"> - this attribute used by SmartTooltip for showing specified text as tooltip.
 *                                      For this functionality the class name must be specified in attribute 'className' of <smart-ui-tooltip> custom element
 *  </smart-ui-button>
 * When user clicks on this button this element generates an event 'click' and store own state in parameter this.state and inside attribute 'current-state'

 */
class SmartUiButton extends HTMLElement {
    constructor() {
        super();
        this._o     = null; // options
        this._btn   = null; // button
        this._off   = null; // icon off
        this._on    = null; // icon on

        this._shadowDOM = this.attachShadow({mode: 'open'});
		if (!this._shadowDOM) {
            throw new Error('Unfortunately, your browser does not support shadow DOM v1.');
        }
        this._shadowDOM.innerHTML = `
            <style>
                :host {
                    all: initial;
                    contain: content;
                    color: rgba( 102,227,255, 0.4 );
                }
                :host([disabled]) { /* style when host has disabled attribute. */
                    pointer-events: none;
                    opacity: 0.2;
                }


                .smartcontainer {
                    font-family: Helvetica, sans-serif;
                    color: rgba( 255,255,255, 0.8 );
                }
                .smartcontainer .title {
                    text-transform: uppercase;
                    font-size: 9px;
                    -webkit-font-smoothing: subpixel-antialiased;
                    height: 12px;
                }
                .svgcontainer {
                    position: relative;
                    display: inline-block;
                    overflow: hidden;
                    margin-bottom: 3px;
                    vertical-align: top;
                }
                div#label {
                    float: right;
                    margin-left: 10px;
                    margin-top: 6px;
                }
                .iconfill {
                    fill: #ffffff;
                    opacity: 0.8;
                }
                .iconfill:hover {
                    opacity: 1;
                }
                .title:hover {
                    opacity: 1;
                }
                div#label:hover {
                    opacity: 1;
                }


            </style>
            <div class="smartcontainer">
                <div class="icon svgcontainer" id="btn">
                    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
                    overflow="scroll" xml:space="preserve" x="0px" y="0px" width="35px" height="34px" viewBox="0 0 35 34">
                        <g class="iconfill">
                        <image id="off" xlink:href="${this.getAttribute('imageOff') || this.getAttribute('image')}" x="0" y="0" width="35" height="34"/>
                        <image id="on" xlink:href="${this.getAttribute('imageOn') || this.getAttribute('image')}" x="0" y="0" width="35" height="34"/>
                        </g>
                    </svg>
                    <div class="title" id="label"> ${_(this.getAttribute('label')) || ''}</div>
                </div>
            </div>
        `;
    }
    _applyState(state) {
        if (state == 'off') {
            this._on.style.setProperty('display', 'none');
            this._off.style.setProperty('display', 'unset');
        } else {
            this._on.style.setProperty('display', 'unset');
            this._off.style.setProperty('display', 'none');
        }
        this.setAttribute('current-state', this._o.state);

        if (typeof this._o.class === 'string' && this._o.class.length) {
            if (this._o.type === 'radio' && this._o.state === 'on') {
                // try to find all elements with same class name and same type and change it's state (exclude own) to off
                const sameClassEls = document.getElementsByClassName(this._o.class);
                for (let el of sameClassEls) {
                    if (el.getAttribute('type') === this._o.type && el.getAttribute('id') !== this.id) {
                        el.setAttribute('state', 'off');
                    }
                }
            }
        }
    }
    static get observedAttributes() {
		return 	['state', 'imageOn', 'imageOff', 'targets'];
    }
    attributeChangedCallback(name, oldValue, newValue) {
        if (!this._o) {
            return;
        }

        switch (name) {
            case 'state':
                this._o.state = (newValue === '1' || newValue === 'on') ? 'on' : 'off';
                this._applyState(this._o.state);
                break;
            case 'imageOn':
                if (this._on) {
                    this._on.setAttribute('xlink:href', newValue);
                }
                break;
            case 'imageOff':
                if (this._off) {
                    this._off.setAttribute('xlink:href', newValue);
                }
                break;
            case 'targets':
                this._o.targets = newValue;
                break;
        }

    }


    connectedCallback() {
        // get all attributes into _o (options)
        this._o = {};
        for (let attr of this.attributes) {
            this._o[attr.name] = attr.value;
        }
        // get references
        this._btn = this._shadowDOM.getElementById('btn');
        this._on  = this._shadowDOM.getElementById('on');
        this._off = this._shadowDOM.getElementById('off');

        if (this._btn && this._on && this._off) {
            let imageWidth = this.getAttribute('image-width');
            let imageHeight = this.getAttribute('image-height');
            if (imageHeight && imageWidth) {
                this._on.setAttribute('width', imageWidth);
                this._on.setAttribute('height', imageHeight);
                this._off.setAttribute('width', imageWidth);
                this._off.setAttribute('height', imageHeight);
                const btnSvg = this._btn.firstElementChild;
                btnSvg.viewBox.baseVal.width = imageWidth;
                btnSvg.viewBox.baseVal.height = imageHeight;
                btnSvg.setAttribute('width', `${imageWidth}px`);
                btnSvg.setAttribute('height', `${imageHeight}px`);
            }

            this._o.state = this._o.state || 'on';
            this._applyState(this._o.state);

            this._btn.addEventListener('click', (evt) => {
                if (this._o.type === 'radio' && this._o.state === 'on') {
                    return;
                }
                this._o.state = this._o.state === 'on' ? 'off' : 'on';
                this.state = this._o.state; // see evt.target.state on 'click' event
                this._applyState(this._o.state);
            });
        }
    }
}
if (!customElements.get('smart-ui-button')) {
    customElements.define('smart-ui-button', SmartUiButton);
}

class SmartUiCheckBox extends HTMLElement {
    constructor() {
        super();
        this._shadowDOM = this.attachShadow({mode: 'open'});
		if (!this._shadowDOM) {
            throw new Error('Unfortunately, your browser does not support shadow DOM v1.');
        }
        this._shadowDOM.innerHTML = `
            <style>
                :host {
                    all: initial;
                    color: rgba( 102,227,255, 0.4 );
                }
                :host([disabled]) { /* style when host has disabled attribute. */
                    pointer-events: none;
                    opacity: 0.2;
                }

                .iconfill {
                    fill: #ffffff;
                    opacity: 0.8;
                }
                .iconfill:hover {
                    opacity: 1;
                }
                .title:hover {
                    opacity: 1;
                }

                .smartcontainer {
                    font-family: Helvetica, sans-serif;
                    color: rgba( 255,255,255, 0.8 );

                }
                .smartcontainer .title {
                    text-transform: uppercase;
                    font-size: 9px;
                    -webkit-font-smoothing: subpixel-antialiased;
                    height: 12px;
                }

                .smartcontainer .controls {
                    display: inline-block;
                    margin-top: 3px;
                    margin-left: 2px;
                    vertical-align: top;
                }

                .svgcontainer {
                    position: relative;
                    display: inline-block;
                    overflow: hidden;
                    vertical-align: top;
                }

                #c_btn {
                    float: left;
                    margin-top: 5px;
                    // margin-left: 40px;
                }


                input:focus {
                    outline: none;
                }

            </style>
            <div class="smartcontainer">
                <div class="icon svgcontainer">
                    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
                    overflow="scroll" xml:space="preserve" x="0px" y="0px" width="35px" height="34px" viewBox="0 0 35 34">
                        <g class="iconfill">
                        <image xlink:href="${this.getAttribute('image')}" x="0" y="0" width="35px" height="34px"/>
                        </g>
                    </svg>
                </div>
                <div class="controls">
                    <smart-ui-button class="c-btn"
                        id="c_btn"
                        label="${_(this.getAttribute('title'))}";
                        state="${this.getAttribute('state')}"
                        imageOn="${this.getAttribute('imageOn')}"
                        imageOff="${this.getAttribute('imageOff')}"
                        image-width="${this.getAttribute('iw') || 35}"
                        image-height="${this.getAttribute('ih') || 34}"
                        >
                    </smart-ui-button>
                </div>
            </div>

        `;
    }
    static get observedAttributes() {
		return 	['value', 'imageOn', 'imageOff', 'iw', 'ih'];
    }
    attributeChangedCallback(name, oldValue, newValue) {
        if (!this._o) {
            return;
        }

        switch (name) {
            case 'value':
                this._o.value = (newValue === '1' || newValue === 'on') ? 'on' : 'off';
                this._btn.setAttribute('state', this._o.value);
                break;
            case 'imageOn':
                this._btn.setAttribute('xlink:href', newValue);
                break;
            case 'imageOff':
                this._btn.setAttribute('xlink:href', newValue);
                break;
            case 'iw':
                this._btn.setAttribute('width', imageWidth);
                break;
            case 'ih':
                this._btn.setAttribute('height', imageHeight);
                break;
        }
    }

    connectedCallback() {
        // get all attributes into _o (options)
        this._o = {};
        for (let attr of this.attributes) {
            this._o[attr.name] = attr.value;
        }
        // get references
        this._btn = this._shadowDOM.getElementById('c_btn');

        if (this._btn) {
            let imageWidth = this.getAttribute('iw');
            let imageHeight = this.getAttribute('ih');
            if (imageHeight && imageWidth) {
                this._btn.setAttribute('width', imageWidth);
                this._btn.setAttribute('height', imageHeight);
            }

            this._o.value = this._o.value || 'on';
            this._btn.setAttribute('state', this._o.value);

            this._btn.addEventListener('click', (evt) => {
                this.value = this._o.value = this._btn.state;
                this.setAttribute('value', this.value);
                // simulate 'click event
                let simulateClick = document.createEvent('MouseEvents');
                simulateClick.initMouseEvent('click', true, true, document.defaultView, 0, 0, 0, 0, 0, false, false, false, 0, null, null);
                this.dispatchEvent(simulateClick);
            });
        }
    }
}

if (!customElements.get('smart-ui-checkbox')) {
    customElements.define('smart-ui-checkbox', SmartUiCheckBox);
}

class SmartUiColorBox extends HTMLElement {
    constructor() {
        super();
        this._shadowDOM = this.attachShadow({mode: 'open'});
		if (!this._shadowDOM) {
            throw new Error('Unfortunately, your browser does not support shadow DOM v1.');
        }
        this._shadowDOM.innerHTML = `
            <style>
                :host {
                    all: initial;
                    contain: content;
                    color: rgba( 102,227,255, 0.4 );
                }
                :host([disabled]) { /* style when host has disabled attribute. */
                    pointer-events: none;
                    opacity: 0.2;
                }

                .iconfill {
                    fill: #ffffff;
                    opacity: 0.8;
                }
                .iconfill:hover {
                    opacity: 1;
                }
                .title:hover {
                    opacity: 1;
                }

                .smartcontainer {
                    font-family: Helvetica, sans-serif;
                    color: rgba( 255,255,255, 0.8 );

                }
                .smartcontainer .title {
                    text-transform: uppercase;
                    font-size: 9px;
                    -webkit-font-smoothing: subpixel-antialiased;
                    height: 12px;
                }

                .smartcontainer .controls {
                    display: inline-block;
                    margin-bottom: 3px;
                    margin-left: 2px;
                    vertical-align: top;
                }

                .svgcontainer {
                    position: relative;
                    display: inline-block;
                    overflow: hidden;
                    margin-bottom: 3px;
                    vertical-align: top;
                }

                /* plus and minus buttons */
                .plusminus {
                    display: block;
                    float: left;
                    width: 3px;
                    height: 16px;
                    overflow: hidden;
                    margin-top: 3px;
                }
                .plusminus .btn path {
                    opacity: 0.8;
                }
                .plusminus .btn:hover path {
                    cursor: pointer;
                    opacity: 1;
                }


                .slider {
                    display: block;
                    float: left;
                    overflow: unset;
                }
                .smartcontainer input[type=text] {
                    color: rgba( 255,255,255, 1 );
                    // display: block;
                    // float: left;
                    overflow: unset;
                    width: 50px;
                    background: none;
                    border: 0px solid;
                    // margin: 2px 4px 2px 8px;
                    // padding: 1px 3px 2px 3px;
                    font-size: 11px;
                    text-align: right;
                    opacity: 0.8;
                    position: relative;
                    left: -58px
                }
                .smartcontainer input[type=color] {
                    color: rgba( 255,255,255, 1 );
                    display: block;
                    float: left;
                    width: 76px;
                    height: 13px;
                    background: none;
                    border: 1px solid;
                    margin: 2px 4px 2px 0px;
                    padding: 1px 3px 2px 3px;
                    opacity: 0.8;
                    //-webkit-appearance: menulist-text;
                }
                .smartcontainer input:hover {
                    opacity: 1;
                }


                /* styling input[type-color] */
                .smartcontainer input[type='color']::-webkit-color-swatch-wrapper {
                    padding: 0 0 0 0;
                    width: 14px;
                    height: 13px;
                    // radius: 6px;
                    border: 1px solid #fff;
                    margin-top: 0.5px; /* You need to specify a margin in Chrome, but in Firefox and IE it is automatic */
                }
                .smartcontainer input[type='color']::-webkit-color-swatch {
                    border-width: 0px;
                }

                input:focus {
                    outline: none;
                }

            </style>
            <div class="smartcontainer">
                <div class="icon svgcontainer">
                    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
                    overflow="scroll" xml:space="preserve" x="0px" y="0px" width="35px" height="34px" viewBox="0 0 35 34">
                        <g class="iconfill">
                        <image xlink:href="${this.getAttribute('image')}" x="0" y="0" width="35px" height="34px"/>
                        </g>
                    </svg>
                </div>
                <div class="controls">
                    <div class="title">${_(this.getAttribute('title'))}</div>

                    <div class="slider">
                        <input name="colorbox" class="slider-bar" id="colorbox" type="color" value="${this.getAttribute('value')}">
                        <input id="IC" type="text" value="${this.getAttribute('value')} ">
                    </div>
                </div>
            </div>

        `;
    }
    static get observedAttributes() {
		return 	['value'];
    }
    attributeChangedCallback(name, oldValue, newValue) {
        if (!this._o) {
            return;
        }

        switch (name) {
            case 'value': {
                const c = w3color(newValue);
                this._o.value = c.valid ? c.toHexString() : '#000000';
                this._input.value = `${this._o.value} `;
                this._colorBox.value = this._o.value;
                break;
            }
        }
    }

    connectedCallback() {
		// SmartTooltip.initTooltip
        // get all attributes into _o (options)
        this._o = {};
        for (let attr of this.attributes) {
            this._o[attr.name] = attr.value;
        }
        // get references to controls
        this._input     = this._shadowDOM.getElementById('IC');     // text input
        this._colorBox  = this._shadowDOM.getElementById('colorbox');

        this._colorBox.addEventListener('wheel', (evt) => {
            evt.preventDefault();

            const cr = this._colorBox.value; // `${this._colorBox.value}`;
            const c = w3color(cr);

            const P = evt.ctrlKey ? 'sat' : evt.shiftKey ? 'lightness' : 'hue';
			let K = evt.ctrlKey ? 0.1 : evt.shiftKey ? 0.1 : 10;
			if (evt.altKey) {
				K = K / 10;
			}
			const delta = evt.deltaY || evt.detail || evt.wheelDelta;
			if (delta > 0) {
                c[P] = c[P] + K;
            } else {
                c[P] = c[P] - K;
            }
            const h = c.hue > 359 ? 0 : c.hue < 0 ? 359 : c.hue;
            const s = c.sat; // > 100 ? 100 : c.sat < 0 ? 0 : c.sat;
            const l = c.lightness; // > 100 ? 100 : c.lightness < 0 ? 0 : c.lightness;
            const c2 = w3color("hsl(" + h + "," + s + "," + l + ")");

            this._o.value = c2.valid ? c2.toHexString() : '#000000';
            this.setAttribute('value', `${this._o.value}`);
            this._colorBox.value = this._o.value;
        });

        this._colorBox.addEventListener('change', (evt) => {
            this._o.value = `${this._colorBox.value}`;
            this.setAttribute('value', `${this._o.value}`);
            this._input.value = `${this._o.value} `;
        });
        this._input.addEventListener('change', (evt) => {
            let result = this._input.value.trimRight();
            this._o.value = result;
            this.setAttribute('value', `${this._o.value}`);
            this._colorBox.value = this._o.value;
        });

    }
}
if (!customElements.get('smart-ui-colorbox')) {
    customElements.define('smart-ui-colorbox', SmartUiColorBox);
}

class SmartUiColorPalette extends HTMLElement {
    constructor() {
		super();
		this.setValue = this.setValue.bind(this);

        this._shadowDOM = this.attachShadow({mode: 'open'});
		if (!this._shadowDOM) {
            throw new Error('Unfortunately, your browser does not support shadow DOM v1.');
        }
        this._shadowDOM.innerHTML = `
            <style>
                :host {
                    all: initial;
                    color: rgba( 102,227,255, 0.4 );
                }
                :host([disabled]) { /* style when host has disabled attribute. */
                    pointer-events: none;
                    opacity: 0.2;
                }

                .iconfill {
                    fill: #ffffff;
                    opacity: 0.8;
                }
                .iconfill:hover {
                    opacity: 1;
                }
                .title:hover {
                    opacity: 1;
                }

                .smartcontainer {
                    font-family: Helvetica, sans-serif;
                    color: rgba( 255,255,255, 0.8 );

                }
                .smartcontainer .title {
                    text-transform: uppercase;
                    font-size: 9px;
                    -webkit-font-smoothing: subpixel-antialiased;
                    height: 12px;
                }

                .smartcontainer .controls {
                    display: inline-block;
                    margin-bottom: 3px;
                    margin-left: 2px;
                    vertical-align: top;
                }

                .svgcontainer {
                    position: relative;
                    display: inline-block;
                    overflow: hidden;
                    margin-bottom: 3px;
                    vertical-align: top;
                }

                /* plus and minus buttons */
                .plusminus {
                    display: block;
                    float: left;
                    /* width: 33px; */
                    height: 16px;
                    overflow: hidden;
                    margin-top: 3px;
                }

                .slider {
                    display: block;
                    float: left;
                    overflow: unset;
                    margin: 6px 12px 0 0;
                }
                .smartcontainer input#IC {
                    color: rgba( 255,255,255, 1 );
                    display: block;
                    float: left;
                    width: 300px;
                    background: none;
                    border: 1px solid;
                    margin: 2px 4px 2px 0px;
                    padding: 1px 3px 2px 3px;
                    font-size: 11px;
                    text-align: left;
                    opacity: 0.8;
                }
                .smartcontainer input:hover {
                    opacity: 1;
                }


                /* styling input[type-range] */
                input[type=range] {
                    -webkit-appearance: none; /* Hides the slider so that custom slider can be made */
                    height:2px;
                    width:100%;
                    cursor: pointer;
                    background: transparent;
                    margin-bottom: 10px;
                }
                input[type=range]::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    border: 1px solid #fff;
                    height: 16px;
                    width: 16px;
                    border-radius: 8px;
                    background: #009fff;
                    cursor: pointer;
                    margin-top: 0px; /* You need to specify a margin in Chrome, but in Firefox and IE it is automatic */
                }
                input:focus {
                    outline: none;
                }

            </style>
            <div class="smartcontainer">
                <div class="icon svgcontainer">
                    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
                    overflow="scroll" xml:space="preserve" x="0px" y="0px" width="35px" height="34px" viewBox="0 0 35 34">
                        <g class="iconfill">
                        <image xlink:href="${this.getAttribute('image')}" x="0" y="0" width="35px" height="34px"/>
                        </g>
                    </svg>
                </div>
                <div class="controls">
                    <div class="title">${_(this.getAttribute('title'))}</div>

                    <input id="IC" type="text" value="${this.getAttribute('value')}" />
				</div>
                <div class="icon svgcontainer">
                    <svg id="sel-palette" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
                    overflow="scroll" xml:space="preserve" x="0px" y="0px" width="35px" height="34px" viewBox="0 0 35 34">
                        <g id="palette">
                        </g>
                    </svg>
                </div>
            </div>
        `;
	}
	setValue(val) {
		this.setAttribute('value', val);
	}
    static get observedAttributes() {
		return 	['value'];
    }
    attributeChangedCallback(name, oldValue, newValue) {
        if (!this._o) {
            return;
        }

        switch (name) {
            case 'value': {
                this._o.value = newValue;
				this._input.value = `${this._o.value}`;
				this._ctrl.setParams({stateColors: newValue});

				// this._s2c.set(this._input.value);
				// for (let n = 0; n < 9; n++) {
				// 	const crDef = this._s2c.get(n);
				// 	if (crDef) {
				// 		this._btnGrArr[n].setAttribute('display', 'none');
				// 		this._paletteArr[n].setAttribute('fill', crDef);
				// 	} else {
				// 		this._btnGrArr[n].removeAttribute('display');
				// 	}
				// }
                break;
            }
        }
    }

	connectedCallback() {
		const paletteG = this._shadowDOM.getElementById('palette');
		if (!paletteG || typeof SmartWidgets === 'undefined') {
			throw new ReferenceError('SmartWidget cannot be found');
		}

		this.svgroot = paletteG;
		this._svgdoc = paletteG.ownerDocument;

		// get references to controls
		this._input  = this._shadowDOM.getElementById('IC');    // input
		// this._input.addEventListener('input', (evt) => {
		//     this._o.value = this._input.value;
		//     this.setAttribute('value', `${this._o.value}`);
		// });
		this._input.addEventListener('change', (evt) => {
			this._o.value = this._input.value;
			this.setAttribute('value', `${this._o.value}`);
		});

		// get all attributes into _o (options)
		this._s2c = new StateToColors();
        this._o = {};
        for (let attr of this.attributes) {
			this._o[attr.name] = attr.value;
		}
		this._o.count = this._o.count || 9;
        // convert to numbers
		utils.convertNumericProps(this._o);

		const options = {
			cb: this.setValue,
			context: this._shadowDOM.getElementById('sel-palette'),
			opt: '{"stwidget":"stpal-.-.-0-0#0080c0,1#008000,2#ffff15,3#ff852e,4#ff0550,5#b400cc,6#424242"}'
		};

		this._ctrl = new SmartPalette('palette', options);
		const mysvg = this.shadowRoot.getElementById('sel-palette');

		// resize own svg
		const sz = {
			width: paletteG.getAttribute('width'),
			height: paletteG.getAttribute('height')
		};

		mysvg.setAttribute('height', sz.height);
		mysvg.setAttribute('width', sz.width);
		mysvg.setAttribute('viewBox', `0 0 ${sz.width} ${sz.height}`);

		// if (0) {
		// 	this._btnGrArr = [];
		// 	this._buttonArr = [];
		// 	this._paletteArr = [];
		// 	const fontFamily = 'Arial, DIN Condensed, Noteworthy, sans-serif';
		// 	const fontSize = '10px';
		// 	const step = 6, gap = 6;
		// 	let width = 60, height = 40, offsetX = gap, offsetY = gap;


		// 	const bRect = SmartWidgets.addElement('rect', {
		// 		x: 0,
		// 		y: 0,
		// 		width: `${(offsetX * 2) + (width * 3) + (step * 2)}`,
		// 		height: `${(offsetY * 2) + (height * 3) + (step * 2)}`,
		// 		fill: 'none',
		// 		stroke: '#ffffff'
		// 	}, paletteG, paletteG.ownerDocument);
		// 	for (let n = 0; n < this._o.count; n++) {
		// 		if (n && n % 3 == 0) {
		// 			offsetX = gap;
		// 			offsetY += step + height;
		// 		}
		// 		this._paletteArr.push(SmartWidgets.addElement('rect', {
		// 			id: `state-${n}`,
		// 			x: offsetX,
		// 			y: offsetY,
		// 			width: width,
		// 			height: height,
		// 			fill: 'none',
		// 			stroke: '#000000'
		// 		}, paletteG, paletteG.ownerDocument));
		// 		SmartWidgets.addElement('text', {
		// 			text: `State ${n}`,
		// 			x: offsetX + (width / 2),
		// 			y: offsetY + (height / 2),
		// 			fill: '#000000',
		// 			'text-anchor': 'middle',
		// 			'dominant-baseline': 'middle',
		// 			'pointer-events': 'none',
		// 			'font-family': fontFamily,
		// 			'font-size': fontSize,
		// 			// 'paint-order': 'stroke',
		// 			// stroke: 'black',
		// 			// 'stroke-width': "1",
		// 			'stroke-linejoin': 'round'
		// 		}, paletteG, paletteG.ownerDocument);

		// 		this._btnGrArr.push(SmartWidgets.addElement('g', {}, paletteG, paletteG.ownerDocument));
		// 		this._buttonArr.push(SmartWidgets.addElement('rect', {
		// 			id: `btn-${n}`,
		// 			x: offsetX,
		// 			y: offsetY,
		// 			width: width,
		// 			height: height,
		// 			fill: '#8f8f8f',
		// 			stroke: '#ffffff'
		// 		}, this._btnGrArr[n], paletteG.ownerDocument));
		// 		SmartWidgets.addElement('text', {
		// 			text: `${n} - default`,
		// 			x: offsetX + (width / 2),
		// 			y: offsetY + (height / 2),
		// 			fill: '#ffffff',
		// 			'text-anchor': 'middle',
		// 			'dominant-baseline': 'middle',
		// 			'alignment-baseline': 'middle',
		// 			'pointer-events': 'none',
		// 			'font-family': fontFamily,
		// 			'font-size': fontSize
		// 		}, this._btnGrArr[n], paletteG.ownerDocument);

		// 		offsetX += step + width;
		// 	}
		// 	const size = {
		// 		w: +bRect.getAttribute('width'),
		// 		h: +bRect.getAttribute('height')
		// 	};

		// 	// resize svg
		// 	const svgRoot = this._shadowDOM.getElementById('sel-palette');
		// 	svgRoot.setAttribute('height', size.h);
		// 	svgRoot.setAttribute('width', size.w);
		// 	svgRoot.setAttribute('viewBox', `0 0 ${size.w} ${size.h}`);

		// 	this._buttonArr.forEach((btn) => {
		// 		btn.addEventListener('click', (evt) => {
		// 			const n = Number(btn.id.replace('btn-', ''));
		// 			this._btnGrArr[n].setAttribute('display', 'none');
		// 			let cr = this._s2c.get(n);
		// 			if (!cr) { // lets try to find the color in 'anoter' place
		// 				cr = this._paletteArr[n].getAttribute('fill');
		// 				if (!cr || cr == 'none') {
		// 					cr = n ? this._s2c.get(n - 1) || '#888888' : '#888888';
		// 				}
		// 			}
		// 			if (cr) {
		// 				this._s2c.set(n, cr);
		// 				this._o.value = this._s2c.get();
		// 				this._paletteArr[n].setAttribute('fill', cr);

		// 				this.setAttribute('value', this._o.value);
		// 			}
		// 		});
		// 	});
		// 	this._paletteArr.forEach((sel) => {
		// 		sel.addEventListener('click', (evt) => {
		// 			const n = Number(sel.id.replace('state-', ''));
		// 			this._s2c.delete(n);
		// 			this.setAttribute('value', this._s2c.get());
		// 			this._btnGrArr[n].removeAttribute('display');
		// 		});
		// 	});


		// 	this._paletteArr.forEach((sel) => {
		// 		sel.addEventListener('wheel', (evt) => {
		// 			evt.preventDefault();
		// 			const stateN = Number(evt.target.id.split('-')[1]);

		// 			const cr = evt.target.getAttribute('fill'); // `${this._colorBox.value}`;
		// 			const c = w3color(cr);

		// 			const P = evt.ctrlKey ? 'sat' : evt.shiftKey ? 'lightness' : 'hue';
		// 			let K = evt.ctrlKey ? 0.01 : evt.shiftKey ? 0.01 : 1;
		// 			if (evt.altKey) {
		// 				K = K * 5;
		// 			}
		// 			const delta = evt.deltaY || evt.detail || evt.wheelDelta;
		// 			if (delta > 0) {
		// 				c[P] = c[P] + K;
		// 			} else {
		// 				c[P] = c[P] - K;
		// 			}
		// 			const h = c.hue > 359 ? 0 : c.hue < 0 ? 359 : c.hue;
		// 			const s = c.sat; // > 100 ? 100 : c.sat < 0 ? 0 : c.sat;
		// 			const l = c.lightness; // > 100 ? 100 : c.lightness < 0 ? 0 : c.lightness;

		// 			const c2 = w3color(`hsl(${h},${s},${l})`);
		// 			console.log(`hue = ${h}, sat = ${s}, lightness = ${l}, color = ${c2.toHexString()} is ${c2.valid ? 'valid' : 'invalid'}`);

		// 			const newCr = c2.valid ? c2.toHexString() : '#000000';
		// 			this._s2c.set(stateN, newCr);
		// 			this._o.value = this._s2c.get();
		// 			evt.target.setAttribute('fill', this._o.value);

		// 			this.setAttribute('value', this._o.value);
		// 		});
		// 	});
		// }
	}
	disconnectedCallback() {
        this.className = this.className;
    }
}
if (!customElements.get('smart-ui-colorpalette')) {
    customElements.define('smart-ui-colorpalette', SmartUiColorPalette);
}

