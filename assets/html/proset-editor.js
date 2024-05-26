// @author: Christoph Minz
// @created: 19/02/2024
// @license: BSD 3-Clause

class Poset {
	
	constructor( permutation ){
		if ( permutation.constructor === Array ) {
			this.permutation = permutation;
		} else {
			this.permutation = permutation.split( "," ).map(
				function( element ) {
					return parseInt( element, 10 );
				}
			);
		}
		// TODO: make sure that it is a permutation of 1 to some pos. integer n
	}
	
	card() {
		return this.permutation.length;
	}
	
	toString() {
		return poset.permutation.join( "," );
	}
	
	toLatexCode( showLabels, showPermutation ) {
		let code = "\\pcauset"
		if ( showLabels && showPermutation ) {
			code += "X"
		} else if ( showLabels ) {
			code += "L"
		} else if ( showPermutation ) {
			code += "P"
		}
		code += "{" + this.toString() + "}"
		return code;
	}
	
}

let poset;

function generatePosetFromInput() {
	let permStr = document.getElementById( "txtInput" ).value;
	poset = new Poset( permStr );
	updateSelectionBound();
	setSelection( 0 );
}

function updateSelectionBound() {
	document.getElementById( "txtSelection" ).max = poset.card().toString();
}

function getSelection() {
	let sel = document.getElementById( "txtSelection" ).value;
	let sel_int = parseInt( sel, 10 );
	if ( sel_int >= 1 && sel_int <= poset.card() )
		return sel_int;
	return 0; // invalid or empty selection
}

