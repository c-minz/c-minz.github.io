// @author: Christoph Minz
// @created: 19/02/2024
// @license: BSD 3-Clause

// #############################################################################
// Editor initialization and main class definition

function initializeEditor() {
	/* Initialize input type, editor canvas size, and settings bottons. */
	// hide active JavaScript alert:
	document.getElementById( "msgJavascript" ).hidden = true;
	selectInputType();
	updateWidth();
	document.getElementById( "txtSelection" ).value = "";
	document.getElementById( "txtLinked" ).value = "";
	updateSettingsButton( "ShowLabels", false );
	updateSettingsButton( "ShowCross", false );
	updateSettingsButton( "ShowGrid", false );
	document.getElementById( "txtPermutation" ).value = "";
	document.getElementById( "txtLinks" ).value = "";
	document.getElementById( "txtRemlinks" ).value = "";
	document.getElementById( "txtExport_pcauset" ).value = "";
	document.getElementById( "txtExport_rcauset" ).value = "";
	document.getElementById( "txtExport_causet" ).value = "";
}

function selectInputType() {
	/* Hide/show the input controls for the currently selected import type. */
	let input_type = document.getElementById( "selInputType" ).value;
	document.getElementById( "frmInputPredefined" ).hidden = 
		( input_type != "predefined" );
	document.getElementById( "frmInputPermutation" ).hidden = 
		( !input_type.endsWith( "causet" ) );
	document.getElementById( "frmInputLinks" ).hidden = 
		( input_type != "rcauset" && input_type != "causet" );
	document.getElementById( "frmInputLatex" ).hidden = 
		( input_type != "latex" );
	document.getElementById( "frmInputMatrix" ).hidden = 
		( input_type != "matrix" );
}

function updateWidth() {
	/* Adjust canvas size to be a square that fits to the window display width. */
	let current_width = document.getElementById( "cnvPoset" ).width;
	let new_width = document.getElementById( "cnvPosetContainer" ).clientWidth;
	new_width = Math.min( new_width - 20, 900 );  // remove padding and limit size
	if ( new_width === current_width )
		return false;
	document.getElementById( "cnvPoset" ).width = new_width;
	document.getElementById( "cnvPoset" ).height = new_width;
	return true;
}

function parseIntNotNaN( value ) {
	/* Parse a string input `value` to an integer and raises an error if the 
	string does not represent an integer, while leading and trailing spaces are 
	ignored. */
	let int_value = parseInt( value.trim(), 10 );
	if ( isNaN( int_value ) ) {
		if ( value.length == 0 )
			value = "(empty)";
		throw new TypeError(
			"The value " + value + " cannot be converted to an integer!" );
	}
	return int_value;
}

function parseLink( value ) {
	/* Parse a string input `value` to a pair of integers (and a string option) 
	and raises an error if the string does not represent link, while leading and 
	trailing spaces are ignored. Returns an array of either two or three entries, 
	where the first entry is the lower index (from) and the second one is the 
	upper index (to), the optional third entry is a string of all specified link 
	options. */
	let sep0 = value.indexOf( "/" );
	if ( sep0 < 0 )
		throw Error( "Each link has to be of the format 'number/number'." );
	let sep1 = value.indexOf( "/", sep0 + 1 );
	let from = parseIntNotNaN( value.substr( 0, sep0 ) );
	let to;
	let has_options = false;
	let options = "";
	if ( sep1 < 0 ) {
		to = parseIntNotNaN( value.substr( sep0 + 1 ) );
	} else {
		to = parseIntNotNaN( value.substr( sep0 + 1, sep1 - sep0 - 1 ) );
		has_options = true;
		options = value.substr( sep1 + 1 );
	}
	if ( from === to )
		throw Error( "An element cannot be linked to itself." );
	if ( to < from ) {
		if ( has_options )
			return [ to, from, options ];
		return [ to, from ];
	}
	if ( has_options )
		return [ from, to, options ];
	return [ from, to ];
}

