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
	const butRemoveElement = document.getElementById( "butRemoveElement" );
	butRemoveElement.disabled = true;
	butRemoveElement.className = "btn btn-secondary";
	const txtSelection = document.getElementById( "txtSelection" );
	txtSelection.value = "";
	document.getElementById( "butUndo" ).disabled = true;
	document.getElementById( "butRedo" ).disabled = true;
	document.getElementById( "butAutoLink" ).disabled = true;
	const butLink = document.getElementById( "butLink" );
	butLink.disabled = true;
	butLink.className = "btn btn-secondary";
	document.getElementById( "txtLinking" ).value = "";
	updateSettingsButton( "ShowLabels", false );
	document.getElementById( "chbShowCross" ).checked = true;
	updateSettingsButton( "ShowCross", false );
	updateSettingsButton( "ShowGrid", false );
	document.getElementById( "txtCard" ).value = "";
	const strStatusBars = [ "txtPermutation", "txtLinks", "txtRemovedLinks" ];
	for ( let i = 0; i < strStatusBars.length; i++ )
		document.getElementById( strStatusBars[i] ).value = "";
	const frmExports = [ "pcauset", "rcauset", "causet" ];
	for ( let i = 0; i < frmExports.length; i++ ) {
		document.getElementById( "txtExport_" + frmExports[i] ).value = "";
		document.getElementById( "frmExport_" + frmExports[i] ).hidden = true;
	}
	document.getElementById( "txtExportMatrix" ).value = "";
}

function selectInputType() {
	/* Hide/show the input controls for the currently selected import type. */
	let input_type = document.getElementById( "selInputType" ).value;
	document.getElementById( "frmInputPredefined" ).hidden = 
		( input_type != "predefined" );
	document.getElementById( "frmInputPermutation" ).hidden = 
		( !input_type.endsWith( "causet" ) );
	document.getElementById( "frmInputRemovedLinks" ).hidden = 
		( input_type != "rcauset" );
	document.getElementById( "frmInputLinks" ).hidden = 
		( input_type != "causet" );
	document.getElementById( "frmInputLatex" ).hidden = 
		( input_type != "latex" );
	document.getElementById( "frmInputMatrix" ).hidden = 
		( input_type != "matrix" );
}

function updateWidth() {
	/* Adjust canvas size to be a square that fits to the window display width. */
	const padding = 4;
	let current_width = document.getElementById( "cnvPoset" ).width;
	let new_width = document.getElementById( "cnvPosetContainer" ).clientWidth;
	let rel_size = document.getElementById( "selRelativeCanvasSize" ).value;
	let abs_size = document.getElementById( "selAbsoluteCanvasSize" ).value;
	if ( rel_size === "fill" ) {
		if ( abs_size != "unbounded" )
			new_width = parseInt( abs_size, 10 );
		else
			new_width = new_width - padding;
	} else {
		new_width = Math.floor( rel_size / 100 * new_width ) - padding;
		if ( abs_size != "unbounded" )
			new_width = Math.min( new_width, parseInt( abs_size, 10 ) );
	}
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
	let linklist;
	if ( typeof value == "string" )
		linklist = value.split( "," ).map( parseLink );
	else
		linklist = value;
	const linklist_nooptions = [];
	const linklist_withoptions = [];
	for ( let i = 0; i < linklist.length; i++ ) {
		let from = linklist[i][0] - offset;
		let to = linklist[i][1] - offset;
		if ( from < 0 || to > max_element )
			continue;
		if ( linklist[i].length > 2 )
			linklist_withoptions.push( [ from, to ] );
		else
			linklist_nooptions.push( [ from, to ] );
	}
	return [ linklist_nooptions, linklist_withoptions ];
}

function initializeLinkList( n ) {
	/* Returns an array of length `n`, where each element is an empty array. */
	const linklist = new Array( n );
	for ( let i = 0; i < n; i++ )
		linklist[i] = [];
	return linklist;
}
	
function remapLinkList( links, mapping ) {
	/* Updates the linklist `links` by mapping elements from any index `i` to 
	`mapping[i]`. */
	let n = links.length;
	const remapped_links = initializeLinkList( n );
	for ( let i = 0; i < n; i++ ) {
		let linklist = links[i];
		let i_m = mapping[i];
		for ( let l = 0; l < linklist.length; l++ ) {
			let j_m = mapping[linklist[l]];
			let p = Math.min( i_m, j_m );
			let q = Math.max( i_m, j_m );
			remapped_links[p].push( q );
		}
	}
	return remapped_links;
}

function raiseLinkedElements( linkedelements, e, offset, addLinksTo ) {
	/* Offsets all elements larger than `e` in `linkedelements` by `offset` and 
	replaces `e` by `new_e`. If `e` is in the list, the elements of the array 
	`addLinksTo` are added to the list as well. */
	for ( let l = 0; l < linkedelements.length; l++ ) {
		if ( linkedelements[l] > e )
			linkedelements[l] = linkedelements[l] + offset;
	}
	if ( addLinksTo.length === 0 || !linkedelements.includes( e ) ) return;
	for ( let l = 0; l < addLinksTo.length; l++ )
		linkedelements.push( addLinksTo[l] );
}

