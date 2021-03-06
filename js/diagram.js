'use strict';

const sprintf = require('sprintf-js').sprintf;

const ObjectUtil = require('./object-util');

module.exports = class Diagram{
	static set_err_(err_, level, label, message)
	{
		err_.level = level;
		err_.label = label;
		err_.message = message;
	}

	static add_errs_(errs_, level, label, message)
	{
		let err_ = {};
		DaisyIO.set_err_(err_, level, label, message);

		if(! Array.isArray(errs_)){
			console.error(errs_);
			errs_ = [];
		}
		errs_.push(err_);
	}

	static sanitize_document(src_document, errs_)
	{
		if(! src_document.hasOwnProperty('diagram')){
			add_errs_(errs_, 'error', 'Document', 'nothing property `diagram`');
			return null;
		}

		const file_kind = ObjectUtil.getPropertyFromPath(src_document, 'file_kind');
		if(null === file_kind){
			add_errs_(errs_, 'error', 'Document', 'nothing property `file_kind`');
			return null;
		}
		if('daisy diagram' != file_kind){
			add_errs_(errs_, 'error', 'Document', sprintf('invalid `file_kind`:%s`', file_kind));
			return null;
		}

		//! @todo not implement
		// check tree
		// check property

		return ObjectUtil.deepcopy(src_document);
	}

	static sanitize(src_diagram, errs_)
	{
		//! @todo not implement
		return ObjectUtil.deepcopy(src_diagram);
	}

	static create_from_native_format_string(strdata, errs_)
	{
		let native_doc = {};
		try{
			native_doc = JSON.parse(strdata);
		}catch(err){
			console.debug(err);
			DaisyIO.add_errs_(errs_, 'error', "Diagram", err.message);
			return null;
		}

		if(null === Diagram.sanitize_document(native_doc, errs_)){
			return null;
		}

		if(! native_doc.hasOwnProperty('diagram')){
			DaisyIO.add_errs_(errs_, 'error', "Diagram", 'nothing property "diagram"');
			return null;
		}

		const sanitized_diagram = Diagram.sanitize(native_doc.diagram, errs_);
		if(null === sanitized_diagram){
			return null;
		}

		return sanitized_diagram;
	}

	static getArrowMemberOrDefault(diagram, arrow, property_path)
	{
		const default_arrow = {
			"is_fill": false,
			"size": [16, 16],
		};
		const member = ObjectUtil.getPropertyFromPath(arrow, property_path);
		if(member){
			return member;
		}

		return ObjectUtil.getPropertyFromPath(default_arrow, property_path);
	}

	static getMemberOrDefault(diagram, property_path)
	{
		const default_diagram = {
			"property":{
				"cell_block":{
					"size":			{"x": 128, "y":  64},
					"parent_margin":	{"x":   0, "y":   0},
					"child_margin":		{"x":   8, "y":   8},
				},
				"print":{
					"margin":		{"x":  16, "y":  16},
					"background_color":	"rgba(255, 255, 255, 0.0)",
					"border_width":		0,
					"border_color":		"rgba(255, 255, 255, 0.0)",
				},
				"parent_block_style":{
					"text_size":		"22px",
					"text_anchor_x":	"middle",
					"text_color":		"rgba(  0,   0,   0, 1.0)",
					"border_radius":	0,
					"border_width":		2,
					"background_color":	"rgba(255, 255, 255, 1.0)",
					"foreground_color": 	"rgba(  0,   0,   0, 1.0)",
				}
			},
		};
		const member = ObjectUtil.getPropertyFromPath(diagram, property_path);
		if(member){
			return member;
		}

		return ObjectUtil.getPropertyFromPath(default_diagram, property_path);
	}

	static get_size(diagram)
	{
		const property__cell_block_size = Diagram.getMemberOrDefault(diagram, 'property.cell_block.size');
		const cellBlockArea = Diagram.getCellBlockArea_(diagram);
		return {
			'width' : (cellBlockArea[0]) * property__cell_block_size.x,
			'height': (cellBlockArea[1]) * property__cell_block_size.y
		};
	}

	static getCellBlockArea_(diagram)
	{
		if(! ObjectUtil.getPropertyFromPath(diagram, 'element_tree')){
			return [0,0];
		}

		//! @note child_elementsを包んでいることをfile-formatでが保証しているのでトップレベルのElementだけ見れば良い
		let area = [0,0];
		for(let i = 0; i < diagram.element_tree.length; i++){
			const element = diagram.element_tree[i];
			switch(element.kind){
				case 'block':
				{
					const footpos = [
						element.position[0] + element.position[2],
						element.position[1] + element.position[3]
					];
					area[0] = (area[0] > footpos[0])? area[0] : footpos[0];
					area[1] = (area[1] > footpos[1])? area[1] : footpos[1];
				}
					break;
				case 'line':
				{
					//! @todo not implement
				}
					break;
				default:
					console.error(sprintf("internal error: invalid element kind `%s`(%d,%d)",
							elements[i].kind,
							elements[i].id,
							i));
			}
		}

		return area;
	}
};

