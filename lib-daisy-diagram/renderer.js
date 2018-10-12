'use strict';

const window   = require('svgdom')
const SVG      = require('svg.js')(window)
const document = window.document

const Diagram = require('./diagram');
const Element = require('./element');
const ObjectUtil = require('./object_util');

module.exports.RenderingHandle = class RenderingHandle{
	constructor(elemId)
	{
		this.draw = null;
		this.groups = [];

		this.draw = SVG(elemId).size(0, 0);
		this.clear();
	}

	get_draw()
	{
		return this.draw;
	}

	get_root_group()
	{
		return this.groups.root_group;
	}

	get_current_group()
	{
		return this.groups.current_group;
	}

	get_editor_group()
	{
		return this.groups.editor_group;
	}

	clear()
	{
		this.draw.clear();
		this.groups.root_group = this.draw.group().addClass('dd__root-group');
		this.groups.editor_group = this.draw.group().addClass('dd__editor-group');

		this.groups.current_group = this.groups.root_group;
	}
};

module.exports.Renderer = class Renderer{
	static expand_diagram_margin_for_export(rendering_handle, diagram)
	{
		const diagramSize = Diagram.getSize(diagram);
		const diagramBaseMargin = Diagram.getBaseMargin(diagram);
		let draw = rendering_handle.get_draw();
		draw.size(
			diagramSize.width  + (diagramBaseMargin.width  * 2),
			diagramSize.height + (diagramBaseMargin.height * 2));

		rendering_handle.get_root_group().translate(diagramBaseMargin.width, diagramBaseMargin.height);
	}

	static rendering_(rendering_handle, diagram)
	{
		let current_group = rendering_handle.get_current_group();

		if(null === diagram){
			console.debug('Rendering:diagram is null');
			return;
		}

		let draw = rendering_handle.get_draw();
		const diagramSize = Diagram.getSize(diagram);
		draw.size(diagramSize.width, diagramSize.height);

		const func = function(recurse_info, element, opt){
			//const element = diagram.element_tree[i];
			switch(element.kind){
				case 'block':
				{
					Renderer.draw_block_element_(rendering_handle, diagram, element, recurse_info, opt);
				}
					break;
				default:
				{
					console.error(i, diagram_elements[i]);
					const msg = sprintf("internal error: invalid element kind `%s`(%d,%d)",
						diagram_elements[i].kind,
						diagram_elements[i].id,
						i
					);
					alert(msg);
				}
			}
			return true;
		};
		let opt = {};
		if(ObjectUtil.getPropertyFromPath(diagram, 'element_tree')){
			Element.recursive(diagram.element_tree, func, opt);
		}
	}

	static draw_block_element_(rendering_handle, diagram, block_element, recurse_info, opt)
	{
		let current_group = rendering_handle.get_current_group();
		let block_group = current_group.group().addClass('dd__block-element-group');

		const oneCellBlockSize = Diagram.getOneCellBlockSize(diagram);
		const cell_block_margin = Diagram.getMemberOrDefault(diagram, 'property.cell_block_margin');
		const cell_block_child_margin = Diagram.getMemberOrDefault(diagram, 'property.cell_block_child_margin');
		const offset = {
			'x': cell_block_margin.width + (cell_block_child_margin.width * recurse_info.level),
			'y': cell_block_margin.width + (cell_block_child_margin.width * recurse_info.level),
		};
		const point = {
			'x': (block_element.position[0] * oneCellBlockSize.width)  + offset.x,
			'y': (block_element.position[1] * oneCellBlockSize.height) + offset.y,
		};
		const box = {
			'x': point.x,
			'y': point.y,
			'width':  (block_element.position[2] * oneCellBlockSize.width) -  (offset.x * 2),
			'height': (block_element.position[3] * oneCellBlockSize.height) - (offset.y * 2),
		};
		const attr = {
			'stroke':		'rgba(  0,  0,  0,1.0)',
			'fill':			'rgba(255,255,255,1.0)',
			'fill-opacity':		'1',
			'stroke-width':		'2',
		};
		const radius = 0;
		let rect_element = block_group.rect(box.width, box.height).move(box.x, box.y)
			.attr(attr).radius(radius);

		const text = ObjectUtil.getPropertyFromPath(block_element, 'text');
		if(text){
			const centor = {
				'x': box.x + (box.width  / 2),
				'y': box.y
			};
			rect_element = block_group.text(text)
					.move(centor.x, centor.y)
					.font({
						'fill': 'rgba(  0,  0,  0,1.0)' ,
						'size': '22px',
						'text-anchor': "middle",
						//'dominant-baseline': "middle"
					});
			//! @notice 2018/10時点では'dominant-baseline'はchromeのみ有効とのこと
		}
	}
};

