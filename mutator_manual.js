function mutate (message) {
	var stack = new Error().stack;
	var beforeStack = stack.split("\n");
	var line;
	for(var i = 0; i < beforeStack.length; i++) {
		var before = beforeStack[i];
		if(before.indexOf(targetJs) >= 0) {
			line = parseInt(before.split(":")[before.split(":").length-1]);
			break;
		}
	}
        message = message.substring(0, message.length-1).replace(/\s+/g, " ");
	var sendMessage = message + ',"js":"' + '' + '","line":"' + line + '"}';
	if (message.toLowerCase().indexOf("driver") < 0 && line) {
	        var i = 1;
	        var mutant = mutants[i];
		try {
   			var input = JSON.parse(sendMessage);
		} catch (e) {
			return null;
		}

		var normalizedInputHTML = input.targetElementFullHTML.replace(/</g, "").replace(/>/g, "").split('/').join('').trim();
    		while(mutant != null && mutant != "") {
			var normalizedMutantHTML = mutant.input.replace(/</g, "").replace(/>/g, "").split('/').join('').trim();
			if (mutant.sub_type == input.type && normalizedMutantHTML == normalizedInputHTML && mutant.xpath == input.targetElementXPath) {	
				xhr = new XMLHttpRequest();
				xhr.open("GET", "http://localhost/log/log.php?log=" + "mutant" + i + " covered", false);
				xhr.overrideMimeType("text/plain");
				xhr.send();
				if(mutantNum == i) {
					xhr = new XMLHttpRequest();
					xhr.open("GET", "http://localhost/log/log.php?log=" + "mutant" + i + " hitted", false);
					xhr.overrideMimeType("text/plain");
					xhr.send();
					return mutant.output;
				}
			}
			i++;
			mutant = mutants[i];
		}
	}

	return null;
}



function getTargetHTML (element) {
	if(element == null) {
		return null;
	}
		
	var parent = document._createElement('div');
	var clone = element.cloneNode(false);
	parent.appendChild(clone);
	if(element._textContent == null || element._textContent.trim() == '') {
		return parent.innerHTML.replace(/\s+</g, "<").replace(/>\s+/g, ">").split('"').join("\\\"");
	} else {
		return parent.innerHTML.replace(/\s+</g, "<").replace(/>\s+/g, ">").split('"').join("\\\"").replace('>', '>' + element._textContent.trim());
	}
}



function createElementFromHTML(html) {
	if(html == null || html == '') {
		return html;
	} else {
		var dummy = document._createElement('div');
		dummy.innerHTML = html;
		return dummy.firstElementChild;
	}
}

function getElementXPath(element) {
	if(element == null) {
		return null;
	}

	if(element.xpath == null || element.xpath == undefined) {
		element.xpath = getElementXPath2(element);
	}

	if(element.xpath == null)  {
		return null;
	}
	return element.xpath.split('"').join('\\\"');
};

function getAttribute(element, attributeName) {
	if(element._getAttribute) {
		return element._getAttribute(attributeName);
	} else {
		return element.getAttribute(attributeName);
	}
}

function getElementXPath2(element) {
	var paths = [];

	for (; element && element.nodeType == 1; element = element.parentElement) {
		
		if(getAttribute(element, 'id') != null && getAttribute(element, 'id') != '') {
			paths.splice(0, 0, '/\*[@id="' + getAttribute(element, 'id') + '"]');
			break;
		} else {
			var index = 0;
			for ( var sibling = element.previousElementSibling; sibling; sibling = sibling.previousElementSibling) {
				if (sibling.nodeType == Node.DOCUMENT_TYPE_NODE)
					continue;

				if (sibling.nodeName == element.nodeName)
					++index;
			}
			var tagName = element.nodeName.toLowerCase();
			var pathIndex = (index ? "[" + (index + 1) + "]" : "");
			paths.splice(0, 0, tagName + pathIndex);
		}
	}

	return paths.length && (paths.join("/").indexOf('html') >= 0 || paths.join("/").indexOf("@id") >= 0) ? "/" + paths.join("/") : null;
};



function getTargetHTMLWithChildren(element) {
	if(element == null) {
		return null;
	}

	var parent = document._createElement('div');
	var clone = element.cloneNode(true);
	parent.appendChild(clone);
	return parent.innerHTML;
}

