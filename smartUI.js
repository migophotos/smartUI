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
                    margin-left: 8px;
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
                    width: 64px;
                    background: none;
                    border: 1px solid;
                    margin: 2px 12px;
                    padding: 1px 3px 2px 3px;
                    font-size: 11px;
                    text-align: right;
                }
                .editwithslider .slider {
                    display: block;
                    float: left;                    
                    overflow: hidden;
                    margin: 3px 8px 0 0;
                }
                
                .editwithslider .btn:hover path {
                    color: rgba( 255,255,255, 1 );
                    opacity: 1;
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
                        <div class="svgcontainer btn" onclick="_(2, 0, 0)">
                            <svg version="1.2" baseProfile="tiny" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" overflow="scroll" xml:space="preserve" x="0px" y="0px" width="17px" height="16px" viewBox="0 0 17 16">
                                <g class="iconfill">
                                    <path d="M8,0C3.582,0,0,3.582,0,8s3.582,8,8,8h8V0H8z M5,9V7h8v2H5z"></path>
                                </g>
                            </svg>
                        </div>
                        <div class="svgcontainer btn" onclick="_(2, 0, 1)">
                            <svg version="1.2" baseProfile="tiny" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" overflow="scroll" xml:space="preserve" x="0px" y="0px" width="16px" height="16px" viewBox="0 0 16 16">
                                <g class="iconfill">
                                    <path d="M8,0H0v16h8c4.418,0,8-3.582,8-8S12.418,0,8,0z M11,9H8v3H6V9H3V7h3V4h2v3h3V9z"></path>
                                </g>
                            </svg>
                        </div>
                    </div>

                    <input class="indata" type="number" value="0" max="${this.getAttribute('max')}" min="${this.getAttribute('min')}" step="${this.getAttribute('step')}">
                    <div class="slider btn" style="width:96px; height:16px;">
                        <svg version="1.2" baseProfile="tiny" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" overflow="scroll" xml:space="preserve" x="0px" y="0px" width="96px" height="16px" viewBox="0 0 96 16">
                            <g class="iconstroke" stroke-width="2" fill="none">
                                <g id="SL0" transform="translate(20.2,0)">
                                    <path class="left-part" stroke="rgba(102,227,255,0.8)" stroke-width="5" d="M-80,8 L1,8"></path>
                                    <path class="right-part" d="M15,8 L96,8"></path>
                                    <circle cx="8" cy="8" r="7" fill="skyblue"></circle>
                                </g>
                            </g>
                        </svg>
                    </div>
                </div>
            </div>

        `;

    }

}
const supportsCustomElementsV1 = 'customElements' in window;
if (!supportsCustomElementsV1) {
	throw new Error('Unfortunately, your browser does not support custom elements v1. Think about switching to a last release of Chrome browser that supports all new technologies!');
}

window.customElements.define('smart-editslider', smartEditSlider);