class Poset {
	/* Main class to hold the permutation (position of elements) and link lists. 
	The elements in the permutation are indexed starting from 0 and the parameter 
	`offset` shifts the labels. */
	
	constructor( permutation, links, autolinking ){
		this.error = "";  // holds an input error message (if any)
		// parse permutation for the element positions:
		try {
			const parsed_permutation = parsePermutation( permutation );
			this.permutation = parsed_permutation[0];
			this.offset = parsed_permutation[1];
		} catch ( e ) {
			this.error = e.toString();
			return;
		}
		// parse links:
		this.resetLinks( autolinking );
		try {
			const parsed_links = parseLinks( links, this.offset, this.card() - 1 );
			let linkpairs = parsed_links[0];
			if ( autolinking ) {
				for ( let l = 0; l < linkpairs.length; l++ ) {
					this.removeLink( linkpairs[l][0], linkpairs[l][1] );
				}
			} else {
				for ( let l = 0; l < linkpairs.length; l++ ) {
					this.addLink( linkpairs[l][0], linkpairs[l][1] );
				}
			}
			linkpairs = parsed_links[1];
			for ( let l = 0; l < linkpairs.length; l++ ) {
				this.addLink( linkpairs[l][0], linkpairs[l][1] );
			}
		} catch ( e ) {
			this.error = e.toString();
			return;
		}
	}
	
	card() {
		return this.permutation.length;
	}
	
	resetLinks( autolinking ) {
		/* Resets the list of links and auto links from the permutation if 
		`autolinking = true`. */
		let n = this.card();
		this.autolinks = initializeLinkList( n );
		this.removedlinks = initializeLinkList( n );
		this.addedlinks = initializeLinkList( n );
		this.links = initializeLinkList( n );
		// find auto links:
		for ( let i = 0; i < n; i++ ) {
			let p = this.permutation[i];
			let bound = n;
			for ( let j = i + 1; j < n; j++ ) {
				let q = this.permutation[j];
				if ( p < q && q < bound ) {
					this.autolinks[p].push( q );
					if ( autolinking )
						this.links[p].push( q );
					else
						this.removedlinks[p].push( q );
					bound = q;
				}
			}
		}
	}
	
	remapLinks( mapping ) {
		/* Remaps all links of the poset via `remapLinkList`. */
		this.autolinks = remapLinkList( this.autolinks, mapping );
		this.removedlinks = remapLinkList( this.removedlinks, mapping );
		this.addedlinks = remapLinkList( this.addedlinks, mapping );
		this.links = remapLinkList( this.links, mapping );
	}
	
	isOrdered( i, j ) {
		/* Returns true if `i < j` (full partial order relation, not only links). */
		if ( this.links[i].includes( j ) ) return true;
		const ordered = new Array( j - i + 1 );
		ordered[0] = true;
		ordered[j - i] = false;
		for ( let o = i; o < j; o++ ) {
			if ( !ordered[o - i] ) continue;
			let links = this.links[o];
			for ( let l = 0; l < links.length; l++ ) {
				if ( links[l] < o || links[l] > j ) continue;
				ordered[links[l] - i] = true;
			}
		}
		return ordered[j - i];
	}
	
	removeLink( i, j, ignoreerrors = false ) {
		/* Removes a link from element `i` to `j` (or `j` to `i` if `i > j`). If 
		`ignoreerrors` and both arguments are the same or there is no link between 
		the elements, then an error is raised. */
		if ( i > j ) {
			this.removeLink( j, i, ignoreerrors );
			return;
		}
		if ( i === j ) {
			if ( ignoreerrors ) return;
			throw Error( "An element cannot be unlinked from itself." );
		}
		let l = this.links[i].indexOf( j );
		if ( l === -1 ) {
			if ( ignoreerrors ) return;
			throw Error( "The element " + i.toString() + " is not linked to " 
				+ j.toString() + "." );
		}
		this.links[i].splice( l, 1 );
		l = this.addedlinks[i].indexOf( j );
		if ( l > -1 )
			this.addedlinks[i].splice( l, 1 );
		if ( this.autolinks[i].includes( j ) )
			this.removedlinks[i].push( j );
	}
	
	addLink( i, j, ignoreerrors = false ) {
		/* Adds a link from element `i` to `j` (or `j` to `i` if `i > j`). An 
		error is raised if both arguments are the same or they are already related. 
		*/
		if ( i > j ) {
			this.addLink( j, i, ignoreerrors );
			return;
		}
		if ( i === j ) {
			if ( ignoreerrors ) return;
			throw Error( "An element cannot be linked to itself." );
		}
		if ( this.links[i].includes( j ) ) {
			if ( ignoreerrors ) return;
			throw Error( "The element " + i.toString() + " already precedes " 
				+ j.toString() + "." )
		}
		// remove links from an element `a <= i` to an element `b >= j`:
		for ( let a = 0; a <= i; a++ ) {
			let linkcount = this.addedlinks[a];
			for ( let l = linkcount - 1; l >= 0; l-- ) {
				let b = this.addedlinks[a][l];
				if ( j <= b && ( ( a === i ) || this.isOrdered( a, i ) ) 
						&& ( ( j === b ) || this.isOrdered( j, b ) ) ) {
					this.removeLink( a, b, true );
				}
			}
		}
		// re-add link (remove from "removed links"):
		let l = this.removedlinks[i].indexOf( j );
		if ( l > -1 )
			this.removedlinks[i].splice( l, 1 );
		this.links[i].push( j );
		if ( !this.autolinks[i].includes( j ) )
			this.addedlinks[i].push( j );
	}
	