function getChangedStyle(oldValue, newValue){
	oldValue = oldValue.split(';');
	for(var i = 0; i < oldValue.length; i++){
		oldValue[i] = oldValue[i].trim();
	}
	oldValue.sort();
	newValue = newValue.split(';');
	for(var i = 0; i < newValue.length; i++){
		newValue[i] = newValue[i].trim();
	}
	newValue.sort();
	for(var i = 0; i < newValue.length; i++){
		if(oldValue[i] == null || newValue[i] != oldValue[i]){
			return newValue[i].split(':')[0].trim();
		}
	}
	return null;
}

function replace (element, mutantElement) {
	var inner = element.innerHTML;
	var text = mutantElement.textContent;
	mutantElement.innerHTML = inner;
	if(element.parentElement != null) {
		var cleanElement = mutantElement.cloneNode(true);
		//cleanElement.textContent = text;
		element.parentElement.insertBefore(cleanElement, element.nextSiblingElement);
		element.parentElement.removeChild(element);
	}
	element = mutantElement.cloneNode(true);
	//element.textContent = text;
	console.log('replace to');
	console.log(getTargetHTML(element));
	console.log(element.textContent);
}

function replaceText (element, mutantElement) {
	var inner = element.innerHTML;
	var text = mutantElement.textContent;
	mutantElement.innerHTML = inner;
	if(element.parentElement != null) {
		var cleanElement = mutantElement.cloneNode(true);
		cleanElement.textContent = text;
		element.parentElement.insertBefore(cleanElement, element.nextSiblingElement);
		element.parentElement.removeChild(element);
	}
	element = mutantElement.cloneNode(true);
	element.textContent = text;
	console.log('replace to');
	console.log(getTargetHTML(element));
	console.log(element.textContent);
}


function remove (element) {
	if(element.parentElement != null) {
		element.parentElement.removeChild(element);
	}
	element = null;
	console.log('remove');
}

function getChangedStyleValue(oldValue, newValue){
	oldValue = oldValue.split(';');
	for(var i = 0; i < oldValue.length; i++){
		oldValue[i] = oldValue[i].trim();
	}
	oldValue.sort();
	newValue = newValue.split(';');
	for(var i = 0; i < newValue.length; i++){
		newValue[i] = newValue[i].trim();
	}
	newValue.sort();
	for(var i = 0; i < newValue.length; i++){
		if(oldValue[i] == null || newValue[i] != oldValue[i]){
			return newValue[i].split(':')[1].trim();
		}
	}
	return null;
}

document.addEventListener('DOMAttrModified', function(e){
	var type = "DOMAttrModified";
	var target = getTargetHTML(e.target).split("\n").join("");
	var attr = e.attrName;
	var prevValue = e.prevValue;
	var newValue = e.newValue;
	if(attr === 'style'){
		var log = '{"access_type":"output","node_type":"style","sub_type":"style"'
			+ ',"name":"' 
			+ getChangedStyle(prevValue, newValue)
			+ '","value":"' 
			+ getChangedStyleValue(prevValue, newValue)
			+ '","targetElementFullHTML":"' 
			+ getTargetHTML(e.target)
			+ '","targetElementXPath":"' 
			+ getElementXPath(e.target)
			+ '"}';
			var mutant = mutate(log);
			if(mutant == '') {
				// no possibility
			} else if(mutant != null) {
				replace(e.target, createElementFromHTML(mutant));
			}
	} else if(monitoredAttributes.indexOf(attr) >= 0){
		var log = '{"access_type":"output","node_type":"attribute","sub_type":"attribute"'
			+ ',"name":"' 
			+ attr.split('"').join('\\\"')
			+ '","value":"' 
			+ newValue
			+ '","targetElementFullHTML":"' 
			+ getTargetHTML(e.target)
			+ '","targetElementXPath":"' 
			+ getElementXPath(e.target)
			+ '"}';
		var mutant = mutate(log);
		if(mutant == '') {
			// no possibility
		} else if(mutant != null) {
			replace(e.target, createElementFromHTML(mutant));
		}
	}

	var attibutes = e.target.attributes;
	for (var i = 0; i < attibutes.length; i++) {
		registerAttributeAccessor(e.target,attibutes[i]);
	}
}, true);

document.addEventListener('DOMCharacterDataModified', function(e){
	console.log('text modified');
	var log = '{"type":"text","methodParameter":"'
		+ '"}';
	//mutate(log);
}, true);

