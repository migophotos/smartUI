/* eslint-disable */
/**
 * Utilitts
 */
class utils {
    constructor() {};
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
			} else {
				if (optObj.hasOwnProperty(np)) {
					optObj[np] = Number(optObj[np]);
					count++;
				}
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
class smartEditSlider extends HTMLElement {
    constructor() {
        super();
        this._shadowDOM = this.attachShadow({mode: 'open'});
		if (!this._shadowDOM) {
			throw new Error('Unfortunately, your browser does not support shadow DOM v1. Think about switching to a last release of Chrome browser that supports all new technologies!');
        }
        // this.getAttribute('title');
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

                .imagefill {
                    opacity: 0.8;
                }
                .iconfill {
                    fill: #FFFFFF;
                    opacity: 0.8;
                }
                input {
                    color: rgba( 255,255,255, 0.8 );
                }
                .iconstroke {
                    stroke: #ffffff;
                    opacity: 0.8;
                }
                .iconsh1 {
                    opacity: 0.4;
                }
                .iconsh0 {
                    opacity: 1;
                }

                .editwithslider {
                    font-family: Helvetica, sans-serif;
                    color: rgba( 255,255,255, 0.8 );

                }
                .editwithslider .controls {
                    display: inline-block;
                    margin-top: 3px;
                    margin-left: 2px;
                    vertical-align: top;
                }
                .editwithslider .title {
                    text-transform: uppercase;
                    font-size: 9px;
                    -webkit-font-smoothing: subpixel-antialiased;
                    height: 12px;
                }
                .svgcontainer {
                    position: relative;
                    display: inline-block;
                    overflow: hidden;
                }
                .svgcontainer svg {
                    vertical-align: top;
                }
                .btn, .cbtn{
                    cursor: pointer;
                }


                .plusminus {
                    display: block;
                    float: left;
                    /* width: 33px; */
                    height: 16px;
                    overflow: hidden;
                    margin-top: 3px;
                }
                .editwithslider input {
                    display: block;
                    float: left;
                    width: 40px;
                    background: none;
                    border: 1px solid;
                    margin: 2px 4px 2px 8px;
                    padding: 1px 3px 2px 3px;
                    font-size: 11px;
                    text-align: right;
                }
                .editwithslider .slider {
                    display: block;
                    float: left;
                    overflow: unset;
                    margin: 6px 12px 0 0;
                }

                .editwithslider .btn:hover path {
                    color: rgba( 255,255,255, 1 );
                    opacity: 1;
                }
                input[type=range] {
                    -webkit-appearance: none; /* Hides the slider so that custom slider can be made */
                    height:2px;
                    width:80px;
                    cursor: pointer;
                    background: #009fff;
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

                  input[type=range]:focus {
                    outline: none;
                  }

            </style>
            <div class="editwithslider">
                <div class="svgcontainer">
                    <svg version="1.2" baseProfile="tiny" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" overflow="scroll" xml:space="preserve" x="0px" y="0px" width="48px" height="40px" viewBox="0 0 48 40">
                        <g class="imagefill">
                        <image xlink:href="${this.getAttribute('image')}" x="0" y="-4" height="48px" width="48px"/>
                        </g>
                    </svg>
                </div>
                <div class="controls">
                    <div class="title">${this.getAttribute('title')}</div>
                    <div class="plusminus">
                        <div class="svgcontainer btn" id="MB">
                            <svg version="1.2" baseProfile="tiny" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" overflow="scroll" xml:space="preserve" x="0px" y="0px" width="17px" height="16px" viewBox="0 0 17 16">
                                <g class="iconfill">
                                    <path d="M8,0C3.582,0,0,3.582,0,8s3.582,8,8,8h8V0H8z M5,9V7h8v2H5z"></path>
                                </g>
                            </svg>
                        </div>
                        <div class="svgcontainer btn" id="PB">
                            <svg version="1.2" baseProfile="tiny" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" overflow="scroll" xml:space="preserve" x="0px" y="0px" width="16px" height="16px" viewBox="0 0 16 16">
                                <g class="iconfill">
                                    <path d="M8,0H0v16h8c4.418,0,8-3.582,8-8S12.418,0,8,0z M11,9H8v3H6V9H3V7h3V4h2v3h3V9z"></path>
                                </g>
                            </svg>
                        </div>
                    </div>

                    <input class="indata" id="IC" type="text" value="${this.getAttribute('value')} ${this.getAttribute('units')}" max="${this.getAttribute('max')}" min="${this.getAttribute('min')}" step="${this.getAttribute('step')}">
                    <div class="slider btn" style="width:90px; height:16px;">
                        <input name="slider" class="slider-bar" id="SL" type="range" max="${this.getAttribute('max')}" value="${this.getAttribute('value')}" min="${this.getAttribute('min')}" step="${this.getAttribute('step')}" />
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
        // convert to numbers
        utils.convertNumericProps(this._o);
        //get references on controls
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
            let result;
            if (parseFloat(this._o.step) - parseInt(this._o.step) != 0) {
                result = parseFloat(this._input.value).toFixed(1);
            } else {
                result = parseInt(this._input.value);
            }
            this._o.value = result;
            this.setAttribute('value', `${this._o.value}`);

            this._slider.value = this._o.value;
        });
        this._input.addEventListener('change', (evt) => {
            let result;
            if (parseFloat(this._o.step) - parseInt(this._o.step) != 0) {
                result = parseFloat(this._input.value).toFixed(1);
            } else {
                result = parseInt(this._input.value);
            }
            this._o.value = result;
            this.setAttribute('value', `${this._o.value}`);

            this._input.value = `${result} ${this._o.units}`;
            this._slider.value = this._o.value;

        });

        this._plus.addEventListener('click', (evt) => {
            if (typeof this._o.value === "number" && typeof this._o.max === "number" && typeof this._o.step === "number" ) {
                if (this._o.value + this._o.step > this._o.max) {
                    this._o.value = this._o.max;
                } else {
                    this._o.value += this._o.step;
                }
                let result;
                if (parseFloat(this._o.step) - parseInt(this._o.step) != 0) {
                    result = parseFloat(this._o.value).toFixed(1);
                } else {
                    result = parseInt(this._o.value);
                }
                this.setAttribute('value', `${result}`);

                this._input.value = `${result} ${this._o.units}`;
                this._slider.value = this._o.value;
            }
        });
        this._minus.addEventListener('click', (evt) => {
            if (typeof this._o.value === "number" && typeof this._o.min === "number" && typeof this._o.step === "number" ) {
                if (this._o.value - this._o.step < this._o.min) {
                    this._o.value = this._o.min;
                } else {
                    this._o.value -= this._o.step;
                }
                let result;
                if (parseFloat(this._o.step) - parseInt(this._o.step) != 0) {
                    result = parseFloat(this._o.value).toFixed(1);
                } else {
                    result = parseInt(this._o.value);
                }
                this.setAttribute('value', `${result}`);

                this._input.value = `${result} ${this._o.units}`;
                this._slider.value = this._o.value;
            }
        });
	}
	disconnectedCallback() {
    }


}
const supportsCustomElementsV1 = 'customElements' in window;
if (!supportsCustomElementsV1) {
	throw new Error('Unfortunately, your browser does not support custom elements v1. Think about switching to a last release of Chrome browser that supports all new technologies!');
}

window.customElements.define('smart-editslider', smartEditSlider);