	isLinkable( i, j ) {
		/* Returns -1 if the elements with indices `i` and `j` are linked and the 
		link can be removed. Returns 1 if the elements are not linked, but can be 
		linked. Returns 0 otherwise. */
		if ( j <= i ) return 0;
		let iv = this.permutation.indexOf( i );
		let jv = this.permutation.indexOf( j );
		if ( jv <= iv ) return 0;
		if ( this.links[i].includes( j ) ) {
			if ( this.links[i].length <= 1 ) return 0;
			if ( this.findCoveredElements( this.links, j ).length <= 1 ) return 0;
			return -1;  // can be unlinked
		}
		if ( this.isOrdered( i, j ) ) return 0;
		return 1;  // can be linked
	}
	
	findCoveredElements( linklist, j ) {
		/* Returns the list of links that go from any element to `j`. Returns an 
		empty array if `j` does not cover any elements or if `j` is out of bounds. 
		*/
		const covered = [];
		if ( j >= linklist.length ) return covered;
		for ( let i = 0; i < j; i++ ) {
			if ( linklist[i].includes( j ) )
				covered.push( i );
		}
		return covered;
	}
	
	pushNewElement() {
		/* Adds a new element to the right of the diagram. */
		let i = this.card();
		this.permutation.unshift( i );
		this.autolinks.push( [] );
		this.removedlinks.push( [] );
		this.addedlinks.push( [] );
		this.links.push( [] );
	}
	
	dublicateElement( e, related ) {
		/* Dublicates the element `e` into a 2-antichain or a 2-chain (if `related` 
		is true). Raises an error if `e` is out of bounds. */
		let n = this.card();
		if ( e < 0 || e >= n )
			throw Error( "There is no element " + getElementString( e ) + "." );
		let v = this.permutation.indexOf( e );
		for ( let i = 0; i < n; i++ ) {
			if ( this.permutation[i] >= e )
				this.permutation[i] += 1;
		}
		this.permutation.splice( v + Number( !related ), 0, e );
		let addLinksTo = related ? [] : [ e + 1 ];
		for ( let i = 0; i < n; i++ ) {
			raiseLinkedElements( this.autolinks[i], e, 1, addLinksTo );
			raiseLinkedElements( this.removedlinks[i], e, 1, addLinksTo );
			raiseLinkedElements( this.addedlinks[i], e, 1, addLinksTo );
			raiseLinkedElements( this.links[i], e, 1, addLinksTo );
		}
		if ( related ) {
			this.autolinks.splice( e, 0, [ e + 1 ] );
			this.removedlinks.splice( e, 0, [] );
			this.addedlinks.splice( e, 0, [] );
			this.links.splice( e, 0, [ e + 1 ] );
		} else {
			this.autolinks.splice( e + 1, 0, this.autolinks[e].slice() );
			this.removedlinks.splice( e + 1, 0, this.removedlinks[e].slice() );
			this.addedlinks.splice( e + 1, 0, this.addedlinks[e].slice() );
			this.links.splice( e + 1, 0, this.links[e].slice() );
		}
	}
	
	reset_restoreLinks( e, f, isremoving_e = false ) {
		/* This is a class private method. Resets to auto-links and restores all 
		removed/added links but ignores the elements `e` (and `f`), while `e` is 
		treated as removed element if `isremoving_e`. */
		let removedlinks = this.removedlinks;
		let addedlinks = this.addedlinks;
		this.resetLinks( true );
		// restore removed links, while shifting elements larger than `e`:
		for ( let i = 0; i < removedlinks.length; i++ ) {
			if ( i === e || i === f ) continue;
			let removedlinks_i = removedlinks[i];
			let a = ( !isremoving_e || i < e ) ? i : ( i - 1 );
			for ( let l = 0; l < removedlinks_i.length; l++ ) {
				let b = removedlinks_i[l];
				if ( b === e || b === f ) continue;
				if ( isremoving_e && e < b ) b = b - 1;
				if ( this.isLinkable( a, b ) === -1 )
					this.removeLink( a, b, true );
			}
		}
		// restore added links, while shifting elements larger than `e`:
		for ( let i = 0; i < addedlinks.length; i++ ) {
			if ( i === e || i === f ) continue;
			let addedlinks_i = addedlinks[i];
			let a = ( !isremoving_e || i < e ) ? i : ( i - 1 );
			for ( let l = 0; l < addedlinks_i.length; l++ ) {
				let b = addedlinks_i[l];
				if ( b === e || b === f ) continue;
				if ( isremoving_e && e < b ) b = b - 1;
				if ( this.isLinkable( a, b ) === 1 )
					this.addLink( a, b, true );
			}
		}
	}
	
