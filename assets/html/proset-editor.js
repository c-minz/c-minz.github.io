// @author: Christoph Minz
// @created: 19/02/2024
// @license: BSD 3-Clause
// @version: v1.1 05/11/2025

// #############################################################################
// Error handling, progress updates, editor initialization

let isBusy = false;
const LargePosetWarning_elements = 250;
const LargePosetWarning_links = 2000;
let WarningError_isShowing = false;
let LargePosetWarningError_isShowing = false;

class WarningError extends Error {
  constructor(message) {
    super(message);
    WarningError_isShowing = true;
    this.name = "Warning";
    this.message = message + " \nRepeat the action to ignore this warning.";
  }
}

class LargePosetWarningError extends WarningError {
  constructor(value, links = false) {
    let message = "You are about to generate a poset with " + value;
    if (links) message = message + " links. ";
    else message = message + " elements. ";
    super(message + "Handling large posets can slow down your system!");
    LargePosetWarningError_isShowing = true;
  }
}

function checkAndThrowWarningIfLarge(count, isLinkCount = false) {
  if (((isLinkCount && count > LargePosetWarning_links) || (!isLinkCount && count > LargePosetWarning_elements)) && !LargePosetWarningError_isShowing)
    throw new LargePosetWarningError(count, isLinkCount);
}

function showError(message, isWarning = false) {
  finishProgress();
  const msgError = document.getElementById("msgError");
  msgError.innerText = message;
  msgError.className = isWarning ? "alert alert-danger" : "alert alert-warning";
  msgError.hidden = false;
  msgError.focus();
  isBusy = false;
}

function hideLastError() {
  document.getElementById("msgError").hidden = true;
  WarningError_isShowing = false;
  LargePosetWarningError_isShowing = false;
}

function startProgress() {
  document.getElementById("prgSymbol").className = "progress-symbol busy";
  document.getElementById("prgBar").ariaValueNow = "0";
  document.getElementById("prgBarValue").style = "width: 0%";
  isBusy = true;
}

function stepProgress(fraction = 0.0) {
  let percentage = Math.max(0, Math.min(Math.round(100 * fraction), 100));
  let percentage_string = percentage.toString();
  document.getElementById("prgBar").ariaValueNow = percentage_string;
  document.getElementById("prgBarValue").style = "width: " + percentage_string + "%";
}

function finishProgress() {
  document.getElementById("prgSymbol").className = "progress-symbol";
  document.getElementById("prgBar").ariaValueNow = "0";
  document.getElementById("prgBarValue").style = "width: 0%";
  isBusy = false;
}

let isShowingLabels = false;
let isShowingCross = true;
let isShowingGrid = false;
let strAllLinks = "";
let strAllRemovedLinks = "";

function initializeEditor() {
  /* Initialize input type, editor canvas size, and settings bottons. */
  // hide active JavaScript alert:
  document.getElementById("msgJavascript").hidden = true;
  selectInputType();
  updateWidth();
  document.getElementById("butRemoveMemoryEntry").disabled = true;
  document.getElementById("butClearMemory").disabled = true;
  document.getElementById("butCopyMemoryEntry").disabled = true;
  document.getElementById("butCopyMemory").disabled = true;
  document.getElementById("butCreateInsert").disabled = true;
  document.getElementById("butRevise").disabled = true;
  document.getElementById("butMemorize").disabled = true;
  document.getElementById("butUndo").disabled = true;
  document.getElementById("butRedo").disabled = true;
  document.getElementById("butRaiseOffset").disabled = true;
  document.getElementById("butLowerOffset").disabled = true;
  document.getElementById("butReflect").disabled = true;
  document.getElementById("butOpposite").disabled = true;
  document.getElementById("butOptimize").disabled = true;
  document.getElementById("butTo2Order").disabled = true;
  document.getElementById("butAddElement").disabled = true;
  const butRemoveElement = document.getElementById("butRemoveElement");
  butRemoveElement.disabled = true;
  butRemoveElement.className = "btn btn-secondary";
  const txtSelection = document.getElementById("txtSelection");
  txtSelection.value = "";
  const butLink = document.getElementById("butLink");
  butLink.disabled = true;
  butLink.className = "btn btn-secondary";
  document.getElementById("txtLinking").value = "";
  document.getElementById("butSwapLeft").disabled = true;
  updateSettingsButton("ShowLabels", false, false);
  updateSettingsButton("ShowCross", false, false);
  updateSettingsButton("ShowGrid", false, false);
  document.getElementById("lblPermutation").innerHTML = "0 elements on 0 layers:";
  document.getElementById("txtPermutation").value = "";
  document.getElementById("lblLinks").innerHTML = "0 links:";
  document.getElementById("txtLinks").value = "";
  const lblRemovedLinks = document.getElementById("lblRemovedLinks");
  lblRemovedLinks.className = "input-group-text";
  lblRemovedLinks.innerHTML = "0 removed links:";
  document.getElementById("txtRemovedLinks").value = "";
  const frmExports = ["pcauset", "rcauset", "causet"];
  for (let i = 0; i < frmExports.length; i++) {
    document.getElementById("txtExport_" + frmExports[i]).value = "";
    document.getElementById("frmExport_" + frmExports[i]).hidden = true;
  }
  document.getElementById("txtExportArray").value = "";
  finishProgress();
}

function selectInputType() {
  /* Hide/show the input controls for the currently selected import type. */
  hideLastError();
  let input_type = document.getElementById("selInputType").value;
  document.getElementById("frmInputPredefined").hidden = input_type != "predefined";
  document.getElementById("frmInputPermutation").hidden = !input_type.endsWith("causet");
  document.getElementById("frmInputRemovedLinks").hidden = input_type != "rcauset";
  document.getElementById("frmInputLinks").hidden = input_type != "causet";
  document.getElementById("frmInputLatex").hidden = input_type != "latex";
  document.getElementById("frmInputMemory").hidden = input_type != "memory";
  document.getElementById("frmInputCoveringList").hidden = input_type != "coveringslist";
  document.getElementById("frmInputMatrix").hidden = input_type != "matrix";
}

function updateWidth() {
  /* Adjust canvas size to be a square that fits to the window display width. */
  const padding = 4;
  let current_width = document.getElementById("cnvPoset").width;
  let new_width = document.getElementById("cnvPosetContainer").clientWidth;
  let rel_size = document.getElementById("selRelativeCanvasSize").value;
  let abs_size = document.getElementById("selAbsoluteCanvasSize").value;
  if (rel_size == "fill") {
    if (abs_size != "unbounded") new_width = parseInt(abs_size, 10);
    else new_width = new_width - padding;
  } else {
    new_width = Math.floor((rel_size / 100) * new_width) - padding;
    if (abs_size != "unbounded") new_width = Math.min(new_width, parseInt(abs_size, 10));
  }
  if (new_width === current_width) return false;
  document.getElementById("cnvPoset").width = new_width;
  document.getElementById("cnvPoset").height = new_width;
  return true;
}

function toggleReleaseNotes(version) {
  const releaseNotes = document.getElementById("release_notes_" + version);
  if (releaseNotes.className == "accordion-collapse show") releaseNotes.className = "accordion-collapse collapse";
  else releaseNotes.className = "accordion-collapse show";
}

// #############################################################################
// Parse input strings and Poset class

function parseIntNotNaN(string_value) {
  /* Parse a string input `value` to an integer and raises an error if the 
	string does not represent an integer, while leading and trailing spaces are 
	ignored. */
  let int_value = parseInt(string_value.trim(), 10);
  if (isNaN(int_value)) {
    if (string_value.length == 0) string_value = "(empty)";
    throw new SyntaxError("The value " + string_value + " cannot be converted to an integer!");
  }
  return int_value;
}

function parseLink(string_value) {
  /* Parse a string input `value` to a pair of integers (and a string option) 
	and raises an error if the string does not represent link, while leading and 
	trailing spaces are ignored. Returns an array of either two or three entries, 
	where the first entry is the lower index (from) and the second one is the 
	upper index (to), the optional third entry is a string of all specified link 
	options. */
  let sep0 = string_value.indexOf("/");
  if (sep0 < 0) throw new SyntaxError("Each link has to be of the format 'number/number'.");
  let sep1 = string_value.indexOf("/", sep0 + 1);
  let from = parseIntNotNaN(string_value.substr(0, sep0));
  let to;
  let has_options = false;
  let options = "";
  if (sep1 < 0) {
    to = parseIntNotNaN(string_value.substr(sep0 + 1));
  } else {
    to = parseIntNotNaN(string_value.substr(sep0 + 1, sep1 - sep0 - 1));
    has_options = true;
    options = string_value.substr(sep1 + 1);
  }
  if (from === to) throw new SyntaxError("An element cannot be linked to itself.");
  if (to < from) {
    if (has_options) return [to, from, options];
    return [to, from];
  }
  if (has_options) return [from, to, options];
  return [from, to];
}

function parsePermutation(value, checkIfLarge) {
  /* Parse `value` either as a string or list of integers and check if the 
	input is valid. Raises an error for invalid inputs. Returns the parsed 
	permutation list and an offset value to adjust labels in the diagram. */
  let permutation;
  if (typeof value == "string") permutation = value.split(",").map(parseIntNotNaN);
  else permutation = value;
  // find min and max labels:
  let n = permutation.length;
  if (n < 1) throw new RangeError("The poset has to have at least one element!");
  let min_element = permutation[0];
  let max_element = permutation[0];
  for (let i = 1; i < n; i++) {
    let element = permutation[i];
    if (element < min_element) {
      min_element = element;
    }
    if (element > max_element) {
      max_element = element;
    }
  }
  // get intended number of elements:
  let n_target = Math.max(n, max_element - min_element + 1);
  if (checkIfLarge) checkAndThrowWarningIfLarge(n_target);
  // check for repeated and missing elements:
  const checkedInput = new Array(n_target).fill(0);
  for (let i = 0; i < n; i++) {
    let index = permutation[i] - min_element;
    checkedInput[index] = checkedInput[index] + 1;
  }
  if (n != n_target || checkedInput.indexOf(0) != -1) {
    let error_count = 0;
    let errors = [];
    for (let i = 0; i < n_target; i++) {
      if (checkedInput[i] != 1) {
        error_count++;
        if (error_count > 3) break;
        let element = i + min_element;
        if (checkedInput[i] == 0) {
          errors.push("The element " + element.toString() + " is missing!");
        } else {
          errors.push("The element " + element.toString() + " appears " + checkedInput[i] + " times!");
        }
      }
    }
    let error = errors.join(" ");
    if (error_count > 3) {
      error = error + " And more errors ...";
    }
    throw new RangeError(error);
  }
  // remove offset and return:
  for (let i = 0; i < n; i++) permutation[i] = permutation[i] - min_element;
  return [permutation, min_element];
}

