// @author: Christoph Minz
// @created: 11/08/2024
// @license: BSD 3-Clause

function countLinkCrossings( covering ) {
	/* Returns the number of link crossings in a 2-layer poset, where all the 
	elements on the first layer are indexed in strict increasing order and the 
	array `covering` contains a subset as list of these first layer indices for 
	each element on the second layer. */
	let count = 0;
	for ( let b_j = 1; b_j < covering.length; b_j++ ) {
		let b_j_covering = covering[b_j];
		for ( let b_i = 0; b_i < b_j; b_i++ ) {
			let b_i_covering = covering[b_i];
			for ( let i = 0; i < b_i_covering.length; i++ ) {
				for ( let j = 0; j < b_j_covering.length; j++ ) {
					if ( b_i_covering[i] > b_j_covering[j] ) count++;
				}
			}
		}
	}
	return count;
}
