/* eslint-disable no-underscore-dangle */
/* eslint-disable no-multi-spaces */
/* eslint-disable no-prototype-builtins */
/* eslint-disable indent */
/* eslint-disable object-curly-newline */


/**
 * @copyright Copyright © 2018 ... All rights reserved.
 * @author Michael Goyberg
 * @license
 * @version   1.0
 * @overview  SmartTooltip
 * The control uses the built-in template to display prompts.
 * The tooltip window can be 'pinned' and will be displayed next to the
 * item until the pinMe option is turned off.

 * It can also use customized templates for individual elements.
 * To take advantage of this functionality, place the custom template
 * on the server and call the static initialization function,
 * passing the element ID and the full name of the template to it.
 *
 * Example of use:
 *
 * 1. Conventional use:
 * if (!window.SmartTooltip) {
 * 	 window.SmartTooltip = new SmartTooltip();
 * }
 * ....
 * ....
 * window.SmartTooltip.init(idElement, templateFileName);
 * ...
 * //collect data object and call the next function
 * var data = { id, x, y, options:{rRect, isRun, scale, sortBy}, targets:[{uuid, name, value, color, link}], title:{uuid, name, value, color, link} };
 * window.SmartTooltip.show(data)
 * window.SmartTooltip.move(evt.clientX, evt.clientY);
 * window.SmartTooltip.hide();
 *
 * 2. Use internal template
 * //collect data object and call the next function
 * var data = { id, x, y, options:{rRect, isRun, scale, sortBy, cssVars:{...}}, targets:[{uuid, name, value, color, link}], title:{uuid, name, value, color, link} };
 * SmartTooltip.showTooltip(data);
 * SmartTooltip.moveTooltip(evt.clientX, evt.clientY);
 * SmartTooltip.hideTooltip();
 */