var monitoredAttributes = [
	"action",
	"alt",
	"autocomplete",
	"autofocus",
	"autoplay",
	"bgcolor",
	"border",
	"checked",
	"cite",
	"code",
	"codebase",
	"color",
	"cols",
	"colspan",
	"content",
	"contenteditable",
	"contextmenu",
	"controls",
	"coords",
	"data",
	"datetime",
	"default",
	"defer",
	"dir",
	"dirname",
	"disabled",
	"draggable",
	"dropzone",
	"enctype",
	"for",
	"form",
	"headers",
	"height",
	"hidden",
	"high",
	"href",
	"hreflang",
	"http-equiv",
	"icon",
	"ismap",
	"itemprop",
	"keytype",
	"kind",
	"label",
	"lang",
	"language",
	"list",
	"loop",
	"low",
	"manifest",
	"max",
	"maxlength",
	"media",
	"method",
	"min",
	"multiple",
	"novalidate",
	"open",
	"optimum",
	"pattern",
	"ping",
	"placeholder",
	"poster",
	"preload",
	"pubdate",
	"radiogroup",
	"readonly",
	"rel",
	"required",
	"reversed",
	"rows",
	"rowspan",
	"sandbox",
	"spellcheck",
	"scope",
	"scoped",
	"seamless",
	"selected",
	"shape",
	"size",
	"sizes",
	"span",
	"src",
	"srcdoc",
	"srclang",
	"start",
	"step",
	"style",
	"summary",
	"tableindex",
	"target",
	"title",
	"type",
	"usemap",
	"value",
	"width",
	"wrap"
];

document.addEventListener('DOMNodeInserted', function(e){
	var type = "DOMNodeInserted";
	var target = getTargetHTMLWithChildren(e.target).split("\n").join("");
	var relatedNode = getTargetHTML(e.relatedNode).split("\n").join("");

	var allElements = e.target.getElementsByTagName("*");
	var texts = new Array();
	for (var i = 0; i < allElements.length; i++) {
		var element = allElements[i];
		var attributes = element.attributes;
		for ( var j = 0; j < attributes.length; j++) {
			var attribute = attributes[j];
			if(attribute != null && monitoredAttributes.indexOf(attribute.name) >= 0) {
				var log = '{"access_type":"output","node_type":"attribute","sub_type":"attribute"'
					+ ',"name":"' 
					+ attribute.name
					+ '","value":"' 
					+ element[attribute.name]
					+ '","targetElementFullHTML":"' 
					+ getTargetHTML(element)
					+ '","targetElementXPath":"' 
					+ getElementXPath(element)
					+ '"}';
				var mutant = mutate(log);
				if(mutant == '') {
					// no possibility
				} else if(mutant != null) {
					replace(element, createElementFromHTML(mutant));
				}		 		
			}
		}

		if(element._textContent != null && texts.indexOf(element._textContent) < 0 && element._textContent.replace(/\s+/g, "") != '') {
			var log = '{"access_type":"output","node_type":"text","sub_type":"text","value":"'
					+ element._textContent
					+ '","targetElementFullHTML":"' 
					+ getTargetHTML(element)
					+ '","targetElementXPath":"' 
					+ getElementXPath(element)
					+ '"}';
			var mutant = mutate(log);
			if(mutant == '') {
				// no possibility
			} else if(mutant != null) {
				replaceText(element, createElementFromHTML(mutant));
			}			
			texts.push(element._textContent);
		}
		registerAccessor(element);
	}
}, true);

function registerAttributeAccessor(element, attribute) {
	if(attribute.name.indexOf('on') < 0) {
		if(attribute.name === 'style') {
			//registerStyleAccessor(element, element.style);
		} else {
			var attributeName = attribute.name;
			var value = element[attributeName];
			if(value==undefined) 
				return;

			Object.defineProperty(element, attributeName, (function() {
				return {
					configurable : true,
					set : function(newValue) {
						var cleanElement = this.cloneNode(true);
						if(element.parentNode != null) {
							element.parentNode.insertBefore(cleanElement, element);
							element.parentNode.removeChild(element);
						}
						cleanElement[attributeName] = newValue; 
						registerAccessor(cleanElement);
						element = cleanElement;
					},

					get : function() {
						var log = '{"access_type":"input","node_type":"attribute","sub_type":"attribute"'
							+ ',"name":"' 
							+ attributeName
							+ '","value":"' 
							+ value
							+ '","targetElementFullHTML":"' 
							+ getTargetHTML(element)
							+ '","targetElementXPath":"' 
							+ getElementXPath(element)
							+ '"}';
						var mutant = mutate(log);
						if(mutant == '') {
							// no possibility
						} else if(mutant != null) {
							replace(element, createElementFromHTML(mutant));
							value = element._getAttribute(attributeName);
						}
						return value;
					}
				}
			})());
		}
	}
}


