'use strict';

const ObjectUtil = require('./object_util');

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

	static getOneCellBlockSize(diagram)
	{
		return {
			'width':	128,
			'height':	64
		};
	}

	static getSize(diagram)
	{
		const oneCellBlockSize = Diagram.getOneCellBlockSize(diagram);
		const panelArea = Diagram.getCellBlockArea(diagram);
		return {
			'width':	(panelArea[0]) * oneCellBlockSize.width,
			'height':	(panelArea[1]) * oneCellBlockSize.height
		};
	}

	static getBaseMargin(diagram)
	{
		return {
			'width':	16,
			'height':	16
		};
	}

	static getCellBlockArea(diagram)
	{
		if(! ObjectUtil.getPropertyFromPath(diagram, 'diagram.element_tree')){
			return [0,0];
		}

		let area = [0,0];
		for(let i = 0; i < diagram.diagram.element_tree.length; i++){
			const element = diagram.diagram.element_tree[i];
			const footpos = [
				element.position[0] + element.position[2],
				element.position[1] + element.position[3]
			];
			area[0] = (area[0] > footpos[0])? area[0] : footpos[0];
			area[1] = (area[1] > footpos[1])? area[1] : footpos[1];
		}

		return area;
	}
};

