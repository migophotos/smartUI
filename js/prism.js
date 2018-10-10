/* PrismJS 1.15.0
https://prismjs.com/download.html#themes=prism&languages=markup+css+json&plugins=wpd+custom-class+file-highlight+toolbar+jsonp-highlight+highlight-keywords+unescaped-markup+normalize-whitespace+show-language+copy-to-clipboard */
var _self = (typeof window !== 'undefined')
	? window   // if in browser
	: (
		(typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope)
		? self // if in worker
		: {}   // if in node js
	);

/**
 * Prism: Lightweight, robust, elegant syntax highlighting
 * MIT license http://www.opensource.org/licenses/mit-license.php/
 * @author Lea Verou http://lea.verou.me
 */

var Prism = (function(){

// Private helper vars
var lang = /\blang(?:uage)?-([\w-]+)\b/i;
var uniqueId = 0;

var _ = _self.Prism = {
	manual: _self.Prism && _self.Prism.manual,
	disableWorkerMessageHandler: _self.Prism && _self.Prism.disableWorkerMessageHandler,
	util: {
		encode: function (tokens) {
			if (tokens instanceof Token) {
				return new Token(tokens.type, _.util.encode(tokens.content), tokens.alias);
			} else if (_.util.type(tokens) === 'Array') {
				return tokens.map(_.util.encode);
			} else {
				return tokens.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/\u00a0/g, ' ');
			}
		},

		type: function (o) {
			return Object.prototype.toString.call(o).match(/\[object (\w+)\]/)[1];
		},

		objId: function (obj) {
			if (!obj['__id']) {
				Object.defineProperty(obj, '__id', { value: ++uniqueId });
			}
			return obj['__id'];
		},

		// Deep clone a language definition (e.g. to extend it)
		clone: function (o, visited) {
			var type = _.util.type(o);
			visited = visited || {};

			switch (type) {
				case 'Object':
					if (visited[_.util.objId(o)]) {
						return visited[_.util.objId(o)];
					}
					var clone = {};
					visited[_.util.objId(o)] = clone;

					for (var key in o) {
						if (o.hasOwnProperty(key)) {
							clone[key] = _.util.clone(o[key], visited);
						}
					}

					return clone;

				case 'Array':
					if (visited[_.util.objId(o)]) {
						return visited[_.util.objId(o)];
					}
					var clone = [];
					visited[_.util.objId(o)] = clone;

					o.forEach(function (v, i) {
						clone[i] = _.util.clone(v, visited);
					});

					return clone;
			}

			return o;
		}
	},

	languages: {
		extend: function (id, redef) {
			var lang = _.util.clone(_.languages[id]);

			for (var key in redef) {
				lang[key] = redef[key];
			}

			return lang;
		},

		/**
		 * Insert a token before another token in a language literal
		 * As this needs to recreate the object (we cannot actually insert before keys in object literals),
		 * we cannot just provide an object, we need anobject and a key.
		 * @param inside The key (or language id) of the parent
		 * @param before The key to insert before. If not provided, the function appends instead.
		 * @param insert Object with the key/value pairs to insert
		 * @param root The object that contains `inside`. If equal to Prism.languages, it can be omitted.
		 */
		insertBefore: function (inside, before, insert, root) {
			root = root || _.languages;
			var grammar = root[inside];

			if (arguments.length == 2) {
				insert = arguments[1];

				for (var newToken in insert) {
					if (insert.hasOwnProperty(newToken)) {
						grammar[newToken] = insert[newToken];
					}
				}

				return grammar;
			}

			var ret = {};

			for (var token in grammar) {

				if (grammar.hasOwnProperty(token)) {

					if (token == before) {

						for (var newToken in insert) {

							if (insert.hasOwnProperty(newToken)) {
								ret[newToken] = insert[newToken];
							}
						}
					}

					ret[token] = grammar[token];
				}
			}

			var old = root[inside];
			root[inside] = ret;

			// Update references in other language definitions
			_.languages.DFS(_.languages, function(key, value) {
				if (value === old && key != inside) {
					this[key] = ret;
				}
			});

			return ret;
		},

		// Traverse a language definition with Depth First Search
		DFS: function(o, callback, type, visited) {
			visited = visited || {};
			for (var i in o) {
				if (o.hasOwnProperty(i)) {
					callback.call(o, i, o[i], type || i);

					if (_.util.type(o[i]) === 'Object' && !visited[_.util.objId(o[i])]) {
						visited[_.util.objId(o[i])] = true;
						_.languages.DFS(o[i], callback, null, visited);
					}
					else if (_.util.type(o[i]) === 'Array' && !visited[_.util.objId(o[i])]) {
						visited[_.util.objId(o[i])] = true;
						_.languages.DFS(o[i], callback, i, visited);
					}
				}
			}
		}
	},
	plugins: {},

	highlightAll: function(async, callback) {
		_.highlightAllUnder(document, async, callback);
	},

	highlightAllUnder: function(container, async, callback) {
		var env = {
			callback: callback,
			selector: 'code[class*="language-"], [class*="language-"] code, code[class*="lang-"], [class*="lang-"] code'
		};

		_.hooks.run("before-highlightall", env);

		var elements = env.elements || container.querySelectorAll(env.selector);

		for (var i=0, element; element = elements[i++];) {
			_.highlightElement(element, async === true, env.callback);
		}
	},

	highlightElement: function(element, async, callback) {
		// Find language
		var language, grammar, parent = element;

		while (parent && !lang.test(parent.className)) {
			parent = parent.parentNode;
		}

		if (parent) {
			language = (parent.className.match(lang) || [,''])[1].toLowerCase();
			grammar = _.languages[language];
		}

		// Set language on the element, if not present
		element.className = element.className.replace(lang, '').replace(/\s+/g, ' ') + ' language-' + language;

		if (element.parentNode) {
			// Set language on the parent, for styling
			parent = element.parentNode;

			if (/pre/i.test(parent.nodeName)) {
				parent.className = parent.className.replace(lang, '').replace(/\s+/g, ' ') + ' language-' + language;
			}
		}

		var code = element.textContent;

		var env = {
			element: element,
			language: language,
			grammar: grammar,
			code: code
		};

		_.hooks.run('before-sanity-check', env);

		if (!env.code || !env.grammar) {
			if (env.code) {
				_.hooks.run('before-highlight', env);
				env.element.textContent = env.code;
				_.hooks.run('after-highlight', env);
			}
			_.hooks.run('complete', env);
			return;
		}

		_.hooks.run('before-highlight', env);

		if (async && _self.Worker) {
			var worker = new Worker(_.filename);

			worker.onmessage = function(evt) {
				env.highlightedCode = evt.data;

				_.hooks.run('before-insert', env);

				env.element.innerHTML = env.highlightedCode;

				callback && callback.call(env.element);
				_.hooks.run('after-highlight', env);
				_.hooks.run('complete', env);
			};

			worker.postMessage(JSON.stringify({
				language: env.language,
				code: env.code,
				immediateClose: true
			}));
		}
		else {
			env.highlightedCode = _.highlight(env.code, env.grammar, env.language);

			_.hooks.run('before-insert', env);

			env.element.innerHTML = env.highlightedCode;

			callback && callback.call(element);

			_.hooks.run('after-highlight', env);
			_.hooks.run('complete', env);
		}
	},

	highlight: function (text, grammar, language) {
		var env = {
			code: text,
			grammar: grammar,
			language: language
		};
		_.hooks.run('before-tokenize', env);
		env.tokens = _.tokenize(env.code, env.grammar);
		_.hooks.run('after-tokenize', env);
		return Token.stringify(_.util.encode(env.tokens), env.language);
	},

	matchGrammar: function (text, strarr, grammar, index, startPos, oneshot, target) {
		var Token = _.Token;

		for (var token in grammar) {
			if(!grammar.hasOwnProperty(token) || !grammar[token]) {
				continue;
			}

			if (token == target) {
				return;
			}

			var patterns = grammar[token];
			patterns = (_.util.type(patterns) === "Array") ? patterns : [patterns];

			for (var j = 0; j < patterns.length; ++j) {
				var pattern = patterns[j],
					inside = pattern.inside,
					lookbehind = !!pattern.lookbehind,
					greedy = !!pattern.greedy,
					lookbehindLength = 0,
					alias = pattern.alias;

				if (greedy && !pattern.pattern.global) {
					// Without the global flag, lastIndex won't work
					var flags = pattern.pattern.toString().match(/[imuy]*$/)[0];
					pattern.pattern = RegExp(pattern.pattern.source, flags + "g");
				}

				pattern = pattern.pattern || pattern;

				// Don’t cache length as it changes during the loop
				for (var i = index, pos = startPos; i < strarr.length; pos += strarr[i].length, ++i) {

					var str = strarr[i];

					if (strarr.length > text.length) {
						// Something went terribly wrong, ABORT, ABORT!
						return;
					}

					if (str instanceof Token) {
						continue;
					}

					if (greedy && i != strarr.length - 1) {
						pattern.lastIndex = pos;
						var match = pattern.exec(text);
						if (!match) {
							break;
						}

						var from = match.index + (lookbehind ? match[1].length : 0),
						    to = match.index + match[0].length,
						    k = i,
						    p = pos;

						for (var len = strarr.length; k < len && (p < to || (!strarr[k].type && !strarr[k - 1].greedy)); ++k) {
							p += strarr[k].length;
							// Move the index i to the element in strarr that is closest to from
							if (from >= p) {
								++i;
								pos = p;
							}
						}

						// If strarr[i] is a Token, then the match starts inside another Token, which is invalid
						if (strarr[i] instanceof Token) {
							continue;
						}

						// Number of tokens to delete and replace with the new match
						delNum = k - i;
						str = text.slice(pos, p);
						match.index -= pos;
					} else {
						pattern.lastIndex = 0;

						var match = pattern.exec(str),
							delNum = 1;
					}

					if (!match) {
						if (oneshot) {
							break;
						}

						continue;
					}

					if(lookbehind) {
						lookbehindLength = match[1] ? match[1].length : 0;
					}

					var from = match.index + lookbehindLength,
					    match = match[0].slice(lookbehindLength),
					    to = from + match.length,
					    before = str.slice(0, from),
					    after = str.slice(to);

					var args = [i, delNum];

					if (before) {
						++i;
						pos += before.length;
						args.push(before);
					}

					var wrapped = new Token(token, inside? _.tokenize(match, inside) : match, alias, match, greedy);

					args.push(wrapped);

					if (after) {
						args.push(after);
					}

					Array.prototype.splice.apply(strarr, args);

					if (delNum != 1)
						_.matchGrammar(text, strarr, grammar, i, pos, true, token);

					if (oneshot)
						break;
				}
			}
		}
	},

	tokenize: function(text, grammar, language) {
		var strarr = [text];

		var rest = grammar.rest;

		if (rest) {
			for (var token in rest) {
				grammar[token] = rest[token];
			}

			delete grammar.rest;
		}

		_.matchGrammar(text, strarr, grammar, 0, 0, false);

		return strarr;
	},

	hooks: {
		all: {},

		add: function (name, callback) {
			var hooks = _.hooks.all;

			hooks[name] = hooks[name] || [];

			hooks[name].push(callback);
		},

		run: function (name, env) {
			var callbacks = _.hooks.all[name];

			if (!callbacks || !callbacks.length) {
				return;
			}

			for (var i=0, callback; callback = callbacks[i++];) {
				callback(env);
			}
		}
	}
};

var Token = _.Token = function(type, content, alias, matchedStr, greedy) {
	this.type = type;
	this.content = content;
	this.alias = alias;
	// Copy of the full string this token was created from
	this.length = (matchedStr || "").length|0;
	this.greedy = !!greedy;
};

Token.stringify = function(o, language, parent) {
	if (typeof o == 'string') {
		return o;
	}

	if (_.util.type(o) === 'Array') {
		return o.map(function(element) {
			return Token.stringify(element, language, o);
		}).join('');
	}

	var env = {
		type: o.type,
		content: Token.stringify(o.content, language, parent),
		tag: 'span',
		classes: ['token', o.type],
		attributes: {},
		language: language,
		parent: parent
	};

	if (o.alias) {
		var aliases = _.util.type(o.alias) === 'Array' ? o.alias : [o.alias];
		Array.prototype.push.apply(env.classes, aliases);
	}

	_.hooks.run('wrap', env);

	var attributes = Object.keys(env.attributes).map(function(name) {
		return name + '="' + (env.attributes[name] || '').replace(/"/g, '&quot;') + '"';
	}).join(' ');

	return '<' + env.tag + ' class="' + env.classes.join(' ') + '"' + (attributes ? ' ' + attributes : '') + '>' + env.content + '</' + env.tag + '>';

};

if (!_self.document) {
	if (!_self.addEventListener) {
		// in Node.js
		return _self.Prism;
	}

	if (!_.disableWorkerMessageHandler) {
		// In worker
		_self.addEventListener('message', function (evt) {
			var message = JSON.parse(evt.data),
				lang = message.language,
				code = message.code,
				immediateClose = message.immediateClose;

			_self.postMessage(_.highlight(code, _.languages[lang], lang));
			if (immediateClose) {
				_self.close();
			}
		}, false);
	}

	return _self.Prism;
}

//Get current script and highlight
var script = document.currentScript || [].slice.call(document.getElementsByTagName("script")).pop();

if (script) {
	_.filename = script.src;

	if (!_.manual && !script.hasAttribute('data-manual')) {
		if(document.readyState !== "loading") {
			if (window.requestAnimationFrame) {
				window.requestAnimationFrame(_.highlightAll);
			} else {
				window.setTimeout(_.highlightAll, 16);
			}
		}
		else {
			document.addEventListener('DOMContentLoaded', _.highlightAll);
		}
	}
}

return _self.Prism;

})();