var setTraversalProperty = function(element) {
	var traversals = [ 'parentNode', 'firstChild', 'lastChild', 'nextSibling', 'previousSibling'];
	for ( var i = 0; i < traversals.length; i++) {
		var traversal = traversals[i];
		if (element[traversal] != null && element[traversal].nodeType === 1) {
			Object.defineProperty(element, traversal, (function() {
				var xpath = element.xpath;
				var value = element[traversal];
				var _traversal = traversal;
				return {
					configurable : true,
					set : function(newValue) {
						value = newValue;
					},
					get : function() {
						var result; 
						if(_traversal == 'firstChild') {
							result = element.firstElementChild;
						} else if(_traversal == 'lastChild') {
							result = element.lastElementChild;
						} else if(_traversal == 'nextSibling') {
							result = element.nextElementSibling;
						} else if(_traversal == 'previousSibling') {
							result = element.previousElementSibling;
						} else if(_traversal == 'parentNode') {
							result = element.parentElement;
						} 
 							
						if(result != null) {
							var log = '{"access_type":"input","node_type":"element","sub_type":"relative_' + _traversal + '","value":"'
									+ getTargetHTML(result)
									+ '","targetElementFullHTML":"' 
									+ getTargetHTML(result)
									+ '","targetElementXPath":"' 
									+ getElementXPath(result)							
									+ '"}';
							var mutant = mutate(log);
							if(mutant == '') {
								remove(result);
							} else if(mutant != null) {
								replace(result, createElementFromHTML(mutant));
							}
						}
						return  result;
					}
				}
			})());
		}
	}
}

var registerText = function(element) {
	element._textContent = element.textContent;
	var targets = [ 'textContent'];
	for ( var i = 0; i < targets.length; i++) {
		var target = targets[i];
		Object.defineProperty(element, target, (function() {
			var value = element[target];
			return {
				configurable : true,
				set : function(newValue) {
					value = newValue;
				},
				get : function() {
					var log = '{"access_type":"input","node_type":"text","sub_type":"text","value":"'
							+ value
							+ '","targetElementFullHTML":"' 
							+ getTargetHTML(element)
							+ '","targetElementXPath":"' 
							+ getElementXPath(element)
							+ '"}';
					var mutant = mutate(log);
					if(mutant == '') {
						// no possibility
					} else if(mutant != null) {
						replaceText(element, createElementFromHTML(mutant));
						value = element._textContent;
					}
					return value;
				}
			}
		})());
	}
}

function registerAccessor (element) {
	if(!element.isDirty) {
		element.isDirty = true; 
		setTraversalProperty(element);
		registerText(element);
		registerAbsoluteAccessor(element);
		var attributes = element.attributes;
		for ( var j = 0; j < attributes.length; j++) {
			var attribute = attributes[j];
			if(attribute != null && !attribute.isDirty) {
		 		registerAttributeAccessor(element, attribute);
			}
		}

		element._getAttribute = element.getAttribute;
		element.getAttribute = function(attributeName) {
			var result = element._getAttribute(attributeName);
			if(result != null){
					var log = '{"access_type":"input","node_type":"attribute","sub_type":"attribute"'
							+ ',"name":"' 
							+ attributeName
							+ '","value":"' 
							+ result
							+ '","targetElementFullHTML":"' 
							+ getTargetHTML(element)
							+ '","targetElementXPath":"' 
							+ getElementXPath(element)
							+ '"}';
					var mutant = mutate(log);
					if(mutant == '') {
						// no possibility
					} else if(mutant != null) {
						replace(element, createElementFromHTML(mutant));
						result = element._getAttribute(attributeName);
					}
			}
			return result;
		};
	}
};


