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
                    width: 40px;
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
if (!customElements.get('smart-editslider')) {
    customElements.define('smart-editslider', SmartEditSlider);
}
/** SmartButton realizes button, checkbox, radiobutton in group
 *  <smart-button 
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
 *                                      For this functionality the class name must be specified in attribute 'className' of <smart-tooltip> custom element
 *  </smart-button>
 * When user clicks on this button this element generates an event 'click' and store own state in parameter this.state and inside attribute 'current-state'

 */
class SmartButton extends HTMLElement {
    constructor() {
        super();
        this._o     = null; // options
        this._btn   = null; // button
        this._off   = null; // icon off
        this._on    = null; // icon on

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
                    --smart-ui-gap: 20px;
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
                    width: 74px;
                    height: 13px;
                    background: none;
                    border: 1px solid;
                    margin: 2px 4px 2px 8px;
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
                    width: 13px;
                    height: 13px;
                    // radius: 6px;
                    border: 1px solid #fff;
                    margin-top: 0.5px; /* You need to specify a margin in Chrome, but in Firefox and IE it is automatic */
                }
                .smartcontainer input[type='color']::-webkit-color-swatch {
                    border-width: 0px;
                }
                div#label {
                    float: right;
                    margin-left: 10px;
                }                
                input:focus {
                    outline: none;
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
                    <div id="label"> ${this.getAttribute('label') || ''}</div>
                </div>
            </div>
        `;
    }
    _applyState(state) {
        if (state == 'off') {
            this._on.style.setProperty('display', 'none');
            this._off.style.setProperty('display', 'unset')
        } else {
            this._on.style.setProperty('display', 'unset');
            this._off.style.setProperty('display', 'none')
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
        if (!this._o) return;

        switch (name) {
            case 'state':
                this._o.state = (newValue === '1' || newValue === 'on') ? 'on' : 'off';
                this._applyState(this._o.state);
                break;
            case 'imageOn':
                if (this._on) {
                    this._on.setAttribute('xlink:href', newValue);
                    break;
                }
            case 'imageOff':
                if (this._off) {
                    this._off.setAttribute('xlink:href', newValue);
                    break;
                }
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
                if (this._o.type === 'radio' && this._o.state === 'on') return;
                this._o.state = this._o.state === 'on' ? 'off' : 'on';
                this.state = this._o.state; // see evt.target.state on 'click' event
                this._applyState(this._o.state);
            })
        }
    }
}
if (!customElements.get('smart-button')) {
    customElements.define('smart-button', SmartButton);
}
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
                    float: right;
                    margin-left: 40px;
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
                    <div class="title">${this.getAttribute('title')}</div>

                    <smart-button class="c-btn"
                        id="c_btn" 
                        state="${this.getAttribute('state')}" 
                        imageOn="${this.getAttribute('imageOn')}" 
                        imageOff="${this.getAttribute('imageOff')}"
                        image-width="${this.getAttribute('iw')}"
                        image-height="${this.getAttribute('ih')}"
                        >
                    </smart-button>
                </div>
            </div>

        `;
    }
}
if (!customElements.get('smart-checkbox')) {
    customElements.define('smart-checkbox', SmartCheckBox);
}

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
                    width: 74px;
                    height: 13px;
                    background: none;
                    border: 1px solid;
                    margin: 2px 4px 2px 8px;
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
                    width: 13px;
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
if (!customElements.get('smart-colorbox')) {
    customElements.define('smart-colorbox', SmartColorBox);
}