	removeElement( e ) {
		/* Remove the element `e`. Raises an error if it is out of bounds. */
		let n = this.card();
		if ( e < 0 || e >= n )
			throw Error( "There is no element " + getElementString( e ) + "." );
		let v = this.permutation.indexOf( e );
		this.permutation.splice( v, 1 );
		for ( let i = 0; i < n; i++ ) {
			if ( this.permutation[i] > e )
				this.permutation[i] = this.permutation[i] - 1;
		}
		this.reset_restoreLinks( e, e, true );
	}
	
	moveU( e, moves ) {
		/* Moves the element `e` in u-direction by `moves` steps (does nothing if 
		moves === 0). Raises an error if the current or new position of the element 
		is out of bounds. Returns the new u-position. */
		let v = this.permutation.indexOf( e );
		if ( moves === 0 ) return e;
		let n = this.card();
		if ( e < 0 || e >= n )
			throw Error( "There is no element " + getElementString( e ) + "." );
		let e_new = e + moves;
		if ( e_new < 0 || e_new >= n )
			throw Error( "The new position lies outside the diagram." );
		let dir = ( moves > 0 ) ? 1 : -1;
		for ( let i = e + dir; dir * ( e_new - i ) >= 0; i = i + dir ) {
			let j = this.permutation.indexOf( i );
			this.permutation[j] = i - dir;
		}
		this.permutation[v] = e_new;
		this.reset_restoreLinks( e, e_new );
		return e_new;
	}
	
	moveV( e, moves ) {
		/* Moves the element `e` in v-direction by `moves` steps (does nothing if 
		moves === 0). Raises an error if the current or new position of the element 
		is out of bounds. Returns the new v-position. */
		let v = this.permutation.indexOf( e );
		if ( moves === 0 ) return v;
		let n = this.card();
		if ( e < 0 || e >= n )
			throw Error( "There is no element " + getElementString( e ) + "." );
		let v_new = v + moves;
		if ( v_new < 0 || v_new >= n )
			throw Error( "The new position lies outside the diagram." );
		let e_new = this.permutation[v_new];
		this.permutation.splice(
			v_new, 0, this.permutation.splice( v, 1 )[0] );
		this.reset_restoreLinks( e, e_new );
		return v_new;
	}
	
	toLinkMatrix() {
		/* Returns the poset as an n times n, upper-triangular, boolean matrix `M` 
		where `M[i][j]` is true iff element `i` is linked to `j`. Since elements 
		are not linked to themselves, the diagonal is `false`. */
		let n = this.card();
		let matrix = new Array( n );
		for ( let i = 0; i < n; i++ ) {
			let links = this.links[i];
			let linked_bool = [];
			for ( let j = 0; j < n; j++ )
				linked_bool[j] = false;
			for ( let l = 0; l < links.length; l++ )
				linked_bool[links[l]] = true;
			matrix[i] = linked_bool;
		}
		return matrix;
	}
	
	toOrderMatrix() {
		/* Returns the poset as an n times n, upper-triangular, boolean matrix `M` 
		where `M[i][j]` is true iff element `i` is strictly ordered before `j`. */
		let n = this.card();
		let matrix = this.toLinkMatrix();
		for ( let i = 0; i < n; i++ ) {
			for ( let j = i + 1; j < n; j++ ) {
				if ( !matrix[i][j] ) continue;
				for ( let k = j + 1; k < n; k++ )
					matrix[i][k] = matrix[i][k] || matrix[j][k];
			}
		}
		return matrix;
	}
	
	getPermutationString() {
		return this.permutation.map( getElementString ).join( "," );
	}
	
	get_LinksString( linklist, targetmap ) {
		/* This method is class private. It converts the nested array `linklist` 
		into a comma-separated string. Each item is formatted as number/(*) where 
		(*) stands for the return of `targetmap` for the target element of the 
		links. */
		let s = "";
		for ( let i = 0; i < linklist.length; i++ ) {
			if ( linklist[i].length === 0 ) continue;
			let from = getElementString( i ) + "/";
			if ( s.length > 0 ) s = s + ",";
			s = s + from + linklist[i].map( targetmap ).join( "," + from );
		}
		return s;
	}
	
	getRemovedLinksString() {
		return this.get_LinksString( this.removedlinks, getElementString );
	}
	
	getAddedLinksString() {
		return this.get_LinksString( this.addedlinks, getAddedLinkTargetString );
	}
	
	getLinksString() {
		return this.get_LinksString( this.links, getElementString );
	}
	
}


// #############################################################################
// Generation from import data

let poset;
	
function getElementString( e ) {
	return String( e + poset.offset );
}
	
function getAddedLinkTargetString( e ) {
	return getElementString( e ) + "/";
}