function parseLinks(value, offset, max_element) {
  /* Parse `value` either as a string or list of integer pairs and check if the 
	input is valid, removing dublicates. Raises an error for invalid inputs. 
	Returns two lists of index pairs, one for links without link options in the 
	input and a second one for links that had link options in the input (options 
	are dropped). */
  if (value.length == 0) return [[], []];
  let linklist;
  if (typeof value == "string") linklist = value.split(",").map(parseLink);
  else linklist = value;
  const linklist_nooptions = [];
  const linklist_withoptions = [];
  for (let i = 0; i < linklist.length; i++) {
    let from = linklist[i][0] - offset;
    let to = linklist[i][1] - offset;
    if (from < 0 || to > max_element) continue;
    if (linklist[i].length > 2) linklist_withoptions.push([from, to]);
    else linklist_nooptions.push([from, to]);
  }
  return [linklist_nooptions, linklist_withoptions];
}

function findEndgroup(value, start, begingroup = "{", endgroup = "}") {
  /* Searches the string `value` for the position of the next `endgoup` 
	character (default: "}") from the `start` position. If there is a `begingroup` 
	character (default: "{") before the `endgoup` character, the matching 
	endgroup is found first. It returns the position of `endgroup` of -1 if there 
	is no (matching) `endgroup` character */
  let end = value.indexOf(endgroup, start);
  if (endgroup < 0) return -1;
  let begin = value.indexOf(begingroup, start);
  if (begin < start || begin > end) return end;
  end = findEndgroup(value, begin + 1, begingroup, endgroup);
  if (end < 0) return -1;
  return findEndgroup(value, end + 1, begingroup, endgroup);
}

function removeGroups(value, begingroup = "{", endgroup = "}") {
  /* Returns the string `value` with all substrings that start with 
	`begingroup` and end in a matching `endgroup` character removed. */
  let begin = value.indexOf(begingroup);
  if (begin < 0) return value;
  let end = findEndgroup(value, begin + 1, begingroup, endgroup);
  if (end < 0) return value;
  value = value.substring(0, begin) + value.substring(end + 1);
  return removeGroups(value, begingroup, endgroup);
}

function initializeArray(n, value) {
  /* Returns an array of length `n`, where each element is initialized with 
	`value`. */
  const A = new Array(n);
  for (let i = 0; i < n; i++) A[i] = value;
  return A;
}

function initializeLinkList(n) {
  /* Returns an array of length `n`, where each element is an empty array. */
  const linklist = new Array(n);
  for (let i = 0; i < n; i++) linklist[i] = [];
  return linklist;
}

function remapLinkList(links, mapping) {
  /* Updates the linklist `links` by mapping elements from any index `i` to 
	`mapping[i]`. */
  let n = links.length;
  const remapped_links = initializeLinkList(n);
  for (let i = 0; i < n; i++) {
    let linklist = links[i];
    let i_m = mapping[i];
    for (let l = 0; l < linklist.length; l++) {
      let j_m = mapping[linklist[l]];
      let p = Math.min(i_m, j_m);
      let q = Math.max(i_m, j_m);
      remapped_links[p].push(q);
    }
  }
  return remapped_links;
}

function findCoveredElements(linklist, e) {
  /* Returns the list of links that go from any element to `j`. Returns an 
	empty array if `j` does not cover any elements or if `j` is out of bounds. 
	*/
  const covered = [];
  if (e >= linklist.length) return covered;
  for (let i = 0; i < e; i++) {
    if (linklist[i].includes(e)) covered.push(i);
  }
  return covered;
}

function raiseElements(elementlist, start, offset) {
  /* Offsets all elements larger or equal to `start` in `elementlist` by 
	`offset`. */
  for (let i = 0; i < elementlist.length; i++) {
    if (elementlist[i] >= start) elementlist[i] = elementlist[i] + offset;
  }
}

function raiseLinkedElements(linklist, start, offset) {
  /* Offsets all elements larger or equal to `start` in the nested `linklist` 
	by `offset`. */
  for (let i = 0; i < linklist.length; i++) raiseElements(linklist[i], start, offset);
}

function insertLinks(linklist, e, insertLinklist, minimal, maximal) {
  raiseLinkedElements(linklist, e + 1, insertLinklist.length - 1);
  raiseLinkedElements(insertLinklist, 0, e);
  const coveredby_e = findCoveredElements(linklist, e);
  const covering_e = linklist[e];
  let newLinklist = linklist.slice(0, e).concat(insertLinklist, linklist.slice(e + 1));
  for (let l = 0; l < coveredby_e.length; l++) {
    let i = coveredby_e[l];
    let e_index = newLinklist[i].indexOf(e);
    if (e_index >= 0) newLinklist[i].splice(e_index, 1);
    newLinklist[i] = newLinklist[i].concat(minimal);
  }
  for (let l = 0; l < maximal.length; l++) {
    let i = maximal[l];
    newLinklist[i] = newLinklist[i].concat(covering_e);
  }
  return newLinklist;
}

class Poset {
  /* Main class to hold the permutation (position of elements) and link lists. 
	The elements in the permutation are indexed starting from 0 and the parameter 
	`offset` shifts the labels. */

  constructor(permutation, links, use2Order, checkIfLarge = true) {
    this.error = ""; // holds an input error message (if any)
    this.hasWarning = false;
    // parse permutation for the element positions:
    try {
      const parsed_permutation = parsePermutation(permutation, checkIfLarge);
      this.permutation = parsed_permutation[0];
      this.offset = parsed_permutation[1];
    } catch (e) {
      this.error = e.toString();
      this.hasWarning = e instanceof WarningError;
      return;
    }
    // parse links:
    this.resetLinks(use2Order);
    try {
      const parsed_links = parseLinks(links, this.offset, this.count() - 1);
      let linkpairs = parsed_links[0];
      if (use2Order) {
        for (let l = 0; l < linkpairs.length; l++) this.removeLink(linkpairs[l][0], linkpairs[l][1]);
      } else {
        for (let l = 0; l < linkpairs.length; l++) this.addLink(linkpairs[l][0], linkpairs[l][1]);
      }
      linkpairs = parsed_links[1];
      for (let l = 0; l < linkpairs.length; l++) this.addLink(linkpairs[l][0], linkpairs[l][1], use2Order);
      let link_count = this.countLinks();
      if (checkIfLarge) checkAndThrowWarningIfLarge(link_count, true);
    } catch (e) {
      this.error = e.toString();
      this.hasWarning = e instanceof WarningError;
      return;
    }
  }

  count() {
    return this.permutation.length;
  }

  resetLinks(autolinking) {
    /* Resets the list of links and auto links from the permutation if 
		`autolinking = true`. */
    let n = this.count();
    this.autolinks = initializeLinkList(n);
    this.removedlinks = initializeLinkList(n);
    this.addedlinks = initializeLinkList(n);
    this.links = initializeLinkList(n);
    // find auto links:
    for (let i = 0; i < n; i++) {
      let p = this.permutation[i];
      let bound = n;
      for (let j = i + 1; j < n; j++) {
        let q = this.permutation[j];
        if (p < q && q < bound) {
          this.autolinks[p].push(q);
          if (autolinking) this.links[p].push(q);
          else this.removedlinks[p].push(q);
          bound = q;
        }
      }
    }
  }

  remapLinks(mapping) {
    /* Remaps all links of the poset via `remapLinkList`. */
    this.autolinks = remapLinkList(this.autolinks, mapping);
    this.removedlinks = remapLinkList(this.removedlinks, mapping);
    this.addedlinks = remapLinkList(this.addedlinks, mapping);
    this.links = remapLinkList(this.links, mapping);
  }

  isOrdered(i, j) {
    /* Returns true if `i < j` (full partial order relation, not only links). */
    if (this.links[i].includes(j)) return true;
    const ordered = new Array(j - i + 1);
    ordered[0] = true;
    ordered[j - i] = false;
    for (let o = i; o < j; o++) {
      if (!ordered[o - i]) continue;
      let links = this.links[o];
      for (let l = 0; l < links.length; l++) {
        if (links[l] < o || links[l] > j) continue;
        ordered[links[l] - i] = true;
      }
    }
    return ordered[j - i];
  }

  countLinks() {
    /* Returns the number of links in the poset. */
    let count = 0;
    let n = this.count();
    for (let i = 0; i < n; i++) count = count + this.links[i].length;
    return count;
  }

  findMinimalElements() {
    /* Returns a list of all minimal elements (those that are not preceded by 
		another element). */
    let n = this.count();
    const isMinimal = initializeArray(n, true);
    for (let i = 0; i < n; i++) {
      let links_i = this.links[i];
      for (let l = 0; l < links_i.length; l++) {
        isMinimal[links_i[l]] = false;
      }
    }
    const minimal = [];
    for (let i = 0; i < n; i++) {
      if (isMinimal[i]) minimal.push(i);
    }
    return minimal;
  }

  findMaximalElements() {
    /* Returns a list of all maximal elements (those that are not succeeded by 
		another element). */
    let n = this.count();
    const maximal = [];
    for (let i = 0; i < n; i++) {
      if (this.links[i].length == 0) maximal.push(i);
    }
    return maximal;
  }

  getLayerIndices() {
    /* Returns an the layer index as an array with the length of card(). */
    const layers = initializeArray(this.count(), 1);
    for (let i = 0; i < layers.length; i++) {
      let links_i = this.links[i];
      let next_layer = layers[i] + 1;
      for (let l = 0; l < links_i.length; l++) {
        let j = links_i[l];
        if (next_layer > layers[j]) layers[j] = next_layer;
      }
    }
    return layers;
  }

  countLayers() {
    /* Returns the number of layers in the poset. */
    let layers = this.getLayerIndices();
    let max = 0;
    for (let i = 0; i < layers.length; i++) if (layers[i] > max) max = layers[i];
    return max;
  }

  removeLink(i, j, ignoreerrors = false) {
    /* Removes a link from element `i` to `j` (or `j` to `i` if `i > j`). If 
		`ignoreerrors` and both arguments are the same or there is no link between 
		the elements, then an error is raised. */
    if (i > j) {
      this.removeLink(j, i, ignoreerrors);
      return;
    }
    if (i === j) {
      if (ignoreerrors) return;
      throw new ReferenceError("An element cannot be unlinked from itself.");
    }
    let l = this.links[i].indexOf(j);
    if (l === -1) {
      if (ignoreerrors) return;
      throw new ReferenceError("The element " + i.toString() + " is not linked to " + j.toString() + ".");
    }
    this.links[i].splice(l, 1);
    l = this.addedlinks[i].indexOf(j);
    if (l > -1) this.addedlinks[i].splice(l, 1);
    if (this.autolinks[i].includes(j)) this.removedlinks[i].push(j);
  }

  addLink(i, j, ignoreerrors = false) {
    /* Adds a link from element `i` to `j` (or `j` to `i` if `i > j`). An 
		error is raised if both arguments are the same or they are already related. 
		*/
    if (i > j) {
      this.addLink(j, i, ignoreerrors);
      return;
    }
    if (i === j) {
      if (ignoreerrors) return;
      throw new ReferenceError("An element cannot be linked to itself.");
    }
    if (this.links[i].includes(j)) {
      if (ignoreerrors) return;
      throw new ReferenceError("The element " + i.toString() + " already covers " + j.toString() + ".");
    }
    // remove links from an element `a <= i` to an element `b >= j`:
    for (let a = 0; a <= i; a++) {
      let linkcount = this.addedlinks[a];
      for (let l = linkcount - 1; l >= 0; l--) {
        let b = this.addedlinks[a][l];
        if (j <= b && (a === i || this.isOrdered(a, i)) && (j === b || this.isOrdered(j, b))) {
          this.removeLink(a, b, true);
        }
      }
    }
    // re-add link (remove from "removed links"):
    let l = this.removedlinks[i].indexOf(j);
    if (l > -1) this.removedlinks[i].splice(l, 1);
    this.links[i].push(j);
    if (!this.autolinks[i].includes(j)) this.addedlinks[i].push(j);
  }