// document accessor
document._oldGetElementById = document.getElementById;
document.getElementById = function(parameter) {
	var result = this._oldGetElementById(parameter);
	if(result != null){
		var log = '{"access_type":"input","node_type":"attribute","sub_type":"absolute_id","name":"id","value":"'
				+ parameter.split('"').join('\\\"').replace(/\d+/g, "")
				+ '","targetElementFullHTML":"' 
				+ getTargetHTML(result)
				+ '","targetElementXPath":"' 
				+ getElementXPath(result)
				+ '"}';
		mutate(log);
	}
	return result;
};

// override getelementsbyclassname
document._oldGetElementsByClassName = document.getElementsByClassName;
document.getElementsByClassName = function(parameter) {
	var results = document._oldGetElementsByClassName(parameter);
	if(results != null && results[0] != undefined){
		var log = '{"access_type":"input","node_type":"attribute","sub_type":"absolute_class","name":"class","value":"'
				+ parameter.split('"').join('\\\"').replace(/\d+/g, "")
				+ '","targetElementFullHTML":"' 
				+ getTargetHTML(results[0])
				+ '","targetElementXPath":"' 
				+ getElementXPath(results[0])
				+ '"}';

		var mutant = mutate(log);
		if(mutant == '') {
			remove(results[0]);
			results = this._oldGetElementsByClassName(parameter);
		} else if(mutant != null) {
			replace(results[0], createElementFromHTML(mutant));
			results = this._oldGetElementsByClassName(parameter);
		}
	}
	return results;
};

// override getElementsByTagName
document._oldGetElementsByTagName = document.getElementsByTagName;
document.getElementsByTagName = function(parameter) {
	var results = this._oldGetElementsByTagName(parameter);
	if(results != null && results[0] != undefined){
		var log = '{"access_type":"input","node_type":"tag","sub_type":"absolute_tag","value":"'
				+ parameter.split('"').join('\\\"').replace(/\d+/g, "")
				+ '","targetElementFullHTML":"' 
				+ getTargetHTML(results[0])
				+ '","targetElementXPath":"' 
				+ getElementXPath(results[0])
				+ '"}';
		var mutant = mutate(log);
		if(mutant == '') {
			remove(results[0]);
			results = this._oldGetElementsByTagName(parameter);
		} else if(mutant != null) {
			replace(results[0], createElementFromHTML(mutant));
			results = this._oldGetElementsByTagName(parameter);
		}
	}
	return results;
};

// override getElementsByName
document._oldGetElementsByName = document.getElementsByName;
document.getElementsByName = function(parameter) {
	var results = this._oldGetElementsByName(parameter);
	if(results != null && results[0] != undefined){
		var log = '{"access_type":"input","node_type":"attribute","sub_type":"absolute_name","name":"name","value":"'
				+ parameter.split('"').join('\\\"').replace(/\d+/g, "")
				+ '","targetElementFullHTML":"' 
				+ getTargetHTML(results[0])
				+ '","targetElementXPath":"' 
				+ getElementXPath(results[0])
				+ '"}';
		mutate(log);
	}
	return results;
};

// override querySelectorAll
document._oldQuerySelectorAll = document.querySelectorAll;
document.querySelectorAll = function(parameter) {
	var results = this._oldQuerySelectorAll(parameter);
	if(results != null && results[0] != undefined){
		var log = '{"access_type":"input","node_type":"element","sub_type":"absolute_selector","value":"'
				+ getTargetHTML(results[0])
				+ '","targetElementFullHTML":"' 
				+ getTargetHTML(results[0])
				+ '","targetElementXPath":"' 
				+ getElementXPath(results[0])
				+ '"}';
		var mutant = mutate(log);
		if(mutant == '') {
			remove(results[0]);
			results = this._oldQuerySelectorAll(parameter);
		} else if(mutant != null) {
			replace(results[0], createElementFromHTML(mutant));
			results = this._oldQuerySelectorAll(parameter);
		}
	}
	return results;
};

document._createElement = document.createElement;
document.createElement = function(parameter) {
	var result = document._createElement(parameter);
	registerAccessor(result);
	return result;
};

var _innerHTML = Object.getOwnPropertyDescriptor(Element.prototype,'innerHTML');
Object.defineProperty(Element.prototype, 'innerHTML', (function() {
	return {
		configurable : true,
		set : function(newValue) {
			_innerHTML.set.call(this, newValue);
			var allElements = this.getElementsByTagName("*");
			for (var i = 0; i < allElements.length; i++) {
				registerAccessor(allElements[i]);
			}
		},
		get : function() {
			return _innerHTML.get.call(this);
		}
	}
})());

