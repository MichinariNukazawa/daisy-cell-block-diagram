'use strict';

const sprintf = require('sprintf-js').sprintf;
const window   = require('svgdom')
const SVG      = require('svg.js')(window)
const document = window.document

const Diagram = require('./diagram');
const Element = require('./element');
const ObjectUtil = require('./object_util');

class GeometoryUtil{
	static getPointFromBoxOfRate(box, rate){
		return {
			'x': box.x + (box.width  * rate[0]),
			'y': box.y + (box.height * rate[1]),
		};
	}

	static getRadianFromPointRelation(point, center)
	{
		return GeometoryUtil.getRadianFromPoint({'x': point.x - center.x, 'y': point.y - center.y});
	}

	static getRadianFromPoint(point)
	{
		return Math.atan2(point.y, point.x);
	}

	static getDegreeFromRadian(radian)
	{
		return radian * (180.0 / Math.PI);
	}

	static getRadianFromDegree(degree)
	{
		return degree * (Math.PI / 180.0);
	}

	static getRotatePointFromRadian(point, radian, center)
	{
		const rel = {'x': point.x - center.x, 'y':point.y - center.y};
		const aft = [
			(rel.x * Math.cos(radian)) - (rel.y * Math.sin(radian)),
			(rel.x * Math.sin(radian)) + (rel.y * Math.cos(radian)),
		];
		return {
			'x': aft[0] + center.x,
			'y': aft[1] + center.x,
		};
	}
};

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

	get_background_group()
	{
		return this.groups.background_group;
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
		this.groups.background_group = this.draw.group().addClass('dd__background-group');
		this.groups.root_group = this.draw.group().addClass('dd__root-group');
		this.groups.editor_group = this.draw.group().addClass('dd__editor-group');

		this.groups.current_group = this.groups.root_group;
	}
};

