/* eslint-disable no-underscore-dangle */
/* eslint-disable no-multi-spaces */
/* eslint-disable no-prototype-builtins */
/* eslint-disable indent */

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
class SmartEditSlider extends HTMLElement {
    constructor() {
        super();
        this._shadowDOM = this.attachShadow({mode: 'open'});
		if (!this._shadowDOM) {
            throw new Error(`Unfortunately, your browser does not support shadow DOM v1.
            Think about switching to a last release of Chrome browser that supports all new technologies!`);
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
                
                .editslider {
                    font-family: Helvetica, sans-serif;
                    color: rgba( 255,255,255, 0.8 );

                }
                .editslider .title {
                    text-transform: uppercase;
                    font-size: 9px;
                    -webkit-font-smoothing: subpixel-antialiased;
                    height: 12px;
                }

                .editslider .controls {
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
                .editslider input {
                    color: rgba( 255,255,255, 1 );
                    display: block;
                    float: left;
                    width: 40px;
                    background: none;
                    border: 1px solid;
                    margin: 2px 4px 2px 8px;
                    padding: 1px 3px 2px 3px;
                    font-size: 11px;
                    text-align: right;
                    opacity: 0.8;
                }
                .editslider input:hover {
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
            <div class="editslider">
                <div class="icon svgcontainer">
                    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
                    overflow="scroll" xml:space="preserve" x="0px" y="0px" width="35px" height="34px" viewBox="0 0 35 34">
                        <g class="iconfill">
                        <image xlink:href="${this.getAttribute('image')}" x="0" y="0" width="35px" height="34px"/>
                        </g>
                    </svg>
                </div>
                <div class="controls">
                    <div class="title">${this.getAttribute('title')}</div>
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
                        step="${this.getAttribute('step')}">
                    <div class="slider" style="width:90px; height:16px;">
                        <input name="slider" class="slider-bar" id="SL" type="range"
                        max="${this.getAttribute('max')}"
                        value="${this.getAttribute('value')}"
                        min="${this.getAttribute('min')}"
                        step="${this.getAttribute('step')}" />
                    </div>
                </div>
            </div>

        `;
    }
    convertAndValidate(val) { 
        let result = null;   
        if (parseFloat(this._o.step) - parseInt(this._o.step, 10) != 0) {
            result = parseFloat(this._input.value).toFixed(1);
        } else {
            result = parseInt(this._input.value, 10);
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
        //get references to controls
        this._input  = this._shadowDOM.getElementById('IC');    // input
        this._minus  = this._shadowDOM.getElementById('MB');    // buttton '-'
        this._plus   = this._shadowDOM.getElementById('PB');    // button '+'
        this._slider = this._shadowDOM.getElementById('SL');    // range input

        this._slider.addEventListener('input', (evt) => {
            this._o.value = Number(this._slider.value);
            this.setAttribute('value', `${this._o.value}`);

            this._input.value = `${this._o.value} ${this._o.units}`;
        });
        this._input.addEventListener('input', (evt) => {
            let result = this.convertAndValidate(this._input.value);
            this._o.value = result;
            this.setAttribute('value', `${this._o.value}`);

            this._slider.value = this._o.value;
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
                let result = this.convertAndValidate(this._input.value);
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
                let result = this.convertAndValidate(this._input.value);
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

window.customElements.define('smart-editslider', SmartEditSlider);

class SmartCheckBox extends HTMLElement {
    constructor() {
        super();
        this._shadowDOM = this.attachShadow({mode: 'open'});
		if (!this._shadowDOM) {
            throw new Error(`Unfortunately, your browser does not support shadow DOM v1.
            Think about switching to a last release of Chrome browser that supports all new technologies!`);
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
                
                .checkbox {
                    font-family: Helvetica, sans-serif;
                    color: rgba( 255,255,255, 0.8 );

                }
                .checkbox .title {
                    text-transform: uppercase;
                    font-size: 9px;
                    -webkit-font-smoothing: subpixel-antialiased;
                    height: 12px;
                }

                .checkbox .controls {
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

                /* styling input[type-range] */
                input[type=checkbox] {
                    -webkit-appearance: none; /* Hides the slider so that custom slider can be made */
                    height:2px;
                    width:100%;
                    cursor: pointer;
                    background: transparent;
                    margin-bottom: 10px;
                }
                input[type=checkbox]::-webkit-slider-thumb {
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
            <div class="checkbox">
                <div class="icon svgcontainer">
                    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
                    overflow="scroll" xml:space="preserve" x="0px" y="0px" width="48px" height="48px" viewBox="0 0 48 48">
                        <g class="iconfill">
                            <image xlink:href="${this.getAttribute('image')}" x="0" y="0" height="48px" width="48px"/>
                        </g>
                    </svg>
                </div>
                <div class="controls">
                    <div class="title">${this.getAttribute('title')}</div>

                    <div class="slider" style="width:48px; height:48px;">
                        <input name="ch01" id="CHB" type="checkbox"
                        value="${this.getAttribute('value')}"
                    </div>
                </div>
            </div>

        `;
    }
}
window.customElements.define('smart-checkbox', SmartCheckBox);

class SmartColorBox extends HTMLElement {
    constructor() {
        super();
        this._shadowDOM = this.attachShadow({mode: 'open'});
		if (!this._shadowDOM) {
            throw new Error(`Unfortunately, your browser does not support shadow DOM v1.
            Think about switching to a last release of Chrome browser that supports all new technologies!`);
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
                
                .selectcolor {
                    font-family: Helvetica, sans-serif;
                    color: rgba( 255,255,255, 0.8 );

                }
                .selectcolor .title {
                    text-transform: uppercase;
                    font-size: 9px;
                    -webkit-font-smoothing: subpixel-antialiased;
                    height: 12px;
                }

                .selectcolor .controls {
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
                .selectcolor input[type=text] {
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
                .selectcolor input[type=color] {
                    color: rgba( 255,255,255, 1 );
                    display: block;
                    float: left;
                    width: 74px;
                    height: 13px;
                    background: none;
                    border: 1px solid;
                    margin: 2px 4px 2px 8px;
                    padding: 1px 3px 2px 3px;
                    opacity: 0.8;
                    //-webkit-appearance: menulist-text;
                }
                .selectcolor input:hover {
                    opacity: 1;
                }


                /* styling input[type-color] */
                .selectcolor input[type='color']::-webkit-color-swatch-wrapper {
                    padding: 0 0 0 0;
                    width: 13px;
                    height: 13px;
                    // radius: 6px;
                    border: 1px solid #fff;
                    margin-top: 0.5px; /* You need to specify a margin in Chrome, but in Firefox and IE it is automatic */
                }
                .selectcolor input[type='color']::-webkit-color-swatch {
                    border-width: 0px;
                }

                input:focus {
                    outline: none;
                }

            </style>
            <div class="selectcolor">
                <div class="icon svgcontainer">
                    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
                    overflow="scroll" xml:space="preserve" x="0px" y="0px" width="35px" height="34px" viewBox="0 0 35 34">
                        <g class="iconfill">
                        <image xlink:href="${this.getAttribute('image')}" x="0" y="0" width="35px" height="34px"/>
                        </g>
                    </svg>
                </div>
                <div class="controls">
                    <div class="title">${this.getAttribute('title')}</div>
                    <div class="plusminus" style="opacity:0;">
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

                    <div class="slider">
                        <input name="colorbox" class="slider-bar" id="colorbox" type="color" value="${this.getAttribute('value')}">
                        <input id="IC" type="text" value="${this.getAttribute('value')} ">
                    </div>
                </div>
            </div>

        `;
    }
    connectedCallback() {
        // get all attributes into _o (options)
        this._o = {};
        for (let attr of this.attributes) {
            this._o[attr.name] = attr.value;
        }
        // get references to controls
        this._input     = this._shadowDOM.getElementById('IC');     // text input
        this._colorBox  = this._shadowDOM.getElementById('colorbox');

        this._colorBox.addEventListener('change', (evt) => {
            this._o.value = `${this._colorBox.value}`;
            this.setAttribute('value', `${this._o.value}`);
            this._input.value = `${this._o.value} `;
        })
        this._input.addEventListener('change', (evt) => {
            let result = this._input.value.trimRight();
            this._o.value = result;
            this.setAttribute('value', `${this._o.value}`);

            // this._input.value = `${result} ${this._o.units}`;
            this._colorBox.value = this._o.value;

        });

    }
}
window.customElements.define('smart-colorbox', SmartColorBox);