  isLinkable(i, j) {
    /* Returns -1 if the elements with indices `i` and `j` are linked `i < j` 
		and the link can be removed. Returns 1 if the elements are not linked, but 
		can be linked `i < j`. Returns 0 otherwise. */
    if (j <= i) return 0;
    let iv = this.permutation.indexOf(i);
    let jv = this.permutation.indexOf(j);
    if (jv <= iv) return 0;
    if (this.links[i].includes(j)) {
      if (this.links[i].length == 0 || findCoveredElements(this.links, j).length == 0) return 0;
      return -1; // can be unlinked
    }
    if (this.isOrdered(i, j)) return 0;
    return 1; // can be linked
  }

  pushNewElement() {
    /* Adds a new element to the right of the diagram. */
    let i = this.count();
    checkAndThrowWarningIfLarge(i + 1);
    this.permutation.unshift(i);
    this.autolinks.push([]);
    this.removedlinks.push([]);
    this.addedlinks.push([]);
    this.links.push([]);
  }

  reset_restoreLinks(e, e_new) {
    /* This is a class private method. Resets to auto-links and restores all 
		removed/added links of the element `e` moved to `e_new` (`NaN` if it is 
		being removed). */
    let removedlinks = this.removedlinks;
    let addedlinks = this.addedlinks;
    let coveredby_e = findCoveredElements(this.links, e);
    let e_covering = this.links[e];
    this.resetLinks(true);
    this.restoreLinks(removedlinks, false, e, e_new, coveredby_e, e_covering);
    this.restoreLinks(addedlinks, true, e, e_new, coveredby_e, e_covering);
  }

  restoreLink(a, b, isAddedlinks) {
    /* This is a class private method called to link (`isAddedlinks = true`) 
		or unlink (`isAddedlinks = false`) elements `a` and `b` without raising 
		errors. */
    let isLinkable = this.isLinkable(a, b);
    if (isAddedlinks && isLinkable == 1) this.addLink(a, b, true);
    else if (!isAddedlinks && isLinkable == -1) this.removeLink(a, b, true);
  }

  restoreLinks(xlinks, isAddedlinks, e, e_new, coveredby_e, links_e) {
    /* This is a class private method called to restore all removed 
		(`isAddedlinks = false`) or added (`isAddedlinks = true`) links in `xlinks` 
		while moving element `e` to `e_new` (where `e_new = NaN` for removing). 
		The element `e` was covering the elements `coveredby_e` and was covered by 
		`e_covering`. */
    // i, j: element indices before (re)move
    // a, b: element indices after (re)move
    const xcoveredby_e = [];
    for (let i = 0; i < xlinks.length; i++) {
      let a = i - (i > e) + (i > e_new) + (i == e_new && e > e_new);
      if (i == e) {
        if (isNaN(e_new)) continue;
        a = e_new;
      }
      let xlinks_i = xlinks[i];
      for (let l = 0; l < xlinks_i.length; l++) {
        let j = xlinks_i[l];
        let b = j - (j > e) + (j > e_new) + (j == e_new && e > e_new);
        if (j == e) {
          xcoveredby_e.push(i);
          if (isNaN(e_new)) continue;
          b = e_new;
        }
        this.restoreLink(a, b, isAddedlinks);
      }
    }
    // Restore removed/added links that used to relate other elements to `e`:
    for (let i = 0; i < xcoveredby_e.length; i++) {
      let a = xcoveredby_e[i];
      for (let l = 0; l < links_e.length; l++) {
        let b = links_e[l];
        this.restoreLink(a + (a >= e_new), b - 1 + (b >= e_new), isAddedlinks);
      }
    }
    // Restore removed/added links that used to relate `e` to other elements:
    const xlinks_e = xlinks[e];
    for (let i = 0; i < coveredby_e.length; i++) {
      let a = coveredby_e[i];
      for (let l = 0; l < xlinks_e.length; l++) {
        let b = xlinks_e[l];
        this.restoreLink(a + (a >= e_new), b - 1 + (b >= e_new), isAddedlinks);
      }
    }
  }

  removeElement(e) {
    /* Remove the element `e`. Raises an error if it is out of bounds. */
    let n = this.count();
    if (e < 0 || e >= n) throw new RangeError("There is no element " + getElementString(e) + ".");
    let v = this.permutation.indexOf(e);
    this.permutation.splice(v, 1);
    for (let i = 0; i < n; i++) {
      if (this.permutation[i] > e) this.permutation[i] = this.permutation[i] - 1;
    }
    this.reset_restoreLinks(e, NaN);
  }

  insert(e, other) {
    /* Insert another poset `other` for an element `e`. */
    let n = this.count();
    let m = other.count();
    if (e < 0 || e >= n) throw new RangeError("The insert position " + getElementString(e) + " is out of range.");
    checkAndThrowWarningIfLarge(n + m);
    let v = this.permutation.indexOf(e);
    let minimal = other.findMinimalElements();
    let maximal = other.findMaximalElements();
    raiseElements(this.permutation, e + 1, m - 1);
    raiseElements(other.permutation, 0, e);
    this.permutation = this.permutation.slice(0, v).concat(other.permutation, this.permutation.slice(v + 1));
    raiseElements(minimal, 0, e);
    raiseElements(maximal, 0, e);
    this.autolinks = insertLinks(this.autolinks, e, other.autolinks, minimal, maximal);
    this.removedlinks = insertLinks(this.removedlinks, e, other.removedlinks, minimal, maximal);
    this.addedlinks = insertLinks(this.addedlinks, e, other.addedlinks, minimal, maximal);
    this.links = insertLinks(this.links, e, other.links, minimal, maximal);
  }

  moveU(e, moves) {
    /* Moves the element `e` in u-direction by `moves` steps (does nothing if 
		moves === 0). Raises an error if the current or new position of the element 
		is out of bounds. Returns the new u-position. */
    if (moves == 0) return e;
    let n = this.count();
    if (e < 0 || e >= n) throw new RangeError("There is no element " + getElementString(e) + ".");
    let e_new = e + moves;
    if (e_new < 0 || e_new >= n) throw new RangeError("The new position lies outside the diagram.");
    let v = this.permutation.indexOf(e);
    let dir = moves > 0 ? 1 : -1;
    for (let i = e + dir; dir * (e_new - i) >= 0; i = i + dir) {
      let j = this.permutation.indexOf(i);
      this.permutation[j] = i - dir;
    }
    this.permutation[v] = e_new;
    this.reset_restoreLinks(e, e_new);
    return e_new;
  }

  moveV(e, moves) {
    /* Moves the element `e` in v-direction by `moves` steps (does nothing if 
		moves === 0). Raises an error if the current or new position of the element 
		is out of bounds. Returns the new v-position. */
    let v = this.permutation.indexOf(e);
    if (moves == 0) return v;
    let n = this.count();
    if (e < 0 || e >= n) throw new RangeError("There is no element " + getElementString(e) + ".");
    let v_new = v + moves;
    if (v_new < 0 || v_new >= n) throw new RangeError("The new position lies outside the diagram.");
    let e_new = e; // this.permutation[v_new];
    this.permutation.splice(v_new, 0, this.permutation.splice(v, 1)[0]);
    this.reset_restoreLinks(e, e_new);
    return v_new;
  }

  getLinkMatrixRow(i) {
    /* Returns the i-th row of the link matrix (boolean vector of element 
		indices covering the i-th element, where i is zero-based). */
    let links = this.links[i];
    let linkrow = initializeArray(this.count(), false);
    for (let l = 0; l < links.length; l++) linkrow[links[l]] = true;
    return linkrow;
  }

  toLinkMatrix() {
    /* Returns the poset as an n times n, upper-triangular, boolean matrix `M` 
		where `M[i][j]` is true iff element `i` is linked to `j`. Since elements 
		are not linked to themselves, the diagonal is `false`. */
    let n = this.count();
    let matrix = new Array(n);
    for (let i = 0; i < n; i++) matrix[i] = this.getLinkMatrixRow(i);
    return matrix;
  }

  toOrderMatrix() {
    /* Returns the poset as an n times n, upper-triangular, boolean matrix `M` 
		where `M[i][j]` is true iff element `i` is strictly ordered before `j`. */
    let n = this.count();
    let matrix = this.toLinkMatrix();
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        if (!matrix[i][j]) continue;
        for (let k = j + 1; k < n; k++) matrix[i][k] = matrix[i][k] || matrix[j][k];
      }
    }
    return matrix;
  }

  getPermutationString() {
    return this.permutation.map(getElementString).join(",");
  }

  get_LinksStringAndCount(linklist, targetmap) {
    /* This method is class private. It converts the nested array `linklist` 
		into a comma-separated string and a number of entries. Each item is 
		formatted as number/(*) where (*) stands for the return of `targetmap` for 
		the target element of the links. */
    let s = "";
    let c = 0;
    for (let i = 0; i < linklist.length; i++) {
      if (linklist[i].length === 0) continue;
      let from = getElementString(i) + "/";
      if (s.length > 0) s = s + ",";
      s = s + from + linklist[i].map(targetmap).join("," + from);
      c = c + linklist[i].length;
    }
    return [s, c];
  }

  getRemovedLinksStringAndCount() {
    return this.get_LinksStringAndCount(this.removedlinks, getElementString);
  }

  getAddedLinksStringAndCount() {
    return this.get_LinksStringAndCount(this.addedlinks, getAddedLinkTargetString);
  }

  getLinksStringAndCount() {
    return this.get_LinksStringAndCount(this.links, getElementString);
  }
}

// #############################################################################
// Generation from import data

let poset;

function getElementString(e) {
  return (e + poset.offset).toString();
}

function getAddedLinkTargetString(e) {
  return getElementString(e) + "/";
}

function createNew() {
  if (isBusy) return;
  let new_poset = generate();
  if (!new_poset) return;
  poset = new_poset;
  updateSelectionBounds();
  setSelection(NaN);
  addUndoStep();
  window.location.href = "#edit";
  if (document.getElementById("selInputType").value == "coveringslist") optimize();
  document.getElementById("butRevise").disabled = false;
  document.getElementById("butMemorize").disabled = false;
  document.getElementById("butRaiseOffset").disabled = false;
  document.getElementById("butLowerOffset").disabled = false;
  document.getElementById("butReflect").disabled = false;
  document.getElementById("butOpposite").disabled = false;
  document.getElementById("butAddElement").disabled = false;
}

function createInsert() {
  if (isBusy) return;
  let sel = getSelection();
  if (isNaN(sel)) {
    let error = new TypeError("There is no element selected! " + "Select an element in the diagram for an insert.");
    showError(error.toString());
    return;
  }
  let new_poset = generate();
  if (!new_poset) return;
  poset.insert(sel, new_poset);
  updateSelectionBounds();
  setSelection(NaN);
  addUndoStep();
}

