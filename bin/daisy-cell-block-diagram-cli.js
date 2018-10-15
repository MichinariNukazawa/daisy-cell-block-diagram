#!/usr/bin/env node
//'use strict';

const sprintf = require('sprintf-js').sprintf;

const DaisyIO = require('../index').DaisyIO;

function main()
{
	// コマンドライン引数を[1]からに調整(node実行の場合に必要)
	let argv = process.argv;
	if(argv[0].endsWith('node')){
		argv.shift();
	}

	//for(let i = 0;i < argv.length; i++){
	//	console.debug("argv[" + i + "] = " + argv[i]);
	//}

	if(argv.length <= 2 || 3 < argv.length){
		process.stderr.write(sprintf("invalid arguments:%d.\n", argv.length));
		process.exit(-1);
	}

	const arg = {
		'open_filepath': argv[1],
		'export_filepath': argv[2]
	};

	let err = {};
	let diagram = DaisyIO.open_diagram_from_path(arg.open_filepath, err);
	if(! diagram){
		process.stderr.write(sprintf("can not open file `%s``%s`.\n", err.message, arg.open_filepath));
		process.exit(-1);
	}

	if(0 != DaisyIO.export_diagram(arg.export_filepath, diagram, err)){
		process.stderr.write(sprintf("can not export file `%s``%s`.\n", err.message, arg.export_filepath));
		process.exit(-1);
	}

}

main();