function parsePermutation( value ) {
	/* Parse `value` either as a string or list of integers and check if the 
	input is valid. Raises an error for invalid inputs. Returns the parsed 
	permutation list and an offset value to adjust labels in the diagram. */
	let permutation;
	if ( typeof value == "string" )
		permutation = value.split( "," ).map( parseIntNotNaN );
	else 
		permutation = value;
	// find min and max labels:
	let n = permutation.length;
	if ( n < 1 )
		throw Error( "The poset has to have at least one element!" );
	let min_element = permutation[0];
	let max_element = permutation[0];
	for ( let i = 1; i < n; i++ ) {
		let element = permutation[i];
		if ( element < min_element ) {
			min_element = element;
		}
		if ( element > max_element ) {
			max_element = element;
		}
	}
	// get intended number of elements:
	let n_target = Math.max( n, max_element - min_element + 1 );
	if ( n_target > 1000 )
		throw Error( "The editor does not support more than 1000 elements!" );
	// check for repeated and missing elements:
	const checkedInput = new Array( n_target ).fill( 0 );
	for ( let i = 0; i < n; i++ ) {
		let index = permutation[i] - min_element;
		checkedInput[index] = checkedInput[index] + 1;
	}
	if ( ( n != n_target ) || ( checkedInput.indexOf( 0 ) != -1 ) ) {
		let error_count = 0;
		let errors = [];
		for ( let i = 0; i < n_target; i++ ) {
			if ( checkedInput[i] != 1 ) {
				error_count++;
				if ( error_count > 3 ) break;
				let element = i + min_element;
				if ( checkedInput[i] == 0 ) {
					errors.push( "The element " + element.toString() + " is missing!" );
				} else {
					errors.push( "The element " + element.toString() + " appears " + 
						checkedInput[i] + " times!" );
				}
			}
		}
		let error = errors.join( " " );
		if ( error_count > 3 ) {
			error = error + " And more errors ..."
		}
		throw Error( error );
	}
	// remove offset and return:
	for ( let i = 0; i < n; i++ )
		permutation[i] = permutation[i] - min_element;
	return [ permutation, min_element ];
}

function parseLinks( value, offset, max_element ) {
	/* Parse `value` either as a string or list of integer pairs and check if the 
	input is valid, removing dublicates. Raises an error for invalid inputs. 
	Returns two lists of index pairs, one for links without link options in the 
	input and a second one for links that had link options in the input (options 
	are dropped). */
	if ( value.length == 0 ) return [ [], [] ];
	let link_list;
	if ( typeof value == "string" )
		link_list = value.split( "," ).map( parseLink );
	else
		link_list = value;
	const link_list_nopt = [];
	const link_list_opt = [];
	for ( let i = 0; i < link_list.length; i++ ) {
		let from = link_list[i][0] - offset;
		let to = link_list[i][1] - offset;
		if ( from < 0 || to > max_element )
			continue;
		if ( link_list[i].length > 2 )
			link_list_opt.push( [ from, to ] );
		else
			link_list_nopt.push( [ from, to ] );
	}
	return [ link_list_nopt, link_list_opt ];
}

class Poset {
	/* Main class to hold the permutation (position of elements) and link lists. 
	The elements in the permutation are indexed starting from 0 and the parameter 
	`offset` shifts the labels. */
	
	constructor( permutation, links, autolinking ){
		this.error = "";  // holds an input error message (if any)
		// parse permutation for the element positions:
		try {
			const parseReturn = parsePermutation( permutation );
			this.permutation = parseReturn[0];
			this.offset = parseReturn[1];
		} catch ( e ) {
			this.error = e.toString();
			return;
		}
		// parse links:
		this.autolinking = autolinking;
		this.reset_permlinks();
		try {
			const link_lists = parseLinks( links, this.offset, this.card() - 1 );
			if ( autolinking ) {
				this.remlinks = link_lists[0];  // holds element pairs for removed links
				this.addlinks = link_lists[1];  // holds element pairs for manual links
			} else {
				this.remlinks = [];
				this.addlinks = link_lists[0].concat( link_lists[1] );
			}
		} catch ( e ) {
			this.error = e.toString();
			return;
		}
	}
	