function generate() {
  let input_type = document.getElementById("selInputType").value;
  let input_perm = removeGroups(document.getElementById("txtInputPermutation").value);
  let error = "";
  let hasWarning = false;
  let new_poset;
  try {
    if (input_type == "predefined") new_poset = getPredefined();
    else if (input_type == "pcauset") new_poset = new Poset(input_perm, "", true);
    else if (input_type == "rcauset") new_poset = new Poset(input_perm, removeGroups(document.getElementById("txtInputRemovedLinks").value), true);
    else if (input_type == "causet") new_poset = new Poset(input_perm, removeGroups(document.getElementById("txtInputLinks").value), false);
    else if (input_type == "latex") {
      new_poset = getFromLatexMacro(document.getElementById("txtInputLatex").value);
    } else if (input_type == "coveringslist") {
      new_poset = getFromCoveringList(document.getElementById("txtInputCoveringList").value);
    } else if (input_type == "memory") {
      new_poset = getFromMemory(document.getElementById("selInputMemory").value);
    }
    error = new_poset.error;
    hasWarning = new_poset.hasWarning;
  } catch (e) {
    error = e.toString();
    hasWarning = e instanceof WarningError;
  }
  if (error) {
    showError(error, hasWarning);
    return 0;
  }
  return new_poset;
}

function getPredefined() {
  let input_type = document.getElementById("selInputPredefinedType").value;
  let n = parseInt(document.getElementById("txtInputOrder").value, 10);
  if (isNaN(n) || n < 1) throw new RangeError("The value for 'n' has to be a strictly positive integer.");
  if (input_type == "chain") return getPredefined_chain(n);
  if (input_type == "antichain") return getPredefined_antichain(n);
  if (input_type == "random") return getPredefined_random(n);
  if (input_type == "fence") return getPredefined_fence(n);
  if (input_type == "crown") return getPredefined_crown(n);
  if (input_type == "polygon") return getPredefined_polygon(n);
  if (input_type == "2lattice") return getPredefined_2lattice(n);
  throw new TypeError("The poset type '" + input_type + "' is not implemented.");
}

function getPredefined_chain(n) {
  checkAndThrowWarningIfLarge(n);
  const permutation = new Array(n);
  for (let i = 0; i < n; ) permutation[i] = ++i;
  return new Poset(permutation, [], true, false);
}

function getPredefined_antichain(n) {
  checkAndThrowWarningIfLarge(n);
  const permutation = new Array(n);
  for (let i = 0; i < n; i++) permutation[i] = n - i;
  return new Poset(permutation, [], true, false);
}

function getPredefined_random(n) {
  checkAndThrowWarningIfLarge(n);
  const permutation = new Array(n);
  for (let i = 0; i < n; ) permutation[i] = ++i;
  for (let i = n - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    let swap = permutation[i];
    permutation[i] = permutation[j];
    permutation[j] = swap;
  }
  return new Poset(permutation, [], true, false);
}

function getPredefined_fence(n) {
  checkAndThrowWarningIfLarge(n);
  if (n === 1) return new Poset([1], [], true);
  const permutation = new Array(n);
  permutation[0] = n - 1;
  for (let i = n % 2; i < n; i++) {
    permutation[i] = Math.max(1, n - i - 2);
    permutation[++i] = Math.min(n - i + 2, n);
  }
  return new Poset(permutation, [], true, false);
}

function getPredefined_crown(n) {
  if (n === 1) throw new RangeError("Crown posets only exist for n > 1.");
  checkAndThrowWarningIfLarge(2 * n);
  checkAndThrowWarningIfLarge(n * (n - 1), true);
  const permutation = [n + 1];
  for (let i = n - 1; i >= 2; i--) permutation.push(i);
  permutation.push(2 * n, 1);
  for (let i = 2 * n - 1; i >= 2 + n; i--) permutation.push(i);
  permutation.push(n);
  const removedlinks = [];
  for (let i = 2; i < n; i++) removedlinks.push([i, 2 * n - i + 1]);
  return new Poset(permutation, removedlinks, true, false);
}

function getPredefined_polygon(n) {
  checkAndThrowWarningIfLarge(2 * n + 2);
  checkAndThrowWarningIfLarge(4 * n, true);
  if (n === 1) return new Poset([0, 1, 2, 3], [], true);
  if (n === 2) return new Poset([0, 2, 1, 4, 3, 5], [], true);
  const permutation = [0, 2 * (n - 1), 2 * (n - 2), 2 * n];
  for (let i = 3; i < n; i++) permutation.push(2 * (n - i), 2 * (n - i + 3) - 1);
  permutation.push(1, 5, 3, 2 * n + 1);
  const removedlinks = [];
  let max = 2 * n - 4;
  for (let i = 2; i <= max; i = i + 2) removedlinks.push([i, i + 3]);
  return new Poset(permutation, removedlinks, true, false);
}

function getPredefined_2lattice(n) {
  let n2 = n * n;
  checkAndThrowWarningIfLarge(n2);
  checkAndThrowWarningIfLarge(2 * (n2 - n), true);
  const permutation = new Array(n2);
  for (let i = 0; i < n2; i++) permutation[i] = Math.floor((i * n) / n2) + ((i * n) % n2) + 1;
  return new Poset(permutation, [], true, false);
}

function getFromLatexMacro(macro) {
  macro = macro.trim();
  let is_pcauset =
    macro.startsWith("\\drawpcauset{") ||
    macro.startsWith("\\pcauset{") ||
    macro.startsWith("\\pcauset[") ||
    macro.startsWith("\\pcausetL{") ||
    macro.startsWith("\\pcausetL[") ||
    macro.startsWith("\\pcausetP{") ||
    macro.startsWith("\\pcausetP[") ||
    macro.startsWith("\\pcausetX{") ||
    macro.startsWith("\\pcausetX[");
  let is_rcauset =
    macro.startsWith("\\drawrcauset{") ||
    macro.startsWith("\\rcauset{") ||
    macro.startsWith("\\rcauset[") ||
    macro.startsWith("\\rcausetL{") ||
    macro.startsWith("\\rcausetL[") ||
    macro.startsWith("\\rcausetP{") ||
    macro.startsWith("\\rcausetP[") ||
    macro.startsWith("\\rcausetX{") ||
    macro.startsWith("\\rcausetX[");
  let is_causet =
    macro.startsWith("\\drawcauset{") ||
    macro.startsWith("\\causet{") ||
    macro.startsWith("\\causet[") ||
    macro.startsWith("\\causetL{") ||
    macro.startsWith("\\causetL[") ||
    macro.startsWith("\\causetP{") ||
    macro.startsWith("\\causetP[") ||
    macro.startsWith("\\causetX{") ||
    macro.startsWith("\\causetX[");
  if (!is_pcauset && !is_rcauset && !is_causet)
    throw new SyntaxError(
      "This value cannot be processed. " +
        "Supported macros are: \\pcauset, \\rcauset and \\causet each followed " +
        "by a square bracket [ or brace {. \n" +
        "Supported macros are also: \\drawpcauset, \\drawrcauset and " +
        "\\drawcauset that must be followed by a brace {."
    );
  let start = macro.indexOf("{") + 1;
  if (start < 1) throw new SyntaxError("The LaTeX macro has to have a first argument " + "starting with an opening brace {.");
  let end = findEndgroup(macro, start);
  if (end < start) throw new SyntaxError("The first argument has no closing brace }.");
  if (is_pcauset) return new Poset(removeGroups(macro.slice(start, end)), [], true);
  let start2 = macro.indexOf("{", end) + 1;
  if (start2 < 1) throw new SyntaxError("The LaTeX macro has to have an second argument " + "starting with an opening brace {.");
  let end2 = findEndgroup(macro, start2);
  if (end2 < start2) throw new SyntaxError("The second argument has no closing brace }.");
  return new Poset(removeGroups(macro.substring(start, end)), removeGroups(macro.substring(start2, end2)), is_rcauset);
}

function getFromMemory(memory_entry) {
  if (!memory_entry)
    throw new TypeError("There is no memory entry! " + "First create a diagram from another input type and add it to the " + "memory.");
  return getFromLatexMacro(memory_entry);
}

// #############################################################################
// Update selection and drawing canvas

let hover = [];
let linkable = 0;

function updateSelectionBounds() {
  let lower = poset.offset;
  let upper = poset.count() - 1 + poset.offset;
  document.getElementById("txtSelection").min = lower.toString();
  document.getElementById("txtSelection").max = upper.toString();
}

function getSelection() {
  let sel = document.getElementById("txtSelection").value;
  let sel_int = parseInt(sel.trim(), 10) - poset.offset;
  if (sel_int >= 0 && sel_int < poset.count()) {
    return sel_int;
  }
  return NaN;
}

function setSelection(new_sel) {
  let strSel = "";
  let n = poset.count();
  const butSwapLeft = document.getElementById("butSwapLeft");
  butSwapLeft.disabled = true;
  if (new_sel >= 0 && new_sel < n) {
    strSel = String(new_sel + poset.offset);
    let i = poset.permutation.indexOf(new_sel);
    butSwapLeft.disabled = i > n - 2 || poset.permutation[i + 1] != new_sel - 1;
  }
  const butRemoveElement = document.getElementById("butRemoveElement");
  butRemoveElement.disabled = strSel == "" || n == 1;
  if (butRemoveElement.disabled) butRemoveElement.className = "btn btn-secondary";
  else butRemoveElement.className = "btn btn-outline-danger";
  document.getElementById("butCreateInsert").disabled = strSel == "";
  const txtSelection = document.getElementById("txtSelection");
  txtSelection.value = strSel;
  document.getElementById("txtLinking").value = "";
  const butLink = document.getElementById("butLink");
  butLink.className = "btn btn-secondary";
  butLink.disabled = true;
  linkable = false;
  redrawPoset();
  updateExport();
}

function resetSelection() {
  if (isBusy) return;
  setSelection(getSelection());
}

function getLinkingSelection() {
  let sel = document.getElementById("txtLinking").value;
  let sel_int = parseInt(sel.trim(), 10) - poset.offset;
  if (sel_int >= 0 && sel_int < poset.count()) {
    return sel_int;
  }
  return NaN;
}

function setLinkingSelection(new_sel) {
  let strSel = "";
  if (new_sel >= 0 && new_sel < poset.count()) strSel = String(new_sel + poset.offset);
  document.getElementById("txtLinking").value = strSel;
  const butLink = document.getElementById("butLink");
  butLink.disabled = strSel == "";
  if (butLink.disabled) butLink.className = "btn btn-secondary";
  else butLink.className = "btn btn-outline-primary";
  redrawPoset();
}

function initializeCanvas(context, n) {
  context.setTransform(1, 0, 0, 1, 0, 0);
  context.clearRect(0, 0, context.canvas.width, context.canvas.height);
  context.beginPath();
  let scaling = context.canvas.height / n / Math.sqrt(2);
  context.scale(scaling, -scaling);
  context.translate(n / Math.sqrt(2), -Math.sqrt(2) * n);
  context.rotate((45 * Math.PI) / 180);
}

