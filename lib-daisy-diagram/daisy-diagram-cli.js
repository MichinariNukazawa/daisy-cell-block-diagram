
const sprintf = require('sprintf-js').sprintf;
const fs = require("fs");
const path = require('path');

class DaisyIO{
	static set_err_(err_, level, label, message)
	{
		err_.level = level;
		err_.label = label;
		err_.message = message;
	}

	static open_doc_from_path(filepath, err_)
	{
		let strdata = '';
		try{
			strdata = fs.readFileSync(filepath, 'utf-8');
		}catch(err){
			//console.error(err.message);
			DaisyIO.set_err_(err_, 'warning', "Open", err.message);
			return -1;
		}

		return 0;
	}

	static export_doc(filepath, doc, err_)
	{
		let strdata = '<?xml version="1.0" encoding="utf-8"?><svg width="32px" height="32px"></svg>'
		try{
			fs.writeFileSync(filepath, strdata);
		}catch(err){
			DaisyIO.add_err_(err_, "warning", "Export", sprintf("writeFile error. :`%s`", filepath));
			return -1;
		}

		return 0;
	}
};

function main()
{
	// コマンドライン引数を[1]からに調整(node実行の場合に必要)
	let argv = process.argv;
	if(argv[1].endsWith('daisy-diagram-cli.js')){
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

	let err;
	if(0 != DaisyIO.open_doc_from_path(arg.open_filepath, err)){
		process.stderr.write(sprintf("can not open file `%s`.\n", arg.open_filepath));
		process.exit(-1);
	}

	let doc = {};
	if(0 != DaisyIO.export_doc(arg.export_filepath, doc, err)){
		process.stderr.write(sprintf("can not export file `%s`.\n", arg.export_filepath));
		process.exit(-1);
	}

}

main();