class TemplateDefs {
	// getDefaultTooltip
	static getInternalTemplate(templateName = '') {
		const internalTemplates = new Map([
			['pie', {
				name: 'pie',
				opt: {},
				template: `
					<svg class="sttip" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" >
						<defs>
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
							<pattern id="sttip-pattern-stripe45"
								width="4" height="4"
								patternUnits="userSpaceOnUse"
								patternTransform="rotate(45)">
								<rect width="2" height="4" transform="translate(0,0)" fill="white"></rect>
							</pattern>
							<pattern id="sttip-pattern-stripe-45"
								width="4" height="4"
								patternUnits="userSpaceOnUse"
								patternTransform="rotate(-45)">
								<rect width="2" height="4" transform="translate(0,0)" fill="white"></rect>
							</pattern>
							<pattern id="sttip-pattern-stripe-45-black"
								width="4" height="4"
								patternUnits="userSpaceOnUse"
								patternTransform="rotate(-45)">
								<rect width="2" height="4" transform="translate(0,0)" fill="black"></rect>
							</pattern>
							<mask id="sttip-mask-stripe">
								<rect x="0" y="0" width="100%" height="100%" fill="url(#sttip-pattern-stripe45)" />
							</mask>
							<mask id="sttip-mask-stripe-black">
								<rect x="0" y="0" width="100%" height="100%" fill="url(#sttip-pattern-stripe45)" />
							</mask>
							<mask id="sttip-mask-cross">
								<rect x="0" y="0" width="100%" height="100%" fill="url(#sttip-pattern-stripe45)" />
								<rect x="0" y="0" width="100%" height="100%" fill="url(#sttip-pattern-stripe-45)" />
							</mask>

						</defs>
						<style>
							svg.sttip {
								overflow: visible;
								vector-effect: non-scaling-stroke;

								--sttip-var-font-family: 'Arial', 'DIN Condensed', 'Noteworthy', sans-serif;
								--sttip-var-font-stretch: condensed;
								--sttip-var-font-color: #666666;
								--sttip-var-scale-size: 12px;
								--sttip-var-legend-size: 18px;
								--sttip-var-title-size: 22px;
								--sttip-var-descr-size: 18px;

								--sttip-var-run-color: #00ff00;
								--sttip-var-stop-color: #ff0000;
								--sttip-var-def-color: #666666;

								--sttip-var-frame-fill: #ffffff;
								--sttip-var-frame-opacity: 0.95;
								--sttip-var-border-color: #000000;
								--sttip-var-border-width: 0;
								--sttip-var-border-radius: 2;

								--sttip-var-legend-fill: #ffffff;
								--sttip-var-legend-stroke: #666666;


								--legend-frm-border-width: 2;
								--legend-frm-border-radius: var(--sttip-var-border-radius, 2);
								--legend-frm-border-color: var(--sttip-var-legend-stroke, #666666);
								--legend-frm-fill: var(--sttip-var-legend-fill, #ffc6c6);

								--no-color:	none;
								--run-color: var(--sttip-var-run-color, green);
								--stop-color: var(--sttip-var-stop-color, red);
							}
							.sttip-scale-line {
								fill: none;
								stroke: var(--sttip-var-font-color);
								stroke-width: 2;
								stroke-linecap: butt;
							}
							text.sttip-text {
								font-family: var(--sttip-var-font-family);
								font-stretch: var(--sttip-var-font-stretch);
								pointer-events: none;
								fill: var(--sttip-var-font-color);
							}
							.sttip-scale-text {
								font-size:var(--sttip-var-scale-size, 12px);
							}
							.sttip-title {
								font-size: var(--sttip-var-title-size, 22px);
							}
							.sttip-description {
								font-size: var(--sttip-var-descr-size, 18px);
							}
							.sttip-legend-value, .sttip-legend-name {
								font-size: var(--sttip-var-legend-size, 18px);
							}
							.sttip-legend-rect {
								fill:var(--legend-frm-fill);
							}
							.sttip-legend-frame {
								fill:var(--legend-frm-fill);
								fill-opacity: 0.1;
								rx: var(--legend-frm-border-radius);
								ry: var(--legend-frm-border-radius);
							}
							.sttip-frame {
								fill:var(--sttip-var-frame-fill);
								fill-opacity: var(--sttip-var-frame-opacity, 1);
								stroke: var(--sttip-var-border-color);
								stroke-width: var(--sttip-var-border-width);
								rx: var(--sttip-var-border-radius);
								ry: var(--sttip-var-border-radius);
							}

							#SmartTooltip.hidden {
								transition: all 500ms ease-in-out;
							}

							.sttip-legend-rect {
								fill:var(--no-color);
								fill:var(--legend-frm-fill);
								rx: var(--legend-frm-border-radius);
								ry: var(--legend-frm-border-radius);
							}
							.sttip-run-indicator {
								stroke: #969696;
								stroke-width: 1px;
							}
							.sttip-value-gauge {
								fill: #ff9191;
								stroke: var(--sttip-var-font-color, black);
							}
							.sttip-run {
								fill: var(--run-color);
							}
							.sttip-stop {
								fill: var(--stop-color);
							}
							.sttip-shadowed {
								filter: url(#drop-shadow);
							}
							.sttip-linked {
								cursor: pointer;
							}
							.sttip-animated {
								transition:all 1s;
							}
							.sttip-selected {
								mask: url(#sttip-mask-cross);
							}
							.sttip-current > rect {
								stroke-width: 1.5;
								stroke: var(--legend-frm-border-color);
							}
							.sttip-current > text {
								font-weight: bold;
							}
							.sttip-hover {
								mask: url(#sttip-mask-stripe);
							}
							.sttip-lightgray {
								fill: lightgray;
							}

							.sttip-max-value {
								width: 265px;
							}
							.sttip-min-value {
								width: 0;
							}

							rect.sttip-legend-rect:hover {
								fill: lightgray;
							}
							.sttip-diagram:hover, path.sttip-linked:hover {
								mask: url(#sttip-mask-stripe);
							}
							g#legend-text-stroke {
								pointer-events: none;
							}

							#pinMe {
								fill: var(--sttip-var-frame-fill, gray);
								stroke: var(--sttip-var-font-color, black);
								stroke-width: 1.5;
								transition: all 500ms ease-in-out;
							}
							#pinMe:hover {
								cursor: pointer;
								fill: lightgray;
							}
							#frmBtns rect {
								fill: var(--sttip-var-frame-fill, none);
								stroke: var(--no-color, black);
                                stroke-width: 0.5;
								rx: var(--sttip-var-border-radius);
								ry: var(--sttip-var-border-radius);

								pointer-events: bounding-box;
								cursor: pointer;
							}
							#frmBtns path {
								stroke: var(--sttip-var-font-color, black);
							}
							#frmBtns text {
								stroke: var(--sttip-var-font-color, black);
							}

							#frmBtns rect:hover {
								fill: lightgray;
							}

							#pinMe.sttip-custom circle {
								fill: red;
							}
							#pinMe #tippex {
								display: none;
							}
							#pinMe.sttip-custom #tippex {
								display: block;
								stroke: var(--sttip-var-frame-fill, white);
								stroke-width: 1.5;
							}
							#pinMe.sttip-pinned {
								transform: rotate(-45deg);
								transform-origin: 8px 8px;
								transform-box: border-box;
							}
							#pinMe.sttip-custom {
								transform: rotate(-45deg);
								transform-origin: 12px 12px;
								transform-box: border-box;
							}

						</style>
						<g id="tooltip-group">
							<rect id="tooltip-frame" class="sttip-frame" x="0" y="0" fill-opacity="0.8" width="432" height="0"/>
							<g id="bound-group">
								<g id="frmBtns" transform="translate(0, 4)">
									<g transform="translate(0, 0)">
										<rect id="helpMe" x="0" y="0" width="16" height="16" />
										<text text-anchor="middle" pointer-events="none" x="8" y="12">?</text>
									</g>
									<g transform="translate(20, 0)">
										<rect id="closeMe" x="0" y="0" width="16" height="16"  />
										<path d="M3,3L13,13M3,13L13,3" stroke="black" stroke-width="2" pointer-events="none"  />
									</g>
								</g>
								<g transform="translate(4,4)">
									<g id="pinMe">
										<path id="pin" d="M8,8L24,7L24,9Z" pointer-events="none" />
										<path id="tippex" d="M8,8L12,7L12,9Z" />
										<circle id="rosh-pin" cx="24" cy="8" r="5" />
									</g>
								</g>
								<circle id="diagram" class="sttip-diagram" cx="72.5" cy="72.5" r="65" style="fill:#fff;"/>
								<g id="diagram-group">
								</g>
								<g id="legend-group" data-x="10" >
									<circle id="run-indicator" class="sttip-run-indicator sttip-stop" cx="16.5" cy="157.5" r="5"/>
									<g id="legend-stroke">
										<rect id="legend-rect" class="sttip-legend-rect" x="22" y="172" width="396" height="34"/>
										<g id="legend-text-stroke">
											<rect id="legend-color" class="sttip-legend-color" x="26.5" y="178.5" width="20" height="20" fill="#ff0600"/>
											<text id="legend-name" data-format="$NAME$" class="sttip-text sttip-legend-name" x="53.5px" y="196.5" text-anchor="left">Legend stroke</text>
											<text id="legend-value" data-format="$VALUE$" class="sttip-text sttip-legend-value" x="359.794px" y="196.5" text-anchor="left">Value</text>
										</g>
									</g>
								</g>
								<g id="title-group" data-x="147" >
									<g id="scale-group">
										<rect id="tooltip-value" class="sttip-value-gauge sttip-animated" data-maxw="265" data-maxh="20" x="147" y="73" width="20" height="20"/>
										<g transform="translate(0, -8)">
										<path id="scale-line" class="sttip-scale-line" d="M147,105.5l265,0"/>
										<path id="scale-0" class="sttip-scale-line" d="M148,111.827l0,-7.327"/>
										<path id="scale-25" class="sttip-scale-line" d="M213.25,109.827l0,-5.327"/>
										<path id="scale-50" class="sttip-scale-line" d="M279.5,111.827l0,-7.327"/>
										<path id="scale-75" class="sttip-scale-line" d="M345.75,109.827l0,-5.327"/>
										<path id="scale-100" class="sttip-scale-line" d="M411,111.827l0,-7.327"/>
										<text id="value-0" class="sttip-text sttip-scale-text" x="145.155px" y="128px">0</text>
										<text id="value-50" class="sttip-text sttip-scale-text" text-anchor="middle" x="280" y="128px">50%</text>
										<text id="value-100" class="sttip-text sttip-scale-text" text-anchor="middle" x="412" y="128px">100%</text>
										</g>
									</g>
									<g id="descr-group">
										<text id="tooltip-title" class="sttip-text sttip-title" x="147" y="40"></text>
										<text id="tooltip-description" class="sttip-text sttip-description" x="147" y="60"></text>
									</g>
								</g>
							</g>
						</g>
					</svg>
					`
			}],
			['simple', {
				name: 'simple',
				opt: {},
				template:
					`<svg class="sttip" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" >
						<defs>
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
							<pattern id="sttip-pattern-stripe45"
								width="4" height="4"
								patternUnits="userSpaceOnUse"
								patternTransform="rotate(45)">
								<rect width="2" height="4" transform="translate(0,0)" fill="white"></rect>
							</pattern>
							<pattern id="sttip-pattern-stripe-45"
								width="4" height="4"
								patternUnits="userSpaceOnUse"
								patternTransform="rotate(-45)">
								<rect width="2" height="4" transform="translate(0,0)" fill="white"></rect>
							</pattern>
							<pattern id="sttip-pattern-stripe-45-black"
								width="4" height="4"
								patternUnits="userSpaceOnUse"
								patternTransform="rotate(-45)">
								<rect width="2" height="4" transform="translate(0,0)" fill="black"></rect>
							</pattern>
							<mask id="sttip-mask-stripe">
								<rect x="0" y="0" width="100%" height="100%" fill="url(#sttip-pattern-stripe45)" />
							</mask>
							<mask id="sttip-mask-stripe-black">
								<rect x="0" y="0" width="100%" height="100%" fill="url(#sttip-pattern-stripe45)" />
							</mask>
							<mask id="sttip-mask-cross">
								<rect x="0" y="0" width="100%" height="100%" fill="url(#sttip-pattern-stripe45)" />
								<rect x="0" y="0" width="100%" height="100%" fill="url(#sttip-pattern-stripe-45)" />
							</mask>
						</defs>
						<style>
							svg.sttip {
								overflow: visible;
								vector-effect: non-scaling-stroke;

								--sttip-var-font-family: 'Arial Narrow', 'DIN Condensed', 'Noteworthy', sans-serif;
								--sttip-var-font-stretch: condensed;
								--sttip-var-font-color: #666666;
								--sttip-var-scale-size: 12px;
								--sttip-var-legend-size: 18px;
								--sttip-var-title-size: 22px;
								--sttip-var-descr-size: 18px;

								--sttip-var-run-color: #00ff00;
								--sttip-var-stop-color: #ff0000;
								--sttip-var-def-color: #666666;

								--sttip-var-frame-fill: #ffffff;
								--sttip-var-frame-opacity: 0.95;
								--sttip-var-border-color: #000000;
								--sttip-var-border-width: 0;
								--sttip-var-border-radius: 2;


								--no-color:	none;
								--run-color: var(--sttip-var-run-color, green);
								--stop-color: var(--sttip-var-stop-color, red);
							}
							text.sttip-text {
								font-family: var(--sttip-var-font-family);
								font-stretch: var(--sttip-var-font-stretch);
								pointer-events: none;
								fill: var(--sttip-var-font-color);
							}
							.sttip-title {
								font-size: var(--sttip-var-title-size, 22px);
							}
							.sttip-description {
								font-size: var(--sttip-var-descr-size, 18px);
							}
							.sttip-frame {
								fill:var(--sttip-var-frame-fill);
								fill-opacity: var(--sttip-var-frame-opacity, 1);
								stroke: var(--sttip-var-border-color);
								stroke-width: var(--sttip-var-border-width);
								rx: var(--sttip-var-border-radius);
								ry: var(--sttip-var-border-radius);
							}
							#SmartTooltip.hidden {
								transition: all 500ms ease-in-out;
							}
							.sttip-shadowed {
								filter: url(#drop-shadow);
							}
							.sttip-linked {
								cursor: pointer;
							}
							.sttip-animated {
								transition:all 1s;
							}
							#pinMe {
								fill: var(--sttip-var-frame-fill, gray);
								stroke: var(--sttip-var-font-color, black);
								stroke-width: 1.5;
								transition: all 500ms ease-in-out;
							}
							#pinMe:hover {
								cursor: pointer;
								fill: lightgray;
							}
							#frmBtns rect {
								fill: var(--sttip-var-frame-fill, none);
								stroke: var(--no-color, black);
                                stroke-width: 0.5;
								rx: var(--sttip-var-border-radius);
								ry: var(--sttip-var-border-radius);

								pointer-events: bounding-box;
								cursor: pointer;
							}
							#frmBtns path {
								stroke: var(--sttip-var-font-color, black);
							}
							#frmBtns text {
								stroke: var(--sttip-var-font-color, black);
							}

							#frmBtns rect:hover {
								fill: lightgray;
							}
							#pinMe.sttip-custom circle {
								fill: red;
							}
							#pinMe #tippex {
								display: none;
							}
							#pinMe.sttip-custom #tippex {
								display: block;
								stroke: var(--sttip-var-frame-fill, white);
								stroke-width: 1.5;
							}
							#pinMe.sttip-pinned {
								transform: rotate(-45deg);
								transform-origin: 8px 8px;
								transform-box: border-box;
							}
							#pinMe.sttip-custom {
								transform: rotate(-45deg);
								transform-origin: 12px 12px;
								transform-box: border-box;
							}
						</style>
						<g id="tooltip-group">
							<rect id="tooltip-frame" class="sttip-frame" x="0" y="0" fill-opacity="0.8" width="360" height="0"/>
							<g id="bound-group">
								<g id="pinmeGr" transform="translate(4,4)">
									<g id="pinMe">
										<path id="pin" d="M8,8L24,7L24,9Z" pointer-events="none" />
										<path id="tippex" d="M8,8L12,7L12,9Z" />
										<circle id="rosh-pin" cx="24" cy="8" r="5" />
									</g>
								</g>
								<g id="frmBtns" transform="translate(0, 4)">
									<g transform="translate(0, 0)">
										<rect id="helpMe" x="0" y="0" width="16" height="16" />
										<text text-anchor="middle" pointer-events="none" x="8" y="12">?</text>
									</g>
									<g transform="translate(20, 0)">
										<rect id="closeMe" x="0" y="0" width="16" height="16"  />
										<path d="M3,3L13,13M3,13L13,3" stroke="black" stroke-width="2" pointer-events="none"  />
									</g>
								</g>
								<g id="title-group" data-x="10" >
									<g id="descr-group">
										<text id="tooltip-title" class="sttip-text sttip-title" x="10" y="40"></text>
										<text id="tooltip-description" class="sttip-text sttip-description" x="10" y="60"></text>
									</g>
								</g>
							</g>
						</g>
					</svg>`
            }],
			['iframe', {
				name: 'iframe',
				opt: {},
				template:
					`<svg class="sttip" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" >
						<defs>
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
							<pattern id="sttip-pattern-stripe45"
								width="4" height="4"
								patternUnits="userSpaceOnUse"
								patternTransform="rotate(45)">
								<rect width="2" height="4" transform="translate(0,0)" fill="white"></rect>
							</pattern>
							<pattern id="sttip-pattern-stripe-45"
								width="4" height="4"
								patternUnits="userSpaceOnUse"
								patternTransform="rotate(-45)">
								<rect width="2" height="4" transform="translate(0,0)" fill="white"></rect>
							</pattern>
							<pattern id="sttip-pattern-stripe-45-black"
								width="4" height="4"
								patternUnits="userSpaceOnUse"
								patternTransform="rotate(-45)">
								<rect width="2" height="4" transform="translate(0,0)" fill="black"></rect>
							</pattern>
							<mask id="sttip-mask-stripe">
								<rect x="0" y="0" width="100%" height="100%" fill="url(#sttip-pattern-stripe45)" />
							</mask>
							<mask id="sttip-mask-stripe-black">
								<rect x="0" y="0" width="100%" height="100%" fill="url(#sttip-pattern-stripe45)" />
							</mask>
							<mask id="sttip-mask-cross">
								<rect x="0" y="0" width="100%" height="100%" fill="url(#sttip-pattern-stripe45)" />
								<rect x="0" y="0" width="100%" height="100%" fill="url(#sttip-pattern-stripe-45)" />
							</mask>
						</defs>
						<style>
							svg.sttip {
								overflow: visible;
								vector-effect: non-scaling-stroke;

								--sttip-var-font-family: 'Arial Narrow', 'DIN Condensed', 'Noteworthy', sans-serif;
								--sttip-var-font-stretch: condensed;
								--sttip-var-font-color: #666666;
								--sttip-var-scale-size: 12px;
								--sttip-var-legend-size: 18px;
								--sttip-var-title-size: 22px;
								--sttip-var-descr-size: 18px;

								--sttip-var-run-color: #00ff00;
								--sttip-var-stop-color: #ff0000;
								--sttip-var-def-color: #666666;

								--sttip-var-frame-fill: #ffffff;
								--sttip-var-frame-opacity: 0.95;
								--sttip-var-border-color: #000000;
								--sttip-var-border-width: 0;
								--sttip-var-border-radius: 2;


								--no-color:	none;
								--run-color: var(--sttip-var-run-color, green);
								--stop-color: var(--sttip-var-stop-color, red);
							}
							.sttip-frame {
								fill:var(--sttip-var-frame-fill);
								fill-opacity: var(--sttip-var-frame-opacity, 1);
								stroke: var(--sttip-var-border-color);
								stroke-width: var(--sttip-var-border-width);
								rx: var(--sttip-var-border-radius);
								ry: var(--sttip-var-border-radius);
							}
							#SmartTooltip.hidden {
								transition: all 500ms ease-in-out;
							}
							.sttip-shadowed {
								filter: url(#drop-shadow);
							}
							.sttip-animated {
								transition:all 1s;
							}
							#pinMe {
								fill: var(--sttip-var-frame-fill, gray);
								stroke: var(--sttip-var-font-color, black);
								stroke-width: 1.5;
								transition: all 500ms ease-in-out;
							}
							#pinMe:hover {
								cursor: pointer;
								fill: lightgray;
							}
							#frmBtns rect {
								fill: var(--sttip-var-frame-fill, none);
								stroke: var(--no-color, black);
                                stroke-width: 0.5;
								rx: var(--sttip-var-border-radius);
								ry: var(--sttip-var-border-radius);

								pointer-events: bounding-box;
								cursor: pointer;
							}
							#frmBtns path {
								stroke: var(--sttip-var-font-color, black);
							}
							#frmBtns text {
								stroke: var(--sttip-var-font-color, black);
							}

							#frmBtns rect:hover {
								fill: lightgray;
							}
							#pinMe.sttip-custom circle {
								fill: red;
							}
							#pinMe #tippex {
								display: none;
							}
							#pinMe.sttip-custom #tippex {
								display: block;
								stroke: var(--sttip-var-frame-fill, white);
								stroke-width: 1.5;
							}
							#pinMe.sttip-pinned {
								transform: rotate(-45deg);
								transform-origin: 8px 8px;
								transform-box: border-box;
							}
							#pinMe.sttip-custom {
								transform: rotate(-45deg);
								transform-origin: 12px 12px;
								transform-box: border-box;
							}
						</style>
						<g id="tooltip-group">
							<rect id="tooltip-frame" class="sttip-frame" x="0" y="0" fill-opacity="0.8" width="380" height="0"/>
							<g id="bound-group">
								<g id="pinmeGr" transform="translate(4,4)">
									<g id="pinMe">
										<path id="pin" d="M8,8L24,7L24,9Z" pointer-events="none" />
										<path id="tippex" d="M8,8L12,7L12,9Z" />
										<circle id="rosh-pin" cx="24" cy="8" r="5" />
									</g>
								</g>
								<g id="frmBtns" transform="translate(0, 4)">
									<g transform="translate(0, 0)">
										<rect id="helpMe" x="0" y="0" width="16" height="16" />
										<text text-anchor="middle" pointer-events="none" x="8" y="12">?</text>
									</g>
									<g transform="translate(20, 0)">
										<rect id="closeMe" x="0" y="0" width="16" height="16"  />
										<path d="M3,3L13,13M3,13L13,3" stroke="black" stroke-width="2" pointer-events="none"  />
									</g>
								</g>
                                <g id="title-group" data-x="10" >
									<g id="descr-group">
										<text id="tooltip-title" class="sttip-text sttip-title" x="10" y="40"></text>
										<text id="tooltip-description" class="sttip-text sttip-description" x="10" y="60"></text>
									</g>
                                    <rect id="fake-iframe" x="10" y="66" width="360" height="240" stroke="none" fill="gray"/>
                                </g>
							</g>
						</g>
                    </svg>
                    <iframe id="inlineFrame" width="357" height="238" sandbox="allow-same-origin allow-scripts allow-popups allow-forms" style="position:absolute; left:10px; top:30px;"
                    src=""></iframe>
                    `
			}],
			['image', {
				name: 'image',
				opt: {},
				template:
					`<svg class="sttip" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" >
						<defs>
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
							<pattern id="sttip-pattern-stripe45"
								width="4" height="4"
								patternUnits="userSpaceOnUse"
								patternTransform="rotate(45)">
								<rect width="2" height="4" transform="translate(0,0)" fill="white"></rect>
							</pattern>
							<pattern id="sttip-pattern-stripe-45"
								width="4" height="4"
								patternUnits="userSpaceOnUse"
								patternTransform="rotate(-45)">
								<rect width="2" height="4" transform="translate(0,0)" fill="white"></rect>
							</pattern>
							<pattern id="sttip-pattern-stripe-45-black"
								width="4" height="4"
								patternUnits="userSpaceOnUse"
								patternTransform="rotate(-45)">
								<rect width="2" height="4" transform="translate(0,0)" fill="black"></rect>
							</pattern>
							<mask id="sttip-mask-stripe">
								<rect x="0" y="0" width="100%" height="100%" fill="url(#sttip-pattern-stripe45)" />
							</mask>
							<mask id="sttip-mask-stripe-black">
								<rect x="0" y="0" width="100%" height="100%" fill="url(#sttip-pattern-stripe45)" />
							</mask>
							<mask id="sttip-mask-cross">
								<rect x="0" y="0" width="100%" height="100%" fill="url(#sttip-pattern-stripe45)" />
								<rect x="0" y="0" width="100%" height="100%" fill="url(#sttip-pattern-stripe-45)" />
							</mask>
						</defs>
						<style>
							svg.sttip {
								overflow: visible;
								vector-effect: non-scaling-stroke;

								--sttip-var-font-family: 'Arial Narrow', 'DIN Condensed', 'Noteworthy', sans-serif;
								--sttip-var-font-stretch: condensed;
								--sttip-var-font-color: #666666;
								--sttip-var-scale-size: 12px;
								--sttip-var-legend-size: 18px;
								--sttip-var-title-size: 22px;
								--sttip-var-descr-size: 18px;

								--sttip-var-run-color: #00ff00;
								--sttip-var-stop-color: #ff0000;
								--sttip-var-def-color: #666666;

								--sttip-var-frame-fill: #ffffff;
								--sttip-var-frame-opacity: 0.95;
								--sttip-var-border-color: #000000;
								--sttip-var-border-width: 0;
								--sttip-var-border-radius: 2;


								--no-color:	none;
								--run-color: var(--sttip-var-run-color, green);
								--stop-color: var(--sttip-var-stop-color, red);
							}
							.sttip-frame {
								fill:var(--sttip-var-frame-fill);
								fill-opacity: var(--sttip-var-frame-opacity, 1);
								stroke: var(--sttip-var-border-color);
								stroke-width: var(--sttip-var-border-width);
								rx: var(--sttip-var-border-radius);
								ry: var(--sttip-var-border-radius);
							}
							#SmartTooltip.hidden {
								transition: all 500ms ease-in-out;
							}
							.sttip-shadowed {
								filter: url(#drop-shadow);
							}
							.sttip-animated {
								transition:all 1s;
							}
							#pinMe {
								fill: var(--sttip-var-frame-fill, gray);
								stroke: var(--sttip-var-font-color, black);
								stroke-width: 1.5;
								transition: all 500ms ease-in-out;
							}
							#pinMe:hover {
								cursor: pointer;
								fill: lightgray;
							}
							#frmBtns rect {
								fill: var(--sttip-var-frame-fill, none);
								stroke: var(--no-color, black);
                                stroke-width: 0.5;
								rx: var(--sttip-var-border-radius);
								ry: var(--sttip-var-border-radius);

								pointer-events: bounding-box;
								cursor: pointer;
							}
							#frmBtns path {
								stroke: var(--sttip-var-font-color, black);
							}
							#frmBtns text {
								stroke: var(--sttip-var-font-color, black);
							}

							#frmBtns rect:hover {
								fill: lightgray;
							}
							#pinMe.sttip-custom circle {
								fill: red;
							}
							#pinMe #tippex {
								display: none;
							}
							#pinMe.sttip-custom #tippex {
								display: block;
								stroke: var(--sttip-var-frame-fill, white);
								stroke-width: 1.5;
							}
							#pinMe.sttip-pinned {
								transform: rotate(-45deg);
								transform-origin: 8px 8px;
								transform-box: border-box;
							}
							#pinMe.sttip-custom {
								transform: rotate(-45deg);
								transform-origin: 12px 12px;
								transform-box: border-box;
							}
						</style>
						<g id="tooltip-group">
							<rect id="tooltip-frame" class="sttip-frame" x="0" y="0" fill-opacity="0.8" width="380" height="0"/>
							<g id="bound-group">
								<g id="pinmeGr" transform="translate(4,4)">
									<g id="pinMe">
										<path id="pin" d="M8,8L24,7L24,9Z" pointer-events="none" />
										<path id="tippex" d="M8,8L12,7L12,9Z" />
										<circle id="rosh-pin" cx="24" cy="8" r="5" />
									</g>
								</g>
								<g id="frmBtns" transform="translate(0, 4)">
									<g transform="translate(0, 0)">
										<rect id="helpMe" x="0" y="0" width="16" height="16" />
										<text text-anchor="middle" pointer-events="none" x="8" y="12">?</text>
									</g>
									<g transform="translate(20, 0)">
										<rect id="closeMe" x="0" y="0" width="16" height="16"  />
										<path d="M3,3L13,13M3,13L13,3" stroke="black" stroke-width="2" pointer-events="none"  />
									</g>
								</g>
                                <g id="title-group" data-x="10" >
									<g id="descr-group">
										<text id="tooltip-title" class="sttip-text sttip-title" x="10" y="40"></text>
                                        <text id="tooltip-description" class="sttip-text sttip-description" x="10" y="60"></text>
                                        <image id="image-link" x="10" y="64" width="360" height="240" xlink:href=""></image>
									</g>
                                </g>
							</g>
						</g>
                    </svg>
                    `
			}]
		]);
		if (templateName === '') {
            templateName = 'pie';
        }
		return internalTemplates.get(templateName);
	}