	reset_permlinks() {
		/* Calculate the links from the permutation. */
		this.permlinks = [];
		let n = this.card();
		for ( let i = 0; i < n; i++ ) {
			let p = this.permutation[i];
			let bound = n;
			for ( let j = i + 1; j < n; j++ ) {
				let q = this.permutation[j];
				if ( p < q && q < bound ) {
					this.permlinks.push( [ p, q ] );
					bound = q;
				}
			}
		}
	}
	
	card() {
		return this.permutation.length;
	}
	
	isLinkable( i, j ) {
		/* Check if it is possible to have a link from the element with index `i` 
		to the element with index `j`. */
		for ( let l = 0; l < this.permlinks.length; l++ ) {
			if ( this.permlinks[l][0] === i && this.permlinks[l][1] === j )
				return true;
		}
		return false;
	}
	
	getElementString( i ) {
		return String( i + poset.offset );
	}
	
	getLinkString( link ) {
		return String( link[0] + poset.offset ) + "/" 
			+ String( link[1] + poset.offset );
	}
	
	getAddedLinkString( link ) {
		return String( link[0] + poset.offset ) + "/" 
			+ String( link[1] + poset.offset ) + "/";
	}
	
	getPermutationString() {
		return this.permutation.map( this.getElementString ).join( "," );
	}
	
	getRemovedLinksString() {
		return this.remlinks.map( this.getLinkString ).join( "," );
	}
	
	getAddedLinksString() {
		return this.addlinks.map( this.getAddedLinkString ).join( "," );
	}
	
	getLinksString() {
		let links = [];
		for ( let l = 0; l < this.permlinks.length; l++ ) {
			let skip = false;
			for ( let r = 0; r < this.remlinks.length; r++ ) {
				skip = ( this.permlinks[l][0] === this.remlinks[r][0] 
						|| this.permlinks[l][1] === this.remlinks[r][1] ) 
				if ( skip ) break;
			}
			if ( ~skip )
				links.push( this.permlinks[l] );
		}
		links = links.concat( this.addlinks );
		return links.map( this.getLinkString ).join( "," );
	}
	
}


// #############################################################################
// Generation from import data

let poset;
let hover = [];

function generate() {
	try {
	let input_type = document.getElementById( "selInputType" ).value;
	let new_poset;
	if ( input_type === "predefined" )
		new_poset = new Poset( getPredefined(), "", true );
	else if ( input_type === "pcauset" )
		new_poset = new Poset( 
			document.getElementById( "txtInputPermutation" ).value, "", true );
	document.getElementById( "msgInputError" ).hidden = true;
	if ( new_poset.error ) {
		document.getElementById( "msgInputError" ).innerText = new_poset.error;
		document.getElementById( "msgInputError" ).hidden = false;
		return;
	}
	poset = new_poset;
	updateSelectionBounds();
	setSelection( NaN );
	} catch ( e ) {
		document.getElementById( "msgInputError" ).innerText = e.toString();
		document.getElementById( "msgInputError" ).hidden = false;
	}
}

function getPredefined() {
	let input_type = document.getElementById( "selInputPredefinedType" ).value;
	let n = parseInt( document.getElementById( "txtInputOrder" ).value, 10 );
	if ( isNaN( n ) || n < 1 || n > 1000 ) return [];
	if ( input_type === "chain" )
		return getPermutation_chain( n );
	if ( input_type === "antichain" )
		return getPermutation_antichain( n );
	if ( input_type === "random" )
		return getPermutation_random( n );
	if ( input_type === "fence" )
		return getPermutation_fence( n );
	if ( input_type === "polygon" )
		return getPermutation_polygon( n );
}

function getPermutation_chain( n ) {
	const permutation = [];
	for ( let i = 0; i < n; )
		permutation[i] = ++i;
	return permutation;
}

function getPermutation_antichain( n ) {
	const permutation = [];
	for ( let i = 0; i < n; i++ )
		permutation[i] = n - i;
	return permutation;
}

function getPermutation_random( n ) {
	const permutation = getPermutation_chain( n );
	for ( let i = n - 1; i > 0; i-- ) {
		let j = Math.floor( Math.random() * ( i + 1 ) );
		let swap = permutation[i];
		permutation[i] = permutation[j];
		permutation[j] = swap;
	}
	return permutation;
}

