/*
 *    yocto-reader - A light-weight RSS reader aggregator prototype, version 0.2
 *                   (http://yocto-reader.flouzo.net/)
 *
 *    Copyright (C) 2007 Loic Dachary (loic@dachary.org) 
 *    Copyright (C) 2007 Chandan Kudige (chandan@nospam.kudige.com)
 *
 *    This program is free software: you can redistribute it and/or modify
 *    it under the terms of the GNU Affero General Public License as
 *    published by the Free Software Foundation, either version 3 of the
 *    License, or (at your option) any later version.
 *
 *    This program is distributed in the hope that it will be useful,
 *    but WITHOUT ANY WARRANTY; without even the implied warranty of
 *    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *    GNU Affero General Public License for more details.
 *
 *    You should have received a copy of the GNU Affero General Public License
 *    along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

/*
 * Extensions to jQuery DOM wrapper to render javascript objects
 * and arrays into appropriate HTML templated nodes.
 *
 * Author: Chandan Kudige (2007)
 */

jQuery.fn.extend({
/*
 * Populate an HTML node with attributes from a javascript object.
 * object can be an array or a dictionary
 *
 * For each attribute of the object, the dom elements whose
 * classname contains the attribute name with a prefix ('fld-')
 * are determined, and is populated by value of that attribute
 */
    populate: function(object, template) {
        if (typeof(object) == typeof([]) &&
            object.length != undefined) {
            return this.populateArray(object, template);
        }

        return this.populateObject(object);
    },

/*
 * Populate HTML template nodes with items from an array
 * and append the nodes to 'this' node(s).
 *
 * Returns an array of bindings, one item for each element
 * of the array.
 *  each binding has
 *  node - newly created HTML node for the element
 *  obj  - corresponding element in the array 
 */ 
    populateArray: function(array_object, template) {
        var node = this;

        if (typeof(template) == typeof('')) {
            template = $(template, $("#templates"));
        }

        var bindings = new Array;
        
        $.each(array_object, function(i, prop) {
                if (typeof(prop) != typeof(function(){})) {
                    var newnode = template.clone(true).
                    appendTo(node).populateObject(prop);

                    bindings.push({node: newnode, obj: prop});
                }
        });
        
        return bindings;
    },
    
/*
 * Populate HTML node with the given object attributes.
 * 
 * Returns the modified nodeset for chaining
 */
    populateObject: function(json) {
        node = this;
        if (typeof(json) == typeof('')) {
            json = {'name' : json};
        }
        
        for (property in json) {
            var set;
            if (node.is('.fld-' + property))
                set = node;
            else
                set = $('.fld-' + property, node);
            
            set.each(
                function() {
                    var node = $(this);
                    if (property == 'icon') {
                        this.style.backgroundImage = 'url("themes/default/' + 
                            json[property] + '")';
                    } else {
                        $(this).setdata(json[property]);
                    }
                });
            
        }
        
        return node; // chain
    },

/*
 * This variant populates an HTML node with and item and an array of entries
 * (item is the feed attributes, array is the feed entries.
 * Used for the Summary View
 *
 * properties and rootpath are for internal use.
 */
    populateFeed : function(obj, properties, rootpath) {
        var target = this;

        if (!properties)
            properties = {};
        if (!rootpath)
            rootpath = '';
        
        var path;
        
        for (var p in obj) {
            path = rootpath;
            if (path)
                path += '-';
            path += p;
            
            if (typeof (obj [p]) == typeof("")) {
                properties[path] = obj[p];
            }            
        }
        
        target.populate(properties);
        
        for (var p in obj) {
            path = rootpath;
            if (path)
                path += '-';
            path += p;
            
            if (typeof (obj [p]) == "object") {
                var ts = $('.fld-'+p, target);
                var rt = ts.clone(true);
                
                for (var i = 0, j = obj [p].length; i < j; i++) {
                    ts.populateFeed(obj[p][i], properties, path);
                    if (i < j - 1) {
                        ts.after(rt.clone(true));
                        
                        ts = ts.next();
                    }
                }
            }
        }
        
        return target; // chain
    }
});

/*
 * Generic function to populate folders and tags
 * for folder chooser dropdowns
 */
function populateFolders(topnode, feed, callback) {
    var dropdown = $("ul.contents", topnode);
    var folders = FR_folderForFeed(feed);
    var allfolders = FR_allFolders();
    $.merge(allfolders, FR_allTags());

    dropdown.children().remove();
    var addfolder = true;

    // Function called when the user clicks on a folder/tag in the dropdown
    var fn = function(event) {
        event = jQuery.event.fix( event || window.event || {} ); 
        
        var folder = event.target.innerHTML;

        if (folder == FS_new_tag) {
            folder = prompt(FS_enter_new_tag);
            if (!folder)
                return;
        }

        var remove = $(event.target).is('.chooser-item-selected');

        if (remove) {
            FR_removeFromFolder(feed, folder);
        } else {
            FR_copyToFolder(feed, folder);
        }
        Reader.refresh();
        dropdown.addClass('hidden');

        // Invoke the app callback if needed
        if (callback) {
            callback(feed, folder, 
                     $(event.target).is('.chooser-item-selected'),
                     topnode);
        }

        // Re-populate the dropdown
        populateFolders(topnode, feed, callback);
    }


    $.each(allfolders, function(i, folder) {
        var li = $(document.createElement('li')).addClass('chooser-item')
           .setdata(folder).appendTo(dropdown).click(fn);
        if ($.indexOf(folders, folder) >= 0) {
            li.addClass('chooser-item-selected');
            addfolder = false;
        }
    });

    $(document.createElement('li')).addClass('chooser-item')
        .setdata(FS_new_tag).appendTo(dropdown).click(fn).addClass('newfolder');
    
    var strprompt = FS_change_folders;
    if (addfolder) {
        strprompt = FS_add_to_folder; 
    }

    $('.prompt', topnode).setdata(strprompt);
}

/*
 * Just like jQuery extend function,
 * but copy attributes with an optional prefix
 */

function objectCopy(dest, src, prefix) {
    if (!prefix)
        prefix = '';
    
    for (p in src) {
        if (typeof(src[p]) == typeof('')) {
            dest[prefix + p] = src[p];
        }
    }
    
    return dest;
}

