'use strict';

module.exports = class Diagram{

	static sanitize(src_diagram, err_)
	{
		if(! src_diagram.hasOwnProperty('diagram')){
			err_.message = 'nothing property `diagram`';
			return null;
		}

		const filekind = ObjectUtil.getPropertyFromPath(src_diagram, 'filekind');
		if(null === filekind){
			err_.message = 'nothing property `filekind`';
			return null;
		}
		if('daisy diagram' != filekind){
			err_.message = sprintf('invalid `filekind`:%s`', filekind);
			return null;
		}

		//! @todo not implement
		// check tree
		// check property

		return ObjectUtil.deeepcopy(src_diagram);
	}

	static getSize(diagram)
	{
		const panelArea = Diagram.getPanelArea(diagram);
		return {
			'width':	(panelArea[0]) * 128,
			'height':	(panelArea[1]) * 64
		};
	}

	static getPanelArea(diagram)
	{
		if(! ObjectUtil.getPropertyFromPath(diagram, 'diagram.element_tree')){
			return [0,0];
		}

		let area = [0,0];
		for(let i = 0; i < diagram.diagram.element_tree.length; i++){
			const element = diagram.diagram.element_tree[i];
			area[0] = (area[0] > element.position[2])? area[0] : element.position[2];
			area[1] = (area[1] > element.position[3])? area[1] : element.position[3];
		}

		area[0] += 1;
		area[1] += 1;

		return area;
	}
};

/**** ############### ****/

class ObjectUtil{
	static deeepcopy(obj)
	{
		/*
		   let r = {};
		   for(let name in obj){
		   if(typeof obj[name] === 'object'){
		   r[name] = this.deep_clone_(obj[name]);
		   }else{
		   r[name] = obj[name];
		   }
		   }
		   return r;
		 */

		return JSON.parse(JSON.stringify(obj))
	}

	static removeKey(obj, keys)
	{
		if(obj instanceof Array){
			obj.forEach(function(item){
				ObjectUtil.removeKey(item,keys)
			});
		}
		else if(typeof obj === 'object'){
			Object.getOwnPropertyNames(obj).forEach(function(key){
				if(keys.indexOf(key) !== -1)delete obj[key];
				else ObjectUtil.removeKey(obj[key],keys);
			});
		}
	}

	static makeMember(obj, path, value)
	{
		const keys = path.split('.');
		let o = obj;
		for(let i = 0; i < keys.length; i++){
			if(undefined === o || null === o || typeof o !== 'object'){
				return false;
			}

			if(! o.hasOwnProperty(keys[i])){
				if(i !== (keys.length - 1)){
					o[keys[i]] = {};
				}else{
					o[keys[i]] = value;
				}
			}

			o = o[keys[i]];
		}

		return true;
	}

	static getPropertyFromPath(obj, path)
	{
		const keys = path.split('.');
		let o = obj;
		for(let i = 0; i < keys.length; i++){
			if(undefined === o || null === o || typeof o !== 'object'){
				return null;
			}
			if(! o.hasOwnProperty(keys[i])){
				return null;
			}else{
				o = o[keys[i]];
			}
		}

		return o;
	}
};

