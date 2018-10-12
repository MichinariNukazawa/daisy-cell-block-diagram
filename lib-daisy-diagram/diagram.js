'use strict';

const ObjectUtil = require('./object_util');

module.exports = class Diagram{

	static sanitize_document(src_diagram, err_)
	{
		if(! src_diagram.hasOwnProperty('diagram')){
			err_.message = 'nothing property `diagram`';
			return null;
		}

		const file_kind = ObjectUtil.getPropertyFromPath(src_diagram, 'file_kind');
		if(null === file_kind){
			err_.message = 'nothing property `file_kind`';
			return null;
		}
		if('daisy diagram' != file_kind){
			err_.message = sprintf('invalid `file_kind`:%s`', file_kind);
			return null;
		}

		//! @todo not implement
		// check tree
		// check property

		return ObjectUtil.deeepcopy(src_diagram);
	}

	static getMemberOrDefault(diagram, property_path)
	{
		const default_diagram = {
			"property":{
				"cell_block_size": {"width": 128, "height": 64},
				"cell_block_margin": {"width": 0, "height": 0},
			},
		};
		const member = ObjectUtil.getPropertyFromPath(diagram, property_path);
		if(member){
			return member;
		}

		return ObjectUtil.getPropertyFromPath(default_diagram, property_path);
	}

	static getOneCellBlockSize(diagram)
	{
		return Diagram.getMemberOrDefault(diagram, 'property.cell_block_size');
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
		if(! ObjectUtil.getPropertyFromPath(diagram, 'element_tree')){
			return [0,0];
		}

		let area = [0,0];
		for(let i = 0; i < diagram.element_tree.length; i++){
			const element = diagram.element_tree[i];
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

