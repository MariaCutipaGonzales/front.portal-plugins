var Liquid={author:"M@ McCray <darthapo@gmail.com>",version:"1.2.1",readTemplateFile:function(a){throw ("This liquid context does not allow includes.")},registerFilters:function(a){Liquid.Template.registerFilter(a)},parse:function(a){return Liquid.Template.parse(a)}};if(!Array.prototype.indexOf){Array.prototype.indexOf=function(b){for(var a=0;a<this.length;a++){if(this[a]==b){return a}}return -1}}if(!Array.prototype.clear){Array.prototype.clear=function(){this.length=0}}if(!Array.prototype.map){Array.prototype.map=function(b){var a=this.length;if(typeof b!="function"){throw"Array.map requires first argument to be a function"}var e=new Array(a);var d=arguments[1];for(var c=0;c<a;c++){if(c in this){e[c]=b.call(d,this[c],c,this)}}return e}}if(!Array.prototype.first){Array.prototype.first=function(){return this[0]}}if(!Array.prototype.last){Array.prototype.last=function(){return this[this.length-1]}}if(!Array.prototype.flatten){Array.prototype.flatten=function(){var b=this.length;var a=[];for(var c=0;c<b;c++){if(this[c] instanceof Array){a=a.concat(this[c])}else{a.push(this[c])}}return a}}if(!Array.prototype.each){Array.prototype.each=function(b){var a=this.length;if(typeof b!="function"){throw"Array.each requires first argument to be a function"}var d=arguments[1];for(var c=0;c<a;c++){if(c in this){b.call(d,this[c],c,this)}}return null}}if(!Array.prototype.include){Array.prototype.include=function(b){var a=this.length;return this.indexOf(b)>=0;for(var c=0;c<a;c++){if(b==this[c]){return true}}return false}}if(!String.prototype.capitalize){String.prototype.capitalize=function(){return this.charAt(0).toUpperCase()+this.substring(1).toLowerCase()}}if(!String.prototype.strip){String.prototype.strip=function(){return this.replace(/^\s+/,"").replace(/\s+$/,"")}}Liquid.extensions={};Liquid.extensions.object={};Liquid.extensions.object.update=function(a){for(var b in a){this[b]=a[b]}return this};Liquid.extensions.object.hasKey=function(a){return !!this[a]};Liquid.extensions.object.hasValue=function(a){for(var b in this){if(this[b]==a){return true}}return false};(function(){var a=false,b=/xyz/.test(function(){xyz})?/\b_super\b/:/.*/;this.Class=function(){};Class.extend=function(g){var f=this.prototype;a=true;var e=new this();a=false;for(var d in g){e[d]=typeof g[d]=="function"&&typeof f[d]=="function"&&b.test(g[d])?(function(h,i){return function(){var k=this._super;this._super=f[h];var j=i.apply(this,arguments);this._super=k;return j}})(d,g[d]):g[d]}function c(){if(!a&&this.init){this.init.apply(this,arguments)}}c.prototype=e;c.prototype.constructor=c;c.extend=arguments.callee;return c}})();Liquid.Tag=Class.extend({init:function(b,a,c){this.tagName=b;this.markup=a;this.nodelist=this.nodelist||[];this.parse(c)},parse:function(a){},render:function(a){return""}});Liquid.Block=Liquid.Tag.extend({init:function(b,a,c){this.blockName=b;this.blockDelimiter="end"+this.blockName;this._super(b,a,c)},parse:function(c){if(!this.nodelist){this.nodelist=[]}this.nodelist.clear();var b=c.shift();c.push("");while(c.length){if(/^\{\%/.test(b)){var a=b.match(/^\{\%\s*(\w+)\s*(.*)?\%\}$/);if(a){if(this.blockDelimiter==a[1]){this.endTag();return}if(a[1] in Liquid.Template.tags){this.nodelist.push(new Liquid.Template.tags[a[1]](a[1],a[2],c))}else{this.unknownTag(a[1],a[2],c)}}else{throw ("Tag '"+b+"' was not properly terminated with: %}")}}else{if(/^\{\{/.test(b)){this.nodelist.push(this.createVariable(b))}else{this.nodelist.push(b)}}b=c.shift()}this.assertMissingDelimitation()},endTag:function(){},unknownTag:function(a,c,b){switch(a){case"else":throw (this.blockName+" tag does not expect else tag");break;case"end":throw ("'end' is not a valid delimiter for "+this.blockName+" tags. use "+this.blockDelimiter);break;default:throw ("Unknown tag: "+a)}},createVariable:function(b){var a=b.match(/^\{\{(.*)\}\}$/);if(a){return new Liquid.Variable(a[1])}else{throw ("Variable '"+b+"' was not properly terminated with: }}")}},render:function(a){return this.renderAll(this.nodelist,a)},renderAll:function(b,a){return(b||[]).map(function(f,d){var c="";try{c=(f.render)?f.render(a):f}catch(g){c=a.handleError(g)}return c})},assertMissingDelimitation:function(){throw (this.blockName+" tag was never closed")}});Liquid.Document=Liquid.Block.extend({init:function(a){this.blockDelimiter=[];this.parse(a)},assertMissingDelimitation:function(){}});Liquid.Strainer=Class.extend({init:function(a){this.context=a},respondTo:function(a){a=a.toString();if(a.match(/^__/)){return false}if(Liquid.Strainer.requiredMethods.include(a)){return false}return(a in this)}});Liquid.Strainer.filters={};Liquid.Strainer.globalFilter=function(a){for(var b in a){Liquid.Strainer.filters[b]=a[b]}};Liquid.Strainer.requiredMethods=["respondTo","context"];Liquid.Strainer.create=function(a){var c=new Liquid.Strainer(a);for(var b in Liquid.Strainer.filters){c[b]=Liquid.Strainer.filters[b]}return c};Liquid.Context=Class.extend({init:function(b,a,c){this.scopes=[b?b:{}];this.registers=a?a:{};this.errors=[];this.rethrowErrors=c;this.strainer=Liquid.Strainer.create(this)},get:function(a){return this.resolve(a)},set:function(a,b){this.scopes[0][a]=b},hasKey:function(a){return(this.resolve(a))?true:false},push:function(){var a={};this.scopes.unshift(a);return a},merge:function(a){return Liquid.extensions.object.update.call(this.scopes[0],a)},pop:function(){if(this.scopes.length==1){throw"Context stack error"}return this.scopes.shift()},stack:function(b,c){var a=null;this.push();try{a=b.apply(c?c:this.strainer)}finally{this.pop()}return a},invoke:function(c,b){if(this.strainer.respondTo(c)){var a=this.strainer[c].apply(this.strainer,b);return a}else{return(b.length==0)?null:b[0]}},resolve:function(g){switch(g){case null:case"nil":case"null":case"":return null;case"true":return true;case"false":return false;case"blank":case"empty":return"";default:if((/^'(.*)'$/).test(g)){return g.replace(/^'(.*)'$/,"$1")}else{if((/^"(.*)"$/).test(g)){return g.replace(/^"(.*)"$/,"$1")}else{if((/^(\d+)$/).test(g)){return parseInt(g.replace(/^(\d+)$/,"$1"))}else{if((/^(\d[\d\.]+)$/).test(g)){return parseFloat(g.replace(/^(\d[\d\.]+)$/,"$1"))}else{if((/^\((\S+)\.\.(\S+)\)$/).test(g)){var d=g.match(/^\((\S+)\.\.(\S+)\)$/),h=parseInt(d[1]),f=parseInt(d[2]),b=[];if(isNaN(h)||isNaN(f)){h=d[1].charCodeAt(0);f=d[2].charCodeAt(0);var c=f-h+1;for(var e=0;e<c;e++){b.push(String.fromCharCode(e+h))}}else{var c=f-h+1;for(var e=0;e<c;e++){b.push(e+h)}}return b}else{var a=this.variable(g);return a}}}}}}},findVariable:function(c){for(var b=0;b<this.scopes.length;b++){var d=this.scopes[b];if(d&&typeof(d[c])!=="undefined"){var a=d[c];if(typeof(a)=="function"){a=a.apply(this);d[c]=a}if(a&&typeof(a)=="object"&&("toLiquid" in a)){a=a.toLiquid()}if(a&&typeof(a)=="object"&&("setContext" in a)){a.setContext(self)}return a}}return null},variable:function(b){if(typeof b!="string"){return null}var f=b.match(/\[[^\]]+\]|(?:[\w\-]\??)+/g),d=f.shift(),e=d.match(/^\[(.*)\]$/);if(e){d=this.resolve(e[1])}var c=this.findVariable(d),a=this;if(c){f.each(function(g){var i=g.match(/^\[(.*)\]$/);if(i){var g=a.resolve(i[1]);if(typeof(c[g])=="function"){c[g]=c[g].apply(this)}c=c[g];if(typeof(c)=="object"&&("toLiquid" in c)){c=c.toLiquid()}}else{if((typeof(c)=="object"||typeof(c)=="hash")&&(g in c)){var h=c[g];if(typeof(h)=="function"){h=c[g]=h.apply(a)}if(typeof(h)=="object"&&("toLiquid" in h)){c=h.toLiquid()}else{c=h}}else{if((/^\d+$/).test(g)){var j=parseInt(g);if(typeof(c[j])=="function"){c[j]=c[j].apply(a)}if(typeof(c[j])=="object"&&typeof(c[j])=="object"&&("toLiquid" in c[j])){c=c[j].toLiquid()}else{c=c[j]}}else{if(c&&typeof(c[g])=="function"&&["length","size","first","last"].include(g)){c=c[g].apply(g);if("toLiquid" in c){c=c.toLiquid()}}else{return c=null}}}if(typeof(c)=="object"&&("setContext" in c)){c.setContext(a)}}})}return c},addFilters:function(a){a=a.flatten();a.each(function(b){if(typeof(b)!="object"){throw ("Expected object but got: "+typeof(b))}this.strainer.addMethods(b)})},handleError:function(a){this.errors.push(a);if(this.rethrowErrors){throw a}return"Liquid error: "+(a.message?a.message:(a.description?a.description:a))}});Liquid.Template=Class.extend({init:function(){this.root=null;this.registers={};this.assigns={};this.errors=[];this.rethrowErrors=false},parse:function(a){this.root=new Liquid.Document(Liquid.Template.tokenize(a));return this},render:function(){if(!this.root){return""}var a={ctx:arguments[0],filters:arguments[1],registers:arguments[2]};var b=null;if(a.ctx instanceof Liquid.Context){b=a.ctx;this.assigns=b.assigns;this.registers=b.registers}else{if(a.ctx){Liquid.extensions.object.update.call(this.assigns,a.ctx)}if(a.registers){Liquid.extensions.object.update.call(this.registers,a.registers)}b=new Liquid.Context(this.assigns,this.registers,this.rethrowErrors)}if(a.filters){b.addFilters(arg.filters)}try{return this.root.render(b).join("")}finally{this.errors=b.errors}},renderWithErrors:function(){var b=this.rethrowErrors;this.rethrowErrors=true;var a=this.render.apply(this,arguments);this.rethrowErrors=b;return a}});Liquid.Template.tags={};Liquid.Template.registerTag=function(b,a){Liquid.Template.tags[b]=a};Liquid.Template.registerFilter=function(a){Liquid.Strainer.globalFilter(a)};Liquid.Template.tokenize=function(b){var a=b.split(/(\{\%.*?\%\}|\{\{.*?\}\}?)/);if(a[0]==""){a.shift()}return a};Liquid.Template.parse=function(a){return(new Liquid.Template()).parse(a)};Liquid.Variable=Class.extend({init:function(b){this.markup=b;this.name=null;this.filters=[];var a=this;var d=b.match(/\s*("[^"]+"|'[^']+'|[^\s,|]+)/);if(d){this.name=d[1];var c=b.match(/\|\s*(.*)/);if(c){var e=c[1].split(/\|/);e.each(function(j){var i=j.match(/\s*(\w+)/);if(i){var h=i[1];var g=[];(j.match(/(?:[:|,]\s*)("[^"]+"|'[^']+'|[^\s,|]+)/g)||[]).flatten().each(function(f){var k=f.match(/^[\s|:|,]*(.*?)[\s]*$/);if(k){g.push(k[1])}});a.filters.push([h,g])}})}}},render:function(b){if(this.name==null){return""}var a=b.get(this.name);this.filters.each(function(e){var d=e[0],c=(e[1]||[]).map(function(f){return b.get(f)});c.unshift(a);a=b.invoke(d,c)});return a}});Liquid.Condition=Class.extend({init:function(c,a,b){this.left=c;this.operator=a;this.right=b;this.childRelation=null;this.childCondition=null;this.attachment=null},evaluate:function(b){b=b||new Liquid.Context();var a=this.interpretCondition(this.left,this.right,this.operator,b);switch(this.childRelation){case"or":return(a||this.childCondition.evaluate(b));case"and":return(a&&this.childCondition.evaluate(b));default:return a}},or:function(a){this.childRelation="or";this.childCondition=a},and:function(a){this.childRelation="and";this.childCondition=a},attach:function(a){this.attachment=a;return this.attachment},isElse:false,interpretCondition:function(d,c,e,b){if(!e){return b.get(d)}d=b.get(d);c=b.get(c);e=Liquid.Condition.operators[e];if(!e){throw ("Unknown operator "+e)}var a=e(d,c);return a},toString:function(){return"<Condition "+this.left+" "+this.operator+" "+this.right+">"}});Liquid.Condition.operators={"==":function(a,b){return(a==b)},"=":function(a,b){return(a==b)},"!=":function(a,b){return(a!=b)},"<>":function(a,b){return(a!=b)},"<":function(a,b){return(a<b)},">":function(a,b){return(a>b)},"<=":function(a,b){return(a<=b)},">=":function(a,b){return(a>=b)},contains:function(a,b){return a.include(b)},hasKey:function(a,b){return Liquid.extensions.object.hasKey.call(a,b)},hasValue:function(a,b){return Liquid.extensions.object.hasValue.call(a,b)}};Liquid.ElseCondition=Liquid.Condition.extend({isElse:true,evaluate:function(a){return true},toString:function(){return"<ElseCondition>"}});Liquid.Drop=Class.extend({setContext:function(a){this.context=a},beforeMethod:function(a){},invokeDrop:function(b){var a=this.beforeMethod();if(!a&&(b in this)){a=this[b].apply(this)}return a},hasKey:function(a){return true}});var hackObjectEach=function(a){if(typeof a!="function"){throw"Object.each requires first argument to be a function"}var c=0;var b=arguments[1];for(var e in this){var d=this[e],f=[e,d];f.key=e;f.value=d;a.call(b,f,c,this);c++}return null};Liquid.Template.registerTag("assign",Liquid.Tag.extend({tagSyntax:/((?:\(?[\w\-\.\[\]]\)?)+)\s*=\s*((?:"[^"]+"|'[^']+'|[^\s,|]+)+)/,init:function(b,a,d){var c=a.match(this.tagSyntax);if(c){this.to=c[1];this.from=c[2]}else{throw ("Syntax error in 'assign' - Valid syntax: assign [var] = [source]")}this._super(b,a,d)},render:function(a){a.scopes.last()[this.to.toString()]=a.get(this.from);return""}}));Liquid.Template.registerTag("cache",Liquid.Block.extend({tagSyntax:/(\w+)/,init:function(b,a,d){var c=a.match(this.tagSyntax);if(c){this.to=c[1]}else{throw ("Syntax error in 'cache' - Valid syntax: cache [var]")}this._super(b,a,d)},render:function(b){var a=this._super(b);b.scopes.last()[this.to]=[a].flatten().join("");return""}}));Liquid.Template.registerTag("capture",Liquid.Block.extend({tagSyntax:/(\w+)/,init:function(b,a,d){var c=a.match(this.tagSyntax);if(c){this.to=c[1]}else{throw ("Syntax error in 'capture' - Valid syntax: capture [var]")}this._super(b,a,d)},render:function(b){var a=this._super(b);b.set(this.to,[a].flatten().join(""));return""}}));Liquid.Template.registerTag("case",Liquid.Block.extend({tagSyntax:/("[^"]+"|'[^']+'|[^\s,|]+)/,tagWhenSyntax:/("[^"]+"|'[^']+'|[^\s,|]+)(?:(?:\s+or\s+|\s*\,\s*)("[^"]+"|'[^']+'|[^\s,|]+.*))?/,init:function(b,a,d){this.blocks=[];this.nodelist=[];var c=a.match(this.tagSyntax);if(c){this.left=c[1]}else{throw ("Syntax error in 'case' - Valid syntax: case [condition]")}this._super(b,a,d)},unknownTag:function(a,b,c){switch(a){case"when":this.recordWhenCondition(b);break;case"else":this.recordElseCondition(b);break;default:this._super(a,b,c)}},render:function(c){var b=this,a=[],d=true;c.stack(function(){for(var e=0;e<b.blocks.length;e++){var f=b.blocks[e];if(f.isElse){if(d==true){a=[a,b.renderAll(f.attachment,c)].flatten()}return a}else{if(f.evaluate(c)){d=false;a=[a,b.renderAll(f.attachment,c)].flatten()}}}});return a},recordWhenCondition:function(a){while(a){var b=a.match(this.tagWhenSyntax);if(!b){throw ("Syntax error in tag 'case' - Valid when condition: {% when [condition] [or condition2...] %} ")}a=b[2];var c=new Liquid.Condition(this.left,"==",b[1]);this.blocks.push(c);this.nodelist=c.attach([])}},recordElseCondition:function(a){if((a||"").strip()!=""){throw ("Syntax error in tag 'case' - Valid else condition: {% else %} (no parameters) ")}var b=new Liquid.ElseCondition();this.blocks.push(b);this.nodelist=b.attach([])}}));Liquid.Template.registerTag("comment",Liquid.Block.extend({render:function(a){return""}}));Liquid.Template.registerTag("cycle",Liquid.Tag.extend({tagSimpleSyntax:/"[^"]+"|'[^']+'|[^\s,|]+/,tagNamedSyntax:/("[^"]+"|'[^']+'|[^\s,|]+)\s*\:\s*(.*)/,init:function(a,b,d){var c,e;c=b.match(this.tagNamedSyntax);if(c){this.variables=this.variablesFromString(c[2]);this.name=c[1]}else{c=b.match(this.tagSimpleSyntax);if(c){this.variables=this.variablesFromString(b);this.name="'"+this.variables.toString()+"'"}else{throw ("Syntax error in 'cycle' - Valid syntax: cycle [name :] var [, var2, var3 ...]")}}this._super(a,b,d)},render:function(d){var b=this,c=d.get(b.name),a="";if(!d.registers.cycle){d.registers.cycle={}}if(!d.registers.cycle[c]){d.registers.cycle[c]=0}d.stack(function(){var e=d.registers.cycle[c],f=d.get(b.variables[e]);e+=1;if(e==b.variables.length){e=0}d.registers.cycle[c]=e;a=f});return a},variablesFromString:function(a){return a.split(",").map(function(b){var c=b.match(/\s*("[^"]+"|'[^']+'|[^\s,|]+)\s*/);return(c[1])?c[1]:null})}}));Liquid.Template.registerTag("for",Liquid.Block.extend({tagSyntax:/(\w+)\s+in\s+((?:\(?[\w\-\.\[\]]\)?)+)/,init:function(a,b,f){var e=b.match(this.tagSyntax);if(e){this.variableName=e[1];this.collectionName=e[2];this.name=this.variableName+"-"+this.collectionName;this.attributes={};var d=b.replace(this.tagSyntax,"");var c=b.match(/(\w*?)\s*\:\s*("[^"]+"|'[^']+'|[^\s,|]+)/g);if(c){c.each(function(g){g=g.split(":");this.attributes[g[0].strip()]=g[1].strip()},this)}}else{throw ("Syntax error in 'for loop' - Valid syntax: for [item] in [collection]")}this._super(a,b,f)},render:function(b){var i=this,c=[],h=(b.get(this.collectionName)||[]),f=[0,h.length];if(!b.registers["for"]){b.registers["for"]={}}if(this.attributes.limit||this.attributes.offset){var e=0,d=0,a=0,g=null;if(this.attributes.offset=="continue"){e=b.registers["for"][this.name]}else{e=b.get(this.attributes.offset)||0}d=b.get(this.attributes.limit);a=(d)?e+d+1:h.length;f=[e,a-1];b.registers["for"][this.name]=a}g=h.slice(f[0],f[1]);if(!g||g.length==0){return""}b.stack(function(){var j=g.length;g.each(function(l,k){b.set(i.variableName,l);b.set("forloop",{name:i.name,length:j,index:(k+1),index0:k,rindex:(j-k),rindex0:(j-k-1),first:(k==0),last:(k==(j-1))});c.push((i.renderAll(i.nodelist,b)||[]).join(""))})});return[c].flatten().join("")}}));Liquid.Template.registerTag("if",Liquid.Block.extend({tagSyntax:/("[^"]+"|'[^']+'|[^\s,|]+)\s*([=!<>a-z_]+)?\s*("[^"]+"|'[^']+'|[^\s,|]+)?/,init:function(a,b,c){this.nodelist=[];this.blocks=[];this.pushBlock("if",b);this._super(a,b,c)},unknownTag:function(a,b,c){if(["elsif","else"].include(a)){this.pushBlock(a,b)}else{this._super(a,b,c)}},render:function(c){var b=this,a="";c.stack(function(){for(var d=0;d<b.blocks.length;d++){var e=b.blocks[d];if(e.evaluate(c)){a=b.renderAll(e.attachment,c);return}}});return[a].flatten().join("")},pushBlock:function(a,c){var g;if(a=="else"){g=new Liquid.ElseCondition()}else{var f=c.split(/\b(and|or)\b/).reverse(),e=f.shift().match(this.tagSyntax);if(!e){throw ("Syntax Error in tag '"+a+"' - Valid syntax: "+a+" [expression]")}var h=new Liquid.Condition(e[1],e[2],e[3]);while(f.length>0){var b=f.shift(),e=f.shift().match(this.tagSyntax);if(!e){throw ("Syntax Error in tag '"+a+"' - Valid syntax: "+a+" [expression]")}var d=new Liquid.Condition(e[1],e[2],e[3]);d[b](h);h=d}g=h}g.attach([]);this.blocks.push(g);this.nodelist=g.attachment}}));Liquid.Template.registerTag("ifchanged",Liquid.Block.extend({render:function(c){var b=this,a="";c.stack(function(){var d=b.renderAll(b.nodelist,c).join("");if(d!=c.registers.ifchanged){a=d;c.registers.ifchanged=a}});return a}}));Liquid.Template.registerTag("include",Liquid.Tag.extend({tagSyntax:/((?:"[^"]+"|'[^']+'|[^\s,|]+)+)(\s+(?:with|for)\s+((?:"[^"]+"|'[^']+'|[^\s,|]+)+))?/,init:function(a,b,e){var d=(b||"").match(this.tagSyntax);if(d){this.templateName=d[1];this.templateNameVar=this.templateName.substring(1,this.templateName.length-1);this.variableName=d[3];this.attributes={};var c=b.match(/(\w*?)\s*\:\s*("[^"]+"|'[^']+'|[^\s,|]+)/g);if(c){c.each(function(f){f=f.split(":");this.attributes[f[0].strip()]=f[1].strip()},this)}}else{throw ("Error in tag 'include' - Valid syntax: include '[template]' (with|for) [object|collection]")}this._super(a,b,e)},render:function(e){var c=this,f=Liquid.readTemplateFile(e.get(this.templateName)),b=Liquid.parse(f),d=e.get((this.variableName||this.templateNameVar)),a="";e.stack(function(){c.attributes.each=hackObjectEach;c.attributes.each(function(g){e.set(g.key,e.get(g.value))});if(d instanceof Array){a=d.map(function(g){e.set(c.templateNameVar,g);return b.render(e)})}else{e.set(c.templateNameVar,d);a=b.render(e)}});a=[a].flatten().join("");return a}}));Liquid.Template.registerTag("unless",Liquid.Template.tags["if"].extend({render:function(c){var b=this,a="";c.stack(function(){var e=b.blocks[0];if(!e.evaluate(c)){a=b.renderAll(e.attachment,c);return}for(var d=1;d<b.blocks.length;d++){var e=b.blocks[d];if(e.evaluate(c)){a=b.renderAll(e.attachment,c);return}}});return[a].flatten().join("")}}));Liquid.Template.registerFilter({size:function(a){return(a.length)?a.length:0},downcase:function(a){return a.toString().toLowerCase()},upcase:function(a){return a.toString().toUpperCase()},capitalize:function(a){return a.toString().capitalize()},escape:function(a){a=a.toString();a=a.replace(/&/g,"&amp;");a=a.replace(/</g,"&lt;");a=a.replace(/>/g,"&gt;");a=a.replace(/"/g,"&quot;");return a},h:function(a){a=a.toString();a=a.replace(/&/g,"&amp;");a=a.replace(/</g,"&lt;");a=a.replace(/>/g,"&gt;");a=a.replace(/"/g,"&quot;");return a},truncate:function(b,d,c){if(!b||b==""){return""}d=d||50;c=c||"...";var a=b.slice(0,d);return(b.length>d?b.slice(0,d)+c:b)},truncatewords:function(b,e,c){if(!b||b==""){return""}e=parseInt(e||15);c=c||"...";var d=b.toString().split(" "),a=Math.max((e),0);return(d.length>a)?d.slice(0,a).join(" ")+c:b},truncate_words:function(b,e,c){if(!b||b==""){return""}e=parseInt(e||15);c=c||"...";var d=b.toString().split(" "),a=Math.max((e),0);return(d.length>a)?d.slice(0,a).join(" ")+c:b},strip_html:function(a){return a.toString().replace(/<.*?>/g,"")},strip_newlines:function(a){return a.toString().replace(/\n/g,"")},join:function(a,b){b=b||" ";return a.join(b)},split:function(a,b){b=b||" ";return a.split(b)},sort:function(a){return a.sort()},reverse:function(a){return a.reverse()},replace:function(a,b,c){c=c||"";return a.toString().replace(new RegExp(b,"g"),c)},replace_first:function(a,b,c){c=c||"";return a.toString().replace(new RegExp(b,""),c)},newline_to_br:function(a){return a.toString().replace(/\n/g,"<br/>\n")},date:function(a,c){var b;if(a instanceof Date){b=a}if(!(b instanceof Date)&&a=="now"){b=new Date()}if(!(b instanceof Date)){b=new Date(a)}if(!(b instanceof Date)){b=new Date(Date.parse(a))}if(!(b instanceof Date)){return a}return b.strftime(c)},first:function(a){return a[0]},last:function(a){a=a;return a[a.length-1]}});if(!(new Date()).strftime){(function(){Date.ext={};Date.ext.util={};Date.ext.util.xPad=function(a,c,b){if(typeof(b)=="undefined"){b=10}for(;parseInt(a,10)<b&&b>1;b/=10){a=c.toString()+a}return a.toString()};Date.prototype.locale="en-GB";if(document.getElementsByTagName("html")&&document.getElementsByTagName("html")[0].lang){Date.prototype.locale=document.getElementsByTagName("html")[0].lang}Date.ext.locales={};Date.ext.locales.en={a:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],A:["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],b:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],B:["January","February","March","April","May","June","July","August","September","October","November","December"],c:"%a %d %b %Y %T %Z",p:["AM","PM"],P:["am","pm"],x:"%d/%m/%y",X:"%T"};Date.ext.locales["en-US"]=Date.ext.locales.en;Date.ext.locales["en-US"].c="%a %d %b %Y %r %Z";Date.ext.locales["en-US"].x="%D";Date.ext.locales["en-US"].X="%r";Date.ext.locales["en-GB"]=Date.ext.locales.en;Date.ext.locales["en-AU"]=Date.ext.locales["en-GB"];Date.ext.formats={a:function(a){return Date.ext.locales[a.locale].a[a.getDay()]},A:function(a){return Date.ext.locales[a.locale].A[a.getDay()]},b:function(a){return Date.ext.locales[a.locale].b[a.getMonth()]},B:function(a){return Date.ext.locales[a.locale].B[a.getMonth()]},c:"toLocaleString",C:function(a){return Date.ext.util.xPad(parseInt(a.getFullYear()/100,10),0)},d:["getDate","0"],e:["getDate"," "],g:function(a){return Date.ext.util.xPad(parseInt(Date.ext.util.G(a)/100,10),0)},G:function(c){var e=c.getFullYear();var b=parseInt(Date.ext.formats.V(c),10);var a=parseInt(Date.ext.formats.W(c),10);if(a>b){e++}else{if(a===0&&b>=52){e--}}return e},H:["getHours","0"],I:function(b){var a=b.getHours()%12;return Date.ext.util.xPad(a===0?12:a,0)},j:function(c){var a=c-new Date(""+c.getFullYear()+"/1/1 GMT");a+=c.getTimezoneOffset()*60000;var b=parseInt(a/60000/60/24,10)+1;return Date.ext.util.xPad(b,0,100)},m:function(a){return Date.ext.util.xPad(a.getMonth()+1,0)},M:["getMinutes","0"],p:function(a){return Date.ext.locales[a.locale].p[a.getHours()>=12?1:0]},P:function(a){return Date.ext.locales[a.locale].P[a.getHours()>=12?1:0]},S:["getSeconds","0"],u:function(a){var b=a.getDay();return b===0?7:b},U:function(e){var a=parseInt(Date.ext.formats.j(e),10);var c=6-e.getDay();var b=parseInt((a+c)/7,10);return Date.ext.util.xPad(b,0)},V:function(e){var c=parseInt(Date.ext.formats.W(e),10);var a=(new Date(""+e.getFullYear()+"/1/1")).getDay();var b=c+(a>4||a<=1?0:1);if(b==53&&(new Date(""+e.getFullYear()+"/12/31")).getDay()<4){b=1}else{if(b===0){b=Date.ext.formats.V(new Date(""+(e.getFullYear()-1)+"/12/31"))}}return Date.ext.util.xPad(b,0)},w:"getDay",W:function(e){var a=parseInt(Date.ext.formats.j(e),10);var c=7-Date.ext.formats.u(e);var b=parseInt((a+c)/7,10);return Date.ext.util.xPad(b,0,10)},y:function(a){return Date.ext.util.xPad(a.getFullYear()%100,0)},Y:"getFullYear",z:function(c){var b=c.getTimezoneOffset();var a=Date.ext.util.xPad(parseInt(Math.abs(b/60),10),0);var e=Date.ext.util.xPad(b%60,0);return(b>0?"-":"+")+a+e},Z:function(a){return a.toString().replace(/^.*\(([^)]+)\)$/,"$1")},"%":function(a){return"%"}};Date.ext.aggregates={c:"locale",D:"%m/%d/%y",h:"%b",n:"\n",r:"%I:%M:%S %p",R:"%H:%M",t:"\t",T:"%H:%M:%S",x:"locale",X:"locale"};Date.ext.aggregates.z=Date.ext.formats.z(new Date());Date.ext.aggregates.Z=Date.ext.formats.Z(new Date());Date.ext.unsupported={};Date.prototype.strftime=function(a){if(!(this.locale in Date.ext.locales)){if(this.locale.replace(/-[a-zA-Z]+$/,"") in Date.ext.locales){this.locale=this.locale.replace(/-[a-zA-Z]+$/,"")}else{this.locale="en-GB"}}var c=this;while(a.match(/%[cDhnrRtTxXzZ]/)){a=a.replace(/%([cDhnrRtTxXzZ])/g,function(e,d){var g=Date.ext.aggregates[d];return(g=="locale"?Date.ext.locales[c.locale][d]:g)})}var b=a.replace(/%([aAbBCdegGHIjmMpPSuUVwWyY%])/g,function(e,d){var g=Date.ext.formats[d];if(typeof(g)=="string"){return c[g]()}else{if(typeof(g)=="function"){return g.call(c,c)}else{if(typeof(g)=="object"&&typeof(g[0])=="string"){return Date.ext.util.xPad(c[g[0]](),g[1])}else{return d}}}});c=null;return b}})()}var cbSplit;if(!cbSplit){cbSplit=function(i,f,e){if(Object.prototype.toString.call(f)!=="[object RegExp]"){return cbSplit._nativeSplit.call(i,f,e)}var c=[],a=0,d=(f.ignoreCase?"i":"")+(f.multiline?"m":"")+(f.sticky?"y":""),f=RegExp(f.source,d+"g"),b,g,h,j;i=i+"";if(!cbSplit._compliantExecNpcg){b=RegExp("^"+f.source+"$(?!\\s)",d)}if(e===undefined||+e<0){e=Infinity}else{e=Math.floor(+e);if(!e){return[]}}while(g=f.exec(i)){h=g.index+g[0].length;if(h>a){c.push(i.slice(a,g.index));if(!cbSplit._compliantExecNpcg&&g.length>1){g[0].replace(b,function(){for(var k=1;k<arguments.length-2;k++){if(arguments[k]===undefined){g[k]=undefined}}})}if(g.length>1&&g.index<i.length){Array.prototype.push.apply(c,g.slice(1))}j=g[0].length;a=h;if(c.length>=e){break}}if(f.lastIndex===g.index){f.lastIndex++}}if(a===i.length){if(j||!f.test("")){c.push("")}}else{c.push(i.slice(a))}return c.length>e?c.slice(0,e):c};cbSplit._compliantExecNpcg=/()??/.exec("")[1]===undefined;cbSplit._nativeSplit=String.prototype.split}String.prototype.split=function(b,a){return cbSplit(this,b,a)};