function setSelection( new_sel ) {
	if ( new_sel < 0 || new_sel > poset.card() )
		return;
	document.getElementById( "txtSelection" ).value = new_sel.toString();
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
	context.strokeStyle = "#f0f0f0";
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

function redrawPoset() {
	let canvas = document.getElementById( "cnvPoset" );
	let context = canvas.getContext( "2d" );
	let sel = getSelection();
	initCanvas( context, poset.card() );  // setup canvas
	// draw selection cross
	if ( document.getElementById( "chbShowCross" ).checked ) {
		if ( sel >= 1 ) {
			context.strokeStyle = "#fff0f0";
			context.lineWidth = 1.0;
			context.beginPath();
			context.moveTo( sel - 0.5, 0 );
			context.lineTo( sel - 0.5, poset.card() );
			for ( let i = 0; i < poset.card(); i++ ) {
				if ( poset.permutation[i] != sel )
					continue;
				context.moveTo( 0, i + 0.5 );
				context.lineTo( poset.card(), i + 0.5 );
			}
			context.stroke();
		}
	}
	// draw permutation grid
	let showGrid = document.getElementById( "chbShowGrid" ).checked
	if ( showGrid ) {
		drawGrid( context, poset.card() );
	}
	// draw links
	context.strokeStyle = "black";
	context.lineWidth = 0.08;
	for ( let i = 0; i < poset.card(); i++ ) {
		let bound = poset.card() + 1;
		for ( let j = i + 1; j < poset.card(); j++ ) {
			if ( poset.permutation[i] < poset.permutation[j]
					&& poset.permutation[j] < bound ) {
				context.beginPath();
				context.moveTo( poset.permutation[i] - 0.5, i + 0.5 );
				context.lineTo( poset.permutation[j] - 0.5, j + 0.5 );
				context.stroke();
				bound = poset.permutation[j];
			}
		}
	}
	// draw poset events
	for ( let i = 0; i < poset.card(); i++ ) {
		context.fillStyle = "black";
		if ( poset.permutation[i] === sel ) context.fillStyle = "red";
		context.beginPath();
		context.ellipse( poset.permutation[i] - 0.5, i + 0.5, 
			0.25, 0.25, 0, 0, 2 * Math.PI );
		context.fill();
	}
	// draw event labels
	let showLabels = document.getElementById( "chbShowLabels" ).checked
	if ( showLabels ) {
		let scaling = canvas.width / poset.card() / 2;
		// context.save();
		context.setTransform( 1, 0, 0, 1, 0, 0 );
		context.translate( canvas.width / 2, canvas.height );
		context.font = ( 150 / poset.card() ).toString() + "px Arial";
		context.textAlign = "right"
		for ( let i = 0; i < poset.card(); i++ ) {
			let p = poset.permutation[i];
			let x = ( p - i - 1.5 ) * scaling;
			let y = ( p + i - 0.7 ) * scaling;
			context.fillStyle = "black";
			if ( p === sel )
				context.fillStyle = "red";
			context.beginPath();
			context.fillText( p, x, -y );
		}
		// context.restore();
	}
	document.getElementById( "txtOutputPermutation" ).value = 
		poset.toString();
	document.getElementById( "txtOutputLatex" ).value = 
		poset.toLatexCode( showLabels, showGrid );
}

// monitor key board
window.addEventListener( "keydown", handleKeyDown );

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

function selectU( dir ) {
	let sel = getSelection();
	setSelection( sel + dir );
}

function selectV( dir ) {
	let sel = getSelection();
	let v_index = poset.permutation.indexOf( sel );
	if ( v_index < 0 && dir < 0 )
		return;
	if ( v_index === poset.card() - 1 && dir > 0 )
		return;
	if ( v_index === 0 && dir < 0 ) {
		setSelection( 0 );
		return;
	}
	setSelection( poset.permutation[v_index + dir] );
}

function moveU( dir ) {
	let sel = getSelection();
	if ( dir === -1 && sel < 2 )
		return;
	if ( dir === 1 && ( sel < 1 || sel === poset.card() ) )
		return;
	let new_sel = sel + dir;
	let v_index = poset.permutation.indexOf( sel );
	let new_v_index = poset.permutation.indexOf( new_sel );
	poset.permutation[v_index] = new_sel;
	poset.permutation[new_v_index] = sel;
	setSelection( new_sel );
}

function moveV( dir ) {
	let sel = getSelection();
	if ( sel < 1 )
		return;
	let v_index = poset.permutation.indexOf( sel );
	let new_v_index = v_index + dir;
	if ( dir === -1 && ( new_v_index < 0 || v_index >= poset.card() ) )
		return;
	if ( dir === 1 && ( v_index < 0 || new_v_index >= poset.card() ) )
		return;
	poset.permutation[v_index] = poset.permutation[new_v_index];
	poset.permutation[new_v_index] = sel;
	redrawPoset();
}

function addEvent() {
	poset.permutation.unshift( poset.card() + 1 );
	updateSelectionBound();
	setSelection( poset.card() );
}

function removeSelectedEvent() {
	let sel = getSelection();
	if ( sel < 1 || poset.card() === 1 )
		return;
	let v_index = poset.permutation.indexOf( sel );
	poset.permutation.splice( v_index, 1 );
	for ( let i = 0; i < poset.card(); i++ ) {
		if ( poset.permutation[i] > sel ) {
			poset.permutation[i] = poset.permutation[i] - 1;
		}
	}
	updateSelectionBound();
	if ( sel > poset.card() )
		sel = poset.card();
	setSelection( sel );
}

function turnOpposite() {
	const opposite = poset.permutation.slice();
	let sel = getSelection();
	let new_sel = 0;
	let n = poset.card();
	for ( let i = n; i > 0; i-- ) {
		let p = poset.permutation[n - i];
		opposite[n - p] = i;
		if ( p === sel ) {
			new_sel = i;
		}
	}
	poset.permutation = opposite;
	setSelection( new_sel );
}

function reflect() {
	const reflected = poset.permutation.slice();
	let sel = getSelection();
	let new_sel = 0;
	for ( let i = 1; i <= poset.card(); i++ ) {
		let p = poset.permutation[i - 1];
		reflected[p - 1] = i;
		if ( p === sel ) {
			new_sel = i;
		}
	}
	poset.permutation = reflected;
	setSelection( new_sel );
}

function copyToInput( textbox ) {
	let text = document.getElementById( textbox ).value;
	document.getElementById( "txtInput" ).value = text;
	document.getElementById( "txtInput" ).focus();
}

function copyToClipboard( textbox ) {
	let text = document.getElementById( textbox ).value;
	navigator.clipboard.writeText( text );
}