if (typeof module !== 'undefined' && module.exports) {
	module.exports = Prism;
}

// hack for components to work correctly in node.js
if (typeof global !== 'undefined') {
	global.Prism = Prism;
}
;
Prism.languages.markup = {
	'comment': /<!--[\s\S]*?-->/,
	'prolog': /<\?[\s\S]+?\?>/,
	'doctype': /<!DOCTYPE[\s\S]+?>/i,
	'cdata': /<!\[CDATA\[[\s\S]*?]]>/i,
	'tag': {
		pattern: /<\/?(?!\d)[^\s>\/=$<%]+(?:\s+[^\s>\/=]+(?:=(?:("|')(?:\\[\s\S]|(?!\1)[^\\])*\1|[^\s'">=]+))?)*\s*\/?>/i,
		greedy: true,
		inside: {
			'tag': {
				pattern: /^<\/?[^\s>\/]+/i,
				inside: {
					'punctuation': /^<\/?/,
					'namespace': /^[^\s>\/:]+:/
				}
			},
			'attr-value': {
				pattern: /=(?:("|')(?:\\[\s\S]|(?!\1)[^\\])*\1|[^\s'">=]+)/i,
				inside: {
					'punctuation': [
						/^=/,
						{
							pattern: /(^|[^\\])["']/,
							lookbehind: true
						}
					]
				}
			},
			'punctuation': /\/?>/,
			'attr-name': {
				pattern: /[^\s>\/]+/,
				inside: {
					'namespace': /^[^\s>\/:]+:/
				}
			}

		}
	},
	'entity': /&#?[\da-z]{1,8};/i
};

Prism.languages.markup['tag'].inside['attr-value'].inside['entity'] =
	Prism.languages.markup['entity'];

// Plugin to make entity title show the real entity, idea by Roman Komarov
Prism.hooks.add('wrap', function(env) {

	if (env.type === 'entity') {
		env.attributes['title'] = env.content.replace(/&amp;/, '&');
	}
});

Prism.languages.xml = Prism.languages.markup;
Prism.languages.html = Prism.languages.markup;
Prism.languages.mathml = Prism.languages.markup;
Prism.languages.svg = Prism.languages.markup;

Prism.languages.css = {
	'comment': /\/\*[\s\S]*?\*\//,
	'atrule': {
		pattern: /@[\w-]+?.*?(?:;|(?=\s*\{))/i,
		inside: {
			'rule': /@[\w-]+/
			// See rest below
		}
	},
	'url': /url\((?:(["'])(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1|.*?)\)/i,
	'selector': /[^{}\s][^{};]*?(?=\s*\{)/,
	'string': {
		pattern: /("|')(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/,
		greedy: true
	},
	'property': /[-_a-z\xA0-\uFFFF][-\w\xA0-\uFFFF]*(?=\s*:)/i,
	'important': /\B!important\b/i,
	'function': /[-a-z0-9]+(?=\()/i,
	'punctuation': /[(){};:]/
};

Prism.languages.css['atrule'].inside.rest = Prism.languages.css;

if (Prism.languages.markup) {
	Prism.languages.insertBefore('markup', 'tag', {
		'style': {
			pattern: /(<style[\s\S]*?>)[\s\S]*?(?=<\/style>)/i,
			lookbehind: true,
			inside: Prism.languages.css,
			alias: 'language-css',
			greedy: true
		}
	});

	Prism.languages.insertBefore('inside', 'attr-value', {
		'style-attr': {
			pattern: /\s*style=("|')(?:\\[\s\S]|(?!\1)[^\\])*\1/i,
			inside: {
				'attr-name': {
					pattern: /^\s*style/i,
					inside: Prism.languages.markup.tag.inside
				},
				'punctuation': /^\s*=\s*['"]|['"]\s*$/,
				'attr-value': {
					pattern: /.+/i,
					inside: Prism.languages.css
				}
			},
			alias: 'language-css'
		}
	}, Prism.languages.markup.tag);
};
Prism.languages.json = {
	'property': /"(?:\\.|[^\\"\r\n])*"(?=\s*:)/i,
	'string': {
		pattern: /"(?:\\.|[^\\"\r\n])*"(?!\s*:)/,
		greedy: true
	},
	'number': /-?\d+\.?\d*([Ee][+-]?\d+)?/,
	'punctuation': /[{}[\],]/,
	'operator': /:/g,
	'boolean': /\b(?:true|false)\b/i,
	'null': /\bnull\b/i
};

Prism.languages.jsonp = Prism.languages.json;

(function(){

if (
	typeof self !== 'undefined' && !self.Prism ||
	typeof global !== 'undefined' && !global.Prism
) {
	return;
}

if (Prism.languages.css) {
	// check whether the selector is an advanced pattern before extending it
	if (Prism.languages.css.selector.pattern)
	{
		Prism.languages.css.selector.inside['pseudo-class'] = /:[\w-]+/;
		Prism.languages.css.selector.inside['pseudo-element'] = /::[\w-]+/;
	}
	else
	{
		Prism.languages.css.selector = {
			pattern: Prism.languages.css.selector,
			inside: {
				'pseudo-class': /:[\w-]+/,
				'pseudo-element': /::[\w-]+/
			}
		};
	}
}

if (Prism.languages.markup) {
	Prism.languages.markup.tag.inside.tag.inside['tag-id'] = /[\w-]+/;
	
	var Tags = {
		HTML: {
			'a': 1, 'abbr': 1, 'acronym': 1, 'b': 1, 'basefont': 1, 'bdo': 1, 'big': 1, 'blink': 1, 'cite': 1, 'code': 1, 'dfn': 1, 'em': 1, 'kbd': 1,  'i': 1, 
			'rp': 1, 'rt': 1, 'ruby': 1, 's': 1, 'samp': 1, 'small': 1, 'spacer': 1, 'strike': 1, 'strong': 1, 'sub': 1, 'sup': 1, 'time': 1, 'tt': 1,  'u': 1, 
			'var': 1, 'wbr': 1, 'noframes': 1, 'summary': 1, 'command': 1, 'dt': 1, 'dd': 1, 'figure': 1, 'figcaption': 1, 'center': 1, 'section': 1, 'nav': 1,
			'article': 1, 'aside': 1, 'hgroup': 1, 'header': 1, 'footer': 1, 'address': 1, 'noscript': 1, 'isIndex': 1, 'main': 1, 'mark': 1, 'marquee': 1,
			'meter': 1, 'menu': 1
		},
		SVG: {
			'animateColor': 1, 'animateMotion': 1, 'animateTransform': 1, 'glyph': 1, 'feBlend': 1, 'feColorMatrix': 1, 'feComponentTransfer': 1, 
			'feFuncR': 1, 'feFuncG': 1, 'feFuncB': 1, 'feFuncA': 1, 'feComposite': 1, 'feConvolveMatrix': 1, 'feDiffuseLighting': 1, 'feDisplacementMap': 1, 
			'feFlood': 1, 'feGaussianBlur': 1, 'feImage': 1, 'feMerge': 1, 'feMergeNode': 1, 'feMorphology': 1, 'feOffset': 1, 'feSpecularLighting': 1, 
			'feTile': 1, 'feTurbulence': 1, 'feDistantLight': 1, 'fePointLight': 1, 'feSpotLight': 1, 'linearGradient': 1, 'radialGradient': 1, 'altGlyph': 1, 
			'textPath': 1, 'tref': 1, 'altglyph': 1, 'textpath': 1, 'altglyphdef': 1, 'altglyphitem': 1, 'clipPath': 1, 'color-profile': 1, 'cursor': 1,
			'font-face': 1, 'font-face-format': 1, 'font-face-name': 1, 'font-face-src': 1, 'font-face-uri': 1, 'foreignObject': 1, 'glyphRef': 1,
			'hkern': 1, 'vkern': 1
		},
		MathML: {}
	}
}

var language;

Prism.hooks.add('wrap', function(env) {
	if ((env.type == 'tag-id'
		|| (env.type == 'property' && env.content.indexOf('-') != 0)
		|| (env.type == 'rule'&& env.content.indexOf('@-') != 0)
		|| (env.type == 'pseudo-class'&& env.content.indexOf(':-') != 0) 
		|| (env.type == 'pseudo-element'&& env.content.indexOf('::-') != 0) 
        || (env.type == 'attr-name' && env.content.indexOf('data-') != 0)
		) && env.content.indexOf('<') === -1
	) {
		if (env.language == 'css'
			|| env.language == 'scss'
			|| env.language == 'markup'
		) {
			var href = 'https://webplatform.github.io/docs/';
			var content = env.content;

			if (env.language == 'css' || env.language == 'scss') {
				href += 'css/';

				if (env.type == 'property') {
					href += 'properties/';
				}
				else if (env.type == 'rule') {
					href += 'atrules/';
					content = content.substring(1);
				}
				else if (env.type == 'pseudo-class') {
					href += 'selectors/pseudo-classes/';
					content = content.substring(1);
				}
				else if (env.type == 'pseudo-element') {
					href += 'selectors/pseudo-elements/';
					content = content.substring(2);
				}
			}
			else if (env.language == 'markup') {
				if (env.type == 'tag-id') {
					// Check language
					language = getLanguage(env.content) || language;

					if (language) {
						href += language + '/elements/';
					}
					else {
						return; // Abort
					}
				}
				else if (env.type == 'attr-name') {
					if (language) {
						href += language + '/attributes/';
					}
					else {
						return; // Abort
					}
				}
			}

			href += content;
			env.tag = 'a';
			env.attributes.href = href;
			env.attributes.target = '_blank';
		}
	}
});

function getLanguage(tag) {
	var tagL = tag.toLowerCase();
	
	if (Tags.HTML[tagL]) {
		return 'html';
	}
	else if (Tags.SVG[tag]) {
		return 'svg';
	}
	else if (Tags.MathML[tag]) {
		return 'mathml';
	}
	
	// Not in dictionary, perform check
	if (Tags.HTML[tagL] !== 0 && typeof document !== 'undefined') {
		var htmlInterface = (document.createElement(tag).toString().match(/\[object HTML(.+)Element\]/) || [])[1];
		
		if (htmlInterface && htmlInterface != 'Unknown') {
			Tags.HTML[tagL] = 1;
			return 'html';
		}
	}
	
	Tags.HTML[tagL] = 0;
	
	if (Tags.SVG[tag] !== 0 && typeof document !== 'undefined') {
		var svgInterface = (document.createElementNS('http://www.w3.org/2000/svg', tag).toString().match(/\[object SVG(.+)Element\]/) || [])[1];
		
		if (svgInterface && svgInterface != 'Unknown') {
			Tags.SVG[tag] = 1;
			return 'svg';
		}
	}
	
	Tags.SVG[tag] = 0;
	
	// Lame way to detect MathML, but browsers don’t expose interface names there :(
	if (Tags.MathML[tag] !== 0) {
		if (tag.indexOf('m') === 0) {
			Tags.MathML[tag] = 1;
			return 'mathml';
		}
	}
	
	Tags.MathML[tag] = 0;
	
	return null;
}

})();
(function(){

if (
	(typeof self === 'undefined' || !self.Prism) &&
	(typeof global === 'undefined' || !global.Prism)
) {
	return;
}

var options = {
	classMap: {}
};
Prism.plugins.customClass = {
	map: function map(cm) {
		options.classMap = cm;
	},
	prefix: function prefix(string) {
		options.prefixString = string;
	}
}

Prism.hooks.add('wrap', function (env) {
	if (!options.classMap && !options.prefixString) {
		return;
	}
	env.classes = env.classes.map(function(c) {
		return (options.prefixString || '') + (options.classMap[c] || c);
	});
});

})();

(function () {
	if (typeof self === 'undefined' || !self.Prism || !self.document || !document.querySelector) {
		return;
	}

	self.Prism.fileHighlight = function() {

		var Extensions = {
			'js': 'javascript',
			'py': 'python',
			'rb': 'ruby',
			'ps1': 'powershell',
			'psm1': 'powershell',
			'sh': 'bash',
			'bat': 'batch',
			'h': 'c',
			'tex': 'latex'
		};

		Array.prototype.slice.call(document.querySelectorAll('pre[data-src]')).forEach(function (pre) {
			var src = pre.getAttribute('data-src');

			var language, parent = pre;
			var lang = /\blang(?:uage)?-([\w-]+)\b/i;
			while (parent && !lang.test(parent.className)) {
				parent = parent.parentNode;
			}

			if (parent) {
				language = (pre.className.match(lang) || [, ''])[1];
			}

			if (!language) {
				var extension = (src.match(/\.(\w+)$/) || [, ''])[1];
				language = Extensions[extension] || extension;
			}

			var code = document.createElement('code');
			code.className = 'language-' + language;

			pre.textContent = '';

			code.textContent = 'Loading…';

			pre.appendChild(code);

			var xhr = new XMLHttpRequest();

			xhr.open('GET', src, true);

			xhr.onreadystatechange = function () {
				if (xhr.readyState == 4) {

					if (xhr.status < 400 && xhr.responseText) {
						code.textContent = xhr.responseText;

						Prism.highlightElement(code);
					}
					else if (xhr.status >= 400) {
						code.textContent = '✖ Error ' + xhr.status + ' while fetching file: ' + xhr.statusText;
					}
					else {
						code.textContent = '✖ Error: File does not exist or is empty';
					}
				}
			};

			xhr.send(null);
		});

		if (Prism.plugins.toolbar) {
			Prism.plugins.toolbar.registerButton('download-file', function (env) {
				var pre = env.element.parentNode;
				if (!pre || !/pre/i.test(pre.nodeName) || !pre.hasAttribute('data-src') || !pre.hasAttribute('data-download-link')) {
					return;
				}
				var src = pre.getAttribute('data-src');
				var a = document.createElement('a');
				a.textContent = pre.getAttribute('data-download-link-label') || 'Download';
				a.setAttribute('download', '');
				a.href = src;
				return a;
			});
		}

	};

	document.addEventListener('DOMContentLoaded', self.Prism.fileHighlight);

})();
(function(){
	if (typeof self === 'undefined' || !self.Prism || !self.document) {
		return;
	}

	var callbacks = [];
	var map = {};
	var noop = function() {};

	Prism.plugins.toolbar = {};

	/**
	 * Register a button callback with the toolbar.
	 *
	 * @param {string} key
	 * @param {Object|Function} opts
	 */
	var registerButton = Prism.plugins.toolbar.registerButton = function (key, opts) {
		var callback;

		if (typeof opts === 'function') {
			callback = opts;
		} else {
			callback = function (env) {
				var element;

				if (typeof opts.onClick === 'function') {
					element = document.createElement('button');
					element.type = 'button';
					element.addEventListener('click', function () {
						opts.onClick.call(this, env);
					});
				} else if (typeof opts.url === 'string') {
					element = document.createElement('a');
					element.href = opts.url;
				} else {
					element = document.createElement('span');
				}

				element.textContent = opts.text;

				return element;
			};
		}

		callbacks.push(map[key] = callback);
	};

	/**
	 * Post-highlight Prism hook callback.
	 *
	 * @param env
	 */
	var hook = Prism.plugins.toolbar.hook = function (env) {
		// Check if inline or actual code block (credit to line-numbers plugin)
		var pre = env.element.parentNode;
		if (!pre || !/pre/i.test(pre.nodeName)) {
			return;
		}

		// Autoloader rehighlights, so only do this once.
		if (pre.parentNode.classList.contains('code-toolbar')) {
			return;
		}

		// Create wrapper for <pre> to prevent scrolling toolbar with content
		var wrapper = document.createElement("div");
		wrapper.classList.add("code-toolbar");
		pre.parentNode.insertBefore(wrapper, pre);
		wrapper.appendChild(pre);

		// Setup the toolbar
		var toolbar = document.createElement('div');
		toolbar.classList.add('toolbar');

		if (document.body.hasAttribute('data-toolbar-order')) {
			callbacks = document.body.getAttribute('data-toolbar-order').split(',').map(function(key) {
				return map[key] || noop;
			});
		}

		callbacks.forEach(function(callback) {
			var element = callback(env);

			if (!element) {
				return;
			}

			var item = document.createElement('div');
			item.classList.add('toolbar-item');

			item.appendChild(element);
			toolbar.appendChild(item);
		});

		// Add our toolbar to the currently created wrapper of <pre> tag
		wrapper.appendChild(toolbar);
	};

	registerButton('label', function(env) {
		var pre = env.element.parentNode;
		if (!pre || !/pre/i.test(pre.nodeName)) {
			return;
		}

		if (!pre.hasAttribute('data-label')) {
			return;
		}

		var element, template;
		var text = pre.getAttribute('data-label');
		try {
			// Any normal text will blow up this selector.
			template = document.querySelector('template#' + text);
		} catch (e) {}

		if (template) {
			element = template.content;
		} else {
			if (pre.hasAttribute('data-url')) {
				element = document.createElement('a');
				element.href = pre.getAttribute('data-url');
			} else {
				element = document.createElement('span');
			}

			element.textContent = text;
		}

		return element;
	});

	/**
	 * Register the toolbar with Prism.
	 */
	Prism.hooks.add('complete', hook);
})();

(function() {
	if ( !self.Prism || !self.document || !document.querySelectorAll || ![].filter) return;

	var adapters = [];
	function registerAdapter(adapter) {
		if (typeof adapter === "function" && !getAdapter(adapter)) {
			adapters.push(adapter);
		}
	}
	function getAdapter(adapter) {
		if (typeof adapter === "function") {
			return adapters.filter(function(fn) { return fn.valueOf() === adapter.valueOf()})[0];
		}
		else if (typeof adapter === "string" && adapter.length > 0) {
			return adapters.filter(function(fn) { return fn.name === adapter})[0];
		}
		return null;
	}
	function removeAdapter(adapter) {
		if (typeof adapter === "string")
			adapter = getAdapter(adapter);
		if (typeof adapter === "function") {
			var index = adapters.indexOf(adapter);
			if (index >=0) {
				adapters.splice(index,1);
			}
		}
	}

	Prism.plugins.jsonphighlight = {
		registerAdapter: registerAdapter,
		removeAdapter: removeAdapter,
		highlight: highlight
	};
	registerAdapter(function github(rsp, el) {
		if ( rsp && rsp.meta && rsp.data ) {
			if ( rsp.meta.status && rsp.meta.status >= 400 ) {
				return "Error: " + ( rsp.data.message || rsp.meta.status );
			}
			else if ( typeof(rsp.data.content) === "string" ) {
				return typeof(atob) === "function"
					? atob(rsp.data.content.replace(/\s/g, ""))
					: "Your browser cannot decode base64";
			}
		}
		return null;
	});
	registerAdapter(function gist(rsp, el) {
		if ( rsp && rsp.meta && rsp.data && rsp.data.files ) {
			if ( rsp.meta.status && rsp.meta.status >= 400 ) {
				return "Error: " + ( rsp.data.message || rsp.meta.status );
			}
			else {
				var filename = el.getAttribute("data-filename");
				if (filename == null) {
					// Maybe in the future we can somehow render all files
					// But the standard <script> include for gists does that nicely already,
					// so that might be getting beyond the scope of this plugin
					for (var key in rsp.data.files) {
						if (rsp.data.files.hasOwnProperty(key)) {
							filename = key;
							break;
						}
					}
				}
				if (rsp.data.files[filename] !== undefined) {
					return rsp.data.files[filename].content;
				}
				else {
					return "Error: unknown or missing gist file " + filename;
				}
			}
		}
		return null;
	});
	registerAdapter(function bitbucket(rsp, el) {
		return rsp && rsp.node && typeof(rsp.data) === "string"
			? rsp.data
			: null;
	});

	var jsonpcb = 0,
	    loadstr = "Loading…";

	function highlight() {
		Array.prototype.slice.call(document.querySelectorAll("pre[data-jsonp]")).forEach(function(pre) {
			pre.textContent = "";

			var code = document.createElement("code");
			code.textContent = loadstr;
			pre.appendChild(code);

			var adapterfn = pre.getAttribute("data-adapter");
			var adapter = null;
			if ( adapterfn ) {
				if ( typeof(window[adapterfn]) === "function" ) {
					adapter = window[adapterfn];
				}
				else {
					code.textContent = "JSONP adapter function '" + adapterfn + "' doesn't exist";
					return;
				}
			}

			var cb = "prismjsonp" + ( jsonpcb++ );
			
			var uri = document.createElement("a");
			var src = uri.href = pre.getAttribute("data-jsonp");
			uri.href += ( uri.search ? "&" : "?" ) + ( pre.getAttribute("data-callback") || "callback" ) + "=" + cb;

			var timeout = setTimeout(function() {
				// we could clean up window[cb], but if the request finally succeeds, keeping it around is a good thing
				if ( code.textContent === loadstr )
					code.textContent = "Timeout loading '" + src + "'";
			}, 5000);
			
			var script = document.createElement("script");
			script.src = uri.href;

			window[cb] = function(rsp) {
				document.head.removeChild(script);
				clearTimeout(timeout);
				delete window[cb];

				var data = "";
				
				if ( adapter ) {
					data = adapter(rsp, pre);
				}
				else {
					for ( var p in adapters ) {
						data = adapters[p](rsp, pre);
						if ( data !== null ) break;
					}
				}

				if (data === null) {
					code.textContent = "Cannot parse response (perhaps you need an adapter function?)";
				}
				else {
					code.textContent = data;
					Prism.highlightElement(code);
				}
			};

			document.head.appendChild(script);
		});
	}

	highlight();
})();
(function(){

if (
	typeof self !== 'undefined' && !self.Prism ||
	typeof global !== 'undefined' && !global.Prism
) {
	return;
}

Prism.hooks.add('wrap', function(env) {
	if (env.type !== "keyword") {
		return;
	}
	env.classes.push('keyword-' + env.content);
});

})();

(function () {

	if (typeof self === 'undefined' || !self.Prism || !self.document || !Prism.languages.markup) {
		return;
	}

	Prism.plugins.UnescapedMarkup = true;

	Prism.hooks.add('before-highlightall', function (env) {
		env.selector += ", [class*='lang-'] script[type='text/plain'], [class*='language-'] script[type='text/plain']" +
		                ", script[type='text/plain'][class*='lang-'], script[type='text/plain'][class*='language-']";
	});

	Prism.hooks.add('before-sanity-check', function (env) {
		if ((env.element.matches || env.element.msMatchesSelector).call(env.element, "script[type='text/plain']")) {
			var code = document.createElement("code");
			var pre = document.createElement("pre");

			pre.className = code.className = env.element.className;

			if (env.element.dataset) {
				Object.keys(env.element.dataset).forEach(function (key) {
					if (Object.prototype.hasOwnProperty.call(env.element.dataset, key)) {
						pre.dataset[key] = env.element.dataset[key];
					}
				});
			}

			env.code = env.code.replace(/&lt;\/script(>|&gt;)/gi, "</scri" + "pt>");
			code.textContent = env.code;

			pre.appendChild(code);
			env.element.parentNode.replaceChild(pre, env.element);
			env.element = code;
			return;
		}

		var pre = env.element.parentNode;
		if (!env.code && pre && pre.nodeName.toLowerCase() == 'pre' &&
				env.element.childNodes.length && env.element.childNodes[0].nodeName == "#comment") {
			env.element.textContent = env.code = env.element.childNodes[0].textContent;
		}
	});
}());

(function() {

var assign = Object.assign || function (obj1, obj2) {
	for (var name in obj2) {
		if (obj2.hasOwnProperty(name))
			obj1[name] = obj2[name];
	}
	return obj1;
}

function NormalizeWhitespace(defaults) {
	this.defaults = assign({}, defaults);
}

function toCamelCase(value) {
	return value.replace(/-(\w)/g, function(match, firstChar) {
		return firstChar.toUpperCase();
	});
}

function tabLen(str) {
	var res = 0;
	for (var i = 0; i < str.length; ++i) {
		if (str.charCodeAt(i) == '\t'.charCodeAt(0))
			res += 3;
	}
	return str.length + res;
}

NormalizeWhitespace.prototype = {
	setDefaults: function (defaults) {
		this.defaults = assign(this.defaults, defaults);
	},
	normalize: function (input, settings) {
		settings = assign(this.defaults, settings);

		for (var name in settings) {
			var methodName = toCamelCase(name);
			if (name !== "normalize" && methodName !== 'setDefaults' &&
					settings[name] && this[methodName]) {
				input = this[methodName].call(this, input, settings[name]);
			}
		}

		return input;
	},

	/*
	 * Normalization methods
	 */
	leftTrim: function (input) {
		return input.replace(/^\s+/, '');
	},
	rightTrim: function (input) {
		return input.replace(/\s+$/, '');
	},
	tabsToSpaces: function (input, spaces) {
		spaces = spaces|0 || 4;
		return input.replace(/\t/g, new Array(++spaces).join(' '));
	},
	spacesToTabs: function (input, spaces) {
		spaces = spaces|0 || 4;
		return input.replace(RegExp(' {' + spaces + '}', 'g'), '\t');
	},
	removeTrailing: function (input) {
		return input.replace(/\s*?$/gm, '');
	},
	// Support for deprecated plugin remove-initial-line-feed
	removeInitialLineFeed: function (input) {
		return input.replace(/^(?:\r?\n|\r)/, '');
	},
	removeIndent: function (input) {
		var indents = input.match(/^[^\S\n\r]*(?=\S)/gm);

		if (!indents || !indents[0].length)
			return input;

		indents.sort(function(a, b){return a.length - b.length; });

		if (!indents[0].length)
			return input;

		return input.replace(RegExp('^' + indents[0], 'gm'), '');
	},
	indent: function (input, tabs) {
		return input.replace(/^[^\S\n\r]*(?=\S)/gm, new Array(++tabs).join('\t') + '$&');
	},
	breakLines: function (input, characters) {
		characters = (characters === true) ? 80 : characters|0 || 80;

		var lines = input.split('\n');
		for (var i = 0; i < lines.length; ++i) {
			if (tabLen(lines[i]) <= characters)
				continue;

			var line = lines[i].split(/(\s+)/g),
			    len = 0;

			for (var j = 0; j < line.length; ++j) {
				var tl = tabLen(line[j]);
				len += tl;
				if (len > characters) {
					line[j] = '\n' + line[j];
					len = tl;
				}
			}
			lines[i] = line.join('');
		}
		return lines.join('\n');
	}
};

// Support node modules
if (typeof module !== 'undefined' && module.exports) {
	module.exports = NormalizeWhitespace;
}

// Exit if prism is not loaded
if (typeof Prism === 'undefined') {
	return;
}

Prism.plugins.NormalizeWhitespace = new NormalizeWhitespace({
	'remove-trailing': true,
	'remove-indent': true,
	'left-trim': true,
	'right-trim': true,
	/*'break-lines': 80,
	'indent': 2,
	'remove-initial-line-feed': false,
	'tabs-to-spaces': 4,
	'spaces-to-tabs': 4*/
});

Prism.hooks.add('before-sanity-check', function (env) {
	var Normalizer = Prism.plugins.NormalizeWhitespace;

	// Check settings
	if (env.settings && env.settings['whitespace-normalization'] === false) {
		return;
	}

	// Simple mode if there is no env.element
	if ((!env.element || !env.element.parentNode) && env.code) {
		env.code = Normalizer.normalize(env.code, env.settings);
		return;
	}

	// Normal mode
	var pre = env.element.parentNode;
	var clsReg = /\bno-whitespace-normalization\b/;
	if (!env.code || !pre || pre.nodeName.toLowerCase() !== 'pre' ||
			clsReg.test(pre.className) || clsReg.test(env.element.className))
		return;

	var children = pre.childNodes,
	    before = '',
	    after = '',
	    codeFound = false;

	// Move surrounding whitespace from the <pre> tag into the <code> tag
	for (var i = 0; i < children.length; ++i) {
		var node = children[i];

		if (node == env.element) {
			codeFound = true;
		} else if (node.nodeName === "#text") {
			if (codeFound) {
				after += node.nodeValue;
			} else {
				before += node.nodeValue;
			}

			pre.removeChild(node);
			--i;
		}
	}

	if (!env.element.children.length || !Prism.plugins.KeepMarkup) {
		env.code = before + env.code + after;
		env.code = Normalizer.normalize(env.code, env.settings);
	} else {
		// Preserve markup for keep-markup plugin
		var html = before + env.element.innerHTML + after;
		env.element.innerHTML = Normalizer.normalize(html, env.settings);
		env.code = env.element.textContent;
	}
});

}());

(function(){

if (typeof self === 'undefined' || !self.Prism || !self.document) {
	return;
}

if (!Prism.plugins.toolbar) {
	console.warn('Show Languages plugin loaded before Toolbar plugin.');

	return;
}

// The languages map is built automatically with gulp
var Languages = /*languages_placeholder[*/{"html":"HTML","xml":"XML","svg":"SVG","mathml":"MathML","css":"CSS","clike":"C-like","javascript":"JavaScript","abap":"ABAP","actionscript":"ActionScript","apacheconf":"Apache Configuration","apl":"APL","applescript":"AppleScript","arff":"ARFF","asciidoc":"AsciiDoc","asm6502":"6502 Assembly","aspnet":"ASP.NET (C#)","autohotkey":"AutoHotkey","autoit":"AutoIt","shell":"Shell","basic":"BASIC","csharp":"C#","cpp":"C++","coffeescript":"CoffeeScript","csp":"Content-Security-Policy","css-extras":"CSS Extras","django":"Django/Jinja2","erb":"ERB","fsharp":"F#","gedcom":"GEDCOM","glsl":"GLSL","gml":"GameMaker Language","graphql":"GraphQL","http":"HTTP","hpkp":"HTTP Public-Key-Pins","hsts":"HTTP Strict-Transport-Security","ichigojam":"IchigoJam","inform7":"Inform 7","json":"JSON","jsonp":"JSONP","latex":"LaTeX","livescript":"LiveScript","lolcode":"LOLCODE","markup-templating":"Markup templating","matlab":"MATLAB","mel":"MEL","n4js":"N4JS","nasm":"NASM","nginx":"nginx","nsis":"NSIS","objectivec":"Objective-C","ocaml":"OCaml","opencl":"OpenCL","parigp":"PARI/GP","objectpascal":"Object Pascal","php":"PHP","php-extras":"PHP Extras","plsql":"PL/SQL","powershell":"PowerShell","properties":".properties","protobuf":"Protocol Buffers","q":"Q (kdb+ database)","jsx":"React JSX","tsx":"React TSX","renpy":"Ren'py","rest":"reST (reStructuredText)","sas":"SAS","sass":"Sass (Sass)","scss":"Sass (Scss)","sql":"SQL","soy":"Soy (Closure Template)","tap":"TAP","tt2":"Template Toolkit 2","typescript":"TypeScript","vbnet":"VB.Net","vhdl":"VHDL","vim":"vim","visual-basic":"Visual Basic","wasm":"WebAssembly","wiki":"Wiki markup","xeoracube":"XeoraCube","xojo":"Xojo (REALbasic)","xquery":"XQuery","yaml":"YAML"}/*]*/;
Prism.plugins.toolbar.registerButton('show-language', function(env) {
	var pre = env.element.parentNode;
	if (!pre || !/pre/i.test(pre.nodeName)) {
		return;
	}
	var language = pre.getAttribute('data-language') || Languages[env.language] || (env.language && (env.language.substring(0, 1).toUpperCase() + env.language.substring(1)));

	if(!language) {
		return;
	}
	var element = document.createElement('span');
	element.textContent = language;

	return element;
});

})();

(function(){
	if (typeof self === 'undefined' || !self.Prism || !self.document) {
		return;
	}

	if (!Prism.plugins.toolbar) {
		console.warn('Copy to Clipboard plugin loaded before Toolbar plugin.');

		return;
	}

	var ClipboardJS = window.ClipboardJS || undefined;

	if (!ClipboardJS && typeof require === 'function') {
		ClipboardJS = require('clipboard');
	}

	var callbacks = [];

	if (!ClipboardJS) {
		var script = document.createElement('script');
		var head = document.querySelector('head');

		script.onload = function() {
			ClipboardJS = window.ClipboardJS;

			if (ClipboardJS) {
				while (callbacks.length) {
					callbacks.pop()();
				}
			}
		};

		script.src = 'https://cdnjs.cloudflare.com/ajax/libs/clipboard.js/2.0.0/clipboard.min.js';
		head.appendChild(script);
	}

	Prism.plugins.toolbar.registerButton('copy-to-clipboard', function (env) {
		var linkCopy = document.createElement('a');
		linkCopy.textContent = 'Copy';

		if (!ClipboardJS) {
			callbacks.push(registerClipboard);
		} else {
			registerClipboard();
		}

		return linkCopy;

		function registerClipboard() {
			var clip = new ClipboardJS(linkCopy, {
				'text': function () {
					return env.code;
				}
			});

			clip.on('success', function() {
				linkCopy.textContent = 'Copied!';

				resetText();
			});
			clip.on('error', function () {
				linkCopy.textContent = 'Press Ctrl+C to copy';

				resetText();
			});
		}

		function resetText() {
			setTimeout(function () {
				linkCopy.textContent = 'Copy';
			}, 5000);
		}
	});
})();

