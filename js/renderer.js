'use strict';

const sprintf = require('sprintf-js').sprintf;

const Diagram = require('./diagram');
const ObjectUtil = require('./object-util');

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

	static getCenterFromTwoPoint(point0, point1)
	{
		return {
			'x': point0.x + ((point1.x - point0.x) / 2.0),
			'y': point0.y + ((point1.y - point0.y) / 2.0),
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

	get_root_group()
	{
		return this.groups.root_group;
	}

	get_background_group()
	{
		return this.groups.background_group;
	}

	get_document_root_group()
	{
		return this.groups.document_root_group;
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
		this.groups.root_group			= this.draw.group().addClass('dd__root-group');
		this.groups.background_group		= this.get_root_group().group().addClass('dd__background-group');
		this.groups.document_root_group		= this.get_root_group().group().addClass('dd__document-root-group');
		this.groups.editor_group		= this.get_root_group().group().addClass('dd__editor-group');

		this.groups.current_group		= this.groups.document_root_group;
	}
};

module.exports.Renderer = class Renderer{
	static rerendering(rendering_handle, diagram, focus, mouse_state, tool_kind)
	{
		rendering_handle.clear();

		if(null !== diagram){
			Renderer.rendering_(rendering_handle, diagram);
			//Renderer.rendering_diagram_(rendering_handle, diagram, focus, mouse_state, tool_kind);
		}
	}

	static expand_diagram_margin_for_export(rendering_handle, diagram)
	{
		const diagramSize = Diagram.get_size(diagram);
		const property__print_margin = Diagram.getMemberOrDefault(diagram, 'property.print.margin');
		let draw = rendering_handle.get_draw();
		draw.size(
			diagramSize.width  + (property__print_margin.x * 2),
			diagramSize.height + (property__print_margin.y * 2)
		);

		rendering_handle.get_document_root_group().translate(property__print_margin.x, property__print_margin.y);
	}

	static rendering_(rendering_handle, diagram)
	{
		const Element = require('./element');

		let current_group = rendering_handle.get_current_group();

		if(null === diagram){
			console.debug('Rendering:diagram is null');
			return;
		}

		let draw = rendering_handle.get_draw();
		const diagramSize = Diagram.get_size(diagram);
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

		const diagramSize = Diagram.get_size(diagram);
		const property__print_margin = Diagram.getMemberOrDefault(diagram, 'property.print.margin');
		const property__print_border_width = Diagram.getMemberOrDefault(diagram, 'property.print.border_width');

		const attr = {
			'fill':			Diagram.getMemberOrDefault(diagram, 'property.print.background_color'),
			'stroke':		Diagram.getMemberOrDefault(diagram, 'property.print.border_color'),
			'stroke-width':		property__print_border_width,
		};
		const fbox = [
			diagramSize.width  + (property__print_margin.x * 2) - (property__print_border_width),
			diagramSize.height + (property__print_margin.y * 2) - (property__print_border_width),
		]; // strokeの分を引く
		background_group.rect(fbox[0], fbox[1])
			.move((property__print_border_width / 2), (property__print_border_width / 2))
			.attr(attr);
	}

	static predraw_block_element_(rendering_handle, diagram, block_element, recurse_info, opt)
	{
		const property__cell_block_size = Diagram.getMemberOrDefault(diagram, 'property.cell_block.size');
		const property__cell_block__parent_margin = Diagram.getMemberOrDefault(diagram, 'property.cell_block.parent_margin');
		const property__cell_block__child_margin = Diagram.getMemberOrDefault(diagram, 'property.cell_block.child_margin');
		const offset = {
			'x': property__cell_block__parent_margin.x + (property__cell_block__child_margin.x * recurse_info.level),
			'y': property__cell_block__parent_margin.y + (property__cell_block__child_margin.y * recurse_info.level),
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

		const border_width = Diagram.getMemberOrDefault(diagram, 'property.parent_block_style.border_width');
		const box_border = {
			'x' : box.x + (border_width / 2.0),
			'y' : box.y + (border_width / 2.0),
			'width'  : box.width  - (border_width),
			'height' : box.height - (border_width),
		}; // SVGで枠を描くと線幅により膨らむため、borderを描画する位置を線幅の半分だけ縮小して、cell_boxの内側に収める
		const attr = {
			'stroke':		Diagram.getMemberOrDefault(diagram, 'property.parent_block_style.foreground_color'),
			'fill':			Diagram.getMemberOrDefault(diagram, 'property.parent_block_style.background_color'),
			'stroke-width':		border_width,
		};
		const radius = Diagram.getMemberOrDefault(diagram, 'property.parent_block_style.border_radius');
		let rect_element = block_group.rect(box_border.width, box_border.height)
			.move(box_border.x, box_border.y)
			.attr(attr)
			.radius(radius);

		Renderer.draw_text_tmp_(block_group, diagram, block_element);

		return true;
	}

	static draw_text_tmp_(current_group, diagram, element)
	{
		const text = ObjectUtil.getPropertyFromPath(element, 'text');
		if(! text){
			return true;
		}

		const box = ObjectUtil.getPropertyFromPath(element, 'work.box');
		if(! box){
			console.error(element)
			return false;
		}

		const border_width = Diagram.getMemberOrDefault(diagram, 'property.parent_block_style.border_width');
		const radius = Diagram.getMemberOrDefault(diagram, 'property.parent_block_style.border_radius');

		let text_draw_point;
		const text_anchor_x = Diagram.getMemberOrDefault(diagram, 'property.parent_block_style.text_anchor_x');
		const box_content = {
			'x' : box.x + border_width,
			'y' : box.y + border_width,
			'width'  : box.width  - (border_width * 2),
			'height' : box.height - (border_width * 2),
		}; // contentという名前だがpaddingは入ってない
		switch(text_anchor_x){
			case 'left':
			{
				text_draw_point = {
					'x': box_content.x + (radius / 4.0),
					'y': box_content.y + (radius / 4.0),
				};
			}
				break;
			case 'middle':
			{
				text_draw_point = {
					'x': box_content.x + (box_content.width  / 2),
					'y': box_content.y,
				};
			}
				break;
			default:
				console.error('unknown', text_anchor_x);
				return;
		}
		let text_element = current_group.text(text)
				.move(text_draw_point.x, text_draw_point.y)
				.font({
					'fill': Diagram.getMemberOrDefault(diagram, 'property.parent_block_style.text_color'),
					'size': Diagram.getMemberOrDefault(diagram, 'property.parent_block_style.text_size'),
					'text-anchor': text_anchor_x,
					//'dominant-baseline': "middle"
				});
		//! @notice 2018/10時点では'dominant-baseline'はchromeのみ有効とのこと

		return true;
	}

	static draw_line_element_(rendering_handle, diagram, line_element, recurse_info, opt)
	{
		let current_group = rendering_handle.get_current_group();
		let line_group = current_group.group().addClass('dd__line-element-group');

		let points = [];
		for(let i = 0; i < line_element.anchor_points.length; i++){
			let anchor_point = line_element.anchor_points[i];

			const anchor_point_element = ObjectUtil.getPropertyFromPath(opt.elements_of_id_key, anchor_point.anchor_point_element_id);
			if(! anchor_point_element){
				console.error(i, line_element.anchor_points);
				// skip
				continue;
			}

			const box = ObjectUtil.getPropertyFromPath(anchor_point_element, 'work.box');
			if(! box){
				console.error(anchor_point_element)
				return false;
			}

			const point = GeometoryUtil.getPointFromBoxOfRate(box, anchor_point.point_of_rate);
			points.push(point);

			anchor_point.work = {
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

		for(let i = 0; i < line_element.anchor_points.length; i++){
			const anchor_point = line_element.anchor_points[i];

			const arrow = ObjectUtil.getPropertyFromPath(anchor_point, 'arrow');
			if(arrow){
				let arrow_for_line_group = line_group.group().addClass('dd__arrow-for__line-element-group');
				Renderer.draw_line_element_arrow_(arrow_for_line_group, diagram, i, points, arrow);
			}
		}

		const text_style = {};
		const point = GeometoryUtil.getCenterFromTwoPoint(points[0], points[points.length - 1]);
		Renderer.draw_text_(line_group, diagram, line_element, point, text_style);

		return true;
	}

	static draw_text_(current_group, diagram, element, point, text_style)
	{
		const text = ObjectUtil.getPropertyFromPath(element, 'text');
		if(! text){
			return true;
		}

		const text_draw_point = point;
		const text_anchor_x = 'left';

		let text_element = current_group.text(text)
				.move(text_draw_point.x, text_draw_point.y)
				.font({
					// 'fill': Diagram.getMemberOrDefault(diagram, 'property.parent_block_style.text_color'),
					'fill': 'rgba(0, 0, 0, 1.0)',
					'size': Diagram.getMemberOrDefault(diagram, 'property.parent_block_style.text_size'),
					'text-anchor': text_anchor_x,
					//'dominant-baseline': "middle"
				});
		//! @notice 2018/10時点では'dominant-baseline'はchromeのみ有効とのこと

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