function getPermutation_fence( n ) {
	if ( n === 1 ) return [ 1 ];
	const permutation = [ n - 1 ];
	for ( let i = n % 2; i < n; i++ ) {
		permutation[i] = Math.max( 1, n - i - 2 );
		permutation[++i] = Math.min( n - i + 2, n );
	}
	return permutation;
}


// #############################################################################
// Initialize editor and handle input/import data

function updateSelectionBounds() {
	let lower = poset.offset;
	let upper = poset.card() - 1 + poset.offset;
	document.getElementById( "txtSelection" ).min = lower.toString();
	document.getElementById( "txtSelection" ).max = upper.toString();
	document.getElementById( "txtLinked" ).min = lower.toString();
	document.getElementById( "txtLinked" ).max = upper.toString();
}

function getSelection() {
	let sel = document.getElementById( "txtSelection" ).value;
	let sel_int = parseInt( sel.trim(), 10 ) - poset.offset;
	if ( ( sel_int >= 0 ) && ( sel_int < poset.card() ) ) {
		return sel_int;
	}
	return NaN;
}

function setSelection( new_sel ) {
	let strSel = "";
	if ( new_sel >= 0 && new_sel < poset.card() )
		strSel = String( new_sel + poset.offset );
	document.getElementById( "txtSelection" ).value = strSel;
	document.getElementById( "txtLinked" ).value = "";
	redrawPoset();
}

function initCanvas( context, n ) {
	context.setTransform( 1, 0, 0, 1, 0, 0 );
	context.clearRect( 0, 0, context.canvas.width, context.canvas.height );
	context.beginPath();
	let scaling = context.canvas.height / n / Math.sqrt( 2 );
	context.scale( scaling, -scaling );
	context.translate( n / Math.sqrt( 2 ), -Math.sqrt( 2 ) * n );
	context.rotate( 45 * Math.PI / 180 );
}

function drawGrid( context, n ) {
	context.strokeStyle = "#c0c0c0";
	context.lineWidth = 0.05;
	for ( let i = 0; i <= n; i++ ) {
		context.beginPath();
		context.moveTo( 0, i );
		context.lineTo( n, i );
		context.stroke();
		context.beginPath();
		context.moveTo( i, 0 );
		context.lineTo( i, n );
		context.stroke();
	}
}

const event_size = 0.25;
const event_hover_size = 0.35;
const link_width = 0.08;
const selection_cross_color = "#ffe8e8";
const relocation_color = "#90b030";