function generate() {
	let input_type = document.getElementById( "selInputType" ).value;
	let input_perm = document.getElementById( "txtInputPermutation" ).value;
	let error = "";
	let new_poset;
	try {
		if ( input_type === "predefined" )
			new_poset = getPredefined();
		else if ( input_type === "pcauset" )
			new_poset = new Poset( input_perm, "", true );
		else if ( input_type === "rcauset" )
			new_poset = new Poset( input_perm, 
				document.getElementById( "txtInputRemovedLinks" ).value, true );
		else if ( input_type === "causet" )
			new_poset = new Poset( input_perm, 
				document.getElementById( "txtInputLinks" ).value, false );
		else if ( input_type === "latex" ) {
			new_poset = getFromLatexMacro(
				document.getElementById( "txtInputLatex" ).value );
		}
		error = new_poset.error;
	} catch ( e ) {
		error = e.toString();
	}
	const msgInputError = document.getElementById( "msgInputError" );
	if ( error ) {
		msgInputError.innerText = error;
		msgInputError.hidden = false;
		return;
	}
	msgInputError.hidden = true;
	poset = new_poset;
	updateSelectionBounds();
	setSelection( NaN );
	updateExport();
	addUndoStep();
	window.location.href = "#edit";
}

function getPredefined() {
	let input_type = document.getElementById( "selInputPredefinedType" ).value;
	let n = parseInt( document.getElementById( "txtInputOrder" ).value, 10 );
	if ( isNaN( n ) || n < 1 || n > 1000 )
		throw Error( "The value for 'n' has to be a strictly positive integer." )
	if ( input_type === "chain" )
		return getPredefined_chain( n );
	if ( input_type === "antichain" )
		return getPredefined_antichain( n );
	if ( input_type === "random" )
		return getPredefined_random( n );
	if ( input_type === "fence" )
		return getPredefined_fence( n );
	if ( input_type === "polygon" )
		return getPredefined_polygon( n );
	if ( input_type === "crown" )
		return getPredefined_crown( n );
	throw Error( "The poset type '" + input_type + "' is not implemented." );
}

function getPredefined_chain( n ) {
	const permutation = [];
	for ( let i = 0; i < n; )
		permutation[i] = ++i;
	return new Poset( permutation, [], true );
}

function getPredefined_antichain( n ) {
	const permutation = [];
	for ( let i = 0; i < n; i++ )
		permutation[i] = n - i;
	return new Poset( permutation, [], true );
}

function getPredefined_random( n ) {
	const permutation = [];
	for ( let i = 0; i < n; )
		permutation[i] = ++i;
	for ( let i = n - 1; i > 0; i-- ) {
		let j = Math.floor( Math.random() * ( i + 1 ) );
		let swap = permutation[i];
		permutation[i] = permutation[j];
		permutation[j] = swap;
	}
	return new Poset( permutation, [], true );
}

function getPredefined_fence( n ) {
	if ( n === 1 ) return new Poset( [ 1 ], [], true );
	const permutation = [ n - 1 ];
	for ( let i = n % 2; i < n; i++ ) {
		permutation[i] = Math.max( 1, n - i - 2 );
		permutation[++i] = Math.min( n - i + 2, n );
	}
	return new Poset( permutation, [], true );
}

function getPredefined_crown( n ) {
	if ( n === 1 ) throw Error( "Crown posets only exist for n > 1." );
	const permutation = [ n + 1 ];
	for ( let i = n - 1; i >= 2; i-- )
		permutation.push( i );
	permutation.push( 2 * n, 1 );
	for ( let i = 2 * n - 1; i >= 2 + n; i-- )
		permutation.push( i );
	permutation.push( n );
	const removedlinks = [];
	for ( let i = 2; i < n; i++ )
		removedlinks.push( [ i, 2 * n - i + 1 ] );
	return new Poset( permutation, removedlinks, true );
}

function getPredefined_polygon( n ) {
	if ( n === 1 ) return new Poset( [ 0, 1, 2, 3 ], [], true );
	if ( n === 2 ) return new Poset( [ 0, 2, 1, 4, 3, 5 ], [], true );
	const permutation = [ 0, 2 * ( n - 1 ), 2 * ( n - 2 ), 2 * n ];
	for ( let i = 3; i < n; i++ )
		permutation.push( 2 * ( n - i ), 2 * ( n - i + 3 ) - 1 );
	permutation.push( 1, 5, 3, 2 * n + 1 );
	const removedlinks = [];
	let max = 2 * n - 4;
	for ( let i = 2; i <= max; i = i + 2 )
		removedlinks.push( [ i, i + 3 ] );
	return new Poset( permutation, removedlinks, true );
}

function getFromLatexMacro_find_endgroup( macro, start ) {
	let endgroup = macro.indexOf( "}", start );
	if ( endgroup < 0 ) return -1;
	let begingroup = macro.indexOf( "{", start );
	if ( begingroup < start || begingroup > endgroup )
		return endgroup;
	endgroup = getFromLatexMacro_find_endgroup( macro, begingroup + 1 );
	if ( endgroup < 0 ) return -1;
	return getFromLatexMacro_find_endgroup( macro, endgroup + 1 );
}

