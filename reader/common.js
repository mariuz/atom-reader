var KEY_ENTER= 13;
var KEY_ESC  = 27;
var KEY_LEFT = 37;
var KEY_UP   = 38;
var KEY_RIGHT= 39;
var KEY_DOWN = 40;
var KEY_F1   = 112;
var KEY_PLUS = 43;
var KEY_MINUS= 45;
var KEY_DELETE = 46;
var KEY_BACKSPACE = 8;
var KEY_TAB = 9;
var KEY_DOT = 46;
var KEY_A   = 65;
var KEY_0   = 48;
var KEY_SHIFT = 16;

var Class = {
  create: function() {
    return function() {
      this.initialize.apply(this, arguments);
    }
  }
}

Function.prototype.bind = function() {
  var __method = this, args = $.clone(arguments), object = args.shift();
  return function() {
    return __method.apply(object, args.concat($.clone(arguments)));
  }
}

jQuery.fn.extend({
    enter: function(fn){
        if (!fn) {
            return this[0].onkeypress({type: 'keypress', 
                                target: node[0], keyCode: KEY_ENTER});
        }

        this.keypress(function(event) {
            event = jQuery.event.fix( event || window.event || {} ); 
            var code =  event.keyCode? event.keyCode : event.charCode;
            if (code == KEY_ENTER) {
                event.preventDefault();
                event.stopPropagation();
                fn(event);
                return false;
            }
            
            return true; 
        });
        return this;
    },

    positionedOffset: function() {
            var element = this[0];
            var valueT = 0, valueL = 0;
            do {
                valueT += element.offsetTop  || 0;
                valueL += element.offsetLeft || 0;
                element = element.offsetParent;

                if (element) {
                    if(element.tagName=='BODY') break;
                    var p = this.css('position');
                    if (p == 'relative' || p == 'absolute') break;
                }
            } while (element);
            return [valueL, valueT];
    },

    datafield: function() {
        var anchor = this[0];
        switch (anchor.nodeName) {
        case 'INPUT':
        case 'input':
            return 'value';
            
        case 'a':
        case 'A':
            return 'href';
            
/* // We dont use this
        case 'IMG':
            return 'src'; 
*/            
        default:
            return 'innerHTML';
        }
    },
                 
    getdata: function() {
        return this[0][this.datafield()];
    },

    setdata: function(value) {
        var node = this;
        try {
            node.each(function() {this[$(this).datafield()] = value});
        } catch(e) {
        }
        return this; // chain
    },

    clear: function() {
        var node = this;
        node.each(function() {$(this).setdata('');});
        return node;
    },

    maketab: function(header_expr, content_expr) {
        var node = this;

        $('.'+content_expr, node).hide();
        var hdrs = $('.'+header_expr, this);
        hdrs.click(function(event) {
            event = jQuery.event.fix( event || window.event || {} );  

            $('.'+content_expr, node).hide(); 
            $('.'+header_expr, node).removeClass(header_expr + "-selected"); 
        
            var hdr = $(event.target); 

            if ($(event.target).is('.'+header_expr)) 
                hdr = $(event.target); 
            else
                hdr = $(event.target).parents('.'+header_expr); 


            $("#" + hdr.addClass(header_expr + "-selected").
                    attr('id') + '-contents').show();

        });

        $(hdrs[0]).click();
    },
    
    addnodes: function(node) {
        var arr = [];
        this.each(function() {arr.push(this);});
        node.each(function() {arr.push(this);});
        
        return $(arr);
    }
});

jQuery.extend({
    uniq: function(first) {
            var second = [];
            jQuery.each(first, function(i,v) {
                            jQuery.merge(second, [v]);
                        });
            return second;
        },

    keys: function(object) {
        var keys = [];
        for (var property in object) {
            if (object[property] != undefined)
                keys.push(property);
        }
        return keys;
    },
    
    values: function(object) {
        var values = [];
        for (var property in object)
            values.push(object[property]);
        return values;
    },

    indexOf: function(obj, value) {
        try {
		    for ( var i = 0, ol = obj.length; i < ol; i++ )
                if (obj[i] == value) return i;
        } catch(e) {
        }
        return -1;
    },

    clone: function(iterable) {
        if (!iterable) return [];
        var results = [];
        for (var i = 0; i < iterable.length; i++)
            results.push(iterable[i]);
        return results;
    }
});

function get_scaling(arr) {
    var max = -1;
    $.each(arr, function(i, val) {
        if (max < val)
            max = val;
    });

    return {scalemax: max,
            scale2: parseInt(2*max/3),
            scale1: parseInt(1*max/3),
            scale0: 0};
}

function currentTime() {
    var d = new Date();
    return d.getTime();
}

function timeExpired(timestamp, interval) {
    return currentTime() - timestamp > interval;
}

Array.prototype.toArray = Array.prototype.clone;

var $break = {}, $continue = new Error('"throw $continue" is deprecated, use "return" instead');

function keycode(letter) {
    if (letter.match(/[a-zA-Z]/)) {
        return KEY_A + (letter.charCodeAt(0) - 'a'.charCodeAt(0));
    }

    if (letter.match(/[0-9]/)) {
        return KEY_0 + (letter.charCodeAt(0) - '0'.charCodeAt(0));
    }
}

function with_shift(str) {
    return str + '_' + MOD_SHIFT;
}

const MOD_NONE = 0;
const MOD_SHIFT = 1;
const MOD_ALT   = 2;
const MOD_CTRL  = 4;