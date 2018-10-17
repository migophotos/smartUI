# smartTooltip
javascript generated svg-based tooltip control with some "smart" functionality such as: pinning to target element, fix in client coordinates, ...

The control uses the built-in template to display tooltips.
 * The tooltip window can be "pinned" and will be displayed next to the element until the pinMe option is turned off.
It also use customized templates for individual elements.
 * To take advantage of this functionality, place the custom template on the server and call the static initialization function before first call of SmartTooltip.showTooltip(...), passing the element ID and the full name of the template in arguments.
 for example: SmartTooltip.initTooltip('pie-123', 'toolip.svg');
 
 An Internal template implementation shows the array of data as flat pie diagramm with title and legend.
 The data argument in function showTemplate have the next structure:
 ``` js
 const data = {
  	id: target identificator,
		x:  evt.clientX,
		y:  evt.clientY,
		options: {
			// the client rectangle coordinates of correspondent element.
			// this coordinates will used for place 'the pinned' tooltip near this element
			// you may specify here any screen coordinates for positioning SmartTooltip window
			// only top and right parameters used for calculating currently. 
			// The position of tooltip window will be moved by 16 px at right side of specified 'right' parameter. 
			tRect: { left: 0, top:0, right:0, bottom:0 },
			// run indicator is a small circle near the legend. It's fill color is green, when this parameter equals true and red when false.
			isRun: true / false

			// SmartTooltip window will be scaled by specified factor before showing
			scale: 0.6 - default

			// Sort data by specified parameter. Can be one of the next parameters:
			// "asis" 			- don't sort, default 
			// states/state 	- sort by state or colors (in case of state is not exists), 
			// values/value 	- sort by value, 
			// colors/color 	- sort by color, 
			// names/name 		- sort by legend or name, 
			// any other word 	- sort by this "word" parameter. For example: link
			// Note: This option parameter may be specified only once. After this it will be used for all tooltips on the page
			//       If you want to show different tooltips with different sort orders, please specify this parameter each time!
			sortby: "asis",

			// here you have an ability to re-style SmartTooltip window by changing svg.sttip css variables
			// there is no need to define all the style variables, you can specify only some of them or do not specify anything at all, 
			// if you like the look and fill of the built-in template.
			//
			// This section of parameters allows you to override the look&fill of SmartTooltip window for each specific element on the HTML page.
			
			// Not yet implemented!
			// If you have a desire to globally change the look&fill of the SmartTooltip window, then you can use a special static function
			// passing into it a similar object, needed in the adjustment, variables.
			// SmartTooltip.changeLookAndFill(cssVars={});
			cssVars: {
				"--smartTip-font-family": "'Arial Narrow', 'DIN Condensed', 'Noteworthy', sans-serif";
				"--smartTip-font-stretch": c"ondensed",
				"--smartTip-font-color": "#9dc2de",
				"--smartTip-scale-font-size": "12px",
				"--smartTip-legend-font-size": "22px",
				"--smartTip-title-font-size": "30px",
				"--smartTip-descr-font-size": "28px",
				
				"--smartTip-run-color": "#0f0",
				"--smartTip-stop-color": "#f00",
				"--smartTip-def-color": "#666",

				"--smartTip-frame-fill": "#fff",
				"--smartTip-frame-opacity": "0.95",
				"--smartTip-frame-scale": "0.6",
				"--smartTip-border-color": "none",
				"--smartTip-border-width": "2",
				"--smartTip-border-radius": "2",

				"--smartTip-legend-fill": "#fff",
				"--smartTip-legend-stroke": "#666"
			}
		},
		title: {
			uuid:	'unique target id',
			legend: 'Title legend',
			name:   'Title legend may be defined here also',
			descr:	'Description',
			value:  `By default this value will be shown in description line (under title). But by using descrFormat and/or titleFormat
					you can change that behavior. By default, it is assumed that the value of this parameter is specified in percents. 
					In case you want to display the actual value, add the "valueMax" parameter to correctly calculate the length of the indicator.`,
			valueMax: null, 
			value:  'This text will be shown as description',
			color:  'state color',
			link:   'external URL',
			legendFormat: 'title string with internal variables, such as $VALUE$, $NAME$, $DESCR$, ...',
			legendValFormat: 'same as legendFormat string but for second string'
		},
		targets: [
			{
				uuid:	 'unuque target id',
				legend: 'Title legend',
				name:   'Title legend may be defined here also',
				descr:	'Description'
				value:  'This text will be shown as description',
				color:  'state color',
				link:   'external URL',
				parent: 'parent UUID',
				legendFormat: 'legend stroke formating string with internal variables, such as $VALUE$, $NAME$, $DESCR$, ...',
				legendValFormat: 'legend value formating string'
			}, 
			{}, ...
		]
	}
```	
  Example of use:
 
 1. Conventional use:
 ``` js
  if (!window.SmartTooltip) {
    window.SmartTooltip = new SmartTooltip();
  }
```
  ....
  ....
``` js
  window.SmartTooltip.init(idElement, templateFileName);
```
  ...
``` js
  //collect data object and call the next function
  var data = { id, x, y, options:{rRect, isRun, scale, sortby, cssVars:{...}}, targets:[{uuid, name, value, color, link}], title:{uuid, name, value, color, link} };

  window.SmartTooltip.show(data)
  window.SmartTooltip.move(evt.clientX, evt.clientY);
  window.SmartTooltip.hide();
 ```
 2. Use internal template
 ``` js
  //collect data object and call the next function
  var data = { id, x, y, options:{rRect, isRun, scale, sortby, cssVars:{...}}, targets:[{uuid, name, value, color, link}], title:{uuid, name, value, color, link} };
 
  SmartTooltip.showTooltip(data);
  SmartTooltip.moveTooltip(evt.clientX, evt.clientY);
  SmartTooltip.hideTooltip();
 ```