function redrawPoset() {
	let canvas = document.getElementById( "cnvPoset" );
	let context = canvas.getContext( "2d" );
	let sel = getSelection();
	let n = poset.card();
	initCanvas( context, n );  // setup canvas
	// draw selection cross
	if ( document.getElementById( "chbShowCross" ).checked ) {
		context.strokeStyle = selection_cross_color;
		context.lineWidth = 1.0;
		context.beginPath();
		context.moveTo( sel + 0.5, 0 );
		context.lineTo( sel + 0.5, n );
		for ( let i = 0; i < n; i++ ) {
			if ( poset.permutation[i] != sel ) continue;
			context.moveTo( 0, i + 0.5 );
			context.lineTo( n, i + 0.5 );
		}
		context.stroke();
	}
	// draw howered tile:
	let hovered_event = -1; 
	let is_hovering = ( hover.length == 2 );
	if ( is_hovering ) {
		let u = hover[0];
		let v = hover[1];
		let p = poset.permutation.indexOf( u );
		if ( p === v )
			hovered_event = u;
		if ( hovered_event === -1 ) {
			context.fillStyle = relocation_color;
			context.beginPath();
			context.ellipse( u + 0.5, v + 0.5, 
				event_hover_size, event_hover_size, 0, 0, 2 * Math.PI );
			context.ellipse( sel + 0.5, poset.permutation.indexOf( sel ) + 0.5, 
				event_hover_size, event_hover_size, 0, 0, 2 * Math.PI );
			context.fill();
		} else if ( hovered_event != sel ) {
			context.fillStyle = "red";
			context.beginPath();
			context.ellipse( u + 0.5, v + 0.5, 
				event_hover_size, event_hover_size, 0, 0, 2 * Math.PI );
			context.fill();
		}
	}
	// draw grid
	if ( document.getElementById( "chbShowGrid" ).checked )
		drawGrid( context, n );
	// draw links
	context.strokeStyle = "black";
	context.lineWidth = link_width;
	for ( let l = 0; l < poset.permlinks.length; l++ ) {
		let i = poset.permlinks[l][0];
		let j = poset.permlinks[l][1];
		context.beginPath();
		context.moveTo( i + 0.5, poset.permutation.indexOf( i ) + 0.5 );
		context.lineTo( j + 0.5, poset.permutation.indexOf( j ) + 0.5 );
		context.stroke();
	}
	// draw poset elements (events)
	for ( let i = 0; i < n; i++ ) {
		let p = poset.permutation[i];
		context.fillStyle = "black";
		if ( hovered_event != sel && hovered_event === p )
			context.fillStyle = "#703030";
		else if ( is_hovering && hovered_event === -1 && p === sel )
			context.fillStyle = selection_cross_color;
		else if ( p === sel )
			context.fillStyle = "red";
		context.beginPath();
		context.ellipse( p + 0.5, i + 0.5, 
			event_size, event_size, 0, 0, 2 * Math.PI );
		context.fill();
	}
	// draw element labels
	let showLabels = document.getElementById( "chbShowLabels" ).checked
	if ( showLabels ) {
		let scaling = canvas.width / n / 2;
		// context.save();
		context.setTransform( 1, 0, 0, 1, 0, 0 );
		context.translate( canvas.width / 2, canvas.height );
		context.font = ( canvas.width / n / 3 ).toString() + "px Arial";
		context.textAlign = "right"
		for ( let i = 0; i < n; i++ ) {
			let p = poset.permutation[i];
			let x = ( p - i - 0.5 ) * scaling;
			let y = ( p + i + 0.2 ) * scaling;
			context.fillStyle = "black";
			if ( p === sel )
				context.fillStyle = "red";
			context.beginPath();
			context.fillText( p + poset.offset, x, -y );
		}
		// context.restore();
	}
	updateExport();
}


// #############################################################################
// Toolbar and input functionality

function updateHoveredTile( x, y ) {
	let canvas = document.getElementById( "cnvPoset" );
	let canvas_border = canvas.getBoundingClientRect();
	let n = poset.card();
	let scaling = canvas.width / n;
	x = x - canvas_border.left - canvas.width / 2;
	y_u = -y + canvas_border.top + canvas.height / 2;
	y_v = -y + canvas_border.bottom - canvas.height / 2;
	let u = Math.round( ( y_u + x ) / scaling + ( n + 1 ) / 2 ) - 1;
	let v = Math.ceil( ( y_v - x ) / scaling + n / 2 ) - 1;
	if ( u < 0 || u >= n || v < 0 || v >= n ) {
		if ( hover.length > 0 ) {
			// Cursor leaves the diagram (and a hovered tile).
			hover = [];
			return true;
		}
		// Cursor stays outside of diagram.
		return false;
	}
	let p = poset.permutation[v];
	let ignoreTile = ( u != p );
	let sel = getSelection();
	let sel_v = poset.permutation.indexOf( sel );
	if ( ~isNaN( sel ) && ( sel_v >= 0 ) && 
		( u === sel || p === poset.permutation[sel_v] ) ) {
		ignoreTile = false;
	}
	if ( ignoreTile ) {
		if ( hover.length > 0 ) {
			// Cursor moves from hovered tile to an ignored tile.
			hover = [];
			return true;
		}
		// Cursor moves among ignored tiles.
		return false;
	}
	// Cursor moves between hovered tiles.
	hover = [ u, v ];
	return true;
}

function selectU( dir ) {
	if ( dir === 0 ) return;
	let sel = getSelection();
	if ( isNaN( sel ) && dir > 0 ) setSelection( 0 );
	if ( isNaN( sel ) && dir < 0 ) setSelection( poset.card() - 1 );
	if ( isNaN( sel ) ) return;
	setSelection( sel + dir );
}