const event_size = 0.25;
const link_width = 0.08;
const linking_width = 0.14;
const event_hover_size = 0.33;
const event_linking_size = 0.17;
const selection_color = "red";
const selection_cross_color = "#ffe6e6";
const relocation_color = "#30a070";
const event_color = "black";
const event_hover_color = "#703030";
const event_linking_color = "#007bff";
const unlinked_color = "#d0ebff";
const link_color = "#6c757d";

function drawCross(context, gridSize, selectionIndex) {
  context.strokeStyle = selection_cross_color;
  context.lineWidth = 1.0;
  context.beginPath();
  context.moveTo(selectionIndex + 0.5, 0);
  context.lineTo(selectionIndex + 0.5, gridSize);
  for (let i = 0; i < gridSize; i++) {
    if (poset.permutation[i] != selectionIndex) continue;
    context.moveTo(0, i + 0.5);
    context.lineTo(gridSize, i + 0.5);
  }
  context.stroke();
}

function drawHoveredTile(context, selectionIndex, hoveredIndex) {
  let selV = poset.permutation.indexOf(selectionIndex);
  let u = hover[0];
  let v = hover[1];
  if (hoveredIndex === -1) {
    context.fillStyle = relocation_color;
    context.beginPath();
    context.ellipse(u + 0.5, v + 0.5, event_hover_size, event_hover_size, 0, 0, 2 * Math.PI);
    context.ellipse(selectionIndex + 0.5, selV + 0.5, event_hover_size, event_hover_size, 0, 0, 2 * Math.PI);
    context.fill();
  } else if (hoveredIndex != selectionIndex) {
    context.fillStyle = selection_color;
    context.beginPath();
    context.ellipse(u + 0.5, v + 0.5, event_hover_size, event_hover_size, 0, 0, 2 * Math.PI);
    context.fill();
  }
}

function drawGrid(context, gridSize) {
  context.strokeStyle = "#c0c0c0";
  context.lineWidth = 0.05;
  for (let i = 0; i <= gridSize; i++) {
    context.beginPath();
    context.moveTo(0, i);
    context.lineTo(gridSize, i);
    context.stroke();
    context.beginPath();
    context.moveTo(i, 0);
    context.lineTo(i, gridSize);
    context.stroke();
  }
}

function drawLinks(context, gridSize, selectionIndex, linkedIndex) {
  let selV = poset.permutation.indexOf(selectionIndex);
  let linkedV = poset.permutation.indexOf(linkedIndex);
  for (let i = 0; i < gridSize; i++) {
    let linked_elements = poset.links[i];
    for (let l = 0; l < linked_elements.length; l++) {
      let j = linked_elements[l];
      context.lineWidth = link_width;
      context.strokeStyle = link_color;
      if (selectionIndex === i && linkedIndex === j) {
        if (linkable === -1) {
          context.lineWidth = linking_width;
          context.strokeStyle = event_linking_color;
        }
      }
      context.beginPath();
      context.moveTo(i + 0.5, poset.permutation.indexOf(i) + 0.5);
      context.lineTo(j + 0.5, poset.permutation.indexOf(j) + 0.5);
      context.stroke();
    }
  }
  let isLinkPairSelected = !isNaN(selectionIndex) && !isNaN(linkedIndex);
  if (isLinkPairSelected && !poset.links[selectionIndex].includes(linkedIndex)) {
    context.lineWidth = link_width;
    context.strokeStyle = unlinked_color;
    context.beginPath();
    context.moveTo(selectionIndex + 0.5, selV + 0.5);
    context.lineTo(linkedIndex + 0.5, linkedV + 0.5);
    context.stroke();
  }
}

function drawEventNodes(context, gridSize, selectionIndex, linkedIndex, isHovering, hoveredIndex) {
  let linkedV = poset.permutation.indexOf(linkedIndex);
  for (let i = 0; i < gridSize; i++) {
    let p = poset.permutation[i];
    context.fillStyle = event_color;
    if (hoveredIndex != selectionIndex && hoveredIndex === p) context.fillStyle = event_hover_color;
    else if (isHovering && hoveredIndex === -1 && p === selectionIndex) context.fillStyle = selection_cross_color;
    else if (p === linkedIndex) context.fillStyle = event_linking_color;
    else if (p === selectionIndex) context.fillStyle = selection_color;
    context.beginPath();
    context.ellipse(p + 0.5, i + 0.5, event_size, event_size, 0, 0, 2 * Math.PI);
    context.fill();
  }
  if (!isNaN(linkedIndex) && (!isHovering || linkedIndex != hover[0] || linkedV != hover[1])) {
    context.fillStyle = event_color;
    context.beginPath();
    context.ellipse(linkedIndex + 0.5, linkedV + 0.5, event_linking_size, event_linking_size, 0, 0, 2 * Math.PI);
    context.fill();
  }
}

function drawLabels(canvas, context, gridSize, selectionIndex) {
  let scaling = canvas.width / gridSize / 2;
  context.setTransform(1, 0, 0, 1, 0, 0);
  context.translate(canvas.width / 2, canvas.height);
  context.font = (canvas.width / gridSize / 3).toString() + "px Arial";
  context.textAlign = "right";
  for (let i = 0; i < gridSize; i++) {
    let p = poset.permutation[i];
    let x = (p - i - 0.5) * scaling;
    let y = (p + i + 0.2) * scaling;
    context.fillStyle = event_color;
    if (p === selectionIndex) context.fillStyle = selection_color;
    context.beginPath();
    context.fillText(p + poset.offset, x, -y);
  }
}

function redrawPoset() {
  if (isBusy) return;
  let canvas = document.getElementById("cnvPoset");
  let context = canvas.getContext("2d");
  let sel = getSelection();
  let linksel = getLinkingSelection();
  let n = poset.count();
  initializeCanvas(context, n);
  if (isShowingCross) drawCross(context, n, sel);
  let hovered_event = -1;
  let is_hovering = hover.length == 2;
  if (is_hovering) {
    let p = poset.permutation.indexOf(hover[0]);
    if (p === hover[1]) hovered_event = hover[0];
    drawHoveredTile(context, sel, hovered_event);
  }
  if (isShowingGrid) drawGrid(context, n);
  drawLinks(context, n, sel, linksel);
  drawEventNodes(context, n, sel, linksel, is_hovering, hovered_event);
  if (isShowingLabels) drawLabels(canvas, context, n, sel);
}

// #############################################################################
// Editor (toolbar) functions

const undosteps_max = 100;
let undosteps = [];
let undoindex = -1;

function addUndoStep() {
  if (undoindex < undosteps.length - 1)
    // delete undo steps that are larger than `undoindex`
    undosteps.splice(undoindex + 1, undosteps.length - undoindex - 1);
  const strPerm = poset.getPermutationString();
  if (strPerm.length > 0) {
    if (undosteps.length >= undosteps_max) undosteps.splice(0, undosteps_max - undosteps.length + 1);
    undosteps.push([strPerm, strAllLinks]);
  }
  undoindex = undosteps.length - 1;
  document.getElementById("butUndo").disabled = undoindex <= 0;
  document.getElementById("butRedo").disabled = true;
}

function resetToUndoStep(dir) {
  if (isBusy) return;
  let new_undoindex = undoindex + dir;
  if (new_undoindex < 0 || new_undoindex >= undosteps.length) return;
  let new_poset = new Poset(undosteps[new_undoindex][0], undosteps[new_undoindex][1], undosteps[new_undoindex][1].length === 0);
  if (new_poset.error) {
    showError(new_poset.error, new_poset.hasWarning);
    return;
  }
  poset = new_poset;
  undoindex = new_undoindex;
  document.getElementById("butUndo").disabled = undoindex <= 0;
  document.getElementById("butRedo").disabled = undoindex >= undosteps.length - 1;
  updateSelectionBounds();
  setSelection(NaN);
}

function updateHoveredTile(x, y) {
  let canvas = document.getElementById("cnvPoset");
  let canvas_border = canvas.getBoundingClientRect();
  let n = poset.count();
  let scaling = canvas.width / n;
  x = x - canvas_border.left - canvas.width / 2;
  y_u = -y + canvas_border.top + canvas.height / 2;
  y_v = -y + canvas_border.bottom - canvas.height / 2;
  let u = Math.round((y_u + x) / scaling + (n + 1) / 2) - 1;
  let v = Math.ceil((y_v - x) / scaling + n / 2) - 1;
  if (u < 0 || u >= n || v < 0 || v >= n) {
    if (hover.length > 0) {
      // Cursor leaves the diagram (and a hovered tile).
      hover = [];
      return true;
    }
    // Cursor stays outside of diagram.
    return false;
  }
  let p = poset.permutation[v];
  let ignoreTile = u != p;
  let sel = getSelection();
  let sel_v = poset.permutation.indexOf(sel);
  if (!isNaN(sel) && sel_v >= 0 && (u === sel || p === poset.permutation[sel_v])) {
    ignoreTile = false;
  }
  if (ignoreTile) {
    if (hover.length > 0) {
      // Cursor moves from hovered tile to an ignored tile.
      hover = [];
      return true;
    }
    // Cursor moves among ignored tiles.
    return false;
  }
  // Cursor moves between hovered tiles.
  hover = [u, v];
  return true;
}

function selectU(dir) {
  if (isBusy) return;
  if (dir === 0) return;
  let sel = getSelection();
  if (isNaN(sel) && dir > 0) setSelection(0);
  if (isNaN(sel) && dir < 0) setSelection(poset.count() - 1);
  if (isNaN(sel)) return;
  setSelection(sel + dir);
}

function selectV(dir) {
  if (isBusy) return;
  if (dir === 0) return;
  let sel = getSelection();
  let n = poset.count();
  if (isNaN(sel) && dir > 0) setSelection(poset.permutation[0]);
  if (isNaN(sel) && dir < 0) setSelection(poset.permutation[n - 1]);
  if (isNaN(sel)) return;
  let sel_v = poset.permutation.indexOf(sel);
  if ((sel_v < 0 && dir < 0) || (sel_v >= n && dir > 0)) return;
  let new_sel_v = sel_v + dir;
  if (new_sel_v < 0 || new_sel_v >= n) {
    setSelection(NaN);
    return;
  }
  setSelection(poset.permutation[new_sel_v]);
}

function moveU(moves) {
  if (isBusy) return;
  try {
    if (moves === 0) return;
    let sel = getSelection();
    if (isNaN(sel)) return;
    let u = poset.moveU(sel, moves);
    setSelection(u);
    addUndoStep();
  } catch (e) {
    showError(e.message, e instanceof WarningError);
  }
}

function moveV(moves) {
  if (isBusy) return;
  try {
    if (moves === 0) return;
    let sel = getSelection();
    if (isNaN(sel)) return;
    poset.moveV(sel, moves);
    setSelection(sel);
    addUndoStep();
  } catch (e) {
    showError(e.message, e instanceof WarningError);
  }
}

function changeOffset(increase) {
  if (isBusy) return;
  if (increase == 0) return;
  let sel = getSelection();
  poset.offset = poset.offset + increase;
  updateSelectionBounds();
  if (isNaN(sel)) {
    redrawPoset();
    updateExport();
  } else setSelection(sel);
}

