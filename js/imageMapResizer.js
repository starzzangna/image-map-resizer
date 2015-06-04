/*! Image Map Resizer
 *  Desc: Resize HTML imageMap to scaled image.
 *  Copyright: (c) 2014-15 David J. Bradshaw - dave@bradshaw.net
 *  License: MIT
 */

(function(){
    'use strict';

    function scaleImageMap(){

        function resizeMap() {
            function resizeAreaTag(cachedAreaCoords,idx){
                function scale(coord){
                    return Math.floor(Number(coord) * scallingFactor[(1===(isWidth = 1-isWidth) ? 'width' : 'height')]);
                }

                var isWidth = 0;

                areas[idx].coords = cachedAreaCoords.split(',').map(scale).join(',');
            }

            var scallingFactor = {
                width  : image.width  / image.naturalWidth,
                height : image.height / image.naturalHeight
            };

            cachedAreaCoordsArray.forEach(resizeAreaTag);
        }

        function getCoords(e){
            // normalize coord-string to csv format without any space chars
            return e.coords.replace(/ *, */g,',').replace(/ +/g,',');
        }

        function debounce() {
            clearTimeout(timer);
            timer = setTimeout(resizeMap, 250);
        }

        function start(){
            if ((image.width !== image.naturalWidth) || (image.height !== image.naturalHeight)) {
                resizeMap();
            }
        }

        function attach(){
            map.resize = resizeMap; //Bind resize method to HTML map element
            image.addEventListener('onload', resizeMap, false); //Detect late image loads in IE11
            window.addEventListener('resize', debounce, false);
        }

        function beenHere(){
            var retCode = false;

            if (undefined !== map.dataset){
                if (map.dataset.imageMapResizer){
                    retCode = true;
                    console.warn('[ImageMapResize] Already bound to map element.\nUse document.getElementsByName(\'' + map.name + '\')[0].resize(); to force resize.');
                } else {
                    map.dataset.imageMapResizer = true;
                }
            }

            return retCode;
        }

        var
            /*jshint validthis:true */
            map                   = this, 
            areas                 = map.getElementsByTagName('area'),
            cachedAreaCoordsArray = Array.prototype.map.call(areas, getCoords),
            image                 = document.querySelector('img[usemap="#'+map.name+'"]'),
            timer                 = null;

        if (!beenHere()){
            attach();
            start(); 
        }
    }



    function factory(){
        function init(element){
            if(!element.tagName) {
                throw new TypeError('Object is not a valid DOM element');
            } else if ('MAP' !== element.tagName.toUpperCase()) {
                throw new TypeError('Expected <MAP> tag, found <'+element.tagName+'>.');
            }
 
            scaleImageMap.call(element);
        }

        return function imageMapResizeF(target){
            switch (typeof(target)){
                case 'undefined':
                case 'string':
                    Array.prototype.forEach.call(document.querySelectorAll(target||'map'),init);
                    break;
                case 'object':
                    init(target);
                    break;
                default:
                    throw new TypeError('Unexpected data type ('+typeof(target)+').');
            }
        };
    }


    if (typeof define === 'function' && define.amd) {
        define([],factory);
    } else if (typeof module === 'object' && typeof module.exports === 'object'){ 
        module.exports = factory(); //Node for browserfy
    } else {
        window.imageMapResize = factory();
    }

    if('jQuery' in window) {
        jQuery.fn.imageMapResize = function $imageMapResizeF(){
            return this.filter('map').each(scaleImageMap).end();
        };
    }

})();