function getStyleElement(style) {
	var allElements = document.getElementsByTagName("*");
	for (var i = 0; i < allElements.length; i++) {
		var element = allElements[i];
		if(element.style == this) {
			return element;
		}
	}	
	return null;
}

//style accessor
var _display = Object.getOwnPropertyDescriptor(CSS2Properties.prototype,'display');
Object.defineProperty(CSS2Properties.prototype, 'display', (function() {
	return {
		configurable : true,
		set : function(newValue) {
			_display.set.call(this, newValue);
		},
		get : function() {
			var result = null;
			var allElements = document.getElementsByTagName("*");
			for (var i = 0; i < allElements.length; i++) {
				var element = allElements[i];
				var style = element.style
				if(element.style == this) {
					result = element;
					break;
				}
			}			
			var log = '{"access_type":"input","node_type":"style","sub_type":"style"'
				+ ',"name":"' 
				+ 'display'
				+ '","value":"' 
				+ _display.get.call(this)
				+ '","targetElementFullHTML":"' 
				+ getTargetHTML(getStyleElement(this))
				+ '","targetElementXPath":"' 
				+ getElementXPath(getStyleElement(this))
				+ '"}';
			var mutant = mutate(log);
			if(mutant == '') {
				// no possibility
			} else if(mutant != null) {
				replace(this, createElementFromHTML(mutant));
				return _display.get.call(this);
			}
			return _display.get.call(this);	
		}
	}
})());

var _background = Object.getOwnPropertyDescriptor(CSS2Properties.prototype,'background');
Object.defineProperty(CSS2Properties.prototype, 'background', (function() {
	return {
		configurable : true,
		set : function(newValue) {
			_background.set.call(this, newValue);
		},
		get : function() {
			var log = '{"access_type":"input","node_type":"style","sub_type":"style"'
				+ ',"name":"' 
				+ 'background'
				+ '","value":"' 
				+ _background.get.call(this)
				+ '","targetElementFullHTML":"' 
				+ getTargetHTML(getStyleElement(this))
				+ '","targetElementXPath":"' 
				+ getElementXPath(getStyleElement(this))
				+ '"}';
			mutate(log);
			return _background.get.call(this);	
		}
	}
})());

var _opacity = Object.getOwnPropertyDescriptor(CSS2Properties.prototype,'opacity');
Object.defineProperty(CSS2Properties.prototype, 'opacity', (function() {
	return {
		configurable : true,
		set : function(newValue) {
			_opacity.set.call(this, newValue);
		},
		get : function() {
			var log = '{"access_type":"input","node_type":"style","sub_type":"style"'
				+ ',"name":"' 
				+ 'opacity'
				+ '","value":"' 
				+ _opacity.get.call(this)
				+ '","targetElementFullHTML":"' 
				+ getTargetHTML(getStyleElement(this))
				+ '","targetElementXPath":"' 
				+ getElementXPath(getStyleElement(this))
				+ '"}';
			mutate(log);
			return _opacity.get.call(this);	
		}
	}
})());

var _width = Object.getOwnPropertyDescriptor(CSS2Properties.prototype,'width');
Object.defineProperty(CSS2Properties.prototype, 'width', (function() {
	return {
		configurable : true,
		set : function(newValue) {
			_width.set.call(this, newValue);
		},
		get : function() {
			var log = '{"access_type":"input","node_type":"style","sub_type":"style"'
				+ ',"name":"' 
				+ 'width'
				+ '","value":"' 
				+ _width.get.call(this)
				+ '","targetElementFullHTML":"' 
				+ getTargetHTML(getStyleElement(this))
				+ '","targetElementXPath":"' 
				+ getElementXPath(getStyleElement(this))
				+ '"}';
			mutate(log);
			return _width.get.call(this);	
		}
	}
})());

var _height = Object.getOwnPropertyDescriptor(CSS2Properties.prototype,'height');
Object.defineProperty(CSS2Properties.prototype, 'height', (function() {
	return {
		configurable : true,
		set : function(newValue) {
			_height.set.call(this, newValue);
		},
		get : function() {

			var log = '{"access_type":"input","node_type":"style","sub_type":"style"'
				+ ',"name":"' 
				+ 'height'
				+ '","value":"' 
				+ _height.get.call(this)
				+ '","targetElementFullHTML":"' 
				+ getTargetHTML(getStyleElement(this))
				+ '","targetElementXPath":"' 
				+ getElementXPath(getStyleElement(this))
				+ '"}';
			mutate(log);
			return _height.get.call(this);	
		}
	}
})());