function changeOffsetAndUnselect(offset) {
  if (isBusy) return;
  if (offset != 0) {
    poset.offset = poset.offset + offset;
    updateSelectionBounds();
  }
  setSelection(NaN);
}

function addElement() {
  if (isBusy) return;
  try {
    poset.pushNewElement();
    hover = [];
    updateSelectionBounds();
    setSelection(poset.count() - 1);
    addUndoStep();
  } catch (e) {
    showError(e.message, e instanceof WarningError);
  }
}

function dublicateElement(shift) {
  if (isBusy) return;
  try {
    let sel = getSelection();
    if (isNaN(sel)) return;
    if (shift) poset.insert(sel, getPredefined_chain(2));
    else poset.insert(sel, getPredefined_antichain(2));
    hover = [];
    updateSelectionBounds();
    setSelection(sel + 1);
    addUndoStep();
  } catch (e) {
    showError(e.message, e instanceof WarningError);
  }
}

function removeElement() {
  if (isBusy) return;
  try {
    let sel = getSelection();
    let n = poset.count();
    if (isNaN(sel) || sel < 0 || n === 1) return;
    poset.removeElement(sel);
    hover = [];
    updateSelectionBounds();
    setSelection(Math.min(sel, n - 1));
    addUndoStep();
  } catch (e) {
    showError(e.message, e instanceof WarningError);
  }
}

function changeLink() {
  if (isBusy) return;
  try {
    let sel = getSelection();
    let linksel = getLinkingSelection();
    if (isNaN(sel) || isNaN(linksel)) return;
    if (poset.links[sel].includes(linksel)) poset.removeLink(sel, linksel);
    else if (poset.isLinkable(sel, linksel)) poset.addLink(sel, linksel);
    linkable = poset.isLinkable(sel, linksel);
    redrawPoset();
    updateExport();
    addUndoStep();
  } catch (e) {
    showError(e.message, e instanceof WarningError);
  }
}

function swapLeft() {
  if (isBusy) return;
  try {
    let sel = getSelection();
    if (isNaN(sel)) return;
    let sel_v = poset.permutation.indexOf(sel);
    if (sel_v < 0 || sel_v >= poset.count() - 1) return;
    let new_sel = sel - 1;
    if (poset.permutation[sel_v + 1] != new_sel) return;
    for (let i = 0; i < sel; i++) {
      swapLinks(poset.links[i], sel, new_sel);
      swapLinks(poset.removedlinks[i], sel, new_sel);
      swapLinks(poset.addedlinks[i], sel, new_sel);
    }
    swapElementPair(poset.links, sel, new_sel);
    swapElementPair(poset.removedlinks, sel, new_sel);
    swapElementPair(poset.addedlinks, sel, new_sel);
    setSelection(new_sel);
    addUndoStep();
  } catch (e) {
    showError(e.message, e instanceof WarningError);
  }
}

function to2Order() {
  if (isBusy) return;
  if (!document.getElementById("frmExport_pcauset").hidden) return;
  poset.resetLinks(true);
  setLinkingSelection(NaN);
  updateExport();
  addUndoStep();
}

function turnOpposite() {
  if (isBusy) return;
  const opposite = poset.permutation.slice();
  let sel = getSelection();
  let new_sel = NaN;
  let n = poset.count();
  for (let i = n; i > 0; i--) {
    let p = poset.permutation[n - i];
    opposite[n - p - 1] = i - 1;
    if (p === sel) new_sel = i - 1;
  }
  poset.permutation = opposite;
  poset.remapLinks(opposite.toReversed());
  hover = [];
  setSelection(new_sel);
}

function reflect() {
  if (isBusy) return;
  const reflected = poset.permutation.slice();
  let sel = getSelection();
  let new_sel = NaN;
  let n = poset.count();
  for (let i = 0; i < n; i++) {
    let p = poset.permutation[i];
    reflected[p] = i;
    if (p === sel) {
      new_sel = i;
    }
  }
  poset.permutation = reflected;
  poset.remapLinks(reflected);
  hover = [];
  setSelection(new_sel);
}

function revise() {
  if (isBusy) return;
  let strPermutation = poset.getPermutationString();
  if (strPermutation == "") return;
  const txtInputPermutation = document.getElementById("txtInputPermutation");
  txtInputPermutation.value = strPermutation;
  let strInputType = "pcauset";
  let strRemovedAndAddedLinks = strAllRemovedLinks;
  let addedlinks = poset.getAddedLinksStringAndCount();
  if (addedlinks[1] > 0) {
    if (strRemovedAndAddedLinks.length > 0) strRemovedAndAddedLinks = strRemovedAndAddedLinks + "," + addedlinks[0];
    else strRemovedAndAddedLinks = addedlinks[0];
  }
  if (strRemovedAndAddedLinks.length > 0) {
    strInputType = "rcauset";
  }
  document.getElementById("selInputType").value = strInputType;
  document.getElementById("txtInputRemovedLinks").value = strRemovedAndAddedLinks;
  document.getElementById("txtInputLinks").value = strAllLinks;
  selectInputType();
  window.location.href = "#import";
  txtInputPermutation.focus();
}

function copyToClipboard(textbox) {
  let text = document.getElementById(textbox).value;
  navigator.clipboard.writeText(text);
}

function updateSettingsButton(name, redraw, toggle) {
  let isActive = false;
  if (name == "ShowLabels") {
    if (toggle) isShowingLabels = !isShowingLabels;
    isActive = isShowingLabels;
  } else if (name == "ShowCross") {
    if (toggle) isShowingCross = !isShowingCross;
    isActive = isShowingCross;
  } else if (name == "ShowGrid") {
    if (toggle) isShowingGrid = !isShowingGrid;
    isActive = isShowingGrid;
  }
  document.getElementById("but" + name).className = "btn btn-sm btn-light" + (isActive ? " active" : "");
  if (redraw) redrawPoset();
}

function updateExport() {
  hideLastError();
  let sel = getSelection();
  let style = document.getElementById("selExportLatexStyle").value;
  let strPerm = poset.getPermutationString();
  let removedLinks = poset.getRemovedLinksStringAndCount();
  let addedLinks = poset.getAddedLinksStringAndCount();
  let links = poset.getLinksStringAndCount();
  let layercount = poset.countLayers();
  let n = poset.count();
  const lblPermutation = document.getElementById("lblPermutation");
  const txtPermutation = document.getElementById("txtPermutation");
  if (isNaN(sel)) {
    // no element selected
    lblPermutation.innerHTML =
      n.toString() + (n == 1 ? " element " : " elements ") + "on " + layercount.toString() + (layercount == 1 ? " layer:" : " layers:");
    txtPermutation.value = strPerm;
  } else {
    // element selected
    lblPermutation.innerHTML = "1 of " + n.toString() + (n == 1 ? " element " : " elements ") + "selected:";
    txtPermutation.value = getElementString(sel);
  }
  const lblLinks = document.getElementById("lblLinks");
  const txtLinks = document.getElementById("txtLinks");
  strAllLinks = links[0];
  if (isNaN(sel)) {
    // no element selected
    lblLinks.innerHTML = links[1].toString() + (links[1] == 1 ? " link:" : " links:");
    txtLinks.value = links[0];
  } else {
    // element selected
    let coverings = findCoveredElements(poset.links, sel);
    coverings.sort(function (a, b) {
      return a - b;
    });
    let coveredbys = poset.links[sel];
    coveredbys.sort(function (a, b) {
      return a - b;
    });
    lblLinks.innerHTML = coverings.length.toString() + " and " + coveredbys.length.toString() + " linked elements:";
    txtLinks.value = "{" + coverings.map(getElementString).join(",") + "} and {" + coveredbys.map(getElementString).join(",") + "}";
  }
  const lblRemovedLinks = document.getElementById("lblRemovedLinks");
  const txtRemovedLinks = document.getElementById("txtRemovedLinks");
  strAllRemovedLinks = removedLinks[0];
  if (isNaN(sel)) {
    // no element selected
    let nonMaximalChainCount = n - layercount;
    let tooManyRemovedLinks = 0;
    if (n <= 5 || nonMaximalChainCount < 3) tooManyRemovedLinks = removedLinks[1];
    else if (nonMaximalChainCount < 5) tooManyRemovedLinks = removedLinks[1] - 2;
    if (tooManyRemovedLinks > 0) {
      lblRemovedLinks.className = "input-group-text alert-danger";
      lblRemovedLinks.innerHTML =
        (tooManyRemovedLinks < removedLinks[1] ? "At least " : "") +
        tooManyRemovedLinks.toString() +
        " of " +
        removedLinks[1].toString() +
        " too many removed links:";
    } else {
      lblRemovedLinks.className = "input-group-text";
      lblRemovedLinks.innerHTML = removedLinks[1].toString() + " removed" + (removedLinks[1] == 1 ? " link:" : " links:");
    }
    txtRemovedLinks.value = strAllRemovedLinks;
  } else {
    // element selected
    let removedcoverings = findCoveredElements(poset.removedlinks, sel);
    removedcoverings.sort(function (a, b) {
      return a - b;
    });
    let removedcoveredbys = poset.removedlinks[sel];
    removedcoveredbys.sort(function (a, b) {
      return a - b;
    });
    lblRemovedLinks.innerHTML = removedcoverings.length.toString() + " and " + removedcoveredbys.length.toString() + " unlinked elements:";
    txtRemovedLinks.value =
      "{" + removedcoverings.map(getElementString).join(",") + "} and {" + removedcoveredbys.map(getElementString).join(",") + "}";
  }
  let strRemovedAndAddedLinks = strAllRemovedLinks;
  if (addedLinks[0].length > 0) strRemovedAndAddedLinks = strRemovedAndAddedLinks + "," + addedLinks[0];
  document.getElementById("txtExport_pcauset").value = "\\pcauset" + style + "{" + strPerm + "}";
  document.getElementById("txtExport_rcauset").value = "\\rcauset" + style + "{" + strPerm + "}{" + strRemovedAndAddedLinks + "}";
  document.getElementById("txtExport_causet").value = "\\causet" + style + "{" + strPerm + "}{" + links[0] + "}";
  let export_pcauset = strRemovedAndAddedLinks.length == 0;
  document.getElementById("butOptimize").disabled = layercount != 2;
  document.getElementById("butTo2Order").disabled = export_pcauset;
  document.getElementById("frmExport_pcauset").hidden = !export_pcauset;
  document.getElementById("frmExport_rcauset").hidden = export_pcauset;
  document.getElementById("frmExport_causet").hidden = export_pcauset;
  setExportArrayButtonBusyState(false);
  document.getElementById("txtExportArray").value = "";
}

// #############################################################################
// Export with progress bar

let exportArray_index;
let exportArray_lines;
let exportArray_matrix; // only for 'ordermatrix'

function addExportArrayLine_linkmatrix() {
  exportArray_lines[exportArray_index] = poset.getLinkMatrixRow(exportArray_index).map(Number).join(",");
  nextExportArrayLine(addExportArrayLine_linkmatrix);
}