function getFromLatexMacro( macro ) {
	macro = macro.trim();
	let is_pcauset = macro.startsWith( "\\pcauset{" )
		|| macro.startsWith( "\\pcauset[" ) || macro.startsWith( "\\pcauset " );
	let is_rcauset = macro.startsWith( "\\rcauset{" )
		|| macro.startsWith( "\\rcauset[" ) || macro.startsWith( "\\rcauset " );
	let is_causet = macro.startsWith( "\\causet{" )
		|| macro.startsWith( "\\causet[" ) || macro.startsWith( "\\causet " );
	if ( !is_pcauset && !is_rcauset && !is_causet )
		throw Error( "This value cannot be processed. Supported macros are: " + 
			"\\pcauset, \\rcauset, \\causet." );
	let begingroup = macro.indexOf( "{" ) + 1;
	if ( begingroup < 1 )
		throw Error( "The LaTeX macro has to have a first argument starting " + 
			"with an opening brace {." );
	let endgroup = getFromLatexMacro_find_endgroup( macro, begingroup );
	if ( endgroup < begingroup )
		throw Error( "The first argument has no closing brace }." );
	if ( is_pcauset )
		return new Poset( macro.slice( begingroup, endgroup ), [], true );
	let begingroup2 = macro.indexOf( "{", endgroup ) + 1;
	if ( begingroup2 < 1 )
		throw Error( "The LaTeX macro has to have an second argument starting " + 
			"with an opening brace {." );
	let endgroup2 = getFromLatexMacro_find_endgroup( macro, begingroup2 );
	if ( endgroup2 < begingroup2 )
		throw Error( "The second argument has no closing brace }." );
	return new Poset(
		macro.substring( begingroup, endgroup ),
		macro.substring( begingroup2, endgroup2 ),
		is_rcauset
	);
}


// #############################################################################
// Initialize editor and handle input/import data

let hover = [];
let linkable = 0;

function updateSelectionBounds() {
	let lower = poset.offset;
	let upper = poset.card() - 1 + poset.offset;
	document.getElementById( "txtSelection" ).min = lower.toString();
	document.getElementById( "txtSelection" ).max = upper.toString();
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
	const butRemoveElement = document.getElementById( "butRemoveElement" );
	butRemoveElement.disabled = ( strSel == "" ) || ( poset.card() === 1 );
	if ( butRemoveElement.disabled )
		butRemoveElement.className="btn btn-secondary";
	else
		butRemoveElement.className="btn btn-outline-danger";
	const txtSelection = document.getElementById( "txtSelection" );
	txtSelection.value = strSel;
	document.getElementById( "txtLinking" ).value = "";
	const butLink = document.getElementById( "butLink" );
	butLink.className="btn btn-secondary";
	butLink.disabled = true;
	linkable = false;
	redrawPoset();
}

function resetSelection() {
	setSelection( getSelection() );
}

function getLinkingSelection() {
	let sel = document.getElementById( "txtLinking" ).value;
	let sel_int = parseInt( sel.trim(), 10 ) - poset.offset;
	if ( ( sel_int >= 0 ) && ( sel_int < poset.card() ) ) {
		return sel_int;
	}
	return NaN;
}

function setLinkingSelection( new_sel ) {
	let strSel = "";
	if ( new_sel >= 0 && new_sel < poset.card() )
		strSel = String( new_sel + poset.offset );
	document.getElementById( "txtLinking" ).value = strSel;
	const butLink = document.getElementById( "butLink" );
	butLink.disabled = ( strSel == "" );
	if ( butLink.disabled )
		butLink.className="btn btn-secondary";
	else
		butLink.className="btn btn-outline-primary";
	redrawPoset();
}

function initializeCanvas( context, n ) {
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
const link_width = 0.08;
const linking_width = 0.14;
const event_hover_size = 0.33;
const event_linking_size = 0.17;
const selection_color = "red";
const selection_cross_color = "#ffe6e2"; // #e9ecef";
const relocation_color = "#90b030";
const event_color = "black";
const event_hover_color = "#703030";
const event_linking_color = "#007bff";
const unlinked_color = "#d0ebff";
const link_color = "#6c757d";

function redrawPoset() {
	let canvas = document.getElementById( "cnvPoset" );
	let context = canvas.getContext( "2d" );
	let sel = getSelection();
	let sel_v = poset.permutation.indexOf( sel );
	let linksel = getLinkingSelection();
	let linksel_v = poset.permutation.indexOf( linksel );
	let n = poset.card();
	initializeCanvas( context, n );  // setup canvas
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
			context.ellipse( sel + 0.5, sel_v + 0.5, 
				event_hover_size, event_hover_size, 0, 0, 2 * Math.PI );
			context.fill();
		} else if ( hovered_event != sel ) {
			context.fillStyle = selection_color;
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
	for ( let i = 0; i < n; i++ ) {
		let linked_elements = poset.links[i];
		for ( let l = 0; l < linked_elements.length; l++ ) {
			let j = linked_elements[l];
			context.lineWidth = link_width;
			context.strokeStyle = link_color;
			if ( ( sel === i && linksel === j ) ) {
				if ( linkable === -1 ) {
					context.lineWidth = linking_width;
					context.strokeStyle = event_linking_color;
				}
			}
			context.beginPath();
			context.moveTo( i + 0.5, poset.permutation.indexOf( i ) + 0.5 );
			context.lineTo( j + 0.5, poset.permutation.indexOf( j ) + 0.5 );
			context.stroke();
		}
	}
	if ( !isNaN( sel ) && !isNaN( linksel ) 
			&& !poset.links[sel].includes( linksel ) ) {
		context.lineWidth = link_width;
		context.strokeStyle = unlinked_color;
		context.beginPath();
		context.moveTo( sel + 0.5, sel_v + 0.5 );
		context.lineTo( linksel + 0.5, linksel_v + 0.5 );
		context.stroke();
	}
	// draw poset elements (events)
	for ( let i = 0; i < n; i++ ) {
		let p = poset.permutation[i];
		context.fillStyle = event_color;
		if ( hovered_event != sel && hovered_event === p )
			context.fillStyle = event_hover_color;
		else if ( is_hovering && hovered_event === -1 && p === sel )
			context.fillStyle = selection_cross_color;
		else if ( p === linksel )
			context.fillStyle = event_linking_color;
		else if ( p === sel )
			context.fillStyle = selection_color;
		context.beginPath();
		context.ellipse( p + 0.5, i + 0.5, 
			event_size, event_size, 0, 0, 2 * Math.PI );
		context.fill();
	}
	if ( !isNaN( linksel )
			&& ( !is_hovering || linksel != hover[0] || linksel_v != hover[1] ) ) {
		context.fillStyle = event_color;
		context.beginPath();
		context.ellipse( linksel + 0.5, linksel_v + 0.5, 
			event_linking_size, event_linking_size, 0, 0, 2 * Math.PI );
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
			context.fillStyle = event_color;
			if ( p === sel )
				context.fillStyle = selection_color;
			context.beginPath();
			context.fillText( p + poset.offset, x, -y );
		}
		// context.restore();
	}
}