	constructor() {
		this._templates = new Map();	// stores id to {name: name, template: template} pair
		this._options = new Map();		// stores id to opt pair
		this._similars = new Map();		// in case of template name already defined, store in this map the reference on id, that contains it in form: id -> id
										// the function get(id) will returns this 'right' definition
	}
	register(id, name) {
		const sdef = this.getByName(name);
		if (sdef) {
			this._similars.set(id, sdef.id);
		} else {
			this._templates.set(id, {name: name, template: 'loading...'});
			this._options.set(id, {});
		}
	}

	set(id, name, template, opt) {
		const sdef = this.getByName(name);
		if (sdef && id != sdef.id) {
			this._options.set(id, opt);
			this._similars.set(id, sdef.id);
		} else {
			this._options.set(id, opt);
			this._templates.set(id, {name: name, template: template});
		}
	}
	has(id) {
		return (this._templates.has(id) || this._similars.has(id));
	}
	get(id) {
		let sid = this._similars.get(id);
		let ttdef = {};
		if (sid) {
			const sdef = this._templates.get(sid);
			ttdef.name = sdef.name;				// similar template name
			ttdef.template = sdef.template;		// similar template definition
		} else {
			if (!this._templates.has(id)) {
				return null;
			}
			const def = this._templates.get(id);
			ttdef.name = def.name;				// own template name
			ttdef.template = def.template;		// own template definition
		}
		ttdef.opt = this._options.get(id);		// own options
		return ttdef;
	}

	getByName(name) {
		for (let [id, ttdef] of this._templates) {
			if (ttdef.name === name) {
				return {id: id, def: ttdef};
			}
		}
		return null;
	}

}

class SmartStorage {
	constructor() {
		this._enabled = true;	// false for disabled mode (emulate enabled mode)
	}
	get enable() {
		return this._enabled;
	}
	set enable(enable) {
		this._enabled = enable;
	}
	read(name) {
		if (this._enabled) {
			return localStorage.getItem(name);
		}
        return sessionStorage.getItem(name);
	}
	save(name, value) {
		if (this._enabled) {
			localStorage.setItem(name, value);
		} else {
            sessionStorage.setItem(name, value);
        }
	}
	delete(name) {
		if (this._enabled) {
			localStorage.removeItem(name);
		} else {
            sessionStorage.removeItem(name);
        }
	}
}

class SmartTooltip {
	// get href link paramter to new or old site
	static getLink(link) {
		if (typeof window.SmartTooltip.isNewSite === 'undefined' || !window.SmartTooltip.isNewSite() || !link || link == '') {
			return link;
		}
		return window.location.pathname + link.replace('/grapher.cgi?', '?');
	}

	static initTooltip(id, template) {
		// create SmartTooltip only once! the 'window' is a global object, so don't store the reference on SmartTooltip inside your class!
		// You can alwaise find it by window.SmartTooltip call
		if (!window.SmartTooltip) {
			window.SmartTooltip = new SmartTooltip();
		}
		window.SmartTooltip.init(id, template);
	}
	static showTooltip(data, evt = null) {
		if (evt && (evt.ctrlKey || evt.metaKey || evt.buttons == 2)) {
			return;
		}
		// create SmartTooltip only once! the 'window' is a global object, so don't store the reference on SmartTooltip inside your class!
		// You can alwaise find it by window.SmartTooltip call
		if (!window.SmartTooltip) {
			window.SmartTooltip = new SmartTooltip();
		}
		window.SmartTooltip.show(evt, data);
	}
	static moveTooltip(evt = null) {
		// call move(..) in any case, lets this function make it's own decision :)
		if (window.SmartTooltip) {
			window.SmartTooltip.move(evt);
		} else {
			throw new ReferenceError("window.SmartTooltip hasn't been initialised. call SmartTooltip.show(data), or SmartTooltip.init(id, template) before.");
		}
	}
	static hideTooltip(evt = null) {
		// call hide(..) in any case, lets this function make it's own decision :)
		if (window.SmartTooltip) {
			window.SmartTooltip.hide(evt);
		} else {
			throw new ReferenceError("window.SmartTooltip hasn't been initialised. call SmartTooltip.show(data), or SmartTooltip.init(id, template) before.");
		}
	}


	static formatString(str, data) {
		let frmStr = '';
		const tokens = str.split('$');
		for (let i = 0; i < tokens.length; i++) {
			switch (tokens[i]) {
				case 'UUID': 	{ frmStr += data.uuid || ''; break; }
				case 'VALUE':	{ frmStr += data.value || ''; break; }
				case 'UNITS':	{ frmStr += data.units || ''; break; }
				case 'COLOR':	{ frmStr += data.color || ''; break; }
				case 'LEGEND':  { frmStr += data.legend || data.name || ''; break; }
				case 'LINK':	{ frmStr += data.link || ''; break; }
				case 'TOOLTIP': { frmStr += data.tooltip || ''; break; }
				case 'STATE':	{ frmStr += data.state || ''; break; }
				case 'DESCR':	{ frmStr += data.descr || ''; break; }
				case 'NAME':	{ frmStr += data.name || ''; break; }
				case 'TITLE':	{ frmStr += data.tooltip || data.text || data.name || ''; break; }
				default:
					frmStr += tokens[i];
					break;
			}
		}
		return frmStr;
	}



	// all browser compatible function that returns an object with curren scroll amount.
	// many thans for w3cub project! http://docs.w3cub.com/dom/window/scrolly/
	static getScroll() {
		const supportPageOffset = window.pageXOffset !== undefined;
		const isCSS1Compat = ((document.compatMode || '') === 'CSS1Compat');
		const x = supportPageOffset ? window.pageXOffset : isCSS1Compat ? document.documentElement.scrollLeft : document.body.scrollLeft;
		const y = supportPageOffset ? window.pageYOffset : isCSS1Compat ? document.documentElement.scrollTop : document.body.scrollTop;
		return {X: x, Y: y};
	}