function addExportArrayLine_ordermatrix() {
  let reverse_index = exportArray_lines.length - 1 - exportArray_index;
  let order_row = poset.getLinkMatrixRow(reverse_index);
  let links = poset.links[reverse_index];
  for (let l = 0; l < links.length; l++) {
    let linked_order_row = exportArray_matrix[links[l]];
    for (let i = 0; i < order_row.length; i++) order_row[i] = order_row[i] || linked_order_row[i];
  }
  exportArray_matrix[reverse_index] = order_row;
  exportArray_lines[reverse_index] = order_row.map(Number).join(",");
  nextExportArrayLine(addExportArrayLine_ordermatrix);
}

function addExportArrayLine_coveringrelations() {
  let coverings = findCoveredElements(poset.links, exportArray_index);
  coverings.sort(function (a, b) {
    return a - b;
  });
  exportArray_lines[exportArray_index] = getElementString(exportArray_index) + ": " + coverings.map(getElementString).join(",");
  nextExportArrayLine(addExportArrayLine_coveringrelations);
}

function addExportArrayLine_coveredbyrelations() {
  let coveredbys = poset.links[exportArray_index].slice();
  coveredbys.sort(function (a, b) {
    return a - b;
  });
  exportArray_lines[exportArray_index] = getElementString(exportArray_index) + ": " + coveredbys.map(getElementString).join(",");
  nextExportArrayLine(addExportArrayLine_coveredbyrelations);
}

function nextExportArrayLine(stepfunction) {
  if (!isBusy) return; // only continue if not interrupted
  exportArray_index = exportArray_index + 1;
  if (exportArray_index < exportArray_lines.length) {
    stepProgress(exportArray_index / exportArray_lines.length);
    setTimeout(stepfunction, 0);
    return;
  }
  document.getElementById("txtExportArray").value = exportArray_lines.join("\n");
  setExportArrayButtonBusyState(false);
  finishProgress();
}

function setExportArrayButtonBusyState(is_computing) {
  const butExportArray = document.getElementById("butExportArray");
  if (is_computing) {
    butExportArray.className = "btn btn-danger mb-2";
    butExportArray.innerHTML = "Cancel";
  } else {
    butExportArray.className = "btn btn-secondary mb-2";
    butExportArray.innerHTML = "Compute";
  }
}

function getExportArray() {
  if (!poset) return;
  if (isBusy) {
    // interrupt
    setExportArrayButtonBusyState(false);
    finishProgress();
    return;
  }
  setExportArrayButtonBusyState(true);
  startProgress();
  exportArray_index = 0;
  exportArray_lines = new Array(poset.count());
  exportArray_matrix = new Array(poset.count());
  let type = document.getElementById("selExportArrayType").value;
  switch (type) {
    case "linkmatrix":
      addExportArrayLine_linkmatrix();
      return;
    case "ordermatrix":
      addExportArrayLine_ordermatrix();
      return;
    case "coveringrelations":
      addExportArrayLine_coveringrelations();
      return;
    case "coveredbyrelations":
      addExportArrayLine_coveredbyrelations();
      return;
  }
  document.getElementById("txtExportArray").value = "Not implemented.";
}

// #############################################################################
// Memory functions

function memorize() {
  if (isBusy || !poset) return;
  let hasRemovedLinks = document.getElementById("frmExport_pcauset").hidden;
  let strMacro;
  if (hasRemovedLinks) strMacro = document.getElementById("txtExport_rcauset").value;
  else strMacro = document.getElementById("txtExport_pcauset").value;
  const entry = document.createElement("option");
  entry.value = strMacro;
  let n = poset.count();
  let l = poset.countLinks();
  entry.innerHTML = n.toString() + (n == 1 ? " element" : " elements") + ", " + l.toString() + (l == 1 ? " link" : " links") + ", " + strMacro;
  entry.selected = true;
  document.getElementById("selInputMemory").appendChild(entry);
  disableMemoryTools(false);
  document.getElementById("selInputType").value = "memory";
  selectInputType();
}

function disableMemoryTools(disabled = true) {
  document.getElementById("butRemoveMemoryEntry").disabled = disabled;
  document.getElementById("butClearMemory").disabled = disabled;
  document.getElementById("butCopyMemoryEntry").disabled = disabled;
  document.getElementById("butCopyMemory").disabled = disabled;
}

function removeMemoryEntry() {
  if (isBusy) return;
  if (!WarningError_isShowing) {
    showError("Removing a poset from this memory list cannot be undone! " + "Push the button again to continue.", true);
    WarningError_isShowing = true;
    return;
  }
  hideLastError();
  const selInputMemory = document.getElementById("selInputMemory");
  for (let i = 0; i < selInputMemory.children.length; i++) {
    if (!selInputMemory.children.item(i).selected) continue;
    selInputMemory.children.item(i).remove();
    break;
  }
  if (selInputMemory.children.length == 0) {
    disableMemoryTools();
    return;
  }
  selInputMemory.children.item(0).selected = true;
}

function clearMemory() {
  if (isBusy) return;
  if (!WarningError_isShowing) {
    showError("Clearing the poset memory list cannot be undone! " + "Push the button again to continue.", true);
    WarningError_isShowing = true;
    return;
  }
  hideLastError();
  document.getElementById("selInputMemory").innerHTML = "";
  disableMemoryTools();
}

function copyMemoryEntry() {
  let entry_value = document.getElementById("selInputMemory").value;
  navigator.clipboard.writeText(entry_value);
}

function copyMemory() {
  const selInputMemory = document.getElementById("selInputMemory");
  let all_entry_values = "";
  for (let i = 0; i < selInputMemory.children.length; i++) {
    if (i > 0) all_entry_values = all_entry_values + "\n";
    all_entry_values = all_entry_values + selInputMemory.children.item(i).value;
  }
  navigator.clipboard.writeText(all_entry_values);
}

// #############################################################################
// Monitor and handle events from input devices

window.addEventListener("mousemove", handleHover);
window.addEventListener("click", handleClick);
window.addEventListener("dblclick", handleDoubleClick);
window.addEventListener("keydown", handleKeyDown);
window.addEventListener("resize", handleResize);

function handleHover(e) {
  if (isBusy) return;
  if (updateHoveredTile(e.clientX, e.clientY)) {
    redrawPoset();
  }
}

function handleClick(e) {
  if (isBusy) return;
  let x = e.clientX;
  let y = e.clientY;
  updateHoveredTile(x, y);
  if (hover.length == 0) {
    // clicked neither on an element nor on a moving position:
    let canvas = document.getElementById("cnvPoset");
    let canvas_border = canvas.getBoundingClientRect();
    if (canvas_border.left < x && x < canvas_border.right && canvas_border.top < y && y < canvas_border.bottom) setSelection(NaN);
    return;
  }
  let u = hover[0];
  let p = poset.permutation[hover[1]];
  let sel = getSelection();
  let linksel = getLinkingSelection();
  if (u === p) {
    // clicked on an element:
    if (!isNaN(sel)) {
      linkable = poset.isLinkable(sel, u);
      if (linkable != 0 && (isNaN(linksel) || linksel != u)) {
        document.getElementById("butLink").disabled = false;
        setLinkingSelection(u);
        return;
      }
    }
    setSelection(u);
    return;
  }
  if (isNaN(sel)) return;
  // clicked on a moving position:
  if (sel != u) {
    moveU(u - sel);
    return;
  }
  let sel_v = poset.permutation.indexOf(sel);
  moveV(hover[1] - sel_v);
}

function handleDoubleClick(e) {
  if (isBusy) return;
  updateHoveredTile(e.clientX, e.clientY);
  if (hover.length == 0) return;
  let u = hover[0];
  let p = poset.permutation[hover[1]];
  if (u === p) {
    dublicateElement(e.shiftKey);
  }
}

function handleKeyDown(e) {
  if (isBusy) return;
  if (document.activeElement && document.activeElement.id.startsWith("txt")) return; // ignore keyboard when a text field is active
  if (e.altKey || e.metaKey) return; // no alt/meta key short-cuts
  if (!e.shiftKey && e.ctrlKey && e.key == "z") resetToUndoStep(-1); // undo
  if ((!e.shiftKey && e.ctrlKey && e.key == "y") || (e.shiftKey && e.ctrlKey && e.key == "Z")) resetToUndoStep(1); // redo
  if (e.ctrlKey) return;
  if (e.shiftKey) {
    if (e.code == "KeyA") moveU(-1);
    else if (e.code == "KeyD") moveU(1);
    else if (e.code == "KeyS") moveV(-1);
    else if (e.code == "KeyW") moveV(1);
  } else {
    // if ( !e.shiftKey )
    if (e.code == "KeyA") selectU(-1);
    else if (e.code == "KeyD") selectU(1);
    else if (e.code == "KeyS") selectV(-1);
    else if (e.code == "KeyW") selectV(1);
    else if (e.key == "Delete") removeElement();
    else if (e.key == ".") addElement();
  }
}

function handleResize() {
  if (isBusy) return;
  if (updateWidth()) {
    redrawPoset();
  }
}

// #############################################################################
// Process layered posets

function getFromCoveringList(textfieldvalue) {
  /* Parses the textfield input `textfieldvalue` (checking the input and raises 
	syntax errors if necessary) and returns a poset object. */
  let lines = textfieldvalue.split("\n");
  let coverings = [];
  let firstlayer = [];
  let min1 = 0;
  let max1 = 0;
  let linkcount = 0;
  let elementcount = 0;
  let parallelcount = 0;
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    if (line.length == 0) {
      parallelcount = parallelcount + 1;
      continue;
    }
    if (line.includes(":")) {
      throw new SyntaxError(
        "An explicit labelling of the second layer " +
          "elements is not supported! The second layer elements are " +
          "automatically labelled starting with the next larger number of all " +
          "numbers in the text field. Do not use the colon character!"
      );
    }
    let line_split = line.split(",").map(parseIntNotNaN);
    let element_coverings = [];
    for (let j = 0; j < line_split.length; j++) {
      e = line_split[j];
      if (firstlayer.length == 0 || e < min1) min1 = e;
      if (firstlayer.length == 0 || e > max1) max1 = e;
      if (!firstlayer.includes(e)) firstlayer.push(e);
      if (!element_coverings.includes(e)) element_coverings.push(e);
    }
    if (element_coverings.length == 0) continue;
    elementcount = elementcount + 1;
    linkcount = linkcount + element_coverings.length;
    coverings.push(element_coverings);
  }
  if (coverings.length == 0) {
    if (parallelcount == 0) throw new SyntaxError("The list of coverings is empty!");
    return getPredefined_antichain(parallelcount);
  }
  let count1 = max1 - min1 + 1;
  if (count1 != firstlayer.length) {
    let missing1 = [];
    let missing1_more = false;
    for (let i = 0; i < count1; i++) {
      if (!firstlayer.includes(min1 + i)) {
        missing1_more = missing1.length >= 5;
        if (missing1_more) break;
        missing1.push(min1 + i);
      }
    }
    throw new SyntaxError(
      "The" +
        (missing1.length == 1 ? " element " : " elements ") +
        missing1.join(", ") +
        (missing1_more ? " and more " : "") +
        (missing1.length == 1 ? " is " : " are ") +
        "missing in the list of coverings!"
    );
  }
  elementcount = elementcount + count1 + parallelcount;
  checkAndThrowWarningIfLarge(elementcount);
  checkAndThrowWarningIfLarge(linkcount, true);
  return convertCoveringsToPoset(coverings, min1, count1, parallelcount);
}