// #############################################################################
// Editor (toolbar) functions

const undosteps_max = 100;
let undosteps = [];
let undoindex = -1;

function addUndoStep() {
	if ( undoindex < undosteps.length - 1 )
		// delete undo steps that are larger than `undoindex`
		undosteps.splice( undoindex + 1, undosteps.length - undoindex - 1 );
	const strPerm = document.getElementById( "txtPermutation" ).value;
	if ( strPerm.length > 0 ) {
		const strLinks = document.getElementById( "txtLinks" ).value;
		if ( undosteps.length >= undosteps_max )
			undosteps.splice( 0, undosteps_max - undosteps.length + 1 );
		undosteps.push( [ strPerm, strLinks ] );
	}
	undoindex = undosteps.length - 1;
	document.getElementById( "butUndo" ).disabled = ( undoindex <= 0 );
	document.getElementById( "butRedo" ).disabled = true;
}

function resetToUndoStep( dir ) {
	let new_undoindex = undoindex + dir;
	if ( new_undoindex < 0 || new_undoindex >= undosteps.length ) return;
	let new_poset = new Poset(
		undosteps[new_undoindex][0],
		undosteps[new_undoindex][1],
		undosteps[new_undoindex][1].length === 0
	);
	const msgInputError = document.getElementById( "msgInputError" );
	if ( new_poset.error ) {
		msgInputError.innerText = new_poset.error;
		msgInputError.hidden = false;
		return;
	}
	msgInputError.hidden = true;
	poset = new_poset;
	undoindex = new_undoindex;
	document.getElementById( "butUndo" ).disabled = 
		( undoindex <= 0 );
	document.getElementById( "butRedo" ).disabled = 
		( undoindex >= undosteps.length - 1 );
	updateSelectionBounds();
	setSelection( NaN );
	updateExport();
}

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
	if ( !isNaN( sel ) && ( sel_v >= 0 ) && 
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
	let u = poset.moveU( sel, moves );
	setSelection( u );
	updateExport();
	addUndoStep();
}

function moveV( moves ) {
	if ( moves === 0 ) return;
	let sel = getSelection();
	if ( isNaN( sel ) ) return;
	poset.moveV( sel, moves );
	redrawPoset();
	updateExport();
	addUndoStep();
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
	updateExport();
}

function addElement() {
	poset.pushNewElement();
	hover = [];
	updateSelectionBounds();
	setSelection( poset.card() - 1 );
	updateExport();
	addUndoStep();
}

function dublicateElement( shift ) {
	let sel = getSelection();
	if ( isNaN( sel ) ) return;
	poset.dublicateElement( sel, shift );
	hover = [];
	updateSelectionBounds();
	setSelection( sel + 1 );
	updateExport();
	addUndoStep();
}

function removeElement() {
	let sel = getSelection();
	let n = poset.card();
	if ( isNaN( sel ) || sel < 0 || n === 1 ) return;
	poset.removeElement( sel );
	hover = [];
	updateSelectionBounds();
	setSelection( Math.min( sel, n - 1 ) );
	updateExport();
	addUndoStep();
}

function changeLink() {
	let sel = getSelection();
	let linksel = getLinkingSelection();
	if ( isNaN( sel ) || isNaN( linksel ) ) return;
	if ( poset.links[sel].includes( linksel ) )
		poset.removeLink( sel, linksel );
	else if ( poset.isLinkable( sel, linksel ) )
		poset.addLink( sel, linksel );
	linkable = poset.isLinkable( sel, linksel );
	redrawPoset();
	updateExport();
	addUndoStep();
}

