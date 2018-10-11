'use strict';

const window   = require('svgdom')
const SVG      = require('svg.js')(window)
const document = window.document

const Diagram = require('./diagram');
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

		let length = 0;
		if(ObjectUtil.getPropertyFromPath(diagram, 'diagram.element_tree')){
			length = diagram.diagram.element_tree.length;
		}
		for(let i = 0; i < length; i++){
			const element = diagram.diagram.element_tree[i];
			switch(element.kind){
				case 'block':
				{
					Renderer.draw_block_element_(rendering_handle, diagram, element);
				}
					break;
				default:
				{
					console.error(i, diagram.diagram_elements[i]);
					const msg = sprintf("internal error: invalid element kind `%s`(%d,%d)",
						diagram.diagram_elements[i].kind,
						diagram.diagram_elements[i].id,
						i
					);
					alert(msg);
				}
			}
		}
	}

	static draw_block_element_(rendering_handle, diagram, block_element)
	{
		let current_group = rendering_handle.get_current_group();
		let block_group = current_group.group().addClass('dd__block-element-group');

		const onePanelSize = Diagram.getOnePanelSize(diagram);
		const point = {
			'x': block_element.position[0] * onePanelSize.width,
			'y': block_element.position[1] * onePanelSize.height
		};
		const box = {
			'x': point.x,
			'y': point.y,
			'width':  block_element.position[2] * onePanelSize.width,
			'height': block_element.position[3] * onePanelSize.height
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