	static getAbsolutePoint(clientX, clientY) {
		// caclulate an absolute location
		const svg = window.SmartTooltip._svg;
		if (!svg) {
			throw new ReferenceError("windows.SmartTooltip._svg hasn't been initialized!");
		}
		let pt = svg.createSVGPoint();
		pt.x = clientX;
		pt.y = clientY;
		pt = pt.matrixTransform(svg.getScreenCTM().inverse());
		return pt;
	}

	// creates svg element, sets attributes and append it to parent, if it not null
	// the new element returned
	// usage example: createElement('circle',{cx:50,cy:50,r:10})
	// special case for 'text' and 'tspan' element creation: append pair text:'any text...' into params object
	// and this text will be automathically appended to 'text' or 'tspan' element
	static addElement(type, params, parent = null, doc = null) {
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
		if (type === 'text' || type === 'tspan') {
			elem.appendChild(doc.createTextNode(textData));
		}
		return elem;
	}

	static wrapText(text, textElem, widthMax, align) {
		function layout(textStr, aligning, maxWidth, elem) {
			const result = {
				dx: parseInt(elem.parentElement.getAttribute('x'), 10),
				x: 0,
				wspace: 0,
				anchor: 'start'
			};
			const words = textStr.split(' ');
			if (aligning === 'justify' && words.length > 1) {
				const lineWidth = elem.getComputedTextLength();
				result.wspace = ((maxWidth - lineWidth) / words.length) - 1; // check this! may be (words.length - 1)?
				elem.setAttributeNS(null, 'word-spacing', result.wspace);
			} else if (aligning === 'center') {
				result.anchor = 'middle';
				// const lineWidth = elem.getComputedTextLength();
				result.x = maxWidth / 2;
			} else if (aligning === 'right') {
				result.anchor = 'end';
				result.x = maxWidth;
			}
			elem.setAttribute('x', result.dx + result.x);
			elem.parentElement.style.setProperty('text-anchor', result.anchor);
		}

		// split the text into the words
		const words = text.split(' ');
		let lineNumber = 0, line = '';
		let tspanElem;

		// tspan for processing
		const testElem = SmartTooltip.addElement('tspan', { text: 'busy' }, textElem);
		for (let n = 0; n < words.length; n++) {
			const testLine = line + words[n] + ' ';
			// add line to test element
			testElem.textContent = testLine;
			// messure test element
			const testLength = testElem.getComputedTextLength();
			if (testLength > widthMax && n > 0) {
				tspanElem = SmartTooltip.addElement('tspan', {x: 0, dy: (lineNumber ? '1em' : 0), text: line}, textElem);
				layout(line, align, widthMax, tspanElem);
				lineNumber++;
				line = words[n] + ' ';
			} else {
				line = testLine;
			}
		}
		tspanElem = SmartTooltip.addElement('tspan', {x: 0, dy: (lineNumber ? '1em' : 0), text: line}, textElem);
		if (align === 'justify') { // the last line of justified text must be left aligned only
			align = 'left';
		}
		layout(line, align, widthMax, tspanElem);
		testElem.remove();
	}

	// calculate and draw segment by center. radius, start and end angles
	static polarToCartesian(centerX, centerY, radius, angleInDegrees) {
		const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;

		return {
			x: centerX + (radius * Math.cos(angleInRadians)),
			y: centerY + (radius * Math.sin(angleInRadians))
		};
	}
	static describeArc(x, y, radius, startAngle, endAngle, isSector = true) {
		const start = SmartTooltip.polarToCartesian(x, y, radius, endAngle);
		const end = SmartTooltip.polarToCartesian(x, y, radius, startAngle);
		const arcSweep = endAngle - startAngle <= 180 ? '0' : '1';
		if (isSector) {
			return [
				'M', start.x, start.y,
				'A', radius, radius, 0, arcSweep, 0, end.x, end.y,
				'L', x, y,
				'Z'
			].join(' ');
		}
		return [
			'M', start.x, start.y,
			'A', radius, radius, 0, arcSweep, 0, end.x, end.y
		].join(' ');
	}

	// http get promis
	static 	httpGet(url) {
		return new Promise(function (resolve, reject) {
			const xhr = new XMLHttpRequest();
			xhr.open('GET', url, true);

			xhr.onload = function () {
				if (this.status == 200) {
					resolve(this.response);
				} else {
					const error = new Error(this.statusText);
					error.code = this.status;
					reject(error);
				}
			};

			xhr.onerror = function () {
				reject(new Error('Network Error'));
			};
			xhr.send();
		});
	}