function autoLink() {
	if ( !document.getElementById( "frmExport_pcauset" ).hidden ) return;
	poset.resetLinks( true );
	setLinkingSelection( NaN );
	updateExport();
	addUndoStep();
}

function turnOpposite() {
	const opposite = poset.permutation.slice();
	let sel = getSelection();
	let new_sel = NaN;
	let n = poset.card();
	for ( let i = n; i > 0; i-- ) {
		let p = poset.permutation[n - i];
		opposite[n - p - 1] = i - 1;
		if ( p === sel )
			new_sel = i - 1;
	}
	poset.permutation = opposite;
	poset.remapLinks( opposite.toReversed() );
	hover = [];
	setSelection( new_sel );
	updateExport();
}

function reflect() {
	const reflected = poset.permutation.slice();
	let sel = getSelection();
	let new_sel = NaN;
	let n = poset.card();
	for ( let i = 0; i < n; i++ ) {
		let p = poset.permutation[i];
		reflected[p] = i;
		if ( p === sel ) {
			new_sel = i;
		}
	}
	poset.permutation = reflected;
	poset.remapLinks( reflected );
	hover = [];
	setSelection( new_sel );
	updateExport();
}

function revise() {
	const txtInputPermutation = document.getElementById( "txtInputPermutation" );
	txtInputPermutation.value = document.getElementById( "txtPermutation" ).value;
	let strInputType = "pcauset";
	let strRemovedLinks = poset.getRemovedLinksString();
	if ( strRemovedLinks.length > 0 ) {
		strInputType = "rcauset";
		let strAddlinks = poset.getAddedLinksString();
		if ( strAddlinks.length > 0 )
			strRemovedLinks = strRemovedLinks + "," + strAddlinks;
	}
	document.getElementById( "selInputType" ).value = strInputType;
	document.getElementById( "txtInputRemovedLinks" ).value = strRemovedLinks;
	document.getElementById( "txtInputLinks" ).value = 
		document.getElementById( "txtLinks" ).value;
	selectInputType();
	window.location.href = "#import";
	txtInputPermutation.focus();
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
	let style = document.getElementById( "selExportLatexStyle" ).value;
	let strPerm = poset.getPermutationString();
	let strRemovedLinks = poset.getRemovedLinksString();
	let strAddlinks = poset.getAddedLinksString();
	let strLinks = poset.getLinksString();
	document.getElementById( "txtCard" ).value = poset.card().toString();
	document.getElementById( "txtPermutation" ).value = strPerm;
	document.getElementById( "txtLinks" ).value = strLinks;
	document.getElementById( "txtRemovedLinks" ).value = strRemovedLinks;
	if ( strAddlinks.length > 0 )
		strRemovedLinks = strRemovedLinks + "," + strAddlinks;
	document.getElementById( "txtExport_pcauset" ).value = 
		"\\pcauset" + style + "{" + strPerm + "}";
	document.getElementById( "txtExport_rcauset" ).value = 
		"\\rcauset" + style + "{" + strPerm + "}{" + strRemovedLinks + "}";
	document.getElementById( "txtExport_causet" ).value = 
		"\\causet" + style + "{" + strPerm + "}{" + strLinks + "}";
	let export_pcauset = ( strRemovedLinks.length === 0 );
	document.getElementById( "butAutoLink" ).disabled = export_pcauset;
	document.getElementById( "frmExport_pcauset" ).hidden = !export_pcauset;
	document.getElementById( "frmExport_rcauset" ).hidden = export_pcauset;
	document.getElementById( "frmExport_causet" ).hidden = export_pcauset;
	document.getElementById( "txtExportMatrix" ).value = "";
}

function getExportMatrix() {
	let type = document.getElementById( "selExportMatrixType" ).value;
	let matrix;
	if ( type === "link" )
		matrix = poset.toLinkMatrix();
	else
		matrix = poset.toOrderMatrix();
	function rowmapping( row ) {
		return row.map( Number ).join( "," );
	}
	document.getElementById( "txtExportMatrix" ).value = 
		matrix.map( rowmapping ).join( "\n" );
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
		// clicked neither on an element nor on a moving position:
		let canvas = document.getElementById( "cnvPoset" );
		let canvas_border = canvas.getBoundingClientRect();
		if ( canvas_border.left < x && x < canvas_border.right 
				&& canvas_border.top < y && y < canvas_border.bottom )
			setSelection( NaN );
		return;
	}
	let u = hover[0];
	let p = poset.permutation[hover[1]];
	let sel = getSelection();
	let linksel = getLinkingSelection();
	if ( u === p ) {
		// clicked on an element:
		if ( !isNaN( sel ) ) {
			linkable = poset.isLinkable( sel, u );
			if ( linkable != 0 && ( isNaN( linksel ) || linksel != u ) ) {
				document.getElementById( "butLink" ).disabled = false;
				setLinkingSelection( u );
				return;
			}
		}
		setSelection( u );
		return;
	}
	if ( isNaN( sel ) ) return;
	// clicked on a moving position:
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
		dublicateElement( e.shiftKey );
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
			removeElement();
			break;
		case "Period":
			addElement();
			break;
	}
}

function handleResize() {
	if ( updateWidth() ) {
		redrawPoset();
	}
}