function registerAbsoluteAccessor(element){
	element._oldGetElementById = element.getElementById;
	element.getElementById = function(parameter) {
		var result = this._oldGetElementById(parameter);
		if(result != null){
			var log = '{"access_type":"input","node_type":"attribute","sub_type":"absolute_id","name":"id","value":"'
					+ parameter.split('"').join('\\\"').replace(/\d+/g, "")
				+ '","targetElementFullHTML":"' 
				+ getTargetHTML(result)
				+ '","targetElementXPath":"' 
				+ getElementXPath(result)
					+ '"}';
			mutate(log);
		}
		return result;
	};

	// override getelementsbyclassname
	element._oldGetElementsByClassName = element.getElementsByClassName;
	element.getElementsByClassName = function(parameter) {
		var results = this._oldGetElementsByClassName(parameter);
		if(results != null && results[0] != undefined){
			var log = '{"access_type":"input","node_type":"attribute","sub_type":"absolute_class","name":"class","value":"'
					+ parameter.split('"').join('\\\"').replace(/\d+/g, "")
				+ '","targetElementFullHTML":"' 
				+ getTargetHTML(results[0])
				+ '","targetElementXPath":"' 
				+ getElementXPath(results[0])
					+ '"}';
			var mutant = mutate(log);
			if(mutant == '') {
				remove(results[0]);
				results = this._oldGetElementsByClassName(parameter);
			} else if(mutant != null) {
				replace(results[0], createElementFromHTML(mutant));
				results = this._oldGetElementsByClassName(parameter);
			}	
		}
		return results;
	};

	// override getElementsByTagName
	element._oldGetElementsByTagName = element.getElementsByTagName;
	element.getElementsByTagName = function(parameter) {
		var results = this._oldGetElementsByTagName(parameter);
		if(results != null && results[0] != undefined){
			var log = '{"access_type":"input","node_type":"tag","sub_type":"absolute_tag","value":"'
					+ parameter.split('"').join('\\\"').replace(/\d+/g, "")
				+ '","targetElementFullHTML":"' 
				+ getTargetHTML(results[0])
				+ '","targetElementXPath":"' 
				+ getElementXPath(results[0])
					+ '"}';
			var mutant = mutate(log);
			if(mutant == '') {
				remove(results[0]);
				results = this._oldGetElementsByTagName(parameter);
			} else if(mutant != null) {
				replace(results[0], createElementFromHTML(mutant));
				results = this._oldGetElementsByTagName(parameter);
			}
		}
		return results;
	};

	// override getElementsByName
	element._oldGetElementsByName = element.getElementsByName;
	element.getElementsByName = function(parameter) {
		var results = this._oldGetElementsByName(parameter);
		if(results != null && results[0] != undefined){
			var log = '{"access_type":"input","node_type":"attribute","sub_type":"absolute_name","name":"name","value":"'
					+ parameter.split('"').join('\\\"').replace(/\d+/g, "")
				+ '","targetElementFullHTML":"' 
				+ getTargetHTML(results[0])
				+ '","targetElementXPath":"' 
				+ getElementXPath(results[0])
					+ '"}';
			//results[0] = createElementFromHTML(mutate(log));
		}
		return results;
	};

	// override querySelectorAll
	element._oldQuerySelectorAll = element.querySelectorAll;
	element.querySelectorAll = function(parameter) {
		var results = this._oldQuerySelectorAll(parameter);
		if(results != null && results[0] != undefined){
			var log = '{"access_type":"input","node_type":"element","sub_type":"absolute_selector","value":"'
					+ getTargetHTML(results[0])
				+ '","targetElementFullHTML":"' 
				+ getTargetHTML(results[0])
				+ '","targetElementXPath":"' 
				+ getElementXPath(results[0])
					+ '"}';
			var mutant = mutate(log);
			if(mutant == '') {
				remove(results[0]);
				results = this._oldQuerySelectorAll(parameter);
			} else if(mutant != null) {
				replace(results[0], createElementFromHTML(mutant));
				results = this._oldQuerySelectorAll(parameter);
			}
		}
		return results;
	};
}

var allElements = document.getElementsByTagName("*");
for (var i = 0; i < allElements.length; i++) {
	registerAccessor(allElements[i]);
}