	/**
	 * Sort data array by specified parameter
	 *
	 * @param {array} data An array of data properties
	 * @property {string} name The name of signal. Existing parameter legend will be used instead of this one
	 * @property {string} legend the legend for signal.
	 * @property {number || string} value The value of signal. In case of this parameter's type is 'string' it will be converted to number before compiring
	 * @property {string} color Represents the color of value
	 * @property {number} state Represents state of value. In case of this parameter's type is 'string' it will be converted to number before compiring
	 * @param {string} sortParam Sort data by one of the next parameters:
	 * 		asis - don't sort,
	 * 		states/state - sort by state or colors (in case of state is not exists),
	 * 		values/value - sort by value,
	 * 		colors/color - sort by color,
	 * 		names/name - sort by legend or name,
	 * 		any other word 	- sort by this 'word parameter. For example: link
	 *
	 * Be careful: this function changes an array data!
	 */
	static sortDataByParam(data = [], sortParam = 'asis') {
		switch (sortParam) {
			case 'asis':
				break;
			// sort by name and ignore lower and upper case
			case 'name':
			case 'names': {
				data.sort(function (a, b) {
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
				data.sort(function (a, b) {
					if (Number(a.value) > Number(b.value)) {
						return 1;
					}
					if (Number(a.value) < Number(b.value)) {
						return -1;
					}
					return 0;
				});
				break;
			}
			case 'color':
			case 'colors': {
				data.sort(function (a, b) {
					if (a.color > b.color) { return 1; }
					if (a.color < b.color) { return -1; }
					return 0;
				});
				break;
			}
			case 'state':
			case 'states': {
				data.sort(function (a, b) {
					if (!a.state || !b.state) {
						if (a.color > b.color) { return 1; }
						if (a.color < b.color) { return -1; }
					} else {
						if (Number(a.state) > Number(b.state)) { return 1; }
						if (Number(a.state) < Number(b.state)) { return -1; }
					}
					return 0;
				});
				break;
			}
			default: {
				data.sort(function (a, b) {
					if (a[sortParam] > b[sortParam]) { return 1; }
					if (a[sortParam] < b[sortParam]) { return -1; }
					return 0;
				});
			}
		}
	}


	constructor(role = null, div = null, root) {
		if (role && div && root) {
			// create additional instance of SmartTooltip (for demo purpose) and not register it in window namespace
			this._demo = {};
			this._demo.role = role;
			this._demo.id = div.id;
			this._initialized = 0;	// _initEvents will change in on true after initializing all needed parts
			this._pinned = false;
			this._fixed = false;
			// this map will contains pairs: widget id (as key) : object with template file name (as name) and loaded external tooltip template string (as template)
			// the function 'show(...)' will load the corresponding template into the body of the tooltip and fill it with the data received from outside
			this._definitions = null;
			this._ownOptions = {}; // options from host custom element will stored here (function setOptions fills it on attributes changes of custom element SmartTooltipElement)
			this._root = root;
			this._ttipRef = div;
			this._ttipGroup = null;
			this.storage = null;
		}
		if (!window.SmartTooltip) {
			this._demo = null;
			this._initialized = 0;	// _initEvents will change in on true after initializing all needed parts
			this._pinned = false;
			this._fixed = false;
			// this map will contains pairs: widget id (as key) : object with template file name (as name) and loaded external tooltip template string (as template)
			// the function 'show(...)' will load the corresponding template into the body of the tooltip and fill it with the data received from outside
			this._definitions = new TemplateDefs();
			this._ownOptions = {}; // options from host custom element will stored here (function setOptions fills it on attributes changes of custom element SmartTooltipElement)

			let div = window.document.createElement('div');
			div.setAttribute('id', 'SmartTooltip');
			div.setAttribute('style', 'position:absolute; z-index:999999');
			window.document.body.appendChild(div);
			this._root = div.attachShadow({mode: 'open'});
			this._ttipRef = div;
			this._ttipGroup = null;

			this.storage = new SmartStorage();
		}
	}

	_drawDiagramm(subTargets) {
		// delete all 'sub-target' from 'diagram-group'
		if (!this._ttipDiagramGroup) {
			return;
		}
		const sta = this._ttipDiagramGroup.getElementsByClassName('main-segment');
		while (sta.length) {
			sta[0].remove();
		}
		// calculate the sum of all values in array
		const sum = subTargets.reduce((acc, cur) => acc + Number(cur.value), 0);
		const onePCT = subTargets.length > 1 ? 360 / sum : 3.6;
		const centerPt = {
			x: Number(this._ttipDiagram.getAttribute('cx')),
			y: Number(this._ttipDiagram.getAttribute('cy')),
			r: Number(this._ttipDiagram.getAttribute('r'))
		};
		let startAngle = 0;

		for (let i = 0; i < subTargets.length; i++) {
			let target = subTargets[i];
			// create individual group for each target
			let gEl = SmartTooltip.addElement('g', {class: 'main-segment', id: `${i}--main-segment`}, this._ttipDiagramGroup);
			let endAngle = (target.value * onePCT) + startAngle;
			const isCurrent = target.current ? 'sttip-selected' : '';
			const isLinked  = target.link ? 'sttip-linked' : '';
			SmartTooltip.addElement('path', {
				class: `sub-target ${isCurrent} ${isLinked}`,
				stroke: 'white',
				fill: target.color,
				'stroke-width': 1,
				'data-linkto': target.link || '',
				'data-uuid': target.uuid || '',
				d: SmartTooltip.describeArc(centerPt.x, centerPt.y, centerPt.r, startAngle, endAngle)
			}, gEl);
			startAngle = endAngle;
		}
	}
	_findElementByClassAndUuid(cls, uuid) {
		if (typeof uuid === 'undefined') {
            return null;
        }
		const els = this._ttipGroup.getElementsByClassName(cls);
		for (let el of els) {
			if (el.dataset['uuid'] === uuid) {
				return el;
			}
		}
		return null;
	}
	_setOverEffect(cls, uuid, effect) {
		if (typeof uuid === 'undefined') {
            return null;
        }
		const els = this._ttipGroup.getElementsByClassName(cls);
		let foundEl = null;
		for (let el of els) {
			if (el.dataset['uuid'] === uuid) {
				foundEl = el;
				el.classList.add(effect);
			} else {
				el.classList.remove(effect);
			}
		}
		return foundEl;
	}
	_drag(event) {
		const div = window.SmartTooltip._ttipRef,
		      scroll = SmartTooltip.getScroll();
		let x = parseInt(div.style.left),
			y = parseInt(div.style.top),
			mouseX = event.clientX + scroll.X,
			mouseY = event.clientY + scroll.Y;

		var left = x + mouseX - div._currentX, top = y + mouseY - div._currentY;
		div.style.left = left + "px";
		div.style.top = Math.max(top, 0) + "px";

		div._currentX = mouseX;
		div._currentY = mouseY;
		event.preventDefault();
	}
	_endDrag(event) {
		const ref = window.SmartTooltip;
		const div = window.SmartTooltip._ttipRef;
		// before storing position of tooltip window in local storage, lets check it's current position. may be it was moved by user
		let x = parseInt(div.style.left, 10),
			y = parseInt(div.style.top, 10);
		if (Math.abs(div._currentX - div._startX) > 5 || Math.abs(div._currentY - div._startY) > 5) {
			if (window.SmartTooltip._o.showMode === '' && window.SmartTooltip._pinned) {
				// save coordinates without scroll sizes!
				const scroll = SmartTooltip.getScroll();
				x -= scroll.X;
				y -= scroll.Y;

				ref.storage.save('SmartTooltip.x', x);
				ref.storage.save('SmartTooltip.y', y);

				ref._ttipPinMe.classList.remove('sttip-pinned');
				ref._ttipPinMe.classList.add('sttip-custom');
				ref._fixed = true; // over from just pinned to fixed mode
			}
		} else {
			console.log('drag more!');
		}
        div._currentX = null;
        div._startX = null;
        div._currentY = null;
        div._startY = null;
		document.removeEventListener('mousemove', this._drag);
		document.removeEventListener('mouseup', this._endDrag);
		this.isDrag = false;
		event.preventDefault();
	}
	_startDrag(event) {
		if (event.target.id === 'pinMe' || event.target.id === 'closeMe' || event.target.id === 'helpMe') {
			event.preventDefault();
			return;
		}
		this.isDrag = true;
		document.addEventListener('mousemove', this._drag);
		document.addEventListener('mouseup', this._endDrag);

		const div = window.SmartTooltip._ttipRef, scroll = SmartTooltip.getScroll();

        div._startX = event.clientX + scroll.X;
        div._currentX = div._startX;
        div._startY = event.clientY + scroll.Y;
        div._currentY = div._startY;
		event.preventDefault();
	}


	// initialize smarttooltip event listeners, used for pin tooltip
	_initEvents() {
		if (!this._initialized) {
			this._initialized = 0;
            this._startDrag = this._startDrag.bind(this);
            this._drag = this._drag.bind(this);
            this._endDrag = this._endDrag.bind(this);

			this._interval = null;
			if (this._ttipGroup) {
				this._initialized++;
				this._ttipGroup.addEventListener('contextmenu', function (evt) {
					evt.preventDefault();
				});

				this._ttipGroup.addEventListener('mousedown', this._startDrag);

				this._ttipGroup.addEventListener('mouseover', function (evt) {
					if (evt.target.classList.contains('sttip-legend-rect')) {
							window.SmartTooltip._setOverEffect('sub-target', evt.target.dataset['uuid'], 'sttip-hover');
					} else
					if (evt.target.classList.contains('sub-target')) {
							window.SmartTooltip._setOverEffect('sttip-legend-rect', evt.target.dataset['uuid'], 'sttip-lightgray');
					}
				});
				this._ttipGroup.addEventListener('mouseout', function (evt) {
					if (evt.target.classList.contains('sttip-legend-rect')) {
							window.SmartTooltip._setOverEffect('sub-target', 'resetall', 'sttip-hover');
					} else
					if (evt.target.classList.contains('sub-target')) {
							window.SmartTooltip._setOverEffect('sttip-legend-rect', 'resetall', 'sttip-lightgray');
					}
				});

				this._ttipGroup.addEventListener('mousemove', function (evt) {
					if (evt.buttons == 1) {
						evt.preventDefault();
						return;
					}
					window.SmartTooltip._checkMouseMoving();
					evt.preventDefault();
				});

				this._ttipGroup.addEventListener('click', function (evt) {
					let linkto = evt.target.dataset['linkto'];
					if (typeof linkto !== 'undefined' && typeof linkto.length === 'number' && linkto.length) {
						linkto = SmartTooltip.getLink(linkto);
						window.open(linkto, '');
					}
				});
			}
			if (this._ttipPinMe) {
				this._initialized++;

				this._ttipPinMe.addEventListener('click', function (evt) {
					const ref = window.SmartTooltip;
					ref._pinned = !window.SmartTooltip._pinned;
					if (ref._pinned) {
						ref.storage.save('SmartTooltip.pinned', true);
						this.classList.add('sttip-pinned');
					} else if (ref._fixed) { // return from 'fixed' mode to 'pinned' mode
                        ref._fixed = false;
                        this.classList.remove('sttip-custom');
                        ref.storage.delete('SmartTooltip.x');
                        ref.storage.delete('SmartTooltip.y');

                        ref._pinned = true;
                        this.classList.add('sttip-pinned');
                    } else { // return from 'pinned' mode to 'float' mode
                        this.classList.remove('sttip-pinned');
                        ref.storage.delete('SmartTooltip.pinned');
                    }
				});
			}
			if (this._ttipHelpMe) { // show 'help' panel
				this._initialized++;

				this._ttipHelpMe.addEventListener('click', function (evt) {

					window.SmartTooltip._ttipRef.style['display'] = 'none';
					evt.preventDefault();
				})
			}
			if (this._ttipCloseMe) { // 'close' toolip window
				this._initialized++;

				this._ttipCloseMe.addEventListener('click', function (evt) {
					window.SmartTooltip._ttipRef.style['display'] = 'none';
					evt.preventDefault();
				});
			}

			this._initialized = (this._initialized > 0);
		}
	}
	_checkMouseMoving(delay = null) {
		if (this._interval) {
			clearTimeout(window.SmartTooltip._interval);
		}
		let noMouseActive = delay || window.SmartTooltip._o.delayOn;
		window.SmartTooltip._interval = setTimeout(function () {
			if (window.SmartTooltip._fixed) {
				return;
			}
			if (typeof window.SmartTooltip.isDrag !== 'undefined' && window.SmartTooltip.isDrag === true) {
				return;
			}

			console.log(`${noMouseActive} ms delay is out, hide tooltip window now!`);
			window.SmartTooltip.hide();
			window.SmartTooltip._interval = null;
		}, noMouseActive); // 5000 - 5 second for showing tooltip on the screen without any mouse activity on it
	}

	_applyCustomOptions(options = null, forId) {
		if (options) {
			if (typeof options.startFrom === 'string') {
				this._o.startFrom = options.startFrom;
				// reset all
				this._pinned = this._fixed = false;
				this._ttipPinMe.classList.remove('sttip-custom');
				this._ttipPinMe.classList.remove('sttip-pinned');
				// now anilize and set apropriated
				if (this._o.startFrom === 'pinned') {
					this._pinned = true;
					this._fixed = false;
				}
				if (this._o.startFrom === 'fixed') {
					this._pinned = true;
					this._fixed = true;
				}
				if (!this.demo && this.storage) { // demo tooltip does not use this functionality
					// now get 'pinned' and 'fixed' modes from local storage
					const pinned = (this.storage.read('SmartTooltip.pinned') === 'true');
					const fixed  = this.storage.read('SmartTooltip.x');
					this._pinned = pinned || this._pinned;
					this._fixed  = fixed || this._fixed;
				}
				// set apropriated class on 'pinMe' button
				if (this._ttipPinMe && this._pinned) {
					if (this._fixed) {
						this._ttipPinMe.classList.add('sttip-custom');
					}
					this._ttipPinMe.classList.add('sttip-pinned');
				}
			}
			if (typeof options.showMode === 'string') {
				// hide pinMe button in case of tooltip for specific element has optional showMode
				this._ttipPinMe.setAttribute('display', 'none');
				this._o.showMode = options.showMode;

				if (options.showMode === 'pinned') {
					this._pinned = true;
					this._fixed = false;
				}
				if (options.showMode === 'fixed') {
					this._pinned = true;
					this._fixed = true;
				}
				if (options.showMode === 'float') {
					this._pinned = false;
					this._fixed = false;
				}
			}
			if (this._ttipRunIndicator && options.isRun !== 'undefined') {
				this._o.isRun = options.isRun;
				// change apperiance of run indicator (if exists)
				this._ttipRunIndicator.classList.replace((this._o.isRun ? 'sttip-stop' : 'sttip-run'), (this._o.isRun ? 'sttip-run' : 'sttip-stop'));
			}
		}
	}

	/**
	 * Load tooltip template specified by 'tmplFileName' definition for element specified by its id
	 * @param {*} id Uniq element's id, or an array or elements. In this case, the next parameter
	 * @param {*} tmplFileName May contains the full file name with '.svg' extention, or predefined name of internal template.
	 * 							Currently only two internal templates are implemented: 'simple' and 'pie'
	 */
	init(id, tmplFileName = null) {
		function loadTemplate(id, tmplFileName, ref) {
			if (id && tmplFileName && ref) {
				ref._definitions.register(id, tmplFileName);

				if (!tmplFileName.match('.svg')) {
					let ttdef = TemplateDefs.getInternalTemplate(tmplFileName);
					if (!ttdef) { // not found, so load default this._ownOptions.template
						ttdef = TemplateDefs.getInternalTemplate((ref._ownOptions.template || 'pie'));
					}
					ref._definitions.set(id, ttdef.name, ttdef.template, ttdef.opt);
					return;
				}
				// in case tmplFileName ends with '.svg', try to load it from server
				SmartTooltip.httpGet(tmplFileName)
					.then((response) => {
						ref._definitions.set(id, tmplFileName, response, {});
					})
					.catch((error) => {
						console.error(error); // Error: Not Found
					});
			}
		}

		this._ttipGroup = null;

		if (typeof id === 'object' && typeof id.length === 'number' && id.length) {
			let tmpl = '';
			for (let i = 0; i < id.length; i++) {
				if (tmplFileName && typeof tmplFileName === 'string') {
					tmpl = tmplFileName;
				} else if (typeof tmplFileName === 'object' && typeof tmplFileName.length === 'number' && typeof tmplFileName[i] !== 'undefined') {
					tmpl = tmplFileName[i];
				} else {
					tmpl = '';
				}
                loadTemplate(id[i], tmpl, this);
			}
			// add event listeners for each specified element
			id.forEach(eid => {
				const element = document.getElementById(eid);
				element.addEventListener('mouseover', function(evt) {
					const options = {
						position: evt.target.getBoundingClientRect(),
						cssVars: {}
					};

					const elem = document.getElementById(evt.target.id);
					if(!elem) {
						return;
					}
					// getting properties in form 'sttip-XXX' and 'sttip-var-XXX' from styles
					const compStyle = getComputedStyle(elem);

					const customProp = CustomProperties.getCustomProperties();
					for (let n = 0; n < customProp.length; n++) {
						if (customProp[n].startsWith('var-')) {
							let cssKey = `${CustomProperties.getPrefix()}${customProp[n]}`;
							let cssVal = compStyle.getPropertyValue(cssKey);
							if (cssVal) {
								cssVal = cssVal.trimLeft();
								options.cssVars[`${cssKey}`] = cssVal;
							}
						} else {
							const prop = `${CustomProperties.getPrefix()}${customProp[n]}`;
							const propKey = CustomProperties.customProp2Param(`${customProp[n]}`);
							let propVal = compStyle.getPropertyValue(prop);
							if (propVal) {
								propVal = propVal.trimLeft();
								options[propKey] = propVal;
							}
						}
					}
					CustomProperties.convertNumericProps(options);
					// read dataset title parameters:
					// uuid, name, value, max, color, link, descr
					function lowerFirst(match, offset, string) { return match.toLowerCase(); }
					const title = {};

					for (let key in evt.target.dataset) {
						if (key.startsWith('sttip')) {
							const sttipKey = key.replace('sttip', '');
							const param = sttipKey.replace(/[A-Z]/, lowerFirst);
							title[param] = evt.target.dataset[key];
						}
					}
					const data = {
						id: evt.target.id,
						x:  evt.clientX,
						y: evt.clientY,
						title: title,
						options: options
					};
					SmartTooltip.showTooltip(data, evt);
				});
				element.addEventListener('mousemove', function(evt) {
					SmartTooltip.moveTooltip(evt);
				});
				element.addEventListener('mouseout', function(evt) {
					SmartTooltip.hideTooltip(evt);
				});
			});

		} else if (typeof id === 'string' && typeof tmplFileName === 'string') {
			loadTemplate(id[1], tmplFileName, this);
		}
	}

	isInit() {
		return 1; //this._ttipGroup;
	}

	// see block started with "if (typeof data.options === 'object')" in function show(..)
	// in case of id specified, store this options for specific element
	setOptions(options, id = null) {
		let optRef = null,
			ttdef;
		if (!id || id == '') {
			if(typeof options === 'object') {
				for (let key in options) {
					this._ownOptions[key] = options[key];
				}
			}
		} else { // change settings for known element
			ttdef = this._definitions.get(id);
			if (ttdef) {
				optRef = ttdef.opt;
			}
			if (optRef) {
				if(typeof options === 'object') {
					for (let key in options) {
						optRef[key] = options[key];
					}
				}
			}
		}
	}


	// needMoveForNewId - Id of new owner control, found in data.id
	move(evt, needMoveForNewId = 0, ownerRect) {
		let coordX, coordY;
		let x = evt.x, y = evt.y;
		if (typeof evt === 'object') {
			if (evt.type === 'mousemove') {
				// lets check buttons
				if (evt && (evt.ctrlKey || evt.metaKey || evt.buttons == 2)) {
					console.log("mouse moved with buttons");
					window.SmartTooltip._checkMouseMoving();
					return;
				}
			}
			{ //else if (evt.type === 'fakeEvent')

				if (!needMoveForNewId) {
					if (this._pinned) {
						return;
					}
				}

				if (this._ttipRef && this._ttipGroup) {
					// in case of moving of pinned tooltip, calculate it's new coordinate by positioning it at the right side of owner control
					if (needMoveForNewId && typeof ownerRect === 'object') {
						x = ownerRect.right + 16;
						y = ownerRect.top;
					} else {
						// offset the tooltip window by 6 pixels to right and down from mouse pointer
						x += 6;
						y += 6;
					}
					// caclulate an absolute location
					const scroll = SmartTooltip.getScroll();
					x += scroll.X;
					y += scroll.Y;

					this._ttipRef.style['left'] = `${x}px`;
					this._ttipRef.style['top'] = `${y}px`;

					const divRect = this._ttipRef.getBoundingClientRect();
					let offsetX = window.innerWidth - divRect.right;
					if (offsetX < 0) {
						x += (offsetX - 50);
						this._ttipRef.style['left'] = x;
					}

					window.SmartTooltip._checkMouseMoving();
				}
			}
		}
	}

	show(evt, data) { // dt = { x, y, title: {color, value, name, descr}, targets: [sub-targets], ...options}
		if (typeof data === 'object') {
			let ttipdef = null;
			if (this._definitions && this._definitions.has(data.id)) {
				ttipdef = this._definitions.get(data.id);
			} else {
				let templName;
				// lets register new element with specified internal or default template name this._ownOptions.template
				if (typeof data.options === 'object' && typeof data.options.template === 'string') {
					templName = data.options.template;
					if (templName.match('.svg')) {
						console.log(`Template ${templName} must to be loaded before call showTooltip(..)!`);
						return;
					}
				} else {
					templName = this._ownOptions.template || 'pie';
				}
				ttipdef = TemplateDefs.getInternalTemplate(templName);
				// demo tooltip does not have definitions, so don't register it!
				if (this._definitions) {
					this._definitions.set(data.id, templName, ttipdef.template, ttipdef.opt);
				}
			}
			if (!ttipdef) {
				this._ttipGroup = null;
				console.error('Tooltip definition not found');
				return;
			}
			if (!this._demo) {	// demo tooltip shown all time and does not use timers
				// Rebuild tooltip each time!
				// clear possible timeout
				if (window.SmartTooltip._interval) {
					clearTimeout(window.SmartTooltip._interval);
				}
			}
			// reload
			this._initialized = false;
			this._root.innerHTML = ttipdef.template;
            this._svg = this._root.firstElementChild;

            if(ttipdef.name === 'iframe') {
                this._iframe = this._root.lastElementChild;
            } else {
                this._iframe = null;
            }

			this._ttipGroup 	   = this._root.getElementById('tooltip-group');
			this._ttipPinMe		   = this._root.getElementById('pinMe');
			this._ttipFrameBGroup  = this._root.getElementById('frmBtns');
				this._ttipHelpMe   = this._root.getElementById('helpMe');
				this._ttipCloseMe  = this._root.getElementById('closeMe');

			this._ttipFrame        = this._root.getElementById('tooltip-frame');
			this._ttipLegendGroup  = this._root.getElementById('legend-group');
			this._ttipLegendFrame  = this._root.getElementById('legend-frame');
			this._ttipLegendStroke = this._root.getElementById('legend-stroke');
			this._sttipLegendTextStroke = this._root.getElementById('legend-text-stroke');
			this._ttipLegendRect   = this._root.getElementById('legend-rect');
			this._ttipLegendColor  = this._root.getElementById('legend-color');
			this._ttipLegendName   = this._root.getElementById('legend-name');
			this._ttipLegendValue  = this._root.getElementById('legend-value');
			this._ttipRunIndicator = this._root.getElementById('run-indicator');
			this._ttipDiagram      = this._root.getElementById('diagram');
			this._ttipDiagramGroup = this._root.getElementById('diagram-group');
			this._ttipValue        = this._root.getElementById('tooltip-value');
			this._ttipDescrGroup   = this._root.getElementById('descr-group');
			this._ttipTitle        = this._root.getElementById('tooltip-title');
			this._ttipDescription  = this._root.getElementById('tooltip-description');
			this._ttipTitleGroup   = this._root.getElementById('title-group');
			this._ttipScaleGroup   = this._root.getElementById('scale-group');
			this._ttipBoundGroup   = this._root.getElementById('bound-group');
			this._ttipValue50      = this._root.getElementById('value-50');
            this._ttipValue100     = this._root.getElementById('value-100');
            this._ttipFakeIFrame   = this._root.getElementById('fake-iframe');
			this._ttipImageLink    = this._root.getElementById('image-link');

			if (!this._demo) { // demo tooltip does not use this functionality
				// init events
				this._initEvents();
			}

			/// update definition options
			if (typeof data.options === 'object') {
				this.setOptions(data.options, data.id);
			}

			// merge default options with custom
			this._o = Object.assign({}, CustomProperties.defOptions(), this._ownOptions, ttipdef.opt);

			if (!this._demo && this.storage) { // demo tooltip does not use this functionality
				this.storage.enable = Number(this._o.enableStorage);
			}

			// set pinned and fixed mode by 'startFrom' parameter
			this._pinned = this._fixed = false;
			if (this._o.startFrom === 'pinned') {
				this._pinned = true;
				this._fixed = false;
			}
			if (this._o.startFrom === 'fixed') {
				this._pinned = true;
				this._fixed = true;
			}
			if (!this._demo && this.storage) { // demo tooltip does not use this functionality
				// now get 'pinned' and 'fixed' modes from local storage
				const pinned = (this.storage.read('SmartTooltip.pinned') === 'true');
				const fixed  = this.storage.read('SmartTooltip.x');
				this._pinned = pinned || this._pinned;
				this._fixed  = fixed || this._fixed;
			}
			// set apropriated class on 'pinMe' button
			if (this._ttipPinMe && this._pinned) {
				if (this._fixed) {
					this._ttipPinMe.classList.add('sttip-custom');
				}
				this._ttipPinMe.classList.add('sttip-pinned');
			}

			if (this._ttipRef && this._ttipGroup) {
				let ttipBoundGroupBR, sText;

				// move buttons group (helpMe and closeMe) to the 0,0 position for next right positioning
				if (this._ttipFrameBGroup) {
					this._ttipFrameBGroup.setAttribute('transform', 'translate(0, 0)');
				}

				this._ttipRef.style['display'] = '';
				// apply optional parameters to this._o (options)
				if (typeof data.options === 'object') {
					this._applyCustomOptions(data.options, data.id);

					this._svg.removeAttribute('style');
					if (typeof data.options.cssVars === 'object') {
						const css = data.options.cssVars;
						for (let key in css) {
							this._svg.style.setProperty(key, css[key]);
						}
					}
				}


				// calculate the maximum width of tooltip window
				let startX = 0, maxWidth, textWidth, prevElemRef = null;
				if (this._ttipTitleGroup) {
					// in case of 'pie' template, the dataset parameter 'x' defines the start X position of title, description and value elements
					startX = parseInt(this._ttipTitleGroup.dataset['x']);
				}
				maxWidth = parseInt(this._ttipFrame.getAttribute('width'));
				if (startX) {
					// before calculating lets check the future position of title
					if (this._ttipLegendGroup && typeof data.targets === 'object' && data.targets.length) {
						maxWidth = maxWidth - startX;
					} else {
						maxWidth = maxWidth - 20;
					}
				}

				// render title section of data
				if (typeof data.title === 'object') {
					// title and description are automaticaly wraps its text
					// the max width for wrapping is calculated as max width of tooltip window (from template)
					// or correspondent lower optional parameter 'titleTextWrap' and 'descrTextWrap'
					// title - legend or name
					if (this._ttipTitle) {
						if (typeof data.title.titleFormat === 'string') {
							this._o.titleFormat = data.title.titleFormat;
						}
						sText = SmartTooltip.formatString(this._o.titleFormat, data.title);
						// before inserting text, lets check the wrap width optional parameter
						if (this._o.titleTextWrap) {
							textWidth = Math.min(maxWidth, this._o.titleTextWrap)
						}
						if (sText) {
							SmartTooltip.wrapText(sText, this._ttipTitle, textWidth || maxWidth, this._o.titleTextAlign);
						}
                        prevElemRef = this._ttipTitle;
					}

					// render description - formatted value
					if (this._ttipDescription) {
							// before drawing this part, lets check the position of previous element and move down!
							if (prevElemRef) {
								const gap = Number(this._ttipDescription.attributes.y.value) - Number(prevElemRef.attributes.y.value);
								const height = prevElemRef.getBoundingClientRect().height;
								let offset = height - gap;
								this._ttipDescription.attributes.y.value = Number(this._ttipDescription.attributes.y.value) + offset;
								prevElemRef = this._ttipDescription;
							}
							if (typeof data.title.descrFormat === 'string') {
							this._o.descrFormat = data.title.descrFormat;
						}
						sText = SmartTooltip.formatString(this._o.descrFormat, data.title);
						// before inserting text, lets check the wrap width optional parameter
						if (this._o.descrTextWrap) {
							textWidth = Math.min(maxWidth, this._o.descrTextWrap)
						}
						if (sText) {
							SmartTooltip.wrapText(sText, this._ttipDescription, textWidth || maxWidth, this._o.descrTextAlign);
						}
                        prevElemRef = this._ttipDescription;
                    }

                    if (this._ttipFakeIFrame) {
						// before drawing lets do the similar trick with own position
						if (prevElemRef) {
							const gap = Number(this._ttipFakeIFrame.attributes.y.value) - Number(prevElemRef.attributes.y.value);
							const height = prevElemRef.getBoundingClientRect().height;
							let offset = height - gap;
							this._ttipFakeIFrame.attributes.y.value = Number(this._ttipFakeIFrame.attributes.y.value) + offset;
                        }
                        const top = this._ttipFakeIFrame.getAttribute('y');
                        this._iframe.style.setProperty('top', `${top}px`);
                        this._iframe.setAttribute('src', data.title.link);
                        prevElemRef = this._ttipFakeIFrame;
                    }
                    if (this._ttipImageLink) {
						// before drawing lets do the similar trick with own position
						if (prevElemRef) {
							const gap = Number(this._ttipImageLink.attributes.y.value) - Number(prevElemRef.attributes.y.value);
							const height = prevElemRef.getBoundingClientRect().height;
							let offset = height - gap;
							this._ttipImageLink.attributes.y.value = Number(this._ttipImageLink.attributes.y.value) + offset;
                        }
                        this._ttipImageLink.setAttribute('xlink:href', data.title.link);
                        prevElemRef = this._ttipImageLink;
                    }


					// render value as colored rectangle with width proportional to value
					if (this._ttipValue) {
						// before drawing lets do the similar trick with own position
						if (prevElemRef) {
							const gap = Number(this._ttipValue.attributes.y.value) - Number(prevElemRef.attributes.y.value);
							const height = prevElemRef.getBoundingClientRect().height;
							let offset = height - gap;
							if (this._ttipScaleGroup) {
								this._ttipScaleGroup.setAttributeNS(null, 'transform', `translate(0, ${offset})`);
							} else {
								this._ttipValue.attributes.y.value = Number(this._ttipValue.attributes.y.value) + offset;
							}
						}
						// render value indicator and its scale
						if (typeof data.title.value !== 'undefined') {
							this._ttipScaleGroup ? (this._ttipScaleGroup.style['display'] = 'block') : {};
							this._ttipValue.style['fill'] = data.title.color || '#666666';
							// value indicator (rect in 'pie' template must to have dataset parameter 'maxw' that defines the length of scale)!
							let valueWidth = parseInt(this._ttipValue.dataset['maxw']);
							let onepct = valueWidth/100;
							// next if-else block use the next logic:
							// if you want to show an absolute value, you must! to specify the maximum value
							// in case the maximum is not specified, there are two cases:
							// 1. in case of value greather than 100, this is an absolute value and I will show it just as a maximum value
							// 2. in another case it is a percent from 100%, so I will show it as percents and append the character '%' after value '100' on the scale
							if(typeof data.title.max !== 'undefined' && data.title.max !== null) {
								onepct = valueWidth / data.title.max;
								if (this._ttipValue50 && this._ttipValue100) {
									this._ttipValue50.textContent = (data.title.max / 2).toFixed(0);
									this._ttipValue100.textContent = data.title.max;
								}
							} else if (data.title.value > 100) {
								onepct = valueWidth / data.title.value;
								if (this._ttipValue50 && this._ttipValue100) {
									this._ttipValue50.textContent = (data.title.value / 2).toFixed(0);
									this._ttipValue100.textContent = data.title.value;
								}
							} else {
								if (this._ttipValue50 && this._ttipValue100) {
									this._ttipValue50.textContent = '50';
									this._ttipValue100.textContent = '100%';
								}
							}
							// set the width of rectangle in proportional to value
							this._ttipValue.setAttribute('width', data.title.value * onepct || 0);
							// append or remove the appropriated class name and dataset attribute 'linkto' with specified link url
							if (data.title.link) {
								this._ttipValue.classList.add('sttip-linked');
								this._ttipValue.dataset['linkto'] = data.title.link;
							} else {
								this._ttipValue.classList.remove('sttip-linked');
								this._ttipValue.dataset['linkto'] = '';
							}
							// store 'uuid' in dataset attribute for next reference (for sorting and selecting)
							data.title.uuid ? this._ttipValue.dataset['uuid'] = data.title.uuid : '';
						} else if (this._ttipScaleGroup) { // in case of value was not specified, hide all scale group!
							this._ttipScaleGroup ? (this._ttipScaleGroup.style['display'] = 'none') : {};
                        }
                        prevElemRef = this._ttipValue;
					}
				}

				// render 'targets' as legend table and pie diagram
				if (this._ttipLegendGroup) {
					if (typeof data.targets === 'object' && data.targets.length) {
						// create the temporary array for working with it (sorting,...)
						const targets = Array.from(data.targets);
						// const targets = { ...data.targets }; - cannot be used here, because I use internal Array functions in sorting!

						// now sort it by optional parameter 'sortBy'
						SmartTooltip.sortDataByParam(targets, this._o.sortBy || 'value');
						if (targets.length) {
							this._ttipLegendGroup ? (this._ttipLegendGroup.style['display'] = '') : {};
							this._ttipDiagram ? (this._ttipDiagram.style['display'] = '') : {};
							this._ttipDiagramGroup ? (this._ttipDiagramGroup.style['display'] = '') : {};
							this._ttipTitleGroup ? (this._ttipTitleGroup.setAttributeNS(null, 'transform', `translate(0, 0)`)) : {};

							let y = 0;
							// show template
							if (this._ttipLegendGroup && this._ttipLegendStroke) {
								this._ttipLegendStroke.style['display'] = '';
								// calculate max length for first (name) and second (value) columns
								let C1 = {maxL: 0, maxInd: -1, rows: []},
									C2 = {maxL: 0, maxInd: -1, rows: []},
									gap = 10,
									text;
								for (let index = 0; index < targets.length; index++) {
									if (this._ttipLegendName) {
										if (typeof targets[index].legendFormat === 'string') {
											this._o.legendFormat = targets[index].legendFormat;
										}
										text = SmartTooltip.formatString(this._o.legendFormat, targets[index]);
										if (text.length > C1.maxL) {
											C1.maxL = text.length;
											C1.maxInd = index;
										}
										C1.rows.push(text);
									}
									if (this._ttipLegendValue) {
										if (typeof targets[index].legendValFormat === 'string') {
											this._o.legendValFormat = targets[index].legendValFormat;
										}
										text = SmartTooltip.formatString(this._o.legendValFormat, targets[index]);
										if (text.length > C2.maxL) {
											C2.maxL = text.length;
											C2.maxInd = index;
										}
										C2.rows.push(text);
									}
								}
								// now, set legend stroke width to maximum length as C1.max + gap + C2.max
								let xC1 = 0, xC2 = 0, maxC1Length, maxStrokeWidth = 0, strokeGap = 10;
								if (C1.maxInd > -1) {
									xC1 = this._ttipLegendName.getBBox().x;
									this._ttipLegendName.textContent = C1.rows[C1.maxInd];
									maxC1Length = this._ttipLegendName.getComputedTextLength();
								}
								if (C2.maxInd > -1) {
									this._ttipLegendValue.textContent = C2.rows[C2.maxInd];
									xC2 = xC1 + maxC1Length + gap;
									this._ttipLegendValue.setAttributeNS(null, 'x', xC2);

									maxStrokeWidth = this._sttipLegendTextStroke.getBoundingClientRect().width;
								}

								for (let index = 0; index < targets.length; index++) {
									let target = targets[index];
									this._ttipLegendColor ? (this._ttipLegendColor.style['fill'] = target.color) : {};
									this._ttipLegendName ?  (this._ttipLegendName.textContent = C1.rows[index]) : {};
									this._ttipLegendValue ?  (this._ttipLegendValue.textContent = C2.rows[index]) : {};
									if (this._ttipLegendRect) {
										this._ttipLegendRect.dataset['linkto'] = target.link || '';
										this._ttipLegendRect.dataset['uuid'] = target.uuid || '';
										this._ttipLegendRect.dataset['parent'] = target.parent || '';
										this._ttipLegendRect.setAttributeNS(null, 'width', maxStrokeWidth + strokeGap);
									}
									const ls = this._ttipLegendStroke.cloneNode(true);
									ls.setAttributeNS(null, 'id', `legend-stroke-${index+1}`);
									ls.classList.add('clone-ls');
									if (target.current) {
										ls.classList.add('sttip-current');
									} else {
										ls.classList.remove('sttip-current');
									}
									target.link ? ls.classList.add('sttip-linked') : ls.classList.remove('sttip-linked');
									ls.setAttributeNS(null, 'transform', `translate(0, ${y})`);
									this._ttipLegendGroup.appendChild(ls);
									y = (index + 1) * 34;	// mistical number is a storke height from template
								}
								// hide template
								this._ttipLegendStroke.style['display'] = 'none';
							}
							this._drawDiagramm(targets);
						}
					} else {
						// hide legend group and diagram in case of no targets and move the title group to the legend group position
						this._ttipLegendGroup ? (this._ttipLegendGroup.style['display'] = 'none') : {};
						this._ttipDiagram ? (this._ttipDiagram.style['display'] = 'none') : {};
						this._ttipDiagramGroup ? (this._ttipDiagramGroup.style['display'] = 'none') : {};

						const legendGroupX = this._ttipLegendGroup? (parseInt(this._ttipLegendGroup.dataset['x'])) : 0;
						const titleGroupX  = this._ttipTitleGroup ? (parseInt(this._ttipTitleGroup.dataset['x'])) : 0;
						this._ttipTitleGroup ? (this._ttipTitleGroup.setAttributeNS(null, 'transform', `translate(-${titleGroupX - legendGroupX}, 0)`)) : {};
					}
				}

				// tooltip window positioning
				if (typeof data.x === 'number' && typeof data.y === 'number') {
					if (this._demo) {
						this._ttipRef.style['left'] = `${data.x}px`;
						this._ttipRef.style['top'] = `${data.y}px`;
					} else {
						let forId = 0;
						if (this._shownFor != data.id) {
							this._shownFor = data.id;
							forId = this._shownFor;
						}
						// before moving to position of forId element, check the local storage x and y coordinates
						// and move to these coordinates (the tooltip window was moved by user interaction to sutable place (i hope))
						// but all this happens only in case of 'fixed' mode!!!
						let left=0, top=0
						if (this._fixed) {
							if (forId) {
								left = Number(this.storage.read('SmartTooltip.x'));
								top = Number(this.storage.read('SmartTooltip.y'));
							}
						}
						if (left && top) { // move here!
							const scroll = SmartTooltip.getScroll();
							// append current scroll positions to saved coordinates (was stored without its on 'endDrag)
							left += scroll.X;
							top += scroll.Y;

							this._ttipRef.style['left'] = left;
							this._ttipRef.style['top'] = top;
						} else {
							const fakeEvt = {
								x: data.x,
								y: data.y,
								type: 'fakeEvent'
							}
							this.move(fakeEvt, forId, this._o.position);
						}
					}
				}

				// resize the frame rectange of toolip window
				// hide button 'closeMe' in 'float' mode and show it in 'pinned' and 'custom' modes
				if (this._ttipCloseMe) {
					this._ttipCloseMe.parentNode.removeAttribute('display');
					if (!this._pinned && !this._fixed) {
						this._ttipCloseMe.parentNode.setAttribute('display', 'none');
					}
				}
				// calculate the bounding size of rendered tooltip window and resize the main frame rectangle
				// 10 pixels added to the bounding width and height are the gaps!
				ttipBoundGroupBR = this._ttipBoundGroup.getBoundingClientRect();
				// this._ttipFrame.setAttributeNS(null, 'width', ttipBoundGroupBR.width + 10);
				this._ttipFrame.setAttributeNS(null, 'height', ttipBoundGroupBR.height + 10);

				// add if enabled shadow effect
				if (this._o.isShadow)
				 this._ttipFrame.classList.add('sttip-shadowed');

				if (this._ttipFrameBGroup) { // move buttons 'helpMe' and 'closeMe' to the right side of frame
					ttipBoundGroupBR = this._ttipFrame.getBoundingClientRect();
					const btnRect = this._ttipFrameBGroup.getBoundingClientRect();
					const btnX = ttipBoundGroupBR.width - (btnRect.width + 4); /* the gap */
					this._ttipFrameBGroup.setAttribute('transform', `translate(${btnX}, 4)`);
				}
				// zoom tooltip window to optional parameter 'frameScale'
				this._ttipGroup.setAttribute('transform', `scale(${this._o.frameScale})`);
				// get real (after scaling) size of #toolip-group and resize the root SVG
				ttipBoundGroupBR = this._ttipGroup.getBoundingClientRect();
				this._svg.setAttributeNS(null, 'width', ttipBoundGroupBR.width);
				this._svg.setAttributeNS(null, 'height', ttipBoundGroupBR.height);

				if (!this._demo) { // demo tooltip does not use this functionality
					window.SmartTooltip._checkMouseMoving();
				}
			}
		}
	}
	hide(evt) {
		if (typeof evt === 'undefined') {
			// hide!!!
			this._ttipRef.style['display'] = 'none';
			// this._ttipRef.classList.add('hidden');

			return;
		}
		if (this._ttipRef && this._ttipGroup) {
			if (!this._fixed) {
				if (evt && (evt.ctrlKey || evt.metaKey || evt.buttons == 2)) {
					console.log("out with buttons");
				}
				// instead of hiding, lets delay for some small interval
				const delay = this._o.delayOut;
				window.SmartTooltip._checkMouseMoving(delay);
			}
		}
	}
};

class CustomProperties {
	constructor() {

	};
	/**
	 * Returns the prefix for custom properties
	 */
	static getPrefix() {
		return '--sttip-';
	}
	/**
	 * Returns an array of custom properties. Each of the custom property has corresponding declarative attribute in form first-second == prefix-first-second
	 * and option parameter with name "firstSecond".
	 * for example: '--sttip-title-format' property equals to attribute 'title-format' and options.titleFormat parameter, but
	 * '--sttip-template' property equals to 'template' attribute and options.template parameter.
	 */
	static getCustomProperties() {
		return [
			'title-format',			// formatting correspondent string
			'descr-format',			// ---
			'legend-format',		// ---
			'legend-val-format',	// ---

			'title-text-wrap',		// sets the line width (line-width attribute) for wrapped text. in case of 0 the width attribute from <rect id="tooltip-frame"> in template is used. the defaul is 0
			'title-text-align',		// align for wrapped text. One from 4 values: 'left', 'center', 'right', 'justify'. The default is 'left'
			'descr-text-wrap',		// sets the line width (line-width attribute) for wrapped text. in case of 0 the width attribute from <rect id="tooltip-frame"> in template is used. the defaul is 0
			'descr-text-align',		// align for wrapped text. One from 4 values: 'left', 'center', 'right', 'justify'. The default is 'left'

			'enable-storage',		// allows to disable or enable (default) an ability to store in localStorage pinMe functionality

			'sort-by',				// sort parameter for multiple data. May contains one of the data parameters name: 'asis', 'name', 'value', 'color', 'state'. the default is 'value'
			'sort-dir',				// sorting direction parameter. the default value is '1', wich means from low to high. Possible values: -1, 0, 1.

			'template',				// default value for this property is 'pie', wich means the using of internal SmartTooltip pie template definition.
									// The custom template may be specified as full url name, for example 'templates/vert_bars.svg'. The case of specified name without
									// extension means an internal name of template. Currently only 'pie' and 'simple' are implemented. May be changed by host custom element.
			'data-section',			// maybe targets or anything else? Simple host element may use the data-specific attribute, for example: 'data-tooltip',
									// but more complecs element, for example SmartGauge widget will returns it's data in array, with name 'targets' for example.
									// By default this value has 'data-tooltip' for custom HTML element and 'targets' for SVG-based element. Not yet implemented.
			'output-mode',			// 'what to show?' parameter. Possible values are: 'all-targets' and 'curTarget'. The default is 'all-targets'. Not Yet implemented.
			'start-from',			// this property describes one of three started showing modes: 'float', 'pinned', 'fixed'. By default it equals 'float' and this means
									// that user may change it as he wish. In case of optional parameter 'options.showMode', or attribute 'show-mode' specified,
									// user cannot change apperance of tooltip window!
			'show-mode',			// optional parameter describes show mode and overides 'start-from'
			'position',				// the value describes location of tooltip window in 'pinned' show-mode. Default value is 'rt' which means right-top conner of element.
									// this parameter may contains the client rectangle coordinates of correspondent element, for tooltip positioning in pinned mode
									// in form {left, top, right, bottom}

			'delay-in',				// the time delay interval before tooltip window will be shown on the screen. The default is 0 (ms)
			'delay-out',  			// the time delay interval when tooltip window will be hided. The default is 250 (ms). This delayed interval will counted after mouse pointer
									// will out from the element.
			'delay-on',				// the time delay interval when tooltip window will disappear from screen after non-activity of mouse pointer. The default value is 2000 (ms)
			'transition-in',		// opacity transition in process of showing tooltip window. The default value is 0 means immidiatly showing.
			'transition-out',		// opacity transition in process of disappearing of tooltip window. The defaul value is immidiatly hiding.
			'is-run',				// runtime status indicator. The default value is 0 - 'stopped' in opposite to 1 - 'runned'.
			'frame-scale',			// template scale parameter. The default is 0.8
			'is-shadow',			// enables shadows around of tooltip window. The default value is 1.

			'var-font-family',
			'var-font-size',
			'var-font-stretch',
			'var-font-color',		// are font definition parameters. Will be derived from host elemet in case if not specified.
			'var-scale-size',		// the size of scales text font, The default is 12px, specified in internal template. If not specified in external template, then the 'font-size' will be used
			'var-legend-size',		// legend font size. Internal template specifies it as 22px.
			'var-title-size',		// title font size. Internal template specifies it as 30px.
			'var-descr-size',		// description font size. Internal template value is 28px.
			'var-run-color',		// fill color for 'runned' state of runtime status indicator. The default value is '#00ff00'.
			'var-stop-color',		// fill color for 'stopped' state of runtime status indicator. The default value is '#ff0000'.
			'var-def-color',		// default color. currently not in use.
			'var-legend-fill',
			'var-legend-stroke',
			'var-frame-fill',		// the fill color of tooltip window background. Internal template defines it as '#ffffff'.
			'var-border-color',		// the border color of tooltip window. Internal template defines it as 'none'.
			'var-frame-opacity',	// opacity value of tooltip window background. Internal template defines it as 0.95.
			'var-border-width',		// the border width of tooltip window. Internal template defines it as 2px.
			'var-border-radius'		// the radius of tooltip window. Internal template defines it as 2px.
		];
	}

	static defOptions() {			// see getCustomProperties() for descriptions
		return {
			titleFormat:			'$TITLE$',
			descrFormat:			'$DESCR$',
			legendFormat:			'$LEGEND$',
			legendValFormat:		'$VALUE$',
			titleTextWrap:			0,
			titleTextAlign:			'center',
			descrTextWrap:			0,
			descrTextAlign:			'justify',
			enableStorage:			1,
			isRun:					0,
			sortBy:					'value',
			sortDir:				1,
			template:				'pie',
			dataSection:			'data-tooltip',
			outputMode:				'all-targets',
			startFrom:				'float',
			showMode:				'',
			position:				'rt',
			delayIn:				0,
			delayOut:				250,
			delayOn:				2000,
			transitionIn:			0,
			transitionOut:			0,
			fontFamily:				'Arial, DIN Condensed, Noteworthy, sans-serif',
			fontSize:				'12px',
			fontStretch:			'condensed',
			fontColor:				'#666666',
			scaleSize:				'12px',
			legendSize:				'18px',
			titleSize:				'22px',
			descrSize:				'18px',
			runColor:				'#00ff00',
			stopColor:				'#ff0000',
			defColor:				'#666666',
			legendFill:				'#ffffff',
			legendStroke:			'#666666',
			frameFill:				'#fffcde',
			borderColor:			'#d1c871',
			frameOpacity:			0.90,
			frameScale:				0.8,
			borderWidth:			2.5,
			borderRadius:			6,
			isShadow:				1
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
			'isRun',
			'frameScale',
			'sortDir',
			'delayIn',
			'delayOut',
			'delayOn',
			'transitionIn',
			'transitionOut',
			'fillOpacity',
			'frameOpacity',
			'borderWidth',
			'borderRadius',
			'titleTextWrap',
			'descrTextWrap',
			'isShadow'
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
	/**
	 *	Converts any property in form '--prefix-first-second' to 'firstSecond' parameter
	    example of use: 'accent-height'.replace(CAMELIZE, capitalize)
	 * @param {*} prop
	 */
	static customProp2Param(prop) {
		var CAMELIZE = /[\-\:]([a-z])/g;
		var capitalize = function (token) {
			return token[1].toUpperCase();
		};
		return prop.replace(CAMELIZE, capitalize);
	}

	static getParams() {
		const props = CustomProperties.getCustomProperties();		// get an array of custom properties
		const paramsArray = [];
		for (let prop of props) {
			paramsArray.push(CustomProperties.customProp2Param(prop));
		}
		return paramsArray;
	}

	static registerElementsByIds(doc, ids = []) {
		const curDocument = doc || document;
		if (ids.length) {
			const tmpls = [];
			for (let n = 0; n < ids.length; n++) {
				const el = curDocument.getElementById(ids[n]);
				if (el) {
					let tmpl = getComputedStyle(el).getPropertyValue('--sttip-template');
					if (tmpl) {
						tmpl = tmpl.trimLeft();
					} else {
						tmpl = el.dataset['template'] || '';
					}
					tmpls.push(tmpl);
				}
			}
			if (tmpls.length == ids.length) {
				SmartTooltip.initTooltip(ids, tmpls);
			}
		}
	}
	static registerElementsByClassName(doc, cls = []) {
		const curDocument = doc || document;
		const ids = [], tmpls = [];
		for (let n = 0; n < cls.length; n++) {
			const elms = curDocument.getElementsByClassName(cls[n]);
			for (let el of elms) {
				let tmpl = getComputedStyle(el).getPropertyValue('--sttip-template');
				if (tmpl) {
					tmpl = tmpl.trimLeft();
				} else {
					tmpl = el.dataset['template'] || '';
				}
				let id = el.getAttribute('id');
				if (id) {
					ids.push(id);
					tmpls.push(tmpl);
				}
			}
		}
		SmartTooltip.initTooltip(ids, tmpls);
	}
}

class SmartTooltipElement extends HTMLElement {
	constructor() {
		super();
		this._o = Object.assign({}, CustomProperties.defOptions());

		// check browser for ShadowDOM v1 specification
		const supportsShadowDOMV1 = !!HTMLElement.prototype.attachShadow;
		if (!supportsShadowDOMV1) {
			throw new Error('Unfortunately, your browser does not support shadow DOM v1. Think about switching to a last release of Chrome browser that supports all new technologies!');
		}
		this._demoTooltip = null;
		this._demoTooltipElement = null;

		let root = this;
		const role = this.getAttribute('role');
		if (role && role === 'demoMode') {
			this.innerHTML = `<div id="demo-smart-tooltip" style="position: absolute; z-index:999998"></div>`;
			this._demoTooltipElement = document.getElementById('demo-smart-tooltip');
			root = this._demoTooltipElement;
		}

		this._shadowDOM = root.attachShadow({mode: 'open'});
		if (!this._shadowDOM) {
			throw new Error('Unfortunately, your browser does not support shadow DOM v1. Think about switching to a last release of Chrome browser that supports all new technologies!');
		}
		if (this._demoTooltipElement) {
			// this call will create special instance of SmartTooltip object not registred in window namespace
			this._demoTooltip = new SmartTooltip(role, this._demoTooltipElement, this._shadowDOM);
		}
		// get custom properties for example, only
		getComputedStyle(this).getPropertyValue('--sttip-sort-by')

		SmartTooltip.initTooltip();
	}

	connectedCallback() {
		// initialize all internal here
		CustomProperties.convertNumericProps(this._o);
        let classNames = this.getAttribute('classNames');
        if (classNames) {
            classNames = classNames.split(' ')
            document.addEventListener('DOMContentLoaded', function(evt) {
				CustomProperties.registerElementsByClassName(document, classNames);
            });
		}
	}
	disconnectedCallback() {
		// uninitialize all internals here
	}

	convertKnownProperties(opt) {
		const options = {
			// position: evt.target.getBoundingClientRect(),
			cssVars: {}
		};

		// convert properties started with 'var-' to css values
		const customProp = CustomProperties.getCustomProperties();
		for (let n = 0; n < customProp.length; n++) {
			if (customProp[n].startsWith('var-')) {
				let cssKey = `${CustomProperties.getPrefix()}${customProp[n]}`;
				let oKey = CustomProperties.customProp2Param(`${customProp[n]}`);
				let cssVal = this._o[oKey];
				if (typeof cssVal === 'undefined') {
					oKey = customProp[n].replace('var-', '');
					oKey = CustomProperties.customProp2Param(oKey);
					cssVal = this._o[oKey];
				}
				// and now?
				if (typeof cssVal !== 'undefined') {
					cssVal = cssVal.toString();
					options.cssVars[`${cssKey}`] = cssVal;
				}
			} else {
				const propKey = CustomProperties.customProp2Param(`${customProp[n]}`);
				let propVal = this._o[CustomProperties.customProp2Param(`${customProp[n]}`)];
				if (typeof propVal !== 'undefined') {
					options[propKey] = propVal;
				}
			}
		}
		return options;
	}

	showDemoTooltip(x, y) {
		if (this._demoTooltip) {
			const options = this.convertKnownProperties(this._o);
			CustomProperties.convertNumericProps(options);


			const data = {
				x: x,
				y: y,
				id: null,
				options: options,
				title: {
					uuid: `uuid-demo-tooltip`,
                    name: `Change options for this SmartTooltip widget and hover mouse pointer over bold text at the left side to check real SmartTooltip`,
                    link: 'index.html'
				}
			}
			const evt = null;
			this._demoTooltip.show(evt, data);
		}
	}

	/**
	 * Attributes changing processing. Sinchronize all changed attributes with JS vars
	 */
	static get observedAttributes() {
		return 	CustomProperties.getCustomProperties();
	}
	attributeChangedCallback(name, oldValue, newValue) {
		const sttip = window.SmartTooltip;
		// update own property
		const paramName = CustomProperties.customProp2Param(name)
		this._o[paramName] = newValue;
		// validate it (if in list of known numeric)
		CustomProperties.convertNumericProps(this._o, paramName);
		// all specific work will done in SmartTooltip
		const opt = {};
		opt[paramName] = this._o[paramName];
		window.SmartTooltip.setOptions(opt, this.id);
	}
}
const supportsCustomElementsV1 = 'customElements' in window;
if (!supportsCustomElementsV1) {
	throw new Error('Unfortunately, your browser does not support custom elements v1. Think about switching to a last release of Chrome browser that supports all new technologies!');
}
if (!customElements.get('smart-ui-tooltip')) {
	customElements.define('smart-ui-tooltip', SmartTooltipElement);
}