module.exports.Renderer = class Renderer{
	static expand_diagram_margin_for_export(rendering_handle, diagram)
	{
		const diagramSize = Diagram.getSize(diagram);
		const property__print_margin = Diagram.getMemberOrDefault(diagram, 'property.print_margin');
		let draw = rendering_handle.get_draw();
		draw.size(
			diagramSize.x + (property__print_margin.x * 2),
			diagramSize.y + (property__print_margin.y * 2)
		);

		rendering_handle.get_root_group().translate(property__print_margin.x, property__print_margin.y);
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

		Renderer.draw_background_(rendering_handle, diagram);

		// ** drawing preprocess
		let elements_of_id_key = {};
		{
			const func = function(recurse_info, element, opt){
				const id = ObjectUtil.getPropertyFromPath(element, 'id');
				if(id){
					opt.elements_of_id_key[id] = element;
				}

				switch(element.kind){
					case 'block':
					{
						Renderer.predraw_block_element_(rendering_handle, diagram, element, recurse_info, opt);
					}
						break;
					case 'line':
					{
						// Renderer.draw_block_element_(rendering_handle, diagram, element, recurse_info, opt);
					}
						break;
					default:
					{
						console.error(sprintf("internal error: invalid element kind `%s`(%d,%d)",
								elements[i].kind,
								elements[i].id,
								i));
					}
				}
				return true;
			};
			let opt = {'elements_of_id_key': elements_of_id_key};
			if(ObjectUtil.getPropertyFromPath(diagram, 'element_tree')){
				Element.recursive(diagram.element_tree, func, opt);
			}
		}

		// ** drawing
		{
			const func = function(recurse_info, element, opt){
				switch(element.kind){
					case 'block':
					{
						Renderer.draw_block_element_(rendering_handle, diagram, element, recurse_info, opt);
					}
						break;
					case 'line':
					{
						Renderer.draw_line_element_(rendering_handle, diagram, element, recurse_info, opt);
					}
						break;
					default:
					{
						console.error(sprintf("internal error: invalid element kind `%s`(%d,%d)",
								elements[i].kind,
								elements[i].id,
								i));
					}
				}
				return true;
			};
			let opt = {'elements_of_id_key': elements_of_id_key};
			if(ObjectUtil.getPropertyFromPath(diagram, 'element_tree')){
				Element.recursive(diagram.element_tree, func, opt);
			}
		}
	}

	static draw_background_(rendering_handle, diagram)
	{
		let background_group = rendering_handle.get_background_group();

		const diagramSize = Diagram.getSize(diagram);
		const property__print_margin = Diagram.getMemberOrDefault(diagram, 'property.print_margin');
		const property__print_border_width = Diagram.getMemberOrDefault(diagram, 'property.print_border_width');

		const attr = {
			'fill':			Diagram.getMemberOrDefault(diagram, 'property.print_background_color'),
			'stroke':		Diagram.getMemberOrDefault(diagram, 'property.print_border_color'),
			'stroke-width':		property__print_border_width,
		};
		const fbox = [
			diagramSize.x + (property__print_margin.x * 2) - (property__print_border_width),
			diagramSize.y + (property__print_margin.y * 2) - (property__print_border_width),
		]; // strokeの分を引く
		background_group.rect(fbox[0], fbox[1])
			.move((property__print_border_width / 2), (property__print_border_width / 2))
			.attr(attr);
	}

	static predraw_block_element_(rendering_handle, diagram, block_element, recurse_info, opt)
	{
		const property__cell_block_size = Diagram.getMemberOrDefault(diagram, 'property.cell_block_size');
		const cell_block_margin = Diagram.getMemberOrDefault(diagram, 'property.cell_block_margin');
		const cell_block_child_margin = Diagram.getMemberOrDefault(diagram, 'property.cell_block_child_margin');
		const offset = {
			'x': cell_block_margin.x + (cell_block_child_margin.x * recurse_info.level),
			'y': cell_block_margin.y + (cell_block_child_margin.y * recurse_info.level),
		};
		const point = {
			'x': (block_element.position[0] * property__cell_block_size.x) + offset.x,
			'y': (block_element.position[1] * property__cell_block_size.y) + offset.y,
		};
		const box = {
			'x': point.x,
			'y': point.y,
			'width':  (block_element.position[2] * property__cell_block_size.x) - (offset.x * 2),
			'height': (block_element.position[3] * property__cell_block_size.y) - (offset.y * 2),
		};

		block_element.work = {
			'box': box,
		};

		return true;
	}

	static draw_block_element_(rendering_handle, diagram, block_element, recurse_info, opt)
	{
		let current_group = rendering_handle.get_current_group();
		let block_group = current_group.group().addClass('dd__block-element-group');

		const box = ObjectUtil.getPropertyFromPath(block_element, 'work.box');
		if(! box){
			console.error(block_element)
			return false;
		}

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

		return true;
	}

	static draw_line_element_(rendering_handle, diagram, line_element, recurse_info, opt)
	{
		let current_group = rendering_handle.get_current_group();
		let line_group = current_group.group().addClass('dd__line-element-group');

		let points = [];
		for(let i = 0; i < line_element.edges.length; i++){
			let edge = line_element.edges[i];

			const edge_element = ObjectUtil.getPropertyFromPath(opt.elements_of_id_key, edge.edge_element_id);
			if(! edge_element){
				console.error(i, line_element.edges);
				// skip
				continue;
			}

			const box = ObjectUtil.getPropertyFromPath(edge_element, 'work.box');
			if(! box){
				console.error(edge_element)
				return false;
			}

			const point = GeometoryUtil.getPointFromBoxOfRate(box, edge.point_of_rate);
			points.push(point);

			edge.work = {
				'box': box,
			};
		}

		if(points.length < 2){
			return;
		}

		let svgjs_points = [];
		for(let i = 0; i < points.length; i++){
			svgjs_points.push(points[i].x);
			svgjs_points.push(points[i].y);
		}

		let polyline = line_group.polyline(svgjs_points)
				.stroke({ width: 2, linecap: 'round'})
				.fill('none');

		for(let i = 0; i < line_element.edges.length; i++){
			const edge = line_element.edges[i];

			const arrow = ObjectUtil.getPropertyFromPath(edge, 'arrow');
			if(arrow){
				let arrow_for_line_group = line_group.group().addClass('dd__arrow-for__line-element-group');
				Renderer.draw_line_element_arrow_(arrow_for_line_group, diagram, i, points, arrow);
			}
		}

		return true;
	}

	static draw_line_element_arrow_(arrow_for_line_group, diagram, i, points, arrow)
	{
		if(points.length < 2){
			console.error("bug");
			return null;
		}

		const point = points[i];

		const size = Diagram.getArrowMemberOrDefault(diagram, arrow, 'size');

		// arrow geometory (degree 0 is) ```<-``` from radian base sita.
		let svgjs_points = [
			point.x + size[0], point.y + size[1],
			point.x, point.y,
			point.x + size[0], point.y - size[1],
		];

		let polyline = arrow_for_line_group.polyline(svgjs_points).stroke({ width: 3, linecap: 'round', });
		const is_fill = Diagram.getArrowMemberOrDefault(diagram, arrow, 'is_fill');
		if(!is_fill){
			polyline.fill('none').plot();
		}

		let radian = 0;
		if((i + 1) < points.length){
			radian = GeometoryUtil.getRadianFromPointRelation(points[i + 1], point);
		}else{
			radian = GeometoryUtil.getRadianFromPointRelation(points[i - 1], point);
		}
		const degree = GeometoryUtil.getDegreeFromRadian(radian);
		polyline.rotate(degree, point.x, point.y);

		return polyline;
	}
};