function selectV( dir ) {
	if ( dir === 0 ) return;
	let sel = getSelection();
	let n = poset.card();
	if ( isNaN( sel ) && dir > 0 ) setSelection( poset.permutation[0] );
	if ( isNaN( sel ) && dir < 0 ) setSelection( poset.permutation[n - 1] );
	if ( isNaN( sel ) ) return;
	let sel_v = poset.permutation.indexOf( sel );
	if ( ( sel_v < 0 && dir < 0 ) || ( sel_v >= n && dir > 0 ) ) return;
	let new_sel_v = sel_v + dir;
	if ( new_sel_v < 0 || new_sel_v >= n ) {
		setSelection( NaN );
		return;
	}
	setSelection( poset.permutation[new_sel_v] );
}

function moveU( moves ) {
	if ( moves === 0 ) return;
	let sel = getSelection();
	if ( isNaN( sel ) ) return;
	let new_pos = sel + moves;
	if ( new_pos < 0 || new_pos >= poset.card() ) return;
	let dir = 1;
	if ( moves < 0 ) dir = -1;
	let sel_v = poset.permutation.indexOf( sel );
	for ( i = sel + dir; dir * ( new_pos - i ) >= 0; i = i + dir ) {
		let j = poset.permutation.indexOf( i );
		poset.permutation[j] = i - dir;
	}
	poset.permutation[sel_v] = new_pos;
	poset.reset_permlinks();
	setSelection( new_pos );
}

function moveV( moves ) {
	if ( moves === 0 ) return;
	let sel = getSelection();
	if ( isNaN( sel ) ) return;
	let sel_v = poset.permutation.indexOf( sel );
	let new_sel_v = sel_v + moves;
	if ( new_sel_v < 0 || new_sel_v >= poset.card() ) return;
	poset.permutation.splice(
		new_sel_v, 0, poset.permutation.splice( sel_v, 1 )[0] );
	poset.reset_permlinks();
	redrawPoset();
}

function changeOffset( increase ) {
	if ( increase === 0 ) return;
	let sel = getSelection();
	poset.offset = poset.offset + increase;
	updateSelectionBounds();
	if ( isNaN( sel ) )
		redrawPoset();
	else
		setSelection( sel );
}

function addEvent() {
	let new_event = poset.card();
	poset.permutation.unshift( new_event );
	poset.reset_permlinks();
	hover = [];
	updateSelectionBounds();
	setSelection( new_event );
}

function dublicateEvent( shift ) {
	let sel = getSelection();
	if ( isNaN( sel ) ) return;
	let sel_v = poset.permutation.indexOf( sel );
	let n = poset.card();
	for ( i = 0; i < n; i++ ) {
		if ( poset.permutation[i] >= sel )
			poset.permutation[i] += 1;
	}
	poset.permutation.splice( sel_v + shift, 0, sel );
	poset.reset_permlinks();
	updateSelectionBounds();
	setSelection( sel );
}

function removeSelectedEvent() {
	let sel = getSelection();
	let n = poset.card();
	if ( isNaN( sel ) || sel < 0 || n === 1 ) return;
	let sel_v = poset.permutation.indexOf( sel );
	poset.permutation.splice( sel_v, 1 );
	for ( let i = 0; i < n; i++ ) {
		if ( poset.permutation[i] > sel ) {
			poset.permutation[i] = poset.permutation[i] - 1;
		}
	}
	poset.reset_permlinks();
	updateSelectionBounds();
	setSelection( Math.min( sel, n - 1 ) );
}

function turnOpposite() {
	const opposite = poset.permutation.slice();
	let sel = getSelection();
	let new_sel = 0;
	let n = poset.card();
	for ( let i = n; i > 0; i-- ) {
		let p = poset.permutation[n - i];
		opposite[n - p - 1] = i - 1;
		if ( p === sel )
			new_sel = i - 1;
	}
	poset.permutation = opposite;
	poset.reset_permlinks();
	setSelection( new_sel );
}

