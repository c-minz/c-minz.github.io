function showError(e,t){const n=document.getElementById("msgError");n.innerText=e,n.className=t?"alert alert-danger":"alert alert-warning",n.hidden=!1,n.focus()}function hideLastError(){document.getElementById("msgError").hidden=!0,WarningError_isShowing=!1,LargePosetWarningError_isShowing=!1}function initializeEditor(){document.getElementById("msgJavascript").hidden=!0,selectInputType(),updateWidth();const e=document.getElementById("butRemoveElement");e.disabled=!0,e.className="btn btn-secondary",document.getElementById("txtSelection").value="",document.getElementById("butUndo").disabled=!0,document.getElementById("butRedo").disabled=!0,document.getElementById("butAutoLink").disabled=!0;const t=document.getElementById("butLink");t.disabled=!0,t.className="btn btn-secondary",document.getElementById("txtLinking").value="",updateSettingsButton("ShowLabels",!1),document.getElementById("chbShowCross").checked=!0,updateSettingsButton("ShowCross",!1),updateSettingsButton("ShowGrid",!1),document.getElementById("txtCard").value="";const n=["txtPermutation","txtLinks","txtRemovedLinks"];for(let e=0;e<n.length;e++)document.getElementById(n[e]).value="";const i=["pcauset","rcauset","causet"];for(let e=0;e<i.length;e++)document.getElementById("txtExport_"+i[e]).value="",document.getElementById("frmExport_"+i[e]).hidden=!0;document.getElementById("txtExportMatrix").value=""}function selectInputType(){hideLastError();let e=document.getElementById("selInputType").value;document.getElementById("frmInputPredefined").hidden="predefined"!=e,document.getElementById("frmInputPermutation").hidden=!e.endsWith("causet"),document.getElementById("frmInputRemovedLinks").hidden="rcauset"!=e,document.getElementById("frmInputLinks").hidden="causet"!=e,document.getElementById("frmInputLatex").hidden="latex"!=e,document.getElementById("frmInputMatrix").hidden="matrix"!=e}function updateWidth(){const e=4;let t=document.getElementById("cnvPoset").width,n=document.getElementById("cnvPosetContainer").clientWidth,i=document.getElementById("selRelativeCanvasSize").value,r=document.getElementById("selAbsoluteCanvasSize").value;return"fill"==i?"unbounded"!=r?n=parseInt(r,10):n-=e:(n=Math.floor(i/100*n)-e,"unbounded"!=r&&(n=Math.min(n,parseInt(r,10)))),n!==t&&(document.getElementById("cnvPoset").width=n,document.getElementById("cnvPoset").height=n,!0)}function parseIntNotNaN(e){let t=parseInt(e.trim(),10);if(isNaN(t))throw 0==e.length&&(e="(empty)"),new SyntaxError("The value "+e+" cannot be converted to an integer!");return t}function parseLink(e){let t=e.indexOf("/");if(t<0)throw new SyntaxError("Each link has to be of the format 'number/number'.");let n,i=e.indexOf("/",t+1),r=parseIntNotNaN(e.substr(0,t)),o=!1,s="";if(i<0?n=parseIntNotNaN(e.substr(t+1)):(n=parseIntNotNaN(e.substr(t+1,i-t-1)),o=!0,s=e.substr(i+1)),r===n)throw new SyntaxError("An element cannot be linked to itself.");return n<r?o?[n,r,s]:[n,r]:o?[r,n,s]:[r,n]}function parsePermutation(e){let t,n=(t="string"==typeof e?e.split(",").map(parseIntNotNaN):e).length;if(n<1)throw new RangeError("The poset has to have at least one element!");let i=t[0],r=t[0];for(let e=1;e<n;e++){let n=t[e];n<i&&(i=n),n>r&&(r=n)}let o=Math.max(n,r-i+1);if(o>LargePosetWarning_elements&&!LargePosetWarningError_isShowing)throw new LargePosetWarningError(o);const s=new Array(o).fill(0);for(let e=0;e<n;e++){let n=t[e]-i;s[n]=s[n]+1}if(n!=o||-1!=s.indexOf(0)){let e=0,t=[];for(let n=0;n<o;n++)if(1!=s[n]){if(++e>3)break;let r=n+i;0==s[n]?t.push("The element "+r.toString()+" is missing!"):t.push("The element "+r.toString()+" appears "+s[n]+" times!")}let n=t.join(" ");throw e>3&&(n+=" And more errors ..."),new RangeError(n)}for(let e=0;e<n;e++)t[e]=t[e]-i;return[t,i]}function parseLinks(e,t,n){if(0==e.length)return[[],[]];let i;i="string"==typeof e?e.split(",").map(parseLink):e;const r=[],o=[];for(let e=0;e<i.length;e++){let s=i[e][0]-t,l=i[e][1]-t;s<0||l>n||(i[e].length>2?o.push([s,l]):r.push([s,l]))}return[r,o]}function findEndgroup(e,t,n="{",i="}"){let r=e.indexOf(i,t);if(i<0)return-1;let o=e.indexOf(n,t);return o<t||o>r?r:(r=findEndgroup(e,o+1,n,i))<0?-1:findEndgroup(e,r+1,n,i)}function removeGroups(e,t="{",n="}"){let i=e.indexOf(t);if(i<0)return e;let r=findEndgroup(e,i+1,t,n);return r<0?e:removeGroups(e=e.substring(0,i)+e.substring(r+1),t,n)}function initializeLinkList(e){const t=new Array(e);for(let n=0;n<e;n++)t[n]=[];return t}function remapLinkList(e,t){let n=e.length;const i=initializeLinkList(n);for(let r=0;r<n;r++){let n=e[r],o=t[r];for(let e=0;e<n.length;e++){let r=t[n[e]],s=Math.min(o,r),l=Math.max(o,r);i[s].push(l)}}return i}function raiseLinkedElements(e,t,n,i){for(let i=0;i<e.length;i++)e[i]>t&&(e[i]=e[i]+n);if(0!==i.length&&e.includes(t))for(let t=0;t<i.length;t++)e.push(i[t])}function getElementString(e){return String(e+poset.offset)}function getAddedLinkTargetString(e){return getElementString(e)+"/"}function generate(){let e,t=document.getElementById("selInputType").value,n=removeGroups(document.getElementById("txtInputPermutation").value),i="",r=!1;try{"predefined"==t?e=getPredefined():"pcauset"==t?e=new Poset(n,"",!0):"rcauset"==t?e=new Poset(n,removeGroups(document.getElementById("txtInputRemovedLinks").value),!0):"causet"==t?e=new Poset(n,removeGroups(document.getElementById("txtInputLinks").value),!1):"latex"==t&&(e=getFromLatexMacro(document.getElementById("txtInputLatex").value)),i=e.error,r=e.hasWarning}catch(o){i=o.toString(),r=o instanceof WarningError}i?showError(i,r):(poset=e,updateSelectionBounds(),setSelection(NaN),updateExport(),addUndoStep(),window.location.href="#edit")}function getPredefined(){let e=document.getElementById("selInputPredefinedType").value,t=parseInt(document.getElementById("txtInputOrder").value,10);if(isNaN(t)||t<1)throw new RangeError("The value for 'n' has to be a strictly positive integer.");if("chain"==e)return getPredefined_chain(t);if("antichain"==e)return getPredefined_antichain(t);if("random"==e)return getPredefined_random(t);if("fence"==e)return getPredefined_fence(t);if("polygon"==e)return getPredefined_polygon(t);if("crown"==e)return getPredefined_crown(t);throw new TypeError("The poset type '"+e+"' is not implemented.")}function getPredefined_chain(e){const t=[];for(let n=0;n<e;)t[n]=++n;return new Poset(t,[],!0)}function getPredefined_antichain(e){const t=[];for(let n=0;n<e;n++)t[n]=e-n;return new Poset(t,[],!0)}function getPredefined_random(e){const t=[];for(let n=0;n<e;)t[n]=++n;for(let n=e-1;n>0;n--){let e=Math.floor(Math.random()*(n+1)),i=t[n];t[n]=t[e],t[e]=i}return new Poset(t,[],!0)}function getPredefined_fence(e){if(1===e)return new Poset([1],[],!0);const t=[e-1];for(let n=e%2;n<e;n++)t[n]=Math.max(1,e-n-2),t[++n]=Math.min(e-n+2,e);return new Poset(t,[],!0)}function getPredefined_crown(e){if(1===e)throw new RangeError("Crown posets only exist for n > 1.");const t=[e+1];for(let n=e-1;n>=2;n--)t.push(n);t.push(2*e,1);for(let n=2*e-1;n>=2+e;n--)t.push(n);t.push(e);const n=[];for(let t=2;t<e;t++)n.push([t,2*e-t+1]);return new Poset(t,n,!0)}function getPredefined_polygon(e){if(1===e)return new Poset([0,1,2,3],[],!0);if(2===e)return new Poset([0,2,1,4,3,5],[],!0);const t=[0,2*(e-1),2*(e-2),2*e];for(let n=3;n<e;n++)t.push(2*(e-n),2*(e-n+3)-1);t.push(1,5,3,2*e+1);const n=[];let i=2*e-4;for(let e=2;e<=i;e+=2)n.push([e,e+3]);return new Poset(t,n,!0)}function getFromLatexMacro(e){let t=(e=e.trim()).startsWith("\\drawpcauset{")||e.startsWith("\\pcauset{")||e.startsWith("\\pcauset[")||e.startsWith("\\pcausetL{")||e.startsWith("\\pcausetL[")||e.startsWith("\\pcausetP{")||e.startsWith("\\pcausetP[")||e.startsWith("\\pcausetX{")||e.startsWith("\\pcausetX["),n=e.startsWith("\\drawrcauset{")||e.startsWith("\\rcauset{")||e.startsWith("\\rcauset[")||e.startsWith("\\rcausetL{")||e.startsWith("\\rcausetL[")||e.startsWith("\\rcausetP{")||e.startsWith("\\rcausetP[")||e.startsWith("\\rcausetX{")||e.startsWith("\\rcausetX["),i=e.startsWith("\\drawcauset{")||e.startsWith("\\causet{")||e.startsWith("\\causet[")||e.startsWith("\\causetL{")||e.startsWith("\\causetL[")||e.startsWith("\\causetP{")||e.startsWith("\\causetP[")||e.startsWith("\\causetX{")||e.startsWith("\\causetX[");if(!t&&!n&&!i)throw new SyntaxError("This value cannot be processed. Supported macros are: \\pcauset, \\rcauset and \\causet each followed by an optional L P or X and a square bracket [ or brace {. \nSupported macros are also: \\drawpcauset, \\drawrcauset and \\drawcauset that must be followed by a brace {.");let r=e.indexOf("{")+1;if(r<1)throw new SyntaxError("The LaTeX macro has to have a first argument starting with an opening brace {.");let o=findEndgroup(e,r);if(o<r)throw new SyntaxError("The first argument has no closing brace }.");if(t)return new Poset(removeGroups(e.slice(r,o)),[],!0);let s=e.indexOf("{",o)+1;if(s<1)throw new SyntaxError("The LaTeX macro has to have an second argument starting with an opening brace {.");let l=findEndgroup(e,s);if(l<s)throw new SyntaxError("The second argument has no closing brace }.");return new Poset(removeGroups(e.substring(r,o)),removeGroups(e.substring(s,l)),n)}function updateSelectionBounds(){let e=poset.offset,t=poset.card()-1+poset.offset;document.getElementById("txtSelection").min=e.toString(),document.getElementById("txtSelection").max=t.toString()}function getSelection(){let e=document.getElementById("txtSelection").value,t=parseInt(e.trim(),10)-poset.offset;return t>=0&&t<poset.card()?t:NaN}function setSelection(e){let t="";e>=0&&e<poset.card()&&(t=String(e+poset.offset));const n=document.getElementById("butRemoveElement");n.disabled=""==t||1===poset.card(),n.disabled?n.className="btn btn-secondary":n.className="btn btn-outline-danger",document.getElementById("txtSelection").value=t,document.getElementById("txtLinking").value="";const i=document.getElementById("butLink");i.className="btn btn-secondary",i.disabled=!0,linkable=!1,redrawPoset()}function resetSelection(){setSelection(getSelection())}function getLinkingSelection(){let e=document.getElementById("txtLinking").value,t=parseInt(e.trim(),10)-poset.offset;return t>=0&&t<poset.card()?t:NaN}function setLinkingSelection(e){let t="";e>=0&&e<poset.card()&&(t=String(e+poset.offset)),document.getElementById("txtLinking").value=t;const n=document.getElementById("butLink");n.disabled=""==t,n.disabled?n.className="btn btn-secondary":n.className="btn btn-outline-primary",redrawPoset()}function initializeCanvas(e,t){e.setTransform(1,0,0,1,0,0),e.clearRect(0,0,e.canvas.width,e.canvas.height),e.beginPath();let n=e.canvas.height/t/Math.sqrt(2);e.scale(n,-n),e.translate(t/Math.sqrt(2),-Math.sqrt(2)*t),e.rotate(45*Math.PI/180)}function drawGrid(e,t){e.strokeStyle="#c0c0c0",e.lineWidth=.05;for(let n=0;n<=t;n++)e.beginPath(),e.moveTo(0,n),e.lineTo(t,n),e.stroke(),e.beginPath(),e.moveTo(n,0),e.lineTo(n,t),e.stroke()}function redrawPoset(){let e=document.getElementById("cnvPoset"),t=e.getContext("2d"),n=getSelection(),i=poset.permutation.indexOf(n),r=getLinkingSelection(),o=poset.permutation.indexOf(r),s=poset.card();if(initializeCanvas(t,s),document.getElementById("chbShowCross").checked){t.strokeStyle=selection_cross_color,t.lineWidth=1,t.beginPath(),t.moveTo(n+.5,0),t.lineTo(n+.5,s);for(let e=0;e<s;e++)poset.permutation[e]==n&&(t.moveTo(0,e+.5),t.lineTo(s,e+.5));t.stroke()}let l=-1,a=2==hover.length;if(a){let e=hover[0],r=hover[1];poset.permutation.indexOf(e)===r&&(l=e),-1===l?(t.fillStyle=relocation_color,t.beginPath(),t.ellipse(e+.5,r+.5,event_hover_size,event_hover_size,0,0,2*Math.PI),t.ellipse(n+.5,i+.5,event_hover_size,event_hover_size,0,0,2*Math.PI),t.fill()):l!=n&&(t.fillStyle=selection_color,t.beginPath(),t.ellipse(e+.5,r+.5,event_hover_size,event_hover_size,0,0,2*Math.PI),t.fill())}document.getElementById("chbShowGrid").checked&&drawGrid(t,s);for(let e=0;e<s;e++){let i=poset.links[e];for(let o=0;o<i.length;o++){let s=i[o];t.lineWidth=link_width,t.strokeStyle=link_color,n===e&&r===s&&-1===linkable&&(t.lineWidth=linking_width,t.strokeStyle=event_linking_color),t.beginPath(),t.moveTo(e+.5,poset.permutation.indexOf(e)+.5),t.lineTo(s+.5,poset.permutation.indexOf(s)+.5),t.stroke()}}isNaN(n)||isNaN(r)||poset.links[n].includes(r)||(t.lineWidth=link_width,t.strokeStyle=unlinked_color,t.beginPath(),t.moveTo(n+.5,i+.5),t.lineTo(r+.5,o+.5),t.stroke());for(let e=0;e<s;e++){let i=poset.permutation[e];t.fillStyle=event_color,l!=n&&l===i?t.fillStyle=event_hover_color:a&&-1===l&&i===n?t.fillStyle=selection_cross_color:i===r?t.fillStyle=event_linking_color:i===n&&(t.fillStyle=selection_color),t.beginPath(),t.ellipse(i+.5,e+.5,event_size,event_size,0,0,2*Math.PI),t.fill()}if(isNaN(r)||a&&r==hover[0]&&o==hover[1]||(t.fillStyle=event_color,t.beginPath(),t.ellipse(r+.5,o+.5,event_linking_size,event_linking_size,0,0,2*Math.PI),t.fill()),document.getElementById("chbShowLabels").checked){let i=e.width/s/2;t.setTransform(1,0,0,1,0,0),t.translate(e.width/2,e.height),t.font=(e.width/s/3).toString()+"px Arial",t.textAlign="right";for(let e=0;e<s;e++){let r=poset.permutation[e],o=(r-e-.5)*i,s=(r+e+.2)*i;t.fillStyle=event_color,r===n&&(t.fillStyle=selection_color),t.beginPath(),t.fillText(r+poset.offset,o,-s)}}}function addUndoStep(){undoindex<undosteps.length-1&&undosteps.splice(undoindex+1,undosteps.length-undoindex-1);const e=document.getElementById("txtPermutation").value;if(e.length>0){const t=document.getElementById("txtLinks").value;undosteps.length>=undosteps_max&&undosteps.splice(0,undosteps_max-undosteps.length+1),undosteps.push([e,t])}undoindex=undosteps.length-1,document.getElementById("butUndo").disabled=undoindex<=0,document.getElementById("butRedo").disabled=!0}function resetToUndoStep(e){let t=undoindex+e;if(t<0||t>=undosteps.length)return;let n=new Poset(undosteps[t][0],undosteps[t][1],0===undosteps[t][1].length);n.error?showError(n.error,n.hasWarning):(poset=n,undoindex=t,document.getElementById("butUndo").disabled=undoindex<=0,document.getElementById("butRedo").disabled=undoindex>=undosteps.length-1,updateSelectionBounds(),setSelection(NaN),updateExport())}function updateHoveredTile(e,t){let n=document.getElementById("cnvPoset"),i=n.getBoundingClientRect(),r=poset.card(),o=n.width/r;e=e-i.left-n.width/2,y_u=-t+i.top+n.height/2,y_v=-t+i.bottom-n.height/2;let s=Math.round((y_u+e)/o+(r+1)/2)-1,l=Math.ceil((y_v-e)/o+r/2)-1;if(s<0||s>=r||l<0||l>=r)return hover.length>0&&(hover=[],!0);let a=poset.permutation[l],d=s!=a,u=getSelection(),c=poset.permutation.indexOf(u);return!isNaN(u)&&c>=0&&(s===u||a===poset.permutation[c])&&(d=!1),d?hover.length>0&&(hover=[],!0):(hover=[s,l],!0)}function selectU(e){if(0===e)return;let t=getSelection();isNaN(t)&&e>0&&setSelection(0),isNaN(t)&&e<0&&setSelection(poset.card()-1),isNaN(t)||setSelection(t+e)}function selectV(e){if(0===e)return;let t=getSelection(),n=poset.card();if(isNaN(t)&&e>0&&setSelection(poset.permutation[0]),isNaN(t)&&e<0&&setSelection(poset.permutation[n-1]),isNaN(t))return;let i=poset.permutation.indexOf(t);if(i<0&&e<0||i>=n&&e>0)return;let r=i+e;setSelection(r<0||r>=n?NaN:poset.permutation[r])}function moveU(e){try{if(0===e)return;let n=getSelection();if(isNaN(n))return;setSelection(poset.moveU(n,e)),updateExport(),addUndoStep()}catch(t){showError(t.message,t instanceof WarningError)}}function moveV(e){try{if(0===e)return;let n=getSelection();if(isNaN(n))return;poset.moveV(n,e),redrawPoset(),updateExport(),addUndoStep()}catch(t){showError(t.message,t instanceof WarningError)}}function changeOffset(e){if(0===e)return;let t=getSelection();poset.offset=poset.offset+e,updateSelectionBounds(),isNaN(t)?redrawPoset():setSelection(t),updateExport()}function addElement(){try{poset.pushNewElement(),hover=[],updateSelectionBounds(),setSelection(poset.card()-1),updateExport(),addUndoStep()}catch(e){showError(e.message,e instanceof WarningError)}}function dublicateElement(e){try{let n=getSelection();if(isNaN(n))return;poset.dublicateElement(n,e),hover=[],updateSelectionBounds(),setSelection(n+1),updateExport(),addUndoStep()}catch(t){showError(t.message,t instanceof WarningError)}}function removeElement(){try{let t=getSelection(),n=poset.card();if(isNaN(t)||t<0||1===n)return;poset.removeElement(t),hover=[],updateSelectionBounds(),setSelection(Math.min(t,n-1)),updateExport(),addUndoStep()}catch(e){showError(e.message,e instanceof WarningError)}}function changeLink(){try{let t=getSelection(),n=getLinkingSelection();if(isNaN(t)||isNaN(n))return;poset.links[t].includes(n)?poset.removeLink(t,n):poset.isLinkable(t,n)&&poset.addLink(t,n),linkable=poset.isLinkable(t,n),redrawPoset(),updateExport(),addUndoStep()}catch(e){showError(e.message,e instanceof WarningError)}}function autoLink(){document.getElementById("frmExport_pcauset").hidden&&(poset.resetLinks(!0),setLinkingSelection(NaN),updateExport(),addUndoStep())}function turnOpposite(){const e=poset.permutation.slice();let t=getSelection(),n=NaN,i=poset.card();for(let r=i;r>0;r--){let o=poset.permutation[i-r];e[i-o-1]=r-1,o===t&&(n=r-1)}poset.permutation=e,poset.remapLinks(e.toReversed()),hover=[],setSelection(n),updateExport()}function reflect(){const e=poset.permutation.slice();let t=getSelection(),n=NaN,i=poset.card();for(let r=0;r<i;r++){let i=poset.permutation[r];e[i]=r,i===t&&(n=r)}poset.permutation=e,poset.remapLinks(e),hover=[],setSelection(n),updateExport()}function revise(){const e=document.getElementById("txtInputPermutation");e.value=document.getElementById("txtPermutation").value;let t="pcauset",n=poset.getRemovedLinksString();if(n.length>0){t="rcauset";let e=poset.getAddedLinksString();e.length>0&&(n=n+","+e)}document.getElementById("selInputType").value=t,document.getElementById("txtInputRemovedLinks").value=n,document.getElementById("txtInputLinks").value=document.getElementById("txtLinks").value,selectInputType(),window.location.href="#import",e.focus()}function copyToClipboard(e){let t=document.getElementById(e).value;navigator.clipboard.writeText(t)}function updateSettingsButton(e,t){document.getElementById("chb"+e).checked?document.getElementById("lbl"+e).className="btn btn-light active":document.getElementById("lbl"+e).className="btn btn-light",t&&redrawPoset()}function updateExport(){hideLastError();let e=document.getElementById("selExportLatexStyle").value,t=poset.getPermutationString(),n=poset.getRemovedLinksString(),i=poset.getAddedLinksString(),r=poset.getLinksString();document.getElementById("txtCard").value=poset.card().toString(),document.getElementById("txtPermutation").value=t,document.getElementById("txtLinks").value=r,document.getElementById("txtRemovedLinks").value=n,i.length>0&&(n=n+","+i),document.getElementById("txtExport_pcauset").value="\\pcauset"+e+"{"+t+"}",document.getElementById("txtExport_rcauset").value="\\rcauset"+e+"{"+t+"}{"+n+"}",document.getElementById("txtExport_causet").value="\\causet"+e+"{"+t+"}{"+r+"}";let o=0===n.length;document.getElementById("butAutoLink").disabled=o,document.getElementById("frmExport_pcauset").hidden=!o,document.getElementById("frmExport_rcauset").hidden=o,document.getElementById("frmExport_causet").hidden=o,document.getElementById("txtExportMatrix").value=""}function getExportMatrix(){function e(e){return e.map(Number).join(",")}let t;t="link"==document.getElementById("selExportMatrixType").value?poset.toLinkMatrix():poset.toOrderMatrix(),document.getElementById("txtExportMatrix").value=t.map(e).join("\n")}function handleHover(e){updateHoveredTile(e.clientX,e.clientY)&&redrawPoset()}function handleClick(e){let t=e.clientX,n=e.clientY;if(updateHoveredTile(t,n),0==hover.length){let e=document.getElementById("cnvPoset").getBoundingClientRect();return void(e.left<t&&t<e.right&&e.top<n&&n<e.bottom&&setSelection(NaN))}let i=hover[0],r=poset.permutation[hover[1]],o=getSelection(),s=getLinkingSelection();if(i===r)return isNaN(o)||0==(linkable=poset.isLinkable(o,i))||!isNaN(s)&&s==i?void setSelection(i):(document.getElementById("butLink").disabled=!1,void setLinkingSelection(i));if(isNaN(o))return;if(o!=i)return void moveU(i-o);let l=poset.permutation.indexOf(o);moveV(hover[1]-l)}function handleDoubleClick(e){if(updateHoveredTile(e.clientX,e.clientY),0==hover.length)return;hover[0]===poset.permutation[hover[1]]&&dublicateElement(e.shiftKey)}function handleKeyDown(e){switch(e.code){case"KeyA":"A"==e.key?moveU(-1):selectU(-1);break;case"KeyD":"D"==e.key?moveU(1):selectU(1);break;case"KeyS":"S"==e.key?moveV(-1):selectV(-1);break;case"KeyW":"W"==e.key?moveV(1):selectV(1);break;case"Delete":removeElement();break;case"Period":addElement()}}function handleResize(){updateWidth()&&redrawPoset()}const LargePosetWarning_elements=250,LargePosetWarning_links=2e3;let poset,WarningError_isShowing=!1,LargePosetWarningError_isShowing=!1;class WarningError extends Error{constructor(e){super(e),WarningError_isShowing=!0,this.name="Warning",this.message=e+" \nRepeat the action to ignore this warning."}}class LargePosetWarningError extends WarningError{constructor(e,t=!1){let n="You are about to generate a poset with "+e;super((n+=t?" links. ":" elements. ")+"Handling large posets can slow down your system!"),LargePosetWarningError_isShowing=!0}}class Poset{constructor(e,t,n){this.error="",this.hasWarning=!1;try{const t=parsePermutation(e);this.permutation=t[0],this.offset=t[1]}catch(i){return this.error=i.toString(),void(this.hasWarning=i instanceof WarningError)}this.resetLinks(n);try{const e=parseLinks(t,this.offset,this.card()-1);let r=e[0];if(n)for(let e=0;e<r.length;e++)this.removeLink(r[e][0],r[e][1]);else for(let e=0;e<r.length;e++)this.addLink(r[e][0],r[e][1]);r=e[1];for(let e=0;e<r.length;e++)this.addLink(r[e][0],r[e][1],n);let o=this.countLinks();if(o>LargePosetWarning_links&&!LargePosetWarningError_isShowing)throw new LargePosetWarningError(o,!0)}catch(i){return this.error=i.toString(),void(this.hasWarning=i instanceof WarningError)}}card(){return this.permutation.length}resetLinks(e){let t=this.card();this.autolinks=initializeLinkList(t),this.removedlinks=initializeLinkList(t),this.addedlinks=initializeLinkList(t),this.links=initializeLinkList(t);for(let n=0;n<t;n++){let i=this.permutation[n],r=t;for(let o=n+1;o<t;o++){let t=this.permutation[o];i<t&&t<r&&(this.autolinks[i].push(t),e?this.links[i].push(t):this.removedlinks[i].push(t),r=t)}}}remapLinks(e){this.autolinks=remapLinkList(this.autolinks,e),this.removedlinks=remapLinkList(this.removedlinks,e),this.addedlinks=remapLinkList(this.addedlinks,e),this.links=remapLinkList(this.links,e)}isOrdered(e,t){if(this.links[e].includes(t))return!0;const n=new Array(t-e+1);n[0]=!0,n[t-e]=!1;for(let i=e;i<t;i++){if(!n[i-e])continue;let r=this.links[i];for(let o=0;o<r.length;o++)r[o]<i||r[o]>t||(n[r[o]-e]=!0)}return n[t-e]}countLinks(){let e=0,t=this.card();for(let n=0;n<t;n++)e+=this.links[n].length;return e}removeLink(e,t,n=!1){if(e>t)return void this.removeLink(t,e,n);if(e===t){if(n)return;throw new ReferenceError("An element cannot be unlinked from itself.")}let i=this.links[e].indexOf(t);if(-1===i){if(n)return;throw new ReferenceError("The element "+e.toString()+" is not linked to "+t.toString()+".")}this.links[e].splice(i,1),(i=this.addedlinks[e].indexOf(t))>-1&&this.addedlinks[e].splice(i,1),this.autolinks[e].includes(t)&&this.removedlinks[e].push(t)}addLink(e,t,n=!1){if(e>t)return void this.addLink(t,e,n);if(e===t){if(n)return;throw new ReferenceError("An element cannot be linked to itself.")}if(this.links[e].includes(t)){if(n)return;throw new ReferenceError("The element "+e.toString()+" already precedes "+t.toString()+".")}for(let n=0;n<=e;n++){for(let i=this.addedlinks[n]-1;i>=0;i--){let r=this.addedlinks[n][i];t<=r&&(n===e||this.isOrdered(n,e))&&(t===r||this.isOrdered(t,r))&&this.removeLink(n,r,!0)}}let i=this.removedlinks[e].indexOf(t);i>-1&&this.removedlinks[e].splice(i,1),this.links[e].push(t),this.autolinks[e].includes(t)||this.addedlinks[e].push(t)}isLinkable(e,t){if(t<=e)return 0;let n=this.permutation.indexOf(e);return this.permutation.indexOf(t)<=n?0:this.links[e].includes(t)?this.links[e].length<=1?0:this.findCoveredElements(this.links,t).length<=1?0:-1:this.isOrdered(e,t)?0:1}findCoveredElements(e,t){const n=[];if(t>=e.length)return n;for(let i=0;i<t;i++)e[i].includes(t)&&n.push(i);return n}pushNewElement(){let e=this.card();if(e===LargePosetWarning_elements&&!LargePosetWarningError_isShowing)throw new LargePosetWarningError(e+1);this.permutation.unshift(e),this.autolinks.push([]),this.removedlinks.push([]),this.addedlinks.push([]),this.links.push([])}dublicateElement(e,t){let n=this.card();if(e<0||e>=n)throw new RangeError("There is no element "+getElementString(e)+".");if(n===LargePosetWarning_elements&&!LargePosetWarningError_isShowing)throw new LargePosetWarningError(n+1);let i=this.permutation.indexOf(e);for(let t=0;t<n;t++)this.permutation[t]>=e&&(this.permutation[t]+=1);this.permutation.splice(i+Number(!t),0,e);let r=t?[]:[e+1];for(let t=0;t<n;t++)raiseLinkedElements(this.autolinks[t],e,1,r),raiseLinkedElements(this.removedlinks[t],e,1,r),raiseLinkedElements(this.addedlinks[t],e,1,r),raiseLinkedElements(this.links[t],e,1,r);t?(this.autolinks.splice(e,0,[e+1]),this.removedlinks.splice(e,0,[]),this.addedlinks.splice(e,0,[]),this.links.splice(e,0,[e+1])):(this.autolinks.splice(e+1,0,this.autolinks[e].slice()),this.removedlinks.splice(e+1,0,this.removedlinks[e].slice()),this.addedlinks.splice(e+1,0,this.addedlinks[e].slice()),this.links.splice(e+1,0,this.links[e].slice()))}reset_restoreLinks(e,t,n=!1){let i=this.removedlinks,r=this.addedlinks;this.resetLinks(!0);for(let r=0;r<i.length;r++){if(r===e||r===t)continue;let o=i[r],s=!n||r<e?r:r-1;for(let i=0;i<o.length;i++){let r=o[i];r!==e&&r!==t&&(n&&e<r&&(r-=1),-1===this.isLinkable(s,r)&&this.removeLink(s,r,!0))}}for(let i=0;i<r.length;i++){if(i===e||i===t)continue;let o=r[i],s=!n||i<e?i:i-1;for(let i=0;i<o.length;i++){let r=o[i];r!==e&&r!==t&&(n&&e<r&&(r-=1),1===this.isLinkable(s,r)&&this.addLink(s,r,!0))}}}removeElement(e){let t=this.card();if(e<0||e>=t)throw new RangeError("There is no element "+getElementString(e)+".");let n=this.permutation.indexOf(e);this.permutation.splice(n,1);for(let n=0;n<t;n++)this.permutation[n]>e&&(this.permutation[n]=this.permutation[n]-1);this.reset_restoreLinks(e,e,!0)}moveU(e,t){let n=this.permutation.indexOf(e);if(0===t)return e;let i=this.card();if(e<0||e>=i)throw new RangeError("There is no element "+getElementString(e)+".");let r=e+t;if(r<0||r>=i)throw new RangeError("The new position lies outside the diagram.");let o=t>0?1:-1;for(let t=e+o;o*(r-t)>=0;t+=o){let e=this.permutation.indexOf(t);this.permutation[e]=t-o}return this.permutation[n]=r,this.reset_restoreLinks(e,r),r}moveV(e,t){let n=this.permutation.indexOf(e);if(0===t)return n;let i=this.card();if(e<0||e>=i)throw new RangeError("There is no element "+getElementString(e)+".");let r=n+t;if(r<0||r>=i)throw new RangeError("The new position lies outside the diagram.");let o=this.permutation[r];return this.permutation.splice(r,0,this.permutation.splice(n,1)[0]),this.reset_restoreLinks(e,o),r}toLinkMatrix(){let e=this.card(),t=new Array(e);for(let n=0;n<e;n++){let i=this.links[n],r=[];for(let t=0;t<e;t++)r[t]=!1;for(let e=0;e<i.length;e++)r[i[e]]=!0;t[n]=r}return t}toOrderMatrix(){let e=this.card(),t=this.toLinkMatrix();for(let n=0;n<e;n++)for(let i=n+1;i<e;i++)if(t[n][i])for(let r=i+1;r<e;r++)t[n][r]=t[n][r]||t[i][r];return t}getPermutationString(){return this.permutation.map(getElementString).join(",")}get_LinksString(e,t){let n="";for(let i=0;i<e.length;i++){if(0===e[i].length)continue;let r=getElementString(i)+"/";n.length>0&&(n+=","),n=n+r+e[i].map(t).join(","+r)}return n}getRemovedLinksString(){return this.get_LinksString(this.removedlinks,getElementString)}getAddedLinksString(){return this.get_LinksString(this.addedlinks,getAddedLinkTargetString)}getLinksString(){return this.get_LinksString(this.links,getElementString)}}let hover=[],linkable=0;const event_size=.25,link_width=.08,linking_width=.14,event_hover_size=.33,event_linking_size=.17,selection_color="red",selection_cross_color="#ffe6e2",relocation_color="#90b030",event_color="black",event_hover_color="#703030",event_linking_color="#007bff",unlinked_color="#d0ebff",link_color="#6c757d",undosteps_max=100;let undosteps=[],undoindex=-1;window.addEventListener("mousemove",handleHover),window.addEventListener("click",handleClick),window.addEventListener("dblclick",handleDoubleClick),window.addEventListener("keydown",handleKeyDown),window.addEventListener("resize",handleResize);