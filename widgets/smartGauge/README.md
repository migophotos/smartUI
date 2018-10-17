# smartGauge
Smart Gauge is a subfamily measuring instruments that display the data received from the server in the form of a panel with a rotating arrow.
Appearance of the device is identified by the parameter "kind", and can be changed via the settings window.

Licensed under the MIT-style license.
Copyright (c) 2016 Michael Goyberg

Features:
* Display units on the dial(s) with the ability to adjust the position, color, font, and other parameters.
* Contains functionality for emulation receiving messages from the server
* Contains Widgets Library functional. This library may be shown inside of specified div element, or as a popup window
* Supports DnD of selected widget from Widget Library
* Has API functions for search any specified widget in any specified category
and many more othe functionality

API:
SmartGauges.help() - load content of this file and show it in a popup window. Try call this function from chrome console

SmartGauges.init({lang: 'en', document: document, window: window, editorAPI: {}, runtimeAPI: {}}) - initialize SmartGauges with dashboard
context. Must call this function asap, in other case SmartGauges library will be initialized with html context. Default language is "ru"

SmartGauges.findWidget(nameSubstr) - Finds and returns an object of all founded widgets wich name contains specified substing
A special case of "getWidget" function call, which widget will be searched by the it's namein all categories

SmartGauges.getWidgets(categoryName, nameSubstr) - Returns widgets from certain category, or all widgets if the category name was not specified.
In case of second argument is specified, this function will return only those widgets
in the name of which will be found the specified string of characters 
An object has the following structure:
``` js
{ 
    name: "Smart Gauges",
    categories: [
        { 
            name: "Category Name",
            widgets: [
              {   name: "Widget template name",
                  params: { gaugeType: "Widget template name" }
              }, {...}, {...}. ...
            ]
        }, {...}, {...}, ...
    ]
}
```

SmartGauges.showLibrary(contId) - Show widgets library in element div,  specified by its id
the class of that div element change the view of "Library" layout
this class may be: 
* vertical
* horizontal
* popup
* float
there is another option for specify view mode: call this function with object parameter instead of just id
the object have the next structure:
{ id: id, view: 'vertical', category: categoryName }
the categoryName is the name of category that returns getWidgets(...) function. In case of this parameter not specified all categories will be shown
in "Library" (depends of view). Supports DnD from library in case of callback specified

SmartGauges.initCtrl(contId, options, specials) - create new instance of SmartGauge widget. Returns the referens on this widget or null in case of 
widget with same id was created before this call and generate error message in Chrome console
where: contId    - container id inside wich new widget will be creates and associated. all other API functions get this contId as widget identificator
       options   - widgets parameters
       specialis - aditional parameters

SmartGauges.unInitCtrl(contId) - call this function for delete widget. Often used for reusing contId
where: contId    - container id assitioated with widget

SmartGauges.update(contId, contObj) - update specified widget bwith new "real" datafragment from server
where: contId    - container id assitioated with widget

SmartGauges.getSvgTemplate() - service function, returns svg template

SmartGauges.getDataFormat(contId) - returns default dataFormat extended with tooltip and legend from scale number 1
where: contId    - container id assitioated with widget

SmartGauges.showParams(contId, options, callbackInfo) - show Options dialog for adjust widget's parameters,
in case of callbackInfo specified, this function will do the next call after "OK" click:
callbackInfo.cbOk.call(cb.cbContext, {params: options}); where options - adjusted widget parameters

where: contId    - container id assitioated with widget 
       options - widget's current options, 
       callbackInfo - next structure:
            cbOk - callback for Ok
            cbContext - the context of callback

SmartGauges.getParams(contId, index) - There is one universal way to obtain complete information about the widget:
Returned structure depends on the parameter "specials.version"

For version "2.0" getParams(contId) returns:
``` js
{   uid:        contId,
    version:    "2.0",
    params:     {"gaugeType":"Black Planet"},
    targets:    [
        { scaleN: 1, dtarget: "path", template: "name", link: "link:" dataFormat: { widget's dataFormat object } },
        { scaleN: 2, dtarget: "path", template: "name", link: "link:" dataFormat: { widget's dataFormat object } },
        { scaleN: 3, dtarget: "path", template: "name", link: "link:" dataFormat: { widget's dataFormat object } },
        { scaleN: 4, dtarget: "path", template: "name", link: "link:" dataFormat: { widget's dataFormat object } },
        .........................,          
        .........................,
    ],
    tooltips:   ["tooltip from dataFormat object for easy access", "", "tooltip from dataFormat object for easy access",...],
    legends:    ["legend from dataFormat object for easy access", "legend from dataFormat object for easy access", "", ...]
}
```

For version "1.0" getParams(contId) returns:
``` js
{   uid:        contId,
    params:     {"gaugeType":"Black Planet"},
    dataFormat: {uuid.... },
    tooltips:   ["tooltip from dataFormat object for easy access"],
    legends:    ["legend from dataFormat object for easy access"]
}
```

This function can take the second parameter: the scale number from 1 to 7. In this case, it returns the only the necessary information. 
Notes:   1. The object params will always contains gauge description!
        2. For version "1.0", this parameter is not relevant..
        3. If you specify a nonexistent scale, the function returns a string that contains the description of the error.

SmartGauges.setParams(uid, data, scaleN) - Opposite and frequently used function, with which you can change any of the parameters of the widget. 
The data format is identical to that returned by getParams (...) function.
Unlike the previous one, this function does not need the indixes and the data type identificatores, 
because the input data describes itself quite clearly.

Let us turn to the details. setParams () function understands the following data structures:
"targets" - used to transmit information about linking external data to a certain scale. 
            This structure will be used in the second version of the data format stored in the file scene_targets.js
            Notes: 1. This structure does not change the amount of the widget scales, but only establishes a connection
                    between the number of scale and targets data source!
                2. Redundant and missing entries will be ignored.
                3. Ascending order of links recommended but not required.

"params" - describes the behavior of the widget. This structure is as follows
        for widget based on "Black Planet" with one changed parameter:

"specials" - Additional data structure, which describes special behavior of the widget. The structure has the following format:
``` js
specials: {
    version:            "1.0",      // gauge will not support linking target and link to scales until changing this parameter to "2.0"
                                    // may be changed from outside, by functions SmartGauges.initCtrl(uid, options, specials)
                                    // and by SmartGauges.setParams(uid, {specials:{...}});
    trayMessenger:      "none",     // usable variants: "none", "enabled", uid - enable automatically sending legend messages to TrayMessenger with id = uid 
    showScalesNumbers:  false,      // enable showing scale numbers in demo mode
    emulateUpdates:     false,      // enable update emulation
    showOptions:        false,      // enable "Options" dialog by Ctrl + dblclick in runtime
    exclusive:          false,      // enable exclusive mode of changing parameters of widget instead of usual "merge" mode
    showTooltips:       true,       // false will disable tooltip in any case
    showLabels:         false,      // enable labels near scales. not implemented yet
    gaugeExId:          "gaugeEx",  // demo control id (unique) 
}
```

Note: All parameters - are optional and depend on the required changes!

setParams(uid, {data}), where data is:
``` js
{
    params:     {"gaugeType":"Black Planet"},
    targets:    [
        { scaleN: 1, dtarget: "path", template: "name", link: "link:" dataFormat: { widget's dataFormat object } },
        { scaleN: 2, dtarget: "path", template: "name", link: "link:" dataFormat: { widget's dataFormat object } },
        { scaleN: 3, dtarget: "path", template: "name", link: "link:" dataFormat: { widget's dataFormat object } },
        { scaleN: 4, dtarget: "path", template: "name", link: "link:" dataFormat: { widget's dataFormat object } },
        .........................,          
        .........................,
    ]
}
```
and it's particular equivalent  'setParams(uid, {data}, N)' for changing target linked to scale number N, and tooltip and legend format definitions also. 
the data has the next structure:
``` js
{
    fullpath:   "dtarget;template;...."
    dtarget:    "path", 
    template:   "name", 
    link:       "link:"
    tooltip:    "tooltip from dataFormat object for easy access",
    legends:    "legend from dataFormat object for easy access"
}
```
Notes:   1. All parameters - are optional and depends on the required changes in the structure of the widget.
        2. In case of "fullpath" is specified, the "dtarget" and "template" will be ignored. 
        3. If the widget works in version "1.0", any targets information will be ignored without any error message.

function setParams() returns it's new options
             

SmartGauges.generateExData(options, random) - generate "data fragment" for emulation,
where: options - scale definition objects, randow - true - generate random values in range 0 - 100 %, false - generate 0 value 


SmartGauges.emulateUpdates(contId, flag) - start/stop emulation process with automatically generation "data fragments", 
where: id - widget id, flag - true/false


not implemented:
SmartGauges.resize(contId, w, h)    - skip resize processing, normal working in editor. return -1
SmartGauges.move(contId, x, y)      - skip moving processing, normal working in editor. return -1
SmartGauges.run(contId)             - extended functionality (self update) is not implemented. generates error message
SmartGauges.stop(contId)            - extended functionality (self update) is not implemented. generates error message
