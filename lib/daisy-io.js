'use strict';

const sprintf = require('sprintf-js').sprintf;
const fs = require("fs");
const xml_formatter = require('xml-formatter');

const Version = require('./version');
const Diagram = require('./diagram');
const RenderingHandle = require('./renderer').RenderingHandle;
const Renderer = require('./renderer').Renderer;

module.exports = class DaisyIO{
	static set_err_(err_, level, label, message)
	{
		err_.level = level;
		err_.label = label;
		err_.message = message;
	}

	/** @return success: diagram object, error: null */
	static open_diagram_from_path(filepath, err_)
	{
		let strdata = '';
		try{
			strdata = fs.readFileSync(filepath, 'utf-8');
		}catch(err){
			console.debug(err);
			DaisyIO.set_err_(err_, 'warning', "Open", err.message);
			return -1;
		}

		let raw_diagram = {};
		try{
			raw_diagram = JSON.parse(strdata);
		}catch(err){
			console.debug(err);
			DaisyIO.set_err_(err_, 'warning', "Open", err.message);
			return null;
		}

		const sanitized_diagram = Diagram.sanitize_document(raw_diagram, err_);
		if(null === sanitized_diagram){
			return null;
		}

		return sanitized_diagram.diagram;
	}

	static export_diagram(filepath, diagram, err_)
	{
		// 周辺情報: 0x0pxのSVGを開くとeye of gnomeが読み込みエラーを起こす。

		const diagramSize = Diagram.getSize(diagram);
		//console.debug(diagramSize);
		/*
		const strdata = sprintf(
			'<?xml version="1.0" encoding="utf-8"?><svg width="%dpx" height="%dpx"></svg>',
			diagramSize.width,
			diagramSize.height);
		*/

		let err = {};
		const strdata = DaisyIO.get_svg_string_from_diagram_(diagram, err);

		try{
			fs.writeFileSync(filepath, strdata);
		}catch(err){
			DaisyIO.add_err_(err_, "warning", "Export", sprintf("writeFile error. :`%s`", filepath));
			return -1;
		}

		return 0;
	}

	static get_dummy_draw_diagram_(diagram, err_)
	{
		let dummy_elem = document.createElementNS('http://www.w3.org/2000/svg','svg');
		let dummy_rhandle = new RenderingHandle(dummy_elem);
		let draw = dummy_rhandle.get_draw();
		if(null === draw){
			DaisyIO.set_err_(err_, "warning", "Export", "internal dummy element can not generate.");
			return null;
		}

		Renderer.rendering_(dummy_rhandle, diagram);
		Renderer.expand_diagram_margin_for_export(dummy_rhandle, diagram);

		dummy_rhandle.get_editor_group().remove();

		return draw;
	}

	static get_svg_string_from_diagram_(diagram, err_)
	{
		let draw = DaisyIO.get_dummy_draw_diagram_(diagram, err_);
		if(null === draw){
			return null;
		}

		let s = draw.svg();

		const h = sprintf("<!-- Generator: %s %s  -->", Version.get_name(), Version.get_version());
		s = h + s;

		let options = {indentation: '\t',};
		return xml_formatter(s, options);
	}
};

