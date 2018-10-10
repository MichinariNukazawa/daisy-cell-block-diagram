'use strict';

const sprintf = require('sprintf-js').sprintf;
const fs = require("fs");

const Diagram = require('./diagram');

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

		const sanitized_diagram = Diagram.sanitize(raw_diagram, err_);
		if(null === sanitized_diagram){
			return null;
		}

		return sanitized_diagram;
	}

	static export_diagram(filepath, diagram, err_)
	{
		// 周辺情報: 0x0pxのSVGを開くとeye of gnomeが読み込みエラーを起こす。

		const diagramSize = Diagram.getSize(diagram);
		//console.debug(diagramSize);
		const strdata = sprintf(
			'<?xml version="1.0" encoding="utf-8"?><svg width="%dpx" height="%dpx"></svg>',
			diagramSize.width,
			diagramSize.height);

		try{
			fs.writeFileSync(filepath, strdata);
		}catch(err){
			DaisyIO.add_err_(err_, "warning", "Export", sprintf("writeFile error. :`%s`", filepath));
			return -1;
		}

		return 0;
	}
};

