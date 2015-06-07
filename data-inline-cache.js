var can = require("can/util/util");
var connect = require("can-connect");
var pipe = require("./helpers/pipe");
var sortedSetJSON = require("./helpers/sorted-set-json");

/**
 * @module can-connect/data-inline-cache
 * 
 * Makes requests use a global `INLINE_CACHE` object for data a "single time".
 * 
 * `INILNE_CACHE` might look like:
 * 
 * ```
 * INLINE_CACHE = {
 *   "todos": {
 * 	   1: {id: 1, name: "dishes"},
 *     "{\"completed\": true}": {data: [{...},{...}]} 
 *   }
 * }
 * ```
 * 
 * This would use this inline cache for the data for a `.findOne({id: 1})`
 * and a `.findAll({completed: true})` request for a connection named "todos".
 * 
 * 
 * @param {{}} options
 * 
 *   @option {String} name The name is used to identify which property in INLINE_CACHE this connection
 *   should look for IDs in.
 */
module.exports = connect.behavior("data-inline-cache",function(baseConnect, options){

	if(typeof INLINE_CACHE === "undefined") {
		// do nothing if no INLINE_CACHE when this module loads.  INLINE_CACHE has to be before steal.
		return {};
	}
	
	var getData = function(id){
		var type = INLINE_CACHE[options.name];
		if(type) {
			var data = type[id];
			if( data ) {
				// delete so it can't be used again
				delete type[id];
				return data;
			}
		}
	};
	
	return {
		getListData: function(set){
			var id = sortedSetJSON(set);
			var data = getData(id);
			if(data !== undefined) {
				if(options.cacheConnection) {
					options.cacheConnection.updateListData(data, set);
				}
				return new can.Deferred().resolve(data);
			} else {
				return baseConnect.getListData.apply(this, arguments);
			}
		},
		getInstanceData: function(params){
			var id = this.id(params);
			var data = getData(id);
			if(data !== undefined) {
				if(options.cacheConnection) {
					options.cacheConnection.updateInstanceData(data);
				}
				return new can.Deferred().resolve(data);
			} else {
				return baseConnect.getInstanceData.apply(this, arguments);
			}
		}
	};
	
	
	return behavior;
});