function getRearrangementMoveBounds(coverings, start1, count1) {
  /* Computes the maximal u-moves and v-moves for each element on the first 
	layer and second layer, respectively, and returns two arrays one for each 
	layer. */
  const moves1_u = initializeArray(count1, 0);
  for (let i = 1; i < count1; i++) {
    let a = start1 + i;
    for (let j = 0; j < coverings.length; j++) {
      if (!coverings[j].includes(a)) continue;
      moves1_u[i] = j;
      break;
    }
  }
  const moves2_v = initializeArray(coverings.length, 0);
  for (let j = 1; j < coverings.length; j++) {
    for (let i = 0; i < count1; i++) {
      let a = start1 + i;
      if (!coverings[j].includes(a)) continue;
      moves2_v[j] = i;
      break;
    }
  }
  return [moves1_u, moves2_v];
}

function getLayeredPermutation(start1, count1, count2, parallel, doRemapping = false, remapping = 0) {
  let permutation = new Array(count1 + count2 + parallel);
  // first layer:
  getLayeredPermutation_setRange(permutation, count1, parallel, start1, count1 - 1, doRemapping, remapping);
  // second layer:
  getLayeredPermutation_setRange(permutation, count2, parallel + count1, start1, count1 + count2 - 1, doRemapping, remapping);
  // parallel antichain:
  getLayeredPermutation_setRange(permutation, parallel, 0, start1, permutation.length - 1, false, 0);
  return permutation;
}

function getLayeredPermutation_setRange(permutation, count, i_shift, offset, last, doRemapping, remapping) {
  if (doRemapping) {
    for (let i = 0; i < count; i++) permutation[i + i_shift] = remapping[last - i] + offset;
  } else {
    for (let i = 0; i < count; i++) permutation[i + i_shift] = last - i + offset;
  }
}

function convertCoveringsToPoset(coverings, start1, count1, parallel, rearrange = true) {
  /* Converts the `coverings` to the 2-layer poset object, where `start1` is 
	the index of the first element on the first layer, `count1` is the number of 
	elements on the first layer, and `parallel` is the number of elements that 
	form a parallel antichain to the 2-layers (the number of elements that 
	are not covered --- these are not included in `count1`). */
  // u-rearranges (first layer) and remapping:
  const u_remapping = new Array(count1 + coverings.length);
  for (let i = 0; i < u_remapping.length; i++) {
    u_remapping[i] = i;
  }
  let rearrangement = [];
  let maxshift = 0;
  if (rearrange) {
    rearrangement = getRearrangementMoveBounds(coverings, start1, count1);
    maxshift = rearrangement[0][count1 - 1];
    for (let i = count1 - 1; i >= 0; i--) {
      if (maxshift == 0) break;
      let shift = Math.min(rearrangement[0][i], maxshift);
      u_remapping[i] = u_remapping[i] + shift;
      for (let j = count1; j < count1 + shift; j++) u_remapping[j] = u_remapping[j] - 1;
      maxshift = shift;
    }
  }
  // Create permutation (u-remapped):
  if (parallel < 0) parallel = 0;
  let permutation = getLayeredPermutation(start1, count1, coverings.length, parallel, rearrange, u_remapping);
  // v-rearranges (second layer) and permutation swaps:
  if (rearrange) {
    maxshift = rearrangement[1][coverings.length - 1];
    for (let j = coverings.length - 1; j >= 0; j--) {
      if (maxshift == 0) break;
      let shift = Math.min(rearrangement[1][j], maxshift);
      let b = u_remapping[count1 + j] + start1;
      let b_v = permutation.indexOf(b);
      permutation = permutation.slice(0, b_v - shift).concat([b], permutation.slice(b_v - shift, b_v), permutation.slice(b_v + 1));
      maxshift = shift;
    }
  }
  // Create link list (remapped):
  const links = [];
  for (let i = 0; i < coverings.length; i++) {
    let b_coverings = coverings[i];
    let b = u_remapping[i + count1] + start1;
    for (let j = 0; j < b_coverings.length; j++) {
      let a_index = b_coverings[j] - start1;
      let a = u_remapping[a_index] + start1;
      links.push([a, b]);
    }
  }
  return new Poset(permutation, links, false);
}

function countLayeredAntichains(permutation) {
  /* Returns the number of layered antichains or 0 if the permutation does not 
	represent layered antichains. Layered antichains are total ordered sequence 
	of antichains. */
  let n = permutation.length;
  if (n == 0) return 0;
  let prev = permutation[0];
  let antichains = 1;
  for (let i = 1; i < n; i++) {
    let next = prev - 1;
    let p = permutation[i];
    if (p < next) return 0; // not layered antichains
    if (p > next) antichains = antichains + 1;
    prev = p;
  }
  return antichains;
}

function getCoveringsAndAntichain() {
  const firstLayer_parallel = poset.findMinimalElements();
  const secondLayer_parallel = poset.findMaximalElements();
  const firstLayer = [];
  const parallel = [];
  for (let i = 0; i < firstLayer_parallel.length; i++) {
    let a = firstLayer_parallel[i];
    if (poset.links[a].length == 0) parallel.push(a);
    else firstLayer.push(a);
  }
  const coverings = [];
  for (let i = 0; i < secondLayer_parallel.length; i++) {
    let b = secondLayer_parallel[i];
    if (parallel.includes(b)) continue;
    let coveredby_b = [];
    for (let j = 0; j < firstLayer.length; j++) {
      if (poset.links[firstLayer[j]].includes(b)) coveredby_b.push(j);
    }
    coverings.push(coveredby_b);
  }
  return [coverings, firstLayer.length, parallel.length];
}

function optimize() {
  if (isBusy) return;
  try {
    if (poset.countLayers() != 2) return;
    let offset = poset.offset;
    // Pack into layered poset:
    let coverings_antichain = getCoveringsAndAntichain();
    let count1 = coverings_antichain[1];
    let parallelCount = coverings_antichain[2];
    let layeredPermutation = getLayeredPermutation(0, count1, coverings_antichain[0].length, parallelCount);
    if (layeredPermutation.toString() != poset.permutation.toString()) {
      poset = convertCoveringsToPoset(coverings_antichain[0], 0, count1, parallelCount, false);
      changeOffsetAndUnselect(offset);
      addUndoStep();
    }
    // Optimize the layered part of the poset:
    const minima = [0, poset.permutation[parallelCount] + 1];
    const counts = [minima[1], poset.count() - parallelCount - minima[1]];
    let linkings = poset.links.slice(0, minima[1]);
    let crossingcount = countLinkCrossings(linkings);
    const optimized = findLinkCrossingMinimum(linkings, minima, counts, crossingcount, true);
    // Convert back to poset with readded parallel elements:
    poset = convertCoveringsToPoset(optimized[0], minima[0], counts[0], parallelCount, true);
    changeOffsetAndUnselect(offset);
    addUndoStep();
  } catch (e) {
    showError(e.message, e instanceof WarningError);
  }
}

function findLinkCrossingMinimum(linkings, minima, counts, crossingcount, doFinishOpposite = false) {
  /* Calls `reduceLinkCrossings` repeatedly for a 2-layered poset until a 
	(local) minimum is reached. As input, it expects `linkings` as the list of 
	links from one of the layers to the other one, `minima` and `counts` as two 
	element arrays for the minimal element index and count of elements on this 
	layer (first entry) and the other layer (second entry), respectively, and 
	`crossingcount` as the number of link crossings in `linkings`. It returns a 
	new array as `linkings` (and the input is modified in place) and its number 
	of link crossings. By default, the routine finishes on the same layer where 
	it started, but it can finish on the other layer when setting the flag 
	`doFinishOpposite`. */
  let i = 0;
  let optimized_layers = 0;
  while (optimized_layers < 2) {
    let new_crossingcount = reduceLinkCrossings(linkings, crossingcount);
    if (new_crossingcount < crossingcount) {
      crossingcount = new_crossingcount;
      optimized_layers = 0;
    } else {
      optimized_layers = optimized_layers + 1;
    }
    i = i + 1;
    linkings = oppositeLinkings(linkings, minima[(i + 1) % 2], minima[i % 2], counts[i % 2]);
  }
  if ((doFinishOpposite && i % 2 == 0) || (!doFinishOpposite && i % 2 != 0)) {
    linkings = oppositeLinkings(linkings, minima[i % 2], minima[(i + 1) % 2], counts[(i + 1) % 2]);
  }
  return [linkings, crossingcount];
}

function oppositeLinkings(linkings, min, min_o, count_o) {
  /* Turns the `linkings` of a 2-layer poset over to the other layer 
	(`covering` <-> `coveredby`), where `min` is the first element index on the 
	layer from where `linkings` originate, `min_o` is the first element index on 
	the opposite layer (the minimum of the values in `linkings`), and `count_o` 
	is the number of elements on the opposite layer. */
  const opposite = initializeLinkList(count_o);
  for (let i = 0; i < linkings.length; i++) {
    let a_links = linkings[i];
    for (let j = 0; j < a_links.length; j++) opposite[a_links[j] - min_o].push(i + min);
  }
  return opposite;
}

function swapElementPair(linkings, i, j) {
  /* Swaps elements `i` and `j` of an array in place. */
  let swap = linkings[i];
  linkings[i] = linkings[j];
  linkings[j] = swap;
}

function swapLinks(linkings, i, j) {
  /* Swaps all entries `i` for `j` and `j` for `i` in an array in place. */
  for (let l = 0; l < linkings.length; l++) {
    if (linkings[l] == i) linkings[l] = j;
    else if (linkings[l] == j) linkings[l] = i;
  }
}

function reduceLinkCrossings(linkings, crossingcount) {
  /* Tests all swaps of arrays in `linkings` to search for a lower number of 
	link crossings than `crossingcount` of the input `linkings`. Only if a swap 
	reduces the link crossings, it is kept. After running once through all 
	element combinations for the swaps the new number of link crossings is 
	returned. Swaps are applied in place to the array. */
  if (crossingcount == 0) return crossingcount;
  for (let i = 0; i < linkings.length; i++) {
    for (let j = i + 1; j < linkings.length; j++) {
      swapElementPair(linkings, i, j);
      let new_crossingcount = countLinkCrossings(linkings);
      if (new_crossingcount >= crossingcount) {
        // no improvement -> unswap
        swapElementPair(linkings, i, j);
        continue;
      }
      crossingcount = new_crossingcount;
      if (crossingcount == 0) return crossingcount;
    }
  }
  return crossingcount;
}

function countLinkCrossings(linkings) {
  /* Returns the number of link crossings in a 2-layer poset, where all the 
	elements on each layer are indexed in strict increasing order. The array 
	`linkings` contains a list of linked element indices of one layer for each 
	element on other layer. */
  let count = 0;
  for (let b = 1; b < linkings.length; b++) {
    let b_links = linkings[b];
    for (let a = 0; a < b; a++) {
      let a_links = linkings[a];
      for (let i = 0; i < a_links.length; i++) {
        for (let j = 0; j < b_links.length; j++) {
          if (a_links[i] > b_links[j]) count++;
        }
      }
    }
  }
  return count;
}
