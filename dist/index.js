var DeliverOn =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var $ = __webpack_require__(21);
	var themes_1 = __webpack_require__(3);
	//Import libs and styles
	__webpack_require__(14);
	__webpack_require__(6);
	__webpack_require__(7);
	__webpack_require__(8);
	__webpack_require__(9);
	__webpack_require__(11);
	__webpack_require__(10);
	__webpack_require__(12);
	__webpack_require__(13);
	__webpack_require__(19);
	__webpack_require__(20);
	var Client = (function () {
	    function Client(config) {
	        var _this = this;
	        this.config = config;
	        this.theme = {
	            id: Shopify.theme.id,
	            name: Shopify.theme.name,
	            element: {
	                selector: "[data-deliveronhost]",
	                placement: "in",
	            }
	        };
	        // Search for a data-deliveronhost to load the widget into. If it doesn't exist,
	        // determine which theme the shop is using and load the widget into the appropriate element.
	        if (!document.querySelector(this.theme.element.selector)) {
	            var themeId_1 = Shopify.theme.id;
	            var matchingThemes = themes_1.Themes.filter(function (theme, index) { return theme.id === themeId_1; });
	            var found_1 = false;
	            // Try to find a matching theme and container
	            matchingThemes.forEach(function (theme, index) {
	                if (document.querySelector(theme.element.selector)) {
	                    _this.theme = theme;
	                    found_1 = true;
	                    return false;
	                }
	            });
	            if (!found_1) {
	                // TODO: Make an educated guess as to where the widget should be inserted into the DOM.
	                throw new Error("No suitable Deliveron picker host found.");
	            }
	        }
	        //Add the theme name as a class on the body element
	        document.body.classList.add(Shopify.theme.name);
	        //Ensure the Shopify API wrapper is loaded and then load the widget.
	        this.ensureShopifyWrapper(function () { return _this.loadWidget(); });
	    }
	    Object.defineProperty(Client, "VERSION", {
	        get: function () {
	            return ("0.4.0");
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Client.prototype.ensureShopifyWrapper = function (cb) {
	        if (typeof Shopify.updateCartAttributes === "function") {
	            cb();
	            return;
	        }
	        var script = document.createElement("script");
	        script.src = "https://cdn.shopify.com/s/assets/themes_support/api.jquery-c1754bd1a7bb06d28ce2b85087252f0d8af6d848c75139f5e2a263741ba089b0.js";
	        script.type = "text/javascript";
	        script.onload = function (e) {
	            var interval = setInterval(function () {
	                if (typeof Shopify.updateCartAttributes === "function") {
	                    clearInterval(interval);
	                    cb();
	                }
	            }, 250);
	        };
	        document.body.appendChild(script);
	    };
	    Client.prototype.loadWidget = function () {
	        var _this = this;
	        var container = document.createElement("div");
	        container.id = "deliveron-container";
	        var label = document.createElement("label");
	        label.htmlFor = "deliveron-picker";
	        label.id = "deliveron-label";
	        label.textContent = this.config.label;
	        var input = document.createElement("input");
	        input.placeholder = "Click/tap to select";
	        input.type = "text";
	        input.name = "deliveron-picker";
	        input.id = "deliveron-picker";
	        input.onchange = function (e) {
	            e.preventDefault();
	            if (_this.lastDate) {
	                picker.selectDate(_this.lastDate);
	            }
	        };
	        container.appendChild(label);
	        container.appendChild(input);
	        var placement = this.theme.element.placement;
	        var element = document.querySelector(this.theme.element.selector);
	        if (placement === "in") {
	            element.appendChild(container);
	        }
	        else {
	            element.parentNode.insertBefore(container, element);
	        }
	        var maxDate;
	        if (this.config.maxDays) {
	            maxDate = new Date();
	            maxDate.setDate(maxDate.getDate() + this.config.maxDays);
	        }
	        var picker = $(input)["datepicker"]({
	            minDate: new Date(),
	            language: "en",
	            maxDate: maxDate || undefined,
	        }).data("datepicker");
	        // Get the user's cart to check if they've already set a date
	        Shopify.getCart(function (cart) {
	            var att = cart.attributes;
	            if (att.deliverOn && att.deliverOnIso) {
	                _this.lastDate = new Date(att.deliverOnIso);
	                picker.selectDate(_this.lastDate);
	            }
	            // Update the picker with the onSelect handler. Set *after* the default date has been selected so there isn't 
	            // an extraneous update call just for loading the picker.
	            picker.update({
	                onSelect: function (formattedDate, date, picker) { return _this.updateDate(formattedDate, date, picker); },
	            });
	        });
	    };
	    Client.prototype.updateDate = function (formattedDate, date, instance) {
	        this.lastDate = date;
	        var att = {
	            deliverOn: formattedDate,
	            deliverOnIso: date,
	        };
	        Shopify.updateCartAttributes(att, function () { return console.log("Delivery date updated to %s", formattedDate); });
	    };
	    return Client;
	}());
	exports.Client = Client;
	if (true) {
	    window["deli"] = new Client({
	        label: "Pick your delivery date:",
	        format: "mm/dd/yyyy",
	        addPickerToCheckout: false,
	        allowChangeFromCheckout: false,
	        maxDays: 7,
	    });
	}


/***/ },
/* 1 */
/***/ function(module, exports) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	// css base code, injected by the css-loader
	module.exports = function() {
		var list = [];
	
		// return the list of modules as css string
		list.toString = function toString() {
			var result = [];
			for(var i = 0; i < this.length; i++) {
				var item = this[i];
				if(item[2]) {
					result.push("@media " + item[2] + "{" + item[1] + "}");
				} else {
					result.push(item[1]);
				}
			}
			return result.join("");
		};
	
		// import a list of modules into the list
		list.i = function(modules, mediaQuery) {
			if(typeof modules === "string")
				modules = [[null, modules, ""]];
			var alreadyImportedModules = {};
			for(var i = 0; i < this.length; i++) {
				var id = this[i][0];
				if(typeof id === "number")
					alreadyImportedModules[id] = true;
			}
			for(i = 0; i < modules.length; i++) {
				var item = modules[i];
				// skip already imported module
				// this implementation is not 100% perfect for weird media query combinations
				//  when a module is imported multiple times with different media queries.
				//  I hope this will never occur (Hey this way we have smaller bundles)
				if(typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
					if(mediaQuery && !item[2]) {
						item[2] = mediaQuery;
					} else if(mediaQuery) {
						item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
					}
					list.push(item);
				}
			}
		};
		return list;
	};


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	var stylesInDom = {},
		memoize = function(fn) {
			var memo;
			return function () {
				if (typeof memo === "undefined") memo = fn.apply(this, arguments);
				return memo;
			};
		},
		isOldIE = memoize(function() {
			return /msie [6-9]\b/.test(window.navigator.userAgent.toLowerCase());
		}),
		getHeadElement = memoize(function () {
			return document.head || document.getElementsByTagName("head")[0];
		}),
		singletonElement = null,
		singletonCounter = 0,
		styleElementsInsertedAtTop = [];
	
	module.exports = function(list, options) {
		if(false) {
			if(typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
		}
	
		options = options || {};
		// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
		// tags it will allow on a page
		if (typeof options.singleton === "undefined") options.singleton = isOldIE();
	
		// By default, add <style> tags to the bottom of <head>.
		if (typeof options.insertAt === "undefined") options.insertAt = "bottom";
	
		var styles = listToStyles(list);
		addStylesToDom(styles, options);
	
		return function update(newList) {
			var mayRemove = [];
			for(var i = 0; i < styles.length; i++) {
				var item = styles[i];
				var domStyle = stylesInDom[item.id];
				domStyle.refs--;
				mayRemove.push(domStyle);
			}
			if(newList) {
				var newStyles = listToStyles(newList);
				addStylesToDom(newStyles, options);
			}
			for(var i = 0; i < mayRemove.length; i++) {
				var domStyle = mayRemove[i];
				if(domStyle.refs === 0) {
					for(var j = 0; j < domStyle.parts.length; j++)
						domStyle.parts[j]();
					delete stylesInDom[domStyle.id];
				}
			}
		};
	}
	
	function addStylesToDom(styles, options) {
		for(var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];
			if(domStyle) {
				domStyle.refs++;
				for(var j = 0; j < domStyle.parts.length; j++) {
					domStyle.parts[j](item.parts[j]);
				}
				for(; j < item.parts.length; j++) {
					domStyle.parts.push(addStyle(item.parts[j], options));
				}
			} else {
				var parts = [];
				for(var j = 0; j < item.parts.length; j++) {
					parts.push(addStyle(item.parts[j], options));
				}
				stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
			}
		}
	}
	
	function listToStyles(list) {
		var styles = [];
		var newStyles = {};
		for(var i = 0; i < list.length; i++) {
			var item = list[i];
			var id = item[0];
			var css = item[1];
			var media = item[2];
			var sourceMap = item[3];
			var part = {css: css, media: media, sourceMap: sourceMap};
			if(!newStyles[id])
				styles.push(newStyles[id] = {id: id, parts: [part]});
			else
				newStyles[id].parts.push(part);
		}
		return styles;
	}
	
	function insertStyleElement(options, styleElement) {
		var head = getHeadElement();
		var lastStyleElementInsertedAtTop = styleElementsInsertedAtTop[styleElementsInsertedAtTop.length - 1];
		if (options.insertAt === "top") {
			if(!lastStyleElementInsertedAtTop) {
				head.insertBefore(styleElement, head.firstChild);
			} else if(lastStyleElementInsertedAtTop.nextSibling) {
				head.insertBefore(styleElement, lastStyleElementInsertedAtTop.nextSibling);
			} else {
				head.appendChild(styleElement);
			}
			styleElementsInsertedAtTop.push(styleElement);
		} else if (options.insertAt === "bottom") {
			head.appendChild(styleElement);
		} else {
			throw new Error("Invalid value for parameter 'insertAt'. Must be 'top' or 'bottom'.");
		}
	}
	
	function removeStyleElement(styleElement) {
		styleElement.parentNode.removeChild(styleElement);
		var idx = styleElementsInsertedAtTop.indexOf(styleElement);
		if(idx >= 0) {
			styleElementsInsertedAtTop.splice(idx, 1);
		}
	}
	
	function createStyleElement(options) {
		var styleElement = document.createElement("style");
		styleElement.type = "text/css";
		insertStyleElement(options, styleElement);
		return styleElement;
	}
	
	function createLinkElement(options) {
		var linkElement = document.createElement("link");
		linkElement.rel = "stylesheet";
		insertStyleElement(options, linkElement);
		return linkElement;
	}
	
	function addStyle(obj, options) {
		var styleElement, update, remove;
	
		if (options.singleton) {
			var styleIndex = singletonCounter++;
			styleElement = singletonElement || (singletonElement = createStyleElement(options));
			update = applyToSingletonTag.bind(null, styleElement, styleIndex, false);
			remove = applyToSingletonTag.bind(null, styleElement, styleIndex, true);
		} else if(obj.sourceMap &&
			typeof URL === "function" &&
			typeof URL.createObjectURL === "function" &&
			typeof URL.revokeObjectURL === "function" &&
			typeof Blob === "function" &&
			typeof btoa === "function") {
			styleElement = createLinkElement(options);
			update = updateLink.bind(null, styleElement);
			remove = function() {
				removeStyleElement(styleElement);
				if(styleElement.href)
					URL.revokeObjectURL(styleElement.href);
			};
		} else {
			styleElement = createStyleElement(options);
			update = applyToTag.bind(null, styleElement);
			remove = function() {
				removeStyleElement(styleElement);
			};
		}
	
		update(obj);
	
		return function updateStyle(newObj) {
			if(newObj) {
				if(newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap)
					return;
				update(obj = newObj);
			} else {
				remove();
			}
		};
	}
	
	var replaceText = (function () {
		var textStore = [];
	
		return function (index, replacement) {
			textStore[index] = replacement;
			return textStore.filter(Boolean).join('\n');
		};
	})();
	
	function applyToSingletonTag(styleElement, index, remove, obj) {
		var css = remove ? "" : obj.css;
	
		if (styleElement.styleSheet) {
			styleElement.styleSheet.cssText = replaceText(index, css);
		} else {
			var cssNode = document.createTextNode(css);
			var childNodes = styleElement.childNodes;
			if (childNodes[index]) styleElement.removeChild(childNodes[index]);
			if (childNodes.length) {
				styleElement.insertBefore(cssNode, childNodes[index]);
			} else {
				styleElement.appendChild(cssNode);
			}
		}
	}
	
	function applyToTag(styleElement, obj) {
		var css = obj.css;
		var media = obj.media;
	
		if(media) {
			styleElement.setAttribute("media", media)
		}
	
		if(styleElement.styleSheet) {
			styleElement.styleSheet.cssText = css;
		} else {
			while(styleElement.firstChild) {
				styleElement.removeChild(styleElement.firstChild);
			}
			styleElement.appendChild(document.createTextNode(css));
		}
	}
	
	function updateLink(linkElement, obj) {
		var css = obj.css;
		var sourceMap = obj.sourceMap;
	
		if(sourceMap) {
			// http://stackoverflow.com/a/26603875
			css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */";
		}
	
		var blob = new Blob([css], { type: "text/css" });
	
		var oldSrc = linkElement.href;
	
		linkElement.href = URL.createObjectURL(blob);
	
		if(oldSrc)
			URL.revokeObjectURL(oldSrc);
	}


/***/ },
/* 3 */
/***/ function(module, exports) {

	"use strict";
	/**
	 * Known themes used to tell the client where to insert the datepicker.
	 */
	exports.Themes = [
	    {
	        id: 79146374,
	        name: "launchpad-star",
	        element: {
	            placement: "before",
	            selector: "input.btn--secondary.update-cart[name=update]"
	        }
	    }
	];


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(1)();
	// imports
	
	
	// module
	exports.push([module.id, ".datepicker--cells{display:-ms-flexbox;display:-webkit-box;display:flex;-ms-flex-wrap:wrap;flex-wrap:wrap}.datepicker--cell{border-radius:4px;box-sizing:border-box;cursor:pointer;display:-ms-flexbox;display:-webkit-box;display:flex;position:relative;-ms-flex-align:center;-webkit-box-align:center;align-items:center;-ms-flex-pack:center;-webkit-box-pack:center;justify-content:center;height:32px;z-index:1}.datepicker--cell.-focus-{background:#f0f0f0}.datepicker--cell.-current-{color:#4EB5E6}.datepicker--cell.-current-.-focus-{color:#4a4a4a}.datepicker--cell.-current-.-in-range-{color:#4EB5E6}.datepicker--cell.-in-range-{background:rgba(92,196,239,.1);color:#4a4a4a;border-radius:0}.datepicker--cell.-in-range-.-focus-{background-color:rgba(92,196,239,.2)}.datepicker--cell.-disabled-{cursor:default;color:#aeaeae}.datepicker--cell.-disabled-.-focus-{color:#aeaeae}.datepicker--cell.-disabled-.-in-range-{color:#a1a1a1}.datepicker--cell.-disabled-.-current-.-focus-{color:#aeaeae}.datepicker--cell.-range-from-{border:1px solid rgba(92,196,239,.5);background-color:rgba(92,196,239,.1);border-radius:4px 0 0 4px}.datepicker--cell.-range-to-{border:1px solid rgba(92,196,239,.5);background-color:rgba(92,196,239,.1);border-radius:0 4px 4px 0}.datepicker--cell.-selected-, .datepicker--cell.-selected-.-current-{color:#fff;background:#5cc4ef}.datepicker--cell.-range-from-.-range-to-{border-radius:4px}.datepicker--cell.-selected-{border:none}.datepicker--cell.-selected-.-focus-{background:#45bced}.datepicker--cell:empty{cursor:default}.datepicker--days-names{display:-ms-flexbox;display:-webkit-box;display:flex;-ms-flex-wrap:wrap;flex-wrap:wrap;margin:8px 0 3px}.datepicker--day-name{color:#FF9A19;display:-ms-flexbox;display:-webkit-box;display:flex;-ms-flex-align:center;-webkit-box-align:center;align-items:center;-ms-flex-pack:center;-webkit-box-pack:center;justify-content:center;-ms-flex:1;-webkit-box-flex:1;flex:1;text-align:center;text-transform:uppercase;font-size:.8em}.datepicker--body, .datepicker-inline .datepicker--pointer{display:none}.datepicker--cell-day{width:14.28571%}.datepicker--cells-months{height:170px}.datepicker--cell-month{width:33.33%;height:25%}.datepicker--cells-years, .datepicker--years{height:170px}.datepicker--cell-year{width:25%;height:33.33%}.datepickers-container{position:absolute;left:0;top:0}@media print{.datepickers-container{display:none}}.datepicker{background:#fff;border:1px solid #dbdbdb;box-shadow:0 4px 12px rgba(0,0,0,.15);border-radius:4px;box-sizing:content-box;font-family:Tahoma,sans-serif;font-size:14px;color:#4a4a4a;width:250px;position:absolute;left:-100000px;opacity:0;transition:opacity .3s ease,left 0s .3s,-webkit-transform .3s ease;-webkit-transition:opacity .3s ease,left 0s .3s,-webkit-transform .3s ease;transition:opacity .3s ease,transform .3s ease,left 0s .3s;transition:opacity .3s ease,transform .3s ease,left 0s .3s,-webkit-transform .3s ease;z-index:100}.datepicker.-from-top-{-webkit-transform:translateY(-8px);transform:translateY(-8px)}.datepicker.-from-right-{-webkit-transform:translateX(8px);transform:translateX(8px)}.datepicker.-from-bottom-{-webkit-transform:translateY(8px);transform:translateY(8px)}.datepicker.-from-left-{-webkit-transform:translateX(-8px);transform:translateX(-8px)}.datepicker.active{opacity:1;-webkit-transform:translate(0);transform:translate(0);transition:opacity .3s ease,left 0s 0s,-webkit-transform .3s ease;-webkit-transition:opacity .3s ease,left 0s 0s,-webkit-transform .3s ease;transition:opacity .3s ease,transform .3s ease,left 0s 0s;transition:opacity .3s ease,transform .3s ease,left 0s 0s,-webkit-transform .3s ease}.datepicker-inline .datepicker{border-color:#d7d7d7;box-shadow:none;position:static;left:auto;right:auto;opacity:1;-webkit-transform:none;transform:none}.datepicker--content{box-sizing:content-box;padding:4px}.datepicker--pointer{position:absolute;background:#fff;border-top:1px solid #dbdbdb;border-right:1px solid #dbdbdb;width:10px;height:10px;z-index:-1}.datepicker--nav-action:hover, .datepicker--nav-title:hover{background:#f0f0f0}.-top-center- .datepicker--pointer, .-top-left- .datepicker--pointer, .-top-right- .datepicker--pointer{top:calc(100% - 4px);-webkit-transform:rotate(135deg);transform:rotate(135deg)}.-right-bottom- .datepicker--pointer, .-right-center- .datepicker--pointer, .-right-top- .datepicker--pointer{right:calc(100% - 4px);-webkit-transform:rotate(225deg);transform:rotate(225deg)}.-bottom-center- .datepicker--pointer, .-bottom-left- .datepicker--pointer, .-bottom-right- .datepicker--pointer{bottom:calc(100% - 4px);-webkit-transform:rotate(315deg);transform:rotate(315deg)}.-left-bottom- .datepicker--pointer, .-left-center- .datepicker--pointer, .-left-top- .datepicker--pointer{left:calc(100% - 4px);-webkit-transform:rotate(45deg);transform:rotate(45deg)}.-bottom-left- .datepicker--pointer, .-top-left- .datepicker--pointer{left:10px}.-bottom-right- .datepicker--pointer, .-top-right- .datepicker--pointer{right:10px}.-bottom-center- .datepicker--pointer, .-top-center- .datepicker--pointer{left:calc(50% - 10px / 2)}.-left-top- .datepicker--pointer, .-right-top- .datepicker--pointer{top:10px}.-left-bottom- .datepicker--pointer, .-right-bottom- .datepicker--pointer{bottom:10px}.-left-center- .datepicker--pointer, .-right-center- .datepicker--pointer{top:calc(50% - 10px / 2)}.datepicker--body.active{display:block}.datepicker--nav{display:-ms-flexbox;display:-webkit-box;display:flex;-ms-flex-pack:justify;-webkit-box-pack:justify;justify-content:space-between;border-bottom:1px solid #efefef;min-height:32px;padding:4px}.datepicker--nav-action, .datepicker--nav-title{display:-ms-flexbox;display:-webkit-box;display:flex;cursor:pointer;-ms-flex-align:center;-webkit-box-align:center;align-items:center;-ms-flex-pack:center;-webkit-box-pack:center;justify-content:center}.datepicker--nav-action{width:32px;border-radius:4px;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}.datepicker--nav-action.-disabled-{visibility:hidden}.datepicker--nav-action svg{width:32px;height:32px}.datepicker--nav-action path{fill:none;stroke:#9c9c9c;stroke-width:2px}.datepicker--nav-title{border-radius:4px;padding:0 8px}.datepicker--buttons, .datepicker--time{border-top:1px solid #efefef;padding:4px}.datepicker--nav-title i{font-style:normal;color:#9c9c9c;margin-left:5px}.datepicker--nav-title.-disabled-{cursor:default;background:0 0}.datepicker--buttons{display:-ms-flexbox;display:-webkit-box;display:flex}.datepicker--button{color:#4EB5E6;cursor:pointer;border-radius:4px;-ms-flex:1;-webkit-box-flex:1;flex:1;display:-ms-inline-flexbox;display:-webkit-inline-box;display:inline-flex;-ms-flex-pack:center;-webkit-box-pack:center;justify-content:center;-ms-flex-align:center;-webkit-box-align:center;align-items:center;height:32px}.datepicker--button:hover{color:#4a4a4a;background:#f0f0f0}.datepicker--time{display:-ms-flexbox;display:-webkit-box;display:flex;-ms-flex-align:center;-webkit-box-align:center;align-items:center;position:relative}.datepicker--time.-am-pm- .datepicker--time-sliders{-ms-flex:0 1 138px;-webkit-box-flex:0;flex:0 1 138px;max-width:138px}.datepicker--time-sliders{-ms-flex:0 1 153px;-webkit-box-flex:0;flex:0 1 153px;margin-right:10px;max-width:153px}.datepicker--time-label{display:none;font-size:12px}.datepicker--time-current{display:-ms-flexbox;display:-webkit-box;display:flex;-ms-flex-align:center;-webkit-box-align:center;align-items:center;-ms-flex:1;-webkit-box-flex:1;flex:1;font-size:14px;text-align:center;margin:0 0 0 10px}.datepicker--time-current-colon{margin:0 2px 3px;line-height:1}.datepicker--time-current-hours, .datepicker--time-current-minutes{line-height:1;font-size:19px;font-family:\"Century Gothic\",CenturyGothic,AppleGothic,sans-serif;position:relative;z-index:1}.datepicker--time-current-hours:after, .datepicker--time-current-minutes:after{content:'';background:#f0f0f0;border-radius:4px;position:absolute;left:-2px;top:-3px;right:-2px;bottom:-2px;z-index:-1;opacity:0}.datepicker--time-current-hours.-focus-:after, .datepicker--time-current-minutes.-focus-:after{opacity:1}.datepicker--time-current-ampm{text-transform:uppercase;-ms-flex-item-align:end;align-self:flex-end;color:#9c9c9c;margin-left:6px;font-size:11px;margin-bottom:1px}.datepicker--time-row{display:-ms-flexbox;display:-webkit-box;display:flex;-ms-flex-align:center;-webkit-box-align:center;align-items:center;font-size:11px;height:17px;background:-webkit-linear-gradient(left,#dedede,#dedede) left 50%/100% 1px no-repeat;background:linear-gradient(to right,#dedede,#dedede) left 50%/100% 1px no-repeat}.datepicker--time-row:first-child{margin-bottom:4px}.datepicker--time-row input[type=range]{background:0 0;cursor:pointer;-ms-flex:1;-webkit-box-flex:1;flex:1;height:100%;padding:0;margin:0;-webkit-appearance:none}.datepicker--time-row input[type=range]::-ms-tooltip{display:none}.datepicker--time-row input[type=range]:hover::-webkit-slider-thumb{border-color:#b8b8b8}.datepicker--time-row input[type=range]:hover::-moz-range-thumb{border-color:#b8b8b8}.datepicker--time-row input[type=range]:hover::-ms-thumb{border-color:#b8b8b8}.datepicker--time-row input[type=range]:focus{outline:0}.datepicker--time-row input[type=range]:focus::-webkit-slider-thumb{background:#5cc4ef;border-color:#5cc4ef}.datepicker--time-row input[type=range]:focus::-moz-range-thumb{background:#5cc4ef;border-color:#5cc4ef}.datepicker--time-row input[type=range]:focus::-ms-thumb{background:#5cc4ef;border-color:#5cc4ef}.datepicker--time-row input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;box-sizing:border-box;height:12px;width:12px;border-radius:3px;border:1px solid #dedede;background:#fff;cursor:pointer;-webkit-transition:background .2s;transition:background .2s;margin-top:-6px}.datepicker--time-row input[type=range]::-moz-range-thumb{box-sizing:border-box;height:12px;width:12px;border-radius:3px;border:1px solid #dedede;background:#fff;cursor:pointer;-webkit-transition:background .2s;transition:background .2s}.datepicker--time-row input[type=range]::-ms-thumb{box-sizing:border-box;height:12px;width:12px;border-radius:3px;border:1px solid #dedede;background:#fff;cursor:pointer;-webkit-transition:background .2s;transition:background .2s}.datepicker--time-row input[type=range]::-webkit-slider-runnable-track{border:none;height:1px;cursor:pointer;color:transparent;background:0 0}.datepicker--time-row input[type=range]::-moz-range-track{border:none;height:1px;cursor:pointer;color:transparent;background:0 0}.datepicker--time-row input[type=range]::-ms-track{border:none;height:1px;cursor:pointer;color:transparent;background:0 0}.datepicker--time-row input[type=range]::-ms-fill-lower{background:0 0}.datepicker--time-row input[type=range]::-ms-fill-upper{background:0 0}.datepicker--time-row span{padding:0 12px}.datepicker--time-icon{color:#9c9c9c;border:1px solid;border-radius:50%;font-size:16px;position:relative;margin:0 5px -1px 0;width:1em;height:1em}.datepicker--time-icon:after, .datepicker--time-icon:before{content:'';background:currentColor;position:absolute}.datepicker--time-icon:after{height:.4em;width:1px;left:calc(50% - 1px);top:calc(50% + 1px);-webkit-transform:translateY(-100%);transform:translateY(-100%)}.datepicker--time-icon:before{width:.4em;height:1px;top:calc(50% + 1px);left:calc(50% - 1px)}.datepicker--cell-day.-other-month-, .datepicker--cell-year.-other-decade-{color:#dedede}.datepicker--cell-day.-other-month-:hover, .datepicker--cell-year.-other-decade-:hover{color:#c5c5c5}.-disabled-.-focus-.datepicker--cell-day.-other-month-, .-disabled-.-focus-.datepicker--cell-year.-other-decade-{color:#dedede}.-selected-.datepicker--cell-day.-other-month-, .-selected-.datepicker--cell-year.-other-decade-{color:#fff;background:#a2ddf6}.-selected-.-focus-.datepicker--cell-day.-other-month-, .-selected-.-focus-.datepicker--cell-year.-other-decade-{background:#8ad5f4}.-in-range-.datepicker--cell-day.-other-month-, .-in-range-.datepicker--cell-year.-other-decade-{background-color:rgba(92,196,239,.1);color:#ccc}.-in-range-.-focus-.datepicker--cell-day.-other-month-, .-in-range-.-focus-.datepicker--cell-year.-other-decade-{background-color:rgba(92,196,239,.2)}.datepicker--cell-day.-other-month-:empty, .datepicker--cell-year.-other-decade-:empty{background:0 0;border:none}", ""]);
	
	// exports


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(1)();
	// imports
	
	
	// module
	exports.push([module.id, "div#deliveron-container {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -webkit-box-pack: end;\n      -ms-flex-pack: end;\n          justify-content: flex-end;\n  -webkit-box-align: center;\n      -ms-flex-align: center;\n          align-items: center; }\n  div#deliveron-container label#deliveron-label {\n    padding-right: 7px; }\n  div#deliveron-container input#deliveron-picker {\n    width: auto;\n    min-width: 240px;\n    display: block; }\n", ""]);
	
	// exports


/***/ },
/* 6 */
/***/ function(module, exports) {

	;(function ($) { $.fn.datepicker.language['da'] = {
	    days: ['Søndag', 'Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag'],
	    daysShort: ['Søn', 'Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør'],
	    daysMin: ['Sø', 'Ma', 'Ti', 'On', 'To', 'Fr', 'Lø'],
	    months: ['Januar','Februar','Marts','April','Maj','Juni', 'Juli','August','September','Oktober','November','December'],
	    monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'Maj', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec'],
	    today: 'I dag',
	    clear: 'Nulstil',
	    dateFormat: 'dd/mm/yyyy',
	    timeFormat: 'hh:ii',
	    firstDay: 1
	}; })(jQuery);

/***/ },
/* 7 */
/***/ function(module, exports) {

	;(function ($) { $.fn.datepicker.language['de'] = {
	    days: ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'],
	    daysShort: ['Son', 'Mon', 'Die', 'Mit', 'Don', 'Fre', 'Sam'],
	    daysMin: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
	    months: ['Januar','Februar','März','April','Mai','Juni', 'Juli','August','September','Oktober','November','Dezember'],
	    monthsShort: ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'],
	    today: 'Heute',
	    clear: 'Aufräumen',
	    dateFormat: 'dd.mm.yyyy',
	    timeFormat: 'hh:ii',
	    firstDay: 1
	};
	 })(jQuery);

/***/ },
/* 8 */
/***/ function(module, exports) {

	;(function ($) { $.fn.datepicker.language['en'] = {
	    days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
	    daysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
	    daysMin: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
	    months: ['January','February','March','April','May','June', 'July','August','September','October','November','December'],
	    monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
	    today: 'Today',
	    clear: 'Clear',
	    dateFormat: 'mm/dd/yyyy',
	    timeFormat: 'hh:ii aa',
	    firstDay: 0
	}; })(jQuery);

/***/ },
/* 9 */
/***/ function(module, exports) {

	;(function ($) { $.fn.datepicker.language['nl'] = {
	    days: ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag'],
	    daysShort: ['zo', 'ma', 'di', 'wo', 'do', 'vr', 'za'],
	    daysMin: ['zo', 'ma', 'di', 'wo', 'do', 'vr', 'za'],
	    months: ['Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni', 'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December'],
	    monthsShort: ['Jan', 'Feb', 'Mrt', 'Apr', 'Mei', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec'],
	    today: 'Vandaag',
	    clear: 'Legen',
	    dateFormat: 'dd-MM-yy',
	    timeFormat: 'hh:ii',
	    firstDay: 0
	}; })(jQuery);

/***/ },
/* 10 */
/***/ function(module, exports) {

	;(function ($) { $.fn.datepicker.language['pt-BR'] = {
	    days: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'],
	    daysShort: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'],
	    daysMin: ['Do', 'Se', 'Te', 'Qu', 'Qu', 'Se', 'Sa'],
	    months: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
	    monthsShort: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
	    today: 'Hoje',
	    clear: 'Limpar',
	    dateFormat: 'dd/mm/yyyy',
	    timeFormat: 'hh:ii',
	    firstDay: 0
	}; })(jQuery);

/***/ },
/* 11 */
/***/ function(module, exports) {

	;(function ($) { $.fn.datepicker.language['pt'] = {
	    days: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'],
	    daysShort: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'],
	    daysMin: ['Do', 'Se', 'Te', 'Qa', 'Qi', 'Sx', 'Sa'],
	    months: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
	    monthsShort: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
	    today: 'Hoje',
	    clear: 'Limpar',
	    dateFormat: 'dd/mm/yyyy',
	    timeFormat: 'hh:ii',
	    firstDay: 1
	}; })(jQuery);

/***/ },
/* 12 */
/***/ function(module, exports) {

	;(function ($) { $.fn.datepicker.language['ro'] = {
	    days: ['Duminică', 'Luni', 'Marţi', 'Miercuri', 'Joi', 'Vineri', 'Sâmbătă'],
	    daysShort: ['Dum', 'Lun', 'Mar', 'Mie', 'Joi', 'Vin', 'Sâm'],
	    daysMin: ['D', 'L', 'Ma', 'Mi', 'J', 'V', 'S'],
	    months: ['Ianuarie','Februarie','Martie','Aprilie','Mai','Iunie','Iulie','August','Septembrie','Octombrie','Noiembrie','Decembrie'],
	    monthsShort: ['Ian', 'Feb', 'Mar', 'Apr', 'Mai', 'Iun', 'Iul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'],
	    today: 'Azi',
	    clear: 'Şterge',
	    dateFormat: 'dd.mm.yyyy',
	    timeFormat: 'hh:ii',
	    firstDay: 1
	};
	 })(jQuery);

/***/ },
/* 13 */
/***/ function(module, exports) {

	;(function ($) { $.fn.datepicker.language['zh'] = {
	    days: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
	    daysShort: ['日', '一', '二', '三', '四', '五', '六'],
	    daysMin: ['日', '一', '二', '三', '四', '五', '六'],
	    months: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
	    monthsShort: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
	    today: '今天',
	    clear: '清除',
	    dateFormat: 'yyyy-mm-dd',
	    timeFormat: 'hh:ii',
	    firstDay: 1
	}; })(jQuery);

/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(16);
	__webpack_require__(15);
	__webpack_require__(17);
	__webpack_require__(18);

/***/ },
/* 15 */
/***/ function(module, exports) {

	;(function () {
	    var templates = {
	        days:'' +
	        '<div class="datepicker--days datepicker--body">' +
	        '<div class="datepicker--days-names"></div>' +
	        '<div class="datepicker--cells datepicker--cells-days"></div>' +
	        '</div>',
	        months: '' +
	        '<div class="datepicker--months datepicker--body">' +
	        '<div class="datepicker--cells datepicker--cells-months"></div>' +
	        '</div>',
	        years: '' +
	        '<div class="datepicker--years datepicker--body">' +
	        '<div class="datepicker--cells datepicker--cells-years"></div>' +
	        '</div>'
	        },
	        datepicker = $.fn.datepicker,
	        dp = datepicker.Constructor;
	
	    datepicker.Body = function (d, type, opts) {
	        this.d = d;
	        this.type = type;
	        this.opts = opts;
	
	        this.init();
	    };
	
	    datepicker.Body.prototype = {
	        init: function () {
	            this._buildBaseHtml();
	            this._render();
	
	            this._bindEvents();
	        },
	
	        _bindEvents: function () {
	            this.$el.on('click', '.datepicker--cell', $.proxy(this._onClickCell, this));
	        },
	
	        _buildBaseHtml: function () {
	            this.$el = $(templates[this.type]).appendTo(this.d.$content);
	            this.$names = $('.datepicker--days-names', this.$el);
	            this.$cells = $('.datepicker--cells', this.$el);
	        },
	
	        _getDayNamesHtml: function (firstDay, curDay, html, i) {
	            curDay = curDay != undefined ? curDay : firstDay;
	            html = html ? html : '';
	            i = i != undefined ? i : 0;
	
	            if (i > 7) return html;
	            if (curDay == 7) return this._getDayNamesHtml(firstDay, 0, html, ++i);
	
	            html += '<div class="datepicker--day-name' + (this.d.isWeekend(curDay) ? " -weekend-" : "") + '">' + this.d.loc.daysMin[curDay] + '</div>';
	
	            return this._getDayNamesHtml(firstDay, ++curDay, html, ++i);
	        },
	
	        _getCellContents: function (date, type) {
	            var classes = "datepicker--cell datepicker--cell-" + type,
	                currentDate = new Date(),
	                parent = this.d,
	                opts = parent.opts,
	                d = dp.getParsedDate(date),
	                render = {},
	                html = d.date;
	
	            if (opts.onRenderCell) {
	                render = opts.onRenderCell(date, type) || {};
	                html = render.html ? render.html : html;
	                classes += render.classes ? ' ' + render.classes : '';
	            }
	
	            switch (type) {
	                case 'day':
	                    if (parent.isWeekend(d.day)) classes += " -weekend-";
	                    if (d.month != this.d.parsedDate.month) {
	                        classes += " -other-month-";
	                        if (!opts.selectOtherMonths) {
	                            classes += " -disabled-";
	                        }
	                        if (!opts.showOtherMonths) html = '';
	                    }
	                    break;
	                case 'month':
	                    html = parent.loc[parent.opts.monthsField][d.month];
	                    break;
	                case 'year':
	                    var decade = parent.curDecade;
	                    html = d.year;
	                    if (d.year < decade[0] || d.year > decade[1]) {
	                        classes += ' -other-decade-';
	                        if (!opts.selectOtherYears) {
	                            classes += " -disabled-";
	                        }
	                        if (!opts.showOtherYears) html = '';
	                    }
	                    break;
	            }
	
	            if (opts.onRenderCell) {
	                render = opts.onRenderCell(date, type) || {};
	                html = render.html ? render.html : html;
	                classes += render.classes ? ' ' + render.classes : '';
	            }
	
	            if (opts.range) {
	                if (dp.isSame(parent.minRange, date, type)) classes += ' -range-from-';
	                if (dp.isSame(parent.maxRange, date, type)) classes += ' -range-to-';
	
	                if (parent.selectedDates.length == 1 && parent.focused) {
	                    if (
	                        (dp.bigger(parent.minRange, date) && dp.less(parent.focused, date)) ||
	                        (dp.less(parent.maxRange, date) && dp.bigger(parent.focused, date)))
	                    {
	                        classes += ' -in-range-'
	                    }
	
	                    if (dp.less(parent.maxRange, date) && dp.isSame(parent.focused, date)) {
	                        classes += ' -range-from-'
	                    }
	                    if (dp.bigger(parent.minRange, date) && dp.isSame(parent.focused, date)) {
	                        classes += ' -range-to-'
	                    }
	
	                } else if (parent.selectedDates.length == 2) {
	                    if (dp.bigger(parent.minRange, date) && dp.less(parent.maxRange, date)) {
	                        classes += ' -in-range-'
	                    }
	                }
	            }
	
	
	            if (dp.isSame(currentDate, date, type)) classes += ' -current-';
	            if (parent.focused && dp.isSame(date, parent.focused, type)) classes += ' -focus-';
	            if (parent._isSelected(date, type)) classes += ' -selected-';
	            if (!parent._isInRange(date, type) || render.disabled) classes += ' -disabled-';
	
	            return {
	                html: html,
	                classes: classes
	            }
	        },
	
	        /**
	         * Calculates days number to render. Generates days html and returns it.
	         * @param {object} date - Date object
	         * @returns {string}
	         * @private
	         */
	        _getDaysHtml: function (date) {
	            var totalMonthDays = dp.getDaysCount(date),
	                firstMonthDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay(),
	                lastMonthDay = new Date(date.getFullYear(), date.getMonth(), totalMonthDays).getDay(),
	                daysFromPevMonth = firstMonthDay - this.d.loc.firstDay,
	                daysFromNextMonth = 6 - lastMonthDay + this.d.loc.firstDay;
	
	            daysFromPevMonth = daysFromPevMonth < 0 ? daysFromPevMonth + 7 : daysFromPevMonth;
	            daysFromNextMonth = daysFromNextMonth > 6 ? daysFromNextMonth - 7 : daysFromNextMonth;
	
	            var startDayIndex = -daysFromPevMonth + 1,
	                m, y,
	                html = '';
	
	            for (var i = startDayIndex, max = totalMonthDays + daysFromNextMonth; i <= max; i++) {
	                y = date.getFullYear();
	                m = date.getMonth();
	
	                html += this._getDayHtml(new Date(y, m, i))
	            }
	
	            return html;
	        },
	
	        _getDayHtml: function (date) {
	           var content = this._getCellContents(date, 'day');
	
	            return '<div class="' + content.classes + '" ' +
	                'data-date="' + date.getDate() + '" ' +
	                'data-month="' + date.getMonth() + '" ' +
	                'data-year="' + date.getFullYear() + '">' + content.html + '</div>';
	        },
	
	        /**
	         * Generates months html
	         * @param {object} date - date instance
	         * @returns {string}
	         * @private
	         */
	        _getMonthsHtml: function (date) {
	            var html = '',
	                d = dp.getParsedDate(date),
	                i = 0;
	
	            while(i < 12) {
	                html += this._getMonthHtml(new Date(d.year, i));
	                i++
	            }
	
	            return html;
	        },
	
	        _getMonthHtml: function (date) {
	            var content = this._getCellContents(date, 'month');
	
	            return '<div class="' + content.classes + '" data-month="' + date.getMonth() + '">' + content.html + '</div>'
	        },
	
	        _getYearsHtml: function (date) {
	            var d = dp.getParsedDate(date),
	                decade = dp.getDecade(date),
	                firstYear = decade[0] - 1,
	                html = '',
	                i = firstYear;
	
	            for (i; i <= decade[1] + 1; i++) {
	                html += this._getYearHtml(new Date(i , 0));
	            }
	
	            return html;
	        },
	
	        _getYearHtml: function (date) {
	            var content = this._getCellContents(date, 'year');
	
	            return '<div class="' + content.classes + '" data-year="' + date.getFullYear() + '">' + content.html + '</div>'
	        },
	
	        _renderTypes: {
	            days: function () {
	                var dayNames = this._getDayNamesHtml(this.d.loc.firstDay),
	                    days = this._getDaysHtml(this.d.currentDate);
	
	                this.$cells.html(days);
	                this.$names.html(dayNames)
	            },
	            months: function () {
	                var html = this._getMonthsHtml(this.d.currentDate);
	
	                this.$cells.html(html)
	            },
	            years: function () {
	                var html = this._getYearsHtml(this.d.currentDate);
	
	                this.$cells.html(html)
	            }
	        },
	
	        _render: function () {
	            this._renderTypes[this.type].bind(this)();
	        },
	
	        _update: function () {
	            var $cells = $('.datepicker--cell', this.$cells),
	                _this = this,
	                classes,
	                $cell,
	                date;
	            $cells.each(function (cell, i) {
	                $cell = $(this);
	                date = _this.d._getDateFromCell($(this));
	                classes = _this._getCellContents(date, _this.d.cellType);
	                $cell.attr('class',classes.classes)
	            });
	        },
	
	        show: function () {
	            this.$el.addClass('active');
	            this.acitve = true;
	        },
	
	        hide: function () {
	            this.$el.removeClass('active');
	            this.active = false;
	        },
	
	        //  Events
	        // -------------------------------------------------
	
	        _handleClick: function (el) {
	            var date = el.data('date') || 1,
	                month = el.data('month') || 0,
	                year = el.data('year') || this.d.parsedDate.year;
	            // Change view if min view does not reach yet
	            if (this.d.view != this.opts.minView) {
	                this.d.down(new Date(year, month, date));
	                return;
	            }
	            // Select date if min view is reached
	            var selectedDate = new Date(year, month, date),
	                alreadySelected = this.d._isSelected(selectedDate, this.d.cellType);
	
	            if (!alreadySelected) {
	                this.d._trigger('clickCell', selectedDate);
	            } else if (alreadySelected && this.opts.toggleSelected){
	                this.d.removeDate(selectedDate);
	            } else if (alreadySelected && !this.opts.toggleSelected) {
	                this.d.lastSelectedDate = alreadySelected;
	                if (this.d.opts.timepicker) {
	                    this.d.timepicker._setTime(alreadySelected);
	                    this.d.timepicker.update();
	                }
	            }
	
	        },
	
	        _onClickCell: function (e) {
	            var $el = $(e.target).closest('.datepicker--cell');
	
	            if ($el.hasClass('-disabled-')) return;
	
	            this._handleClick.bind(this)($el);
	        }
	    };
	})();


/***/ },
/* 16 */
/***/ function(module, exports) {

	;(function () {
	    var pluginName = 'datepicker',
	        autoInitSelector = '.datepicker-here',
	        $body, $datepickersContainer,
	        containerBuilt = false,
	        baseTemplate = '' +
	            '<div class="datepicker">' +
	            '<i class="datepicker--pointer"></i>' +
	            '<nav class="datepicker--nav"></nav>' +
	            '<div class="datepicker--content"></div>' +
	            '</div>',
	        defaults = {
	            classes: '',
	            inline: false,
	            language: 'ru',
	            startDate: new Date(),
	            firstDay: '',
	            weekends: [6, 0],
	            dateFormat: '',
	            altField: '',
	            altFieldDateFormat: '@',
	            toggleSelected: true,
	            keyboardNav: true,
	
	            position: 'bottom left',
	            offset: 12,
	
	            view: 'days',
	            minView: 'days',
	
	            showOtherMonths: true,
	            selectOtherMonths: true,
	            moveToOtherMonthsOnSelect: true,
	
	            showOtherYears: true,
	            selectOtherYears: true,
	            moveToOtherYearsOnSelect: true,
	
	            minDate: '',
	            maxDate: '',
	            disableNavWhenOutOfRange: true,
	
	            multipleDates: false, // Boolean or Number
	            multipleDatesSeparator: ',',
	            range: false,
	
	            todayButton: false,
	            clearButton: false,
	
	            showEvent: 'focus',
	            autoClose: false,
	
	            // navigation
	            monthsField: 'monthsShort',
	            prevHtml: '<svg><path d="M 17,12 l -5,5 l 5,5"></path></svg>',
	            nextHtml: '<svg><path d="M 14,12 l 5,5 l -5,5"></path></svg>',
	            navTitles: {
	                days: 'MM, <i>yyyy</i>',
	                months: 'yyyy',
	                years: 'yyyy1 - yyyy2'
	            },
	
	            // timepicker
	            timepicker: false,
	            dateTimeSeparator: ' ',
	            timeFormat: '',
	            minHours: 0,
	            maxHours: 24,
	            minMinutes: 0,
	            maxMinutes: 59,
	            hoursStep: 1,
	            minutesStep: 1,
	
	            // events
	            onSelect: '',
	            onChangeMonth: '',
	            onChangeYear: '',
	            onChangeDecade: '',
	            onChangeView: '',
	            onRenderCell: ''
	        },
	        hotKeys = {
	            'ctrlRight': [17, 39],
	            'ctrlUp': [17, 38],
	            'ctrlLeft': [17, 37],
	            'ctrlDown': [17, 40],
	            'shiftRight': [16, 39],
	            'shiftUp': [16, 38],
	            'shiftLeft': [16, 37],
	            'shiftDown': [16, 40],
	            'altUp': [18, 38],
	            'altRight': [18, 39],
	            'altLeft': [18, 37],
	            'altDown': [18, 40],
	            'ctrlShiftUp': [16, 17, 38]
	        },
	        datepicker;
	
	    var Datepicker  = function (el, options) {
	        this.el = el;
	        this.$el = $(el);
	
	        this.opts = $.extend(true, {}, defaults, options, this.$el.data());
	
	        if ($body == undefined) {
	            $body = $('body');
	        }
	
	        if (!this.opts.startDate) {
	            this.opts.startDate = new Date();
	        }
	
	        if (this.el.nodeName == 'INPUT') {
	            this.elIsInput = true;
	        }
	
	        if (this.opts.altField) {
	            this.$altField = typeof this.opts.altField == 'string' ? $(this.opts.altField) : this.opts.altField;
	        }
	
	        this.inited = false;
	        this.visible = false;
	        this.silent = false; // Need to prevent unnecessary rendering
	
	        this.currentDate = this.opts.startDate;
	        this.currentView = this.opts.view;
	        this._createShortCuts();
	        this.selectedDates = [];
	        this.views = {};
	        this.keys = [];
	        this.minRange = '';
	        this.maxRange = '';
	        this._prevOnSelectValue = '';
	
	        this.init()
	    };
	
	    datepicker = Datepicker;
	
	    datepicker.prototype = {
	        viewIndexes: ['days', 'months', 'years'],
	
	        init: function () {
	            if (!containerBuilt && !this.opts.inline && this.elIsInput) {
	                this._buildDatepickersContainer();
	            }
	            this._buildBaseHtml();
	            this._defineLocale(this.opts.language);
	            this._syncWithMinMaxDates();
	
	            if (this.elIsInput) {
	                if (!this.opts.inline) {
	                    // Set extra classes for proper transitions
	                    this._setPositionClasses(this.opts.position);
	                    this._bindEvents()
	                }
	                if (this.opts.keyboardNav) {
	                    this._bindKeyboardEvents();
	                }
	                this.$datepicker.on('mousedown', this._onMouseDownDatepicker.bind(this));
	                this.$datepicker.on('mouseup', this._onMouseUpDatepicker.bind(this));
	            }
	
	            if (this.opts.classes) {
	                this.$datepicker.addClass(this.opts.classes)
	            }
	
	            if (this.opts.timepicker) {
	                this.timepicker = new $.fn.datepicker.Timepicker(this, this.opts);
	                this._bindTimepickerEvents();
	            }
	
	            this.views[this.currentView] = new $.fn.datepicker.Body(this, this.currentView, this.opts);
	            this.views[this.currentView].show();
	            this.nav = new $.fn.datepicker.Navigation(this, this.opts);
	            this.view = this.currentView;
	
	            this.$el.on('clickCell.adp', this._onClickCell.bind(this));
	            this.$datepicker.on('mouseenter', '.datepicker--cell', this._onMouseEnterCell.bind(this));
	            this.$datepicker.on('mouseleave', '.datepicker--cell', this._onMouseLeaveCell.bind(this));
	
	            this.inited = true;
	        },
	
	        _createShortCuts: function () {
	            this.minDate = this.opts.minDate ? this.opts.minDate : new Date(-8639999913600000);
	            this.maxDate = this.opts.maxDate ? this.opts.maxDate : new Date(8639999913600000);
	        },
	
	        _bindEvents : function () {
	            this.$el.on(this.opts.showEvent + '.adp', this._onShowEvent.bind(this));
	            this.$el.on('mouseup.adp', this._onMouseUpEl.bind(this));
	            this.$el.on('blur.adp', this._onBlur.bind(this));
	            this.$el.on('keyup.adp', this._onKeyUpGeneral.bind(this));
	            $(window).on('resize.adp', this._onResize.bind(this));
	            $('body').on('mouseup.adp', this._onMouseUpBody.bind(this));
	        },
	
	        _bindKeyboardEvents: function () {
	            this.$el.on('keydown.adp', this._onKeyDown.bind(this));
	            this.$el.on('keyup.adp', this._onKeyUp.bind(this));
	            this.$el.on('hotKey.adp', this._onHotKey.bind(this));
	        },
	
	        _bindTimepickerEvents: function () {
	            this.$el.on('timeChange.adp', this._onTimeChange.bind(this));
	        },
	
	        isWeekend: function (day) {
	            return this.opts.weekends.indexOf(day) !== -1;
	        },
	
	        _defineLocale: function (lang) {
	            if (typeof lang == 'string') {
	                this.loc = $.fn.datepicker.language[lang];
	                if (!this.loc) {
	                    console.warn('Can\'t find language "' + lang + '" in Datepicker.language, will use "ru" instead');
	                    this.loc = $.extend(true, {}, $.fn.datepicker.language.ru)
	                }
	
	                this.loc = $.extend(true, {}, $.fn.datepicker.language.ru, $.fn.datepicker.language[lang])
	            } else {
	                this.loc = $.extend(true, {}, $.fn.datepicker.language.ru, lang)
	            }
	
	            if (this.opts.dateFormat) {
	                this.loc.dateFormat = this.opts.dateFormat
	            }
	
	            if (this.opts.timeFormat) {
	                this.loc.timeFormat = this.opts.timeFormat
	            }
	
	            if (this.opts.firstDay !== '') {
	                this.loc.firstDay = this.opts.firstDay
	            }
	
	            if (this.opts.timepicker) {
	                this.loc.dateFormat = [this.loc.dateFormat, this.loc.timeFormat].join(this.opts.dateTimeSeparator);
	            }
	
	            var boundary = this._getWordBoundaryRegExp;
	            if (this.loc.timeFormat.match(boundary('aa')) ||
	                this.loc.timeFormat.match(boundary('AA'))
	            ) {
	               this.ampm = true;
	            }
	        },
	
	        _buildDatepickersContainer: function () {
	            containerBuilt = true;
	            $body.append('<div class="datepickers-container" id="datepickers-container"></div>');
	            $datepickersContainer = $('#datepickers-container');
	        },
	
	        _buildBaseHtml: function () {
	            var $appendTarget,
	                $inline = $('<div class="datepicker-inline">');
	
	            if(this.el.nodeName == 'INPUT') {
	                if (!this.opts.inline) {
	                    $appendTarget = $datepickersContainer;
	                } else {
	                    $appendTarget = $inline.insertAfter(this.$el)
	                }
	            } else {
	                $appendTarget = $inline.appendTo(this.$el)
	            }
	
	            this.$datepicker = $(baseTemplate).appendTo($appendTarget);
	            this.$content = $('.datepicker--content', this.$datepicker);
	            this.$nav = $('.datepicker--nav', this.$datepicker);
	        },
	
	        _triggerOnChange: function () {
	            if (!this.selectedDates.length) {
	                // Prevent from triggering multiple onSelect callback with same argument (empty string) in IE10-11
	                if (this._prevOnSelectValue === '') return;
	                this._prevOnSelectValue = '';
	                return this.opts.onSelect('', '', this);
	            }
	
	            var selectedDates = this.selectedDates,
	                parsedSelected = datepicker.getParsedDate(selectedDates[0]),
	                formattedDates,
	                _this = this,
	                dates = new Date(
	                    parsedSelected.year,
	                    parsedSelected.month,
	                    parsedSelected.date,
	                    parsedSelected.hours,
	                    parsedSelected.minutes
	                );
	
	                formattedDates = selectedDates.map(function (date) {
	                    return _this.formatDate(_this.loc.dateFormat, date)
	                }).join(this.opts.multipleDatesSeparator);
	
	            // Create new dates array, to separate it from original selectedDates
	            if (this.opts.multipleDates || this.opts.range) {
	                dates = selectedDates.map(function(date) {
	                    var parsedDate = datepicker.getParsedDate(date);
	                    return new Date(
	                        parsedDate.year,
	                        parsedDate.month,
	                        parsedDate.date,
	                        parsedDate.hours,
	                        parsedDate.minutes
	                    );
	                })
	            }
	
	            this._prevOnSelectValue = formattedDates;
	            this.opts.onSelect(formattedDates, dates, this);
	        },
	
	        next: function () {
	            var d = this.parsedDate,
	                o = this.opts;
	            switch (this.view) {
	                case 'days':
	                    this.date = new Date(d.year, d.month + 1, 1);
	                    if (o.onChangeMonth) o.onChangeMonth(this.parsedDate.month, this.parsedDate.year);
	                    break;
	                case 'months':
	                    this.date = new Date(d.year + 1, d.month, 1);
	                    if (o.onChangeYear) o.onChangeYear(this.parsedDate.year);
	                    break;
	                case 'years':
	                    this.date = new Date(d.year + 10, 0, 1);
	                    if (o.onChangeDecade) o.onChangeDecade(this.curDecade);
	                    break;
	            }
	        },
	
	        prev: function () {
	            var d = this.parsedDate,
	                o = this.opts;
	            switch (this.view) {
	                case 'days':
	                    this.date = new Date(d.year, d.month - 1, 1);
	                    if (o.onChangeMonth) o.onChangeMonth(this.parsedDate.month, this.parsedDate.year);
	                    break;
	                case 'months':
	                    this.date = new Date(d.year - 1, d.month, 1);
	                    if (o.onChangeYear) o.onChangeYear(this.parsedDate.year);
	                    break;
	                case 'years':
	                    this.date = new Date(d.year - 10, 0, 1);
	                    if (o.onChangeDecade) o.onChangeDecade(this.curDecade);
	                    break;
	            }
	        },
	
	        formatDate: function (string, date) {
	            date = date || this.date;
	            var result = string,
	                boundary = this._getWordBoundaryRegExp,
	                locale = this.loc,
	                leadingZero = datepicker.getLeadingZeroNum,
	                decade = datepicker.getDecade(date),
	                d = datepicker.getParsedDate(date),
	                fullHours = d.fullHours,
	                hours = d.hours,
	                dayPeriod = 'am',
	                validHours;
	
	            if (this.opts.timepicker && this.timepicker && this.ampm) {
	                validHours = this.timepicker._getValidHoursFromDate(date);
	                fullHours = leadingZero(validHours.hours);
	                hours = validHours.hours;
	                dayPeriod = validHours.dayPeriod;
	            }
	
	            switch (true) {
	                case /@/.test(result):
	                    result = result.replace(/@/, date.getTime());
	                case /aa/.test(result):
	                    result = result.replace(boundary('aa'), dayPeriod);
	                case /AA/.test(result):
	                    result = result.replace(boundary('AA'), dayPeriod.toUpperCase());
	                case /dd/.test(result):
	                    result = result.replace(boundary('dd'), d.fullDate);
	                case /d/.test(result):
	                    result = result.replace(boundary('d'), d.date);
	                case /DD/.test(result):
	                    result = result.replace(boundary('DD'), locale.days[d.day]);
	                case /D/.test(result):
	                    result = result.replace(boundary('D'), locale.daysShort[d.day]);
	                case /mm/.test(result):
	                    result = result.replace(boundary('mm'), d.fullMonth);
	                case /m/.test(result):
	                    result = result.replace(boundary('m'), d.month + 1);
	                case /MM/.test(result):
	                    result = result.replace(boundary('MM'), this.loc.months[d.month]);
	                case /M/.test(result):
	                    result = result.replace(boundary('M'), locale.monthsShort[d.month]);
	                case /ii/.test(result):
	                    result = result.replace(boundary('ii'), d.fullMinutes);
	                case /i/.test(result):
	                    result = result.replace(boundary('i'), d.minutes);
	                case /hh/.test(result):
	                    result = result.replace(boundary('hh'), fullHours);
	                case /h/.test(result):
	                    result = result.replace(boundary('h'), hours);
	                case /yyyy/.test(result):
	                    result = result.replace(boundary('yyyy'), d.year);
	                case /yyyy1/.test(result):
	                    result = result.replace(boundary('yyyy1'), decade[0]);
	                case /yyyy2/.test(result):
	                    result = result.replace(boundary('yyyy2'), decade[1]);
	                case /yy/.test(result):
	                    result = result.replace(boundary('yy'), d.year.toString().slice(-2));
	            }
	
	            return result;
	        },
	
	        _getWordBoundaryRegExp: function (sign) {
	            return new RegExp('\\b(?=[a-zA-Z0-9äöüßÄÖÜ<])' + sign + '(?![>a-zA-Z0-9äöüßÄÖÜ])');
	        },
	
	        selectDate: function (date) {
	            var _this = this,
	                opts = _this.opts,
	                d = _this.parsedDate,
	                selectedDates = _this.selectedDates,
	                len = selectedDates.length,
	                newDate = '';
	
	            if (Array.isArray(date)) {
	                date.forEach(function (d) {
	                    _this.selectDate(d)
	                });
	                return;
	            }
	
	            if (!(date instanceof Date)) return;
	
	            this.lastSelectedDate = date;
	
	            // Set new time values from Date
	            if (this.timepicker) {
	                this.timepicker._setTime(date);
	            }
	
	            // On this step timepicker will set valid values in it's instance
	            _this._trigger('selectDate', date);
	
	            // Set correct time values after timepicker's validation
	            // Prevent from setting hours or minutes which values are lesser then `min` value or
	            // greater then `max` value
	            if (this.timepicker) {
	                date.setHours(this.timepicker.hours);
	                date.setMinutes(this.timepicker.minutes)
	            }
	
	            if (_this.view == 'days') {
	                if (date.getMonth() != d.month && opts.moveToOtherMonthsOnSelect) {
	                    newDate = new Date(date.getFullYear(), date.getMonth(), 1);
	                }
	            }
	
	            if (_this.view == 'years') {
	                if (date.getFullYear() != d.year && opts.moveToOtherYearsOnSelect) {
	                    newDate = new Date(date.getFullYear(), 0, 1);
	                }
	            }
	
	            if (newDate) {
	                _this.silent = true;
	                _this.date = newDate;
	                _this.silent = false;
	                _this.nav._render()
	            }
	
	            if (opts.multipleDates && !opts.range) { // Set priority to range functionality
	                if (len === opts.multipleDates) return;
	                if (!_this._isSelected(date)) {
	                    _this.selectedDates.push(date);
	                }
	            } else if (opts.range) {
	                if (len == 2) {
	                    _this.selectedDates = [date];
	                    _this.minRange = date;
	                    _this.maxRange = '';
	                } else if (len == 1) {
	                    _this.selectedDates.push(date);
	                    if (!_this.maxRange){
	                        _this.maxRange = date;
	                    } else {
	                        _this.minRange = date;
	                    }
	                    // Swap dates if they were selected via dp.selectDate() and second date was smaller then first
	                    if (datepicker.bigger(_this.maxRange, _this.minRange)) {
	                        _this.maxRange = _this.minRange;
	                        _this.minRange = date;
	                    }
	                    _this.selectedDates = [_this.minRange, _this.maxRange]
	
	                } else {
	                    _this.selectedDates = [date];
	                    _this.minRange = date;
	                }
	            } else {
	                _this.selectedDates = [date];
	            }
	
	            _this._setInputValue();
	
	            if (opts.onSelect) {
	                _this._triggerOnChange();
	            }
	
	            if (opts.autoClose && !this.timepickerIsActive) {
	                if (!opts.multipleDates && !opts.range) {
	                    _this.hide();
	                } else if (opts.range && _this.selectedDates.length == 2) {
	                    _this.hide();
	                }
	            }
	
	            _this.views[this.currentView]._render()
	        },
	
	        removeDate: function (date) {
	            var selected = this.selectedDates,
	                _this = this;
	
	            if (!(date instanceof Date)) return;
	
	            return selected.some(function (curDate, i) {
	                if (datepicker.isSame(curDate, date)) {
	                    selected.splice(i, 1);
	
	                    if (!_this.selectedDates.length) {
	                        _this.minRange = '';
	                        _this.maxRange = '';
	                        _this.lastSelectedDate = '';
	                    } else {
	                        _this.lastSelectedDate = _this.selectedDates[_this.selectedDates.length - 1];
	                    }
	
	                    _this.views[_this.currentView]._render();
	                    _this._setInputValue();
	
	                    if (_this.opts.onSelect) {
	                        _this._triggerOnChange();
	                    }
	
	                    return true
	                }
	            })
	        },
	
	        today: function () {
	            this.silent = true;
	            this.view = this.opts.minView;
	            this.silent = false;
	            this.date = new Date();
	
	            if (this.opts.todayButton instanceof Date) {
	                this.selectDate(this.opts.todayButton)
	            }
	        },
	
	        clear: function () {
	            this.selectedDates = [];
	            this.minRange = '';
	            this.maxRange = '';
	            this.views[this.currentView]._render();
	            this._setInputValue();
	            if (this.opts.onSelect) {
	                this._triggerOnChange()
	            }
	        },
	
	        /**
	         * Updates datepicker options
	         * @param {String|Object} param - parameter's name to update. If object then it will extend current options
	         * @param {String|Number|Object} [value] - new param value
	         */
	        update: function (param, value) {
	            var len = arguments.length;
	
	            if (len == 2) {
	                this.opts[param] = value;
	            } else if (len == 1 && typeof param == 'object') {
	                this.opts = $.extend(true, this.opts, param)
	            }
	
	            this._createShortCuts();
	            this._syncWithMinMaxDates();
	            this._defineLocale(this.opts.language);
	            this.nav._addButtonsIfNeed();
	            this.nav._render();
	            this.views[this.currentView]._render();
	
	            if (this.elIsInput && !this.opts.inline) {
	                this._setPositionClasses(this.opts.position);
	                if (this.visible) {
	                    this.setPosition(this.opts.position)
	                }
	            }
	
	            if (this.opts.classes) {
	                this.$datepicker.addClass(this.opts.classes)
	            }
	
	            if (this.opts.timepicker) {
	                this.timepicker._handleDate(this.lastSelectedDate);
	                this.timepicker._updateRanges();
	                this.timepicker._updateCurrentTime();
	                // Change hours and minutes if it's values have been changed through min/max hours/minutes
	                if (this.lastSelectedDate) {
	                    this.lastSelectedDate.setHours(this.timepicker.hours);
	                    this.lastSelectedDate.setMinutes(this.timepicker.minutes);
	                }
	            }
	
	            this._setInputValue();
	
	            return this;
	        },
	
	        _syncWithMinMaxDates: function () {
	            var curTime = this.date.getTime();
	            this.silent = true;
	            if (this.minTime > curTime) {
	                this.date = this.minDate;
	            }
	
	            if (this.maxTime < curTime) {
	                this.date = this.maxDate;
	            }
	            this.silent = false;
	        },
	
	        _isSelected: function (checkDate, cellType) {
	            var res = false;
	            this.selectedDates.some(function (date) {
	                if (datepicker.isSame(date, checkDate, cellType)) {
	                    res = date;
	                    return true;
	                }
	            });
	            return res;
	        },
	
	        _setInputValue: function () {
	            var _this = this,
	                opts = _this.opts,
	                format = _this.loc.dateFormat,
	                altFormat = opts.altFieldDateFormat,
	                value = _this.selectedDates.map(function (date) {
	                    return _this.formatDate(format, date)
	                }),
	                altValues;
	
	            if (opts.altField && _this.$altField.length) {
	                altValues = this.selectedDates.map(function (date) {
	                    return _this.formatDate(altFormat, date)
	                });
	                altValues = altValues.join(this.opts.multipleDatesSeparator);
	                this.$altField.val(altValues);
	            }
	
	            value = value.join(this.opts.multipleDatesSeparator);
	
	            this.$el.val(value)
	        },
	
	        /**
	         * Check if date is between minDate and maxDate
	         * @param date {object} - date object
	         * @param type {string} - cell type
	         * @returns {boolean}
	         * @private
	         */
	        _isInRange: function (date, type) {
	            var time = date.getTime(),
	                d = datepicker.getParsedDate(date),
	                min = datepicker.getParsedDate(this.minDate),
	                max = datepicker.getParsedDate(this.maxDate),
	                dMinTime = new Date(d.year, d.month, min.date).getTime(),
	                dMaxTime = new Date(d.year, d.month, max.date).getTime(),
	                types = {
	                    day: time >= this.minTime && time <= this.maxTime,
	                    month: dMinTime >= this.minTime && dMaxTime <= this.maxTime,
	                    year: d.year >= min.year && d.year <= max.year
	                };
	            return type ? types[type] : types.day
	        },
	
	        _getDimensions: function ($el) {
	            var offset = $el.offset();
	
	            return {
	                width: $el.outerWidth(),
	                height: $el.outerHeight(),
	                left: offset.left,
	                top: offset.top
	            }
	        },
	
	        _getDateFromCell: function (cell) {
	            var curDate = this.parsedDate,
	                year = cell.data('year') || curDate.year,
	                month = cell.data('month') == undefined ? curDate.month : cell.data('month'),
	                date = cell.data('date') || 1;
	
	            return new Date(year, month, date);
	        },
	
	        _setPositionClasses: function (pos) {
	            pos = pos.split(' ');
	            var main = pos[0],
	                sec = pos[1],
	                classes = 'datepicker -' + main + '-' + sec + '- -from-' + main + '-';
	
	            if (this.visible) classes += ' active';
	
	            this.$datepicker
	                .removeAttr('class')
	                .addClass(classes);
	        },
	
	        setPosition: function (position) {
	            position = position || this.opts.position;
	
	            var dims = this._getDimensions(this.$el),
	                selfDims = this._getDimensions(this.$datepicker),
	                pos = position.split(' '),
	                top, left,
	                offset = this.opts.offset,
	                main = pos[0],
	                secondary = pos[1];
	
	            switch (main) {
	                case 'top':
	                    top = dims.top - selfDims.height - offset;
	                    break;
	                case 'right':
	                    left = dims.left + dims.width + offset;
	                    break;
	                case 'bottom':
	                    top = dims.top + dims.height + offset;
	                    break;
	                case 'left':
	                    left = dims.left - selfDims.width - offset;
	                    break;
	            }
	
	            switch(secondary) {
	                case 'top':
	                    top = dims.top;
	                    break;
	                case 'right':
	                    left = dims.left + dims.width - selfDims.width;
	                    break;
	                case 'bottom':
	                    top = dims.top + dims.height - selfDims.height;
	                    break;
	                case 'left':
	                    left = dims.left;
	                    break;
	                case 'center':
	                    if (/left|right/.test(main)) {
	                        top = dims.top + dims.height/2 - selfDims.height/2;
	                    } else {
	                        left = dims.left + dims.width/2 - selfDims.width/2;
	                    }
	            }
	
	            this.$datepicker
	                .css({
	                    left: left,
	                    top: top
	                })
	        },
	
	        show: function () {
	            this.setPosition(this.opts.position);
	            this.$datepicker.addClass('active');
	            this.visible = true;
	        },
	
	        hide: function () {
	            this.$datepicker
	                .removeClass('active')
	                .css({
	                    left: '-100000px'
	                });
	
	            this.focused = '';
	            this.keys = [];
	
	            this.inFocus = false;
	            this.visible = false;
	            this.$el.blur();
	        },
	
	        down: function (date) {
	            this._changeView(date, 'down');
	        },
	
	        up: function (date) {
	            this._changeView(date, 'up');
	        },
	
	        _changeView: function (date, dir) {
	            date = date || this.focused || this.date;
	
	            var nextView = dir == 'up' ? this.viewIndex + 1 : this.viewIndex - 1;
	            if (nextView > 2) nextView = 2;
	            if (nextView < 0) nextView = 0;
	
	            this.silent = true;
	            this.date = new Date(date.getFullYear(), date.getMonth(), 1);
	            this.silent = false;
	            this.view = this.viewIndexes[nextView];
	
	        },
	
	        _handleHotKey: function (key) {
	            var date = datepicker.getParsedDate(this._getFocusedDate()),
	                focusedParsed,
	                o = this.opts,
	                newDate,
	                totalDaysInNextMonth,
	                monthChanged = false,
	                yearChanged = false,
	                decadeChanged = false,
	                y = date.year,
	                m = date.month,
	                d = date.date;
	
	            switch (key) {
	                case 'ctrlRight':
	                case 'ctrlUp':
	                    m += 1;
	                    monthChanged = true;
	                    break;
	                case 'ctrlLeft':
	                case 'ctrlDown':
	                    m -= 1;
	                    monthChanged = true;
	                    break;
	                case 'shiftRight':
	                case 'shiftUp':
	                    yearChanged = true;
	                    y += 1;
	                    break;
	                case 'shiftLeft':
	                case 'shiftDown':
	                    yearChanged = true;
	                    y -= 1;
	                    break;
	                case 'altRight':
	                case 'altUp':
	                    decadeChanged = true;
	                    y += 10;
	                    break;
	                case 'altLeft':
	                case 'altDown':
	                    decadeChanged = true;
	                    y -= 10;
	                    break;
	                case 'ctrlShiftUp':
	                    this.up();
	                    break;
	            }
	
	            totalDaysInNextMonth = datepicker.getDaysCount(new Date(y,m));
	            newDate = new Date(y,m,d);
	
	            // If next month has less days than current, set date to total days in that month
	            if (totalDaysInNextMonth < d) d = totalDaysInNextMonth;
	
	            // Check if newDate is in valid range
	            if (newDate.getTime() < this.minTime) {
	                newDate = this.minDate;
	            } else if (newDate.getTime() > this.maxTime) {
	                newDate = this.maxDate;
	            }
	
	            this.focused = newDate;
	
	            focusedParsed = datepicker.getParsedDate(newDate);
	            if (monthChanged && o.onChangeMonth) {
	                o.onChangeMonth(focusedParsed.month, focusedParsed.year)
	            }
	            if (yearChanged && o.onChangeYear) {
	                o.onChangeYear(focusedParsed.year)
	            }
	            if (decadeChanged && o.onChangeDecade) {
	                o.onChangeDecade(this.curDecade)
	            }
	        },
	
	        _registerKey: function (key) {
	            var exists = this.keys.some(function (curKey) {
	                return curKey == key;
	            });
	
	            if (!exists) {
	                this.keys.push(key)
	            }
	        },
	
	        _unRegisterKey: function (key) {
	            var index = this.keys.indexOf(key);
	
	            this.keys.splice(index, 1);
	        },
	
	        _isHotKeyPressed: function () {
	            var currentHotKey,
	                found = false,
	                _this = this,
	                pressedKeys = this.keys.sort();
	
	            for (var hotKey in hotKeys) {
	                currentHotKey = hotKeys[hotKey];
	                if (pressedKeys.length != currentHotKey.length) continue;
	
	                if (currentHotKey.every(function (key, i) { return key == pressedKeys[i]})) {
	                    _this._trigger('hotKey', hotKey);
	                    found = true;
	                }
	            }
	
	            return found;
	        },
	
	        _trigger: function (event, args) {
	            this.$el.trigger(event, args)
	        },
	
	        _focusNextCell: function (keyCode, type) {
	            type = type || this.cellType;
	
	            var date = datepicker.getParsedDate(this._getFocusedDate()),
	                y = date.year,
	                m = date.month,
	                d = date.date;
	
	            if (this._isHotKeyPressed()){
	                return;
	            }
	
	            switch(keyCode) {
	                case 37: // left
	                    type == 'day' ? (d -= 1) : '';
	                    type == 'month' ? (m -= 1) : '';
	                    type == 'year' ? (y -= 1) : '';
	                    break;
	                case 38: // up
	                    type == 'day' ? (d -= 7) : '';
	                    type == 'month' ? (m -= 3) : '';
	                    type == 'year' ? (y -= 4) : '';
	                    break;
	                case 39: // right
	                    type == 'day' ? (d += 1) : '';
	                    type == 'month' ? (m += 1) : '';
	                    type == 'year' ? (y += 1) : '';
	                    break;
	                case 40: // down
	                    type == 'day' ? (d += 7) : '';
	                    type == 'month' ? (m += 3) : '';
	                    type == 'year' ? (y += 4) : '';
	                    break;
	            }
	
	            var nd = new Date(y,m,d);
	            if (nd.getTime() < this.minTime) {
	                nd = this.minDate;
	            } else if (nd.getTime() > this.maxTime) {
	                nd = this.maxDate;
	            }
	
	            this.focused = nd;
	
	        },
	
	        _getFocusedDate: function () {
	            var focused  = this.focused || this.selectedDates[this.selectedDates.length - 1],
	                d = this.parsedDate;
	
	            if (!focused) {
	                switch (this.view) {
	                    case 'days':
	                        focused = new Date(d.year, d.month, new Date().getDate());
	                        break;
	                    case 'months':
	                        focused = new Date(d.year, d.month, 1);
	                        break;
	                    case 'years':
	                        focused = new Date(d.year, 0, 1);
	                        break;
	                }
	            }
	
	            return focused;
	        },
	
	        _getCell: function (date, type) {
	            type = type || this.cellType;
	
	            var d = datepicker.getParsedDate(date),
	                selector = '.datepicker--cell[data-year="' + d.year + '"]',
	                $cell;
	
	            switch (type) {
	                case 'month':
	                    selector = '[data-month="' + d.month + '"]';
	                    break;
	                case 'day':
	                    selector += '[data-month="' + d.month + '"][data-date="' + d.date + '"]';
	                    break;
	            }
	            $cell = this.views[this.currentView].$el.find(selector);
	
	            return $cell.length ? $cell : '';
	        },
	
	        destroy: function () {
	            var _this = this;
	            _this.$el
	                .off('.adp')
	                .data('datepicker', '');
	
	            _this.selectedDates = [];
	            _this.focused = '';
	            _this.views = {};
	            _this.keys = [];
	            _this.minRange = '';
	            _this.maxRange = '';
	
	            if (_this.opts.inline || !_this.elIsInput) {
	                _this.$datepicker.closest('.datepicker-inline').remove();
	            } else {
	                _this.$datepicker.remove();
	            }
	        },
	
	        _onShowEvent: function (e) {
	            if (!this.visible) {
	                this.show();
	            }
	        },
	
	        _onBlur: function () {
	            if (!this.inFocus && this.visible) {
	                this.hide();
	            }
	        },
	
	        _onMouseDownDatepicker: function (e) {
	            this.inFocus = true;
	        },
	
	        _onMouseUpDatepicker: function (e) {
	            this.inFocus = false;
	            e.originalEvent.inFocus = true;
	            if (!e.originalEvent.timepickerFocus) this.$el.focus();
	        },
	
	        _onKeyUpGeneral: function (e) {
	            var val = this.$el.val();
	
	            if (!val) {
	                this.clear();
	            }
	        },
	
	        _onResize: function () {
	            if (this.visible) {
	                this.setPosition();
	            }
	        },
	
	        _onMouseUpBody: function (e) {
	            if (e.originalEvent.inFocus) return;
	
	            if (this.visible && !this.inFocus) {
	                this.hide();
	            }
	        },
	
	        _onMouseUpEl: function (e) {
	            e.originalEvent.inFocus = true;
	            setTimeout(this._onKeyUpGeneral.bind(this),4);
	        },
	
	        _onKeyDown: function (e) {
	            var code = e.which;
	            this._registerKey(code);
	
	            // Arrows
	            if (code >= 37 && code <= 40) {
	                e.preventDefault();
	                this._focusNextCell(code);
	            }
	
	            // Enter
	            if (code == 13) {
	                if (this.focused) {
	                    if (this._getCell(this.focused).hasClass('-disabled-')) return;
	                    if (this.view != this.opts.minView) {
	                        this.down()
	                    } else {
	                        var alreadySelected = this._isSelected(this.focused, this.cellType);
	
	                        if (!alreadySelected) {
	                            if (this.timepicker) {
	                                this.focused.setHours(this.timepicker.hours);
	                                this.focused.setMinutes(this.timepicker.minutes);
	                            }
	                            this.selectDate(this.focused);
	                        } else if (alreadySelected && this.opts.toggleSelected){
	                            this.removeDate(this.focused);
	                        }
	                    }
	                }
	            }
	
	            // Esc
	            if (code == 27) {
	                this.hide();
	            }
	        },
	
	        _onKeyUp: function (e) {
	            var code = e.which;
	            this._unRegisterKey(code);
	        },
	
	        _onHotKey: function (e, hotKey) {
	            this._handleHotKey(hotKey);
	        },
	
	        _onMouseEnterCell: function (e) {
	            var $cell = $(e.target).closest('.datepicker--cell'),
	                date = this._getDateFromCell($cell);
	
	            // Prevent from unnecessary rendering and setting new currentDate
	            this.silent = true;
	
	            if (this.focused) {
	                this.focused = ''
	            }
	
	            $cell.addClass('-focus-');
	
	            this.focused = date;
	            this.silent = false;
	
	            if (this.opts.range && this.selectedDates.length == 1) {
	                this.minRange = this.selectedDates[0];
	                this.maxRange = '';
	                if (datepicker.less(this.minRange, this.focused)) {
	                    this.maxRange = this.minRange;
	                    this.minRange = '';
	                }
	                this.views[this.currentView]._update();
	            }
	        },
	
	        _onMouseLeaveCell: function (e) {
	            var $cell = $(e.target).closest('.datepicker--cell');
	
	            $cell.removeClass('-focus-');
	
	            this.silent = true;
	            this.focused = '';
	            this.silent = false;
	        },
	
	        _onTimeChange: function (e, h, m) {
	            var date = new Date(),
	                selectedDates = this.selectedDates,
	                selected = false;
	
	            if (selectedDates.length) {
	                selected = true;
	                date = this.lastSelectedDate;
	            }
	
	            date.setHours(h);
	            date.setMinutes(m);
	
	            if (!selected && !this._getCell(date).hasClass('-disabled-')) {
	                this.selectDate(date);
	            } else {
	                this._setInputValue();
	                if (this.opts.onSelect) {
	                    this._triggerOnChange();
	                }
	            }
	        },
	
	        _onClickCell: function (e, date) {
	            if (this.timepicker) {
	                date.setHours(this.timepicker.hours);
	                date.setMinutes(this.timepicker.minutes);
	            }
	            this.selectDate(date);
	        },
	
	        set focused(val) {
	            if (!val && this.focused) {
	                var $cell = this._getCell(this.focused);
	
	                if ($cell.length) {
	                    $cell.removeClass('-focus-')
	                }
	            }
	            this._focused = val;
	            if (this.opts.range && this.selectedDates.length == 1) {
	                this.minRange = this.selectedDates[0];
	                this.maxRange = '';
	                if (datepicker.less(this.minRange, this._focused)) {
	                    this.maxRange = this.minRange;
	                    this.minRange = '';
	                }
	            }
	            if (this.silent) return;
	            this.date = val;
	        },
	
	        get focused() {
	            return this._focused;
	        },
	
	        get parsedDate() {
	            return datepicker.getParsedDate(this.date);
	        },
	
	        set date (val) {
	            if (!(val instanceof Date)) return;
	
	            this.currentDate = val;
	
	            if (this.inited && !this.silent) {
	                this.views[this.view]._render();
	                this.nav._render();
	                if (this.visible && this.elIsInput) {
	                    this.setPosition();
	                }
	            }
	            return val;
	        },
	
	        get date () {
	            return this.currentDate
	        },
	
	        set view (val) {
	            this.viewIndex = this.viewIndexes.indexOf(val);
	
	            if (this.viewIndex < 0) {
	                return;
	            }
	
	            this.prevView = this.currentView;
	            this.currentView = val;
	
	            if (this.inited) {
	                if (!this.views[val]) {
	                    this.views[val] = new  $.fn.datepicker.Body(this, val, this.opts)
	                } else {
	                    this.views[val]._render();
	                }
	
	                this.views[this.prevView].hide();
	                this.views[val].show();
	                this.nav._render();
	
	                if (this.opts.onChangeView) {
	                    this.opts.onChangeView(val)
	                }
	                if (this.elIsInput && this.visible) this.setPosition();
	            }
	
	            return val
	        },
	
	        get view() {
	            return this.currentView;
	        },
	
	        get cellType() {
	            return this.view.substring(0, this.view.length - 1)
	        },
	
	        get minTime() {
	            var min = datepicker.getParsedDate(this.minDate);
	            return new Date(min.year, min.month, min.date).getTime()
	        },
	
	        get maxTime() {
	            var max = datepicker.getParsedDate(this.maxDate);
	            return new Date(max.year, max.month, max.date).getTime()
	        },
	
	        get curDecade() {
	            return datepicker.getDecade(this.date)
	        }
	    };
	
	    //  Utils
	    // -------------------------------------------------
	
	    datepicker.getDaysCount = function (date) {
	        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
	    };
	
	    datepicker.getParsedDate = function (date) {
	        return {
	            year: date.getFullYear(),
	            month: date.getMonth(),
	            fullMonth: (date.getMonth() + 1) < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1, // One based
	            date: date.getDate(),
	            fullDate: date.getDate() < 10 ? '0' + date.getDate() : date.getDate(),
	            day: date.getDay(),
	            hours: date.getHours(),
	            fullHours:  date.getHours() < 10 ? '0' + date.getHours() :  date.getHours() ,
	            minutes: date.getMinutes(),
	            fullMinutes:  date.getMinutes() < 10 ? '0' + date.getMinutes() :  date.getMinutes()
	        }
	    };
	
	    datepicker.getDecade = function (date) {
	        var firstYear = Math.floor(date.getFullYear() / 10) * 10;
	
	        return [firstYear, firstYear + 9];
	    };
	
	    datepicker.template = function (str, data) {
	        return str.replace(/#\{([\w]+)\}/g, function (source, match) {
	            if (data[match] || data[match] === 0) {
	                return data[match]
	            }
	        });
	    };
	
	    datepicker.isSame = function (date1, date2, type) {
	        if (!date1 || !date2) return false;
	        var d1 = datepicker.getParsedDate(date1),
	            d2 = datepicker.getParsedDate(date2),
	            _type = type ? type : 'day',
	
	            conditions = {
	                day: d1.date == d2.date && d1.month == d2.month && d1.year == d2.year,
	                month: d1.month == d2.month && d1.year == d2.year,
	                year: d1.year == d2.year
	            };
	
	        return conditions[_type];
	    };
	
	    datepicker.less = function (dateCompareTo, date, type) {
	        if (!dateCompareTo || !date) return false;
	        return date.getTime() < dateCompareTo.getTime();
	    };
	
	    datepicker.bigger = function (dateCompareTo, date, type) {
	        if (!dateCompareTo || !date) return false;
	        return date.getTime() > dateCompareTo.getTime();
	    };
	
	    datepicker.getLeadingZeroNum = function (num) {
	        return parseInt(num) < 10 ? '0' + num : num;
	    };
	
	    $.fn.datepicker = function ( options ) {
	        return this.each(function () {
	            if (!$.data(this, pluginName)) {
	                $.data(this,  pluginName,
	                    new Datepicker( this, options ));
	            } else {
	                var _this = $.data(this, pluginName);
	
	                _this.opts = $.extend(true, _this.opts, options);
	                _this.update();
	            }
	        });
	    };
	
	    $.fn.datepicker.Constructor = Datepicker;
	
	    $.fn.datepicker.language = {
	        ru: {
	            days: ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'],
	            daysShort: ['Вос','Пон','Вто','Сре','Чет','Пят','Суб'],
	            daysMin: ['Вс','Пн','Вт','Ср','Чт','Пт','Сб'],
	            months: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
	            monthsShort: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'],
	            today: 'Сегодня',
	            clear: 'Очистить',
	            dateFormat: 'dd.mm.yyyy',
	            timeFormat: 'hh:ii',
	            firstDay: 1
	        }
	    };
	
	    $(function () {
	        $(autoInitSelector).datepicker();
	    })
	
	})();


/***/ },
/* 17 */
/***/ function(module, exports) {

	;(function () {
	    var template = '' +
	        '<div class="datepicker--nav-action" data-action="prev">#{prevHtml}</div>' +
	        '<div class="datepicker--nav-title">#{title}</div>' +
	        '<div class="datepicker--nav-action" data-action="next">#{nextHtml}</div>',
	        buttonsContainerTemplate = '<div class="datepicker--buttons"></div>',
	        button = '<span class="datepicker--button" data-action="#{action}">#{label}</span>',
	        datepicker = $.fn.datepicker,
	        dp = datepicker.Constructor;
	
	    datepicker.Navigation = function (d, opts) {
	        this.d = d;
	        this.opts = opts;
	
	        this.$buttonsContainer = '';
	
	        this.init();
	    };
	
	    datepicker.Navigation.prototype = {
	        init: function () {
	            this._buildBaseHtml();
	            this._bindEvents();
	        },
	
	        _bindEvents: function () {
	            this.d.$nav.on('click', '.datepicker--nav-action', $.proxy(this._onClickNavButton, this));
	            this.d.$nav.on('click', '.datepicker--nav-title', $.proxy(this._onClickNavTitle, this));
	            this.d.$datepicker.on('click', '.datepicker--button', $.proxy(this._onClickNavButton, this));
	        },
	
	        _buildBaseHtml: function () {
	            this._render();
	            this._addButtonsIfNeed();
	        },
	
	        _addButtonsIfNeed: function () {
	            if (this.opts.todayButton) {
	                this._addButton('today')
	            }
	            if (this.opts.clearButton) {
	                this._addButton('clear')
	            }
	        },
	
	        _render: function () {
	            var title = this._getTitle(this.d.currentDate),
	                html = dp.template(template, $.extend({title: title}, this.opts));
	            this.d.$nav.html(html);
	            if (this.d.view == 'years') {
	                $('.datepicker--nav-title', this.d.$nav).addClass('-disabled-');
	            }
	            this.setNavStatus();
	        },
	
	        _getTitle: function (date) {
	            return this.d.formatDate(this.opts.navTitles[this.d.view], date)
	        },
	
	        _addButton: function (type) {
	            if (!this.$buttonsContainer.length) {
	                this._addButtonsContainer();
	            }
	
	            var data = {
	                    action: type,
	                    label: this.d.loc[type]
	                },
	                html = dp.template(button, data);
	
	            if ($('[data-action=' + type + ']', this.$buttonsContainer).length) return;
	            this.$buttonsContainer.append(html);
	        },
	
	        _addButtonsContainer: function () {
	            this.d.$datepicker.append(buttonsContainerTemplate);
	            this.$buttonsContainer = $('.datepicker--buttons', this.d.$datepicker);
	        },
	
	        setNavStatus: function () {
	            if (!(this.opts.minDate || this.opts.maxDate) || !this.opts.disableNavWhenOutOfRange) return;
	
	            var date = this.d.parsedDate,
	                m = date.month,
	                y = date.year,
	                d = date.date;
	
	            switch (this.d.view) {
	                case 'days':
	                    if (!this.d._isInRange(new Date(y, m-1, d), 'month')) {
	                        this._disableNav('prev')
	                    }
	                    if (!this.d._isInRange(new Date(y, m+1, d), 'month')) {
	                        this._disableNav('next')
	                    }
	                    break;
	                case 'months':
	                    if (!this.d._isInRange(new Date(y-1, m, d), 'year')) {
	                        this._disableNav('prev')
	                    }
	                    if (!this.d._isInRange(new Date(y+1, m, d), 'year')) {
	                        this._disableNav('next')
	                    }
	                    break;
	                case 'years':
	                    if (!this.d._isInRange(new Date(y-10, m, d), 'year')) {
	                        this._disableNav('prev')
	                    }
	                    if (!this.d._isInRange(new Date(y+10, m, d), 'year')) {
	                        this._disableNav('next')
	                    }
	                    break;
	            }
	        },
	
	        _disableNav: function (nav) {
	            $('[data-action="' + nav + '"]', this.d.$nav).addClass('-disabled-')
	        },
	
	        _activateNav: function (nav) {
	            $('[data-action="' + nav + '"]', this.d.$nav).removeClass('-disabled-')
	        },
	
	        _onClickNavButton: function (e) {
	            var $el = $(e.target).closest('[data-action]'),
	                action = $el.data('action');
	
	            this.d[action]();
	        },
	
	        _onClickNavTitle: function (e) {
	            if ($(e.target).hasClass('-disabled-')) return;
	
	            if (this.d.view == 'days') {
	                return this.d.view = 'months'
	            }
	
	            this.d.view = 'years';
	        }
	    }
	
	})();


/***/ },
/* 18 */
/***/ function(module, exports) {

	;(function () {
	    var template = '<div class="datepicker--time">' +
	        '<div class="datepicker--time-current">' +
	        '   <span class="datepicker--time-current-hours">#{hourValue}</span>' +
	        '   <span class="datepicker--time-current-colon">:</span>' +
	        '   <span class="datepicker--time-current-minutes">#{minValue}</span>' +
	        '</div>' +
	        '<div class="datepicker--time-sliders">' +
	        '   <div class="datepicker--time-row">' +
	        '      <input type="range" name="hours" value="#{hourValue}" min="#{hourMin}" max="#{hourMax}" step="#{hourStep}"/>' +
	        '   </div>' +
	        '   <div class="datepicker--time-row">' +
	        '      <input type="range" name="minutes" value="#{minValue}" min="#{minMin}" max="#{minMax}" step="#{minStep}"/>' +
	        '   </div>' +
	        '</div>' +
	        '</div>',
	        datepicker = $.fn.datepicker,
	        dp = datepicker.Constructor;
	
	    datepicker.Timepicker = function (inst, opts) {
	        this.d = inst;
	        this.opts = opts;
	
	        this.init();
	    };
	
	    datepicker.Timepicker.prototype = {
	        init: function () {
	            var input = 'input';
	            this._setTime(this.d.date);
	            this._buildHTML();
	
	            if (navigator.userAgent.match(/trident/gi)) {
	                input = 'change';
	            }
	
	            this.d.$el.on('selectDate', this._onSelectDate.bind(this));
	            this.$ranges.on(input, this._onChangeRange.bind(this));
	            this.$ranges.on('mouseup', this._onMouseUpRange.bind(this));
	            this.$ranges.on('mousemove focus ', this._onMouseEnterRange.bind(this));
	            this.$ranges.on('mouseout blur', this._onMouseOutRange.bind(this));
	        },
	
	        _setTime: function (date) {
	            var _date = dp.getParsedDate(date);
	
	            this._handleDate(date);
	            this.hours = _date.hours < this.minHours ? this.minHours : _date.hours;
	            this.minutes = _date.minutes < this.minMinutes ? this.minMinutes : _date.minutes;
	        },
	
	        _setMinTimeFromDate: function (date) {
	            this.minHours = date.getHours();
	            this.minMinutes = date.getMinutes();
	        },
	
	        _setMaxTimeFromDate: function (date) {
	            this.maxHours = date.getHours();
	            this.maxMinutes = date.getMinutes();
	        },
	
	        _setDefaultMinMaxTime: function () {
	            var maxHours = 23,
	                maxMinutes = 59,
	                opts = this.opts;
	
	            this.minHours = opts.minHours < 0 || opts.minHours > maxHours ? 0 : opts.minHours;
	            this.minMinutes = opts.minMinutes < 0 || opts.minMinutes > maxMinutes ? 0 : opts.minMinutes;
	            this.maxHours = opts.maxHours < 0 || opts.maxHours > maxHours ? maxHours : opts.maxHours;
	            this.maxMinutes = opts.maxMinutes < 0 || opts.maxMinutes > maxMinutes ? maxMinutes : opts.maxMinutes;
	        },
	
	        /**
	         * Looks for min/max hours/minutes and if current values
	         * are out of range sets valid values.
	         * @private
	         */
	        _validateHoursMinutes: function (date) {
	            if (this.hours < this.minHours) {
	                this.hours = this.minHours;
	            } else if (this.hours > this.maxHours) {
	                this.hours = this.maxHours;
	            }
	
	            if (this.minutes < this.minMinutes) {
	                this.minutes = this.minMinutes;
	            } else if (this.minutes > this.maxMinutes) {
	                this.minutes = this.maxMinutes;
	            }
	        },
	
	        _buildHTML: function () {
	            var lz = dp.getLeadingZeroNum,
	                data = {
	                    hourMin: this.minHours,
	                    hourMax: lz(this.maxHours),
	                    hourStep: this.opts.hoursStep,
	                    hourValue: lz(this.displayHours),
	                    minMin: this.minMinutes,
	                    minMax: lz(this.maxMinutes),
	                    minStep: this.opts.minutesStep,
	                    minValue: lz(this.minutes)
	                },
	                _template = dp.template(template, data);
	
	            this.$timepicker = $(_template).appendTo(this.d.$datepicker);
	            this.$ranges = $('[type="range"]', this.$timepicker);
	            this.$hours = $('[name="hours"]', this.$timepicker);
	            this.$minutes = $('[name="minutes"]', this.$timepicker);
	            this.$hoursText = $('.datepicker--time-current-hours', this.$timepicker);
	            this.$minutesText = $('.datepicker--time-current-minutes', this.$timepicker);
	
	            if (this.d.ampm) {
	                this.$ampm = $('<span class="datepicker--time-current-ampm">')
	                    .appendTo($('.datepicker--time-current', this.$timepicker))
	                    .html(this.dayPeriod);
	
	                this.$timepicker.addClass('-am-pm-');
	            }
	        },
	
	        _updateCurrentTime: function () {
	            var h =  dp.getLeadingZeroNum(this.displayHours),
	                m = dp.getLeadingZeroNum(this.minutes);
	
	            this.$hoursText.html(h);
	            this.$minutesText.html(m);
	
	            if (this.d.ampm) {
	                this.$ampm.html(this.dayPeriod);
	            }
	        },
	
	        _updateRanges: function () {
	            this.$hours.attr({
	                min: this.minHours,
	                max: this.maxHours
	            }).val(this.hours);
	
	            this.$minutes.attr({
	                min: this.minMinutes,
	                max: this.maxMinutes
	            }).val(this.minutes)
	        },
	
	        /**
	         * Sets minHours, minMinutes etc. from date. If date is not passed, than sets
	         * values from options
	         * @param [date] {object} - Date object, to get values from
	         * @private
	         */
	        _handleDate: function (date) {
	            this._setDefaultMinMaxTime();
	
	            if (date) {
	                if (dp.isSame(date, this.d.opts.minDate)) {
	                    this._setMinTimeFromDate(this.d.opts.minDate);
	                } else if (dp.isSame(date, this.d.opts.maxDate)) {
	                    this._setMaxTimeFromDate(this.d.opts.maxDate);
	                }
	            }
	
	            this._validateHoursMinutes(date);
	        },
	
	        update: function () {
	            this._updateRanges();
	            this._updateCurrentTime();
	        },
	
	        /**
	         * Calculates valid hour value to display in text input and datepicker's body.
	         * @param date {Date|Number} - date or hours
	         * @returns {{hours: *, dayPeriod: string}}
	         * @private
	         */
	        _getValidHoursFromDate: function (date) {
	            var d = date,
	                hours = date;
	
	            if (date instanceof Date) {
	                d = dp.getParsedDate(date);
	                hours = d.hours;
	            }
	
	            var ampm = this.d.ampm,
	                dayPeriod = 'am';
	
	            if (ampm) {
	                switch(true) {
	                    case hours == 0:
	                        hours = 12;
	                        break;
	                    case hours == 12:
	                        dayPeriod = 'pm';
	                        break;
	                    case hours > 11:
	                        hours = hours - 12;
	                        dayPeriod = 'pm';
	                        break;
	                    default:
	                        break;
	                }
	            }
	
	            return {
	                hours: hours,
	                dayPeriod: dayPeriod
	            }
	        },
	
	        set hours (val) {
	            this._hours = val;
	
	            var displayHours = this._getValidHoursFromDate(val);
	
	            this.displayHours = displayHours.hours;
	            this.dayPeriod = displayHours.dayPeriod;
	        },
	
	        get hours() {
	            return this._hours;
	        },
	
	        //  Events
	        // -------------------------------------------------
	
	        _onChangeRange: function (e) {
	            var $target = $(e.target),
	                name = $target.attr('name');
	            
	            this.d.timepickerIsActive = true;
	
	            this[name] = $target.val();
	            this._updateCurrentTime();
	            this.d._trigger('timeChange', [this.hours, this.minutes])
	        },
	
	        _onSelectDate: function (e, data) {
	            this._handleDate(data);
	            this.update();
	        },
	
	        _onMouseEnterRange: function (e) {
	            var name = $(e.target).attr('name');
	            $('.datepicker--time-current-' + name, this.$timepicker).addClass('-focus-');
	        },
	
	        _onMouseOutRange: function (e) {
	            var name = $(e.target).attr('name');
	            if (this.d.inFocus) return; // Prevent removing focus when mouse out of range slider
	            $('.datepicker--time-current-' + name, this.$timepicker).removeClass('-focus-');
	        },
	
	        _onMouseUpRange: function (e) {
	            this.d.timepickerIsActive = false;
	        }
	    };
	})();


/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag
	
	// load the styles
	var content = __webpack_require__(4);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(2)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../../css-loader/index.js!./../../../postcss-loader/index.js!./datepicker.min.css", function() {
				var newContent = require("!!./../../../css-loader/index.js!./../../../postcss-loader/index.js!./datepicker.min.css");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag
	
	// load the styles
	var content = __webpack_require__(5);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(2)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../node_modules/css-loader/index.js!./../node_modules/postcss-loader/index.js!./../node_modules/sass-loader/index.js!./themes.scss", function() {
				var newContent = require("!!./../node_modules/css-loader/index.js!./../node_modules/postcss-loader/index.js!./../node_modules/sass-loader/index.js!./themes.scss");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 21 */
/***/ function(module, exports) {

	module.exports = $;

/***/ }
/******/ ]);
//# sourceMappingURL=index.js.map