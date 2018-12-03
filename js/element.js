'use strict';

module.exports = class Element{
	static recursive(obj, func, func_opt)
	{
		return this.recursive_(true, obj, func, func_opt);
	}
	static recursive_top_reverse(obj, func, func_opt)
	{
		return this.recursive_(false, obj, func, func_opt);
	}

	static recursive_(is_top_order, obj, func, func_opt)
	{
		let recurse_info = {
			'level': 0,
			'count': 0,
			'last_element': null,
			'parent_objs': [],
			'get_parent_id': function(){
				for(let i = this.level - 1; 0 <= i; i--){
					let obj = this.parent_objs[i];
					if(undefined === obj){
						continue;
					}
					if(null === obj){
						continue;
					}
					if(! obj.hasOwnProperty('kind')){// is element
						continue;
					}
					if(obj.hasOwnProperty('id')){
						return obj.id;
					}
				}
				return -1;
			},
		};

		let res = Element.recursive_inline_(recurse_info, obj, func, func_opt);
		return res;
	}

	static debug_recursive(message, recurse_info, element, opt){
		const parent_id = recurse_info.get_parent_id();
		console.debug("%s: id:%d level:%d count:%d parent:%d",
			message,
			element.id,
			recurse_info.level,
			recurse_info.count,
			parent_id);

		return true;
	}

	static recursive_inline_(recurse_info, obj, func, opt)
	{
		if(undefined === obj){
			return true;
		}
		if(null === obj){
			return true;
		}

		if(! Array.isArray(obj)){
			console.error('not array.', obj);
			return false;
		}

		for(let i = 0; i < obj.length; i++){
			const element = obj[i];

			if(element.hasOwnProperty('kind')){// is element
				Element.debug_recursive("debug", recurse_info, element, opt);

				recurse_info.count++;
				let res = func(recurse_info, element, opt);
				if(! res){
					Element.debug_recursive("func error", recurse_info, element, opt);
					return false;
				}
				recurse_info.last_element = element;
			}

			if(element.hasOwnProperty('child_elements')){
				recurse_info.level++;
				recurse_info.parent_objs[recurse_info.level] = element;
				if(! Element.recursive_inline_(recurse_info, element.child_elements, func, opt)){
					Element.debug_recursive("error", recurse_info, element, opt);
				}
				recurse_info.level--;
			}
		}

		return true;
	}
};