function reflect() {
	const reflected = poset.permutation.slice();
	let sel = getSelection();
	let new_sel = 0;
	let n = poset.card();
	for ( let i = 0; i < n; i++ ) {
		let p = poset.permutation[i];
		reflected[p] = i;
		if ( p === sel ) {
			new_sel = i;
		}
	}
	poset.permutation = reflected;
	poset.reset_permlinks();
	setSelection( new_sel );
}

function copyToInput( textbox ) {
	let text = document.getElementById( textbox ).value;
	const input_textbox = document.getElementById( "txtInputPermutation" );
	input_textbox.value = text;
	input_textbox.focus();
}

function copyToClipboard( textbox ) {
	let text = document.getElementById( textbox ).value;
	navigator.clipboard.writeText( text );
}

function updateSettingsButton( name, redraw ) {
	if ( document.getElementById( "chb" + name ).checked )
		document.getElementById( "lbl" + name ).className = "btn btn-light active";
	else
		document.getElementById( "lbl" + name ).className = "btn btn-light";
	if ( redraw )
		redrawPoset();
}

function updateExport() {
	let option = document.getElementById( "selExportLatexStyle" ).value;
	let strPerm = poset.getPermutationString();
	let strRemlinks = poset.getRemovedLinksString();
	let strLinks = poset.getLinksString();
	document.getElementById( "txtPermutation" ).value = strPerm;
	document.getElementById( "txtLinks" ).value = strLinks;
	document.getElementById( "txtRemlinks" ).value = strRemlinks;
	document.getElementById( "txtExport_pcauset" ).value = 
		"\\pcauset" + option + "{" + strPerm + "}";
	document.getElementById( "txtExport_rcauset" ).value = 
		"\\rcauset" + option + "{" + strPerm + "}{" + strRemlinks + "}";
	document.getElementById( "txtExport_causet" ).value = 
		"\\causet" + option + "{" + strPerm + "}{" + strLinks + "}";
}


// #############################################################################
// Monitor and handle events from input devices

window.addEventListener( "mousemove", handleHover );
window.addEventListener( "click", handleClick );
window.addEventListener( "dblclick", handleDoubleClick );
window.addEventListener( "keydown", handleKeyDown );
window.addEventListener( "resize", handleResize );

function handleHover( e ) {
	if ( updateHoveredTile( e.clientX, e.clientY ) ) {
		redrawPoset();
	}
}

function handleClick( e ) {
	let x = e.clientX;
	let y = e.clientY;
	updateHoveredTile( x, y );
	if ( hover.length == 0 ) {
		let canvas = document.getElementById( "cnvPoset" );
		let canvas_border = canvas.getBoundingClientRect();
		if ( canvas_border.left < x && x < canvas_border.right 
				&& canvas_border.top < y && y < canvas_border.bottom )
			setSelection( NaN );
		return;
	}
	let u = hover[0];
	let p = poset.permutation[hover[1]];
	if ( u === p ) {
		setSelection( u );
		return;
	}
	let sel = getSelection();
	if ( isNaN( sel ) ) return;
	if ( sel != u ) {
		moveU( u - sel );
		return;
	}
	let sel_v = poset.permutation.indexOf( sel );
	moveV( hover[1] - sel_v );
}

function handleDoubleClick( e ) {
	updateHoveredTile( e.clientX, e.clientY );
	if ( hover.length == 0 ) return;
	let u = hover[0];
	let p = poset.permutation[hover[1]];
	if ( u === p ) {
		dublicateEvent( e.shiftKey ? 0 : 1 );
	}
}

function handleKeyDown( e ) {
	switch ( e.code ) {
		case "KeyA":
			if ( e.key === 'A' )
				moveU( -1 );
			else
				selectU( -1 );
			break;
		case "KeyD":
			if ( e.key === 'D' )
				moveU( 1 );
			else
				selectU( 1 );
			break;
		case "KeyS":
			if ( e.key === 'S' )
				moveV( -1 );
			else
				selectV( -1 );
			break;
		case "KeyW":
			if ( e.key === 'W' )
				moveV( 1 );
			else
				selectV( 1 );
			break;
		case "Delete":
			removeSelectedEvent();
			break;
		case "Period":
			addEvent();
			break;
	}
}

function handleResize() {
	if ( updateWidth() ) {
		redrawPoset();
	}
}
