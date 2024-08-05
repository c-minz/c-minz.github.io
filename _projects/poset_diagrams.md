---
layout: page
title: Hasse diagrams
description: Online editor (PrOSET) and LaTeX package (causets) for Hasse diagrams of posets and causal sets.
img: assets/img/PosetCatalogue_3Crown.png
importance: 1
category: side
related_publications: true
---


In the quantum gravity approach of causal set theory, a spacetime manifold is assumed to be the macroscopic counterpart to ensembles of fundamentally discrete structures that are mathematically described by a collection of spacetime points (events or elements) and their causal relations (a partial ordering). 
These partially ordered sets are, especially for a finite number of elements, represented with Hasse diagrams. 
Since partial orders are a fairly common structure in many areas of mathematics, Hasse diagrams are also useful in contexts other than causal set theory.


## LaTeX package: causets

The LaTeX package `causets` {% cite Minz:2020 %} provides macros to draw Hasse diagrams of partially ordered sets (posets) and causal sets (causets). It is available through [CTAN](https://ctan.org/pkg/causets) and it comes with a full LaTeX installation and is ready to use on Overleaf. Just load the package with
```tex
\usepackage{causets}
```

The package is build on three main commands that can be used in text and math mode. 
The macros are 
- `\pcauset{..,i,..}` to insert a Hasse diagram of a 2D-order using a permutation consecutive integers,
- `\rcauset{..,i,..}{..,i/j,..}` to print a diagram based on a permutation as before (first argument) but with the links `i/j` listed in the second argument removed, 
- `\causet{..,i,..}{..,i/j,..}` to place a diagram where the vertices are arranged according to a 2D-order permutation (first argument) but the links are added only between the element pairs `i/j` given in the second argument. 

For example, use
```tex
\pcauset{1,2,...,7}  % to insert a 7-chain
\pcauset{7,6,...,1}  % to insert a 7-antichain
```

The diagrams are created with TikZ, so that there are plenty of additional options to label, restyle, and combine the graphics with other TikZ code.
You may find more information in the [package manual on CTAN](https://ctan.org/pkg/causets) and the [package repository on GitHub](https://github.com/c-minz/LaTeX-causets).


## Online editor: PrOSET

The macros of the LaTeX package are built on integer permutations that determine the positions of the elements in the diagrams. 
To find a suitable permutation for a poset diagram while getting a live preview, I have developed an online tool, the PrOSET editor.

**[Go to the PrOSET editor](/assets/html/proset-editor.html)**


## Catalogue of finite posets

The diagrams in this catalogue are generated with the LaTeX package and the symmetry properties annotated in the catalogue are defined in {% cite Minz:2024 %}.

Each file of the catalogue contains all partial orders on a given number of elements, one poset per page including the annotated properties:
- upper left `d`: dimension of the order (as primary page order, descending)
- upper centre `l`: number of layers (as secondary page order, ascending)
- upper right `e`: number of edges in the diagram (as tertiary page order, ascending)
- centre: Hasse diagram
- lower left `s`: prime symmetry (1: singleton-symmetry, 2: 2-chain-symmetry, 3: wedge-symmetry, 4: vee-symmetry, 5: 3-chain-symmetry), 
  or 1-stable locally unsymmetric poset counter
- lower centre `u`: locally unsymmetric poset counter
- lower right `p`: poset counter

<p>
<div class="container">
<div class="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4">
  <div class="col">
    <a href="/assets/pdf/PosetCataloguePart1.pdf">
      <div class="card h-100 hoverable">
        {% include figure.liquid path="assets/img/PosetCataloguePart1_Poset1.png" title="Posets with cardinality 1" class="img-fluid" %}
        <div class="card-body">1&nbsp;element, 1&nbsp;poset</div>
      </div>
    </a>
  </div>
  <div class="col">
    <a href="/assets/pdf/PosetCataloguePart2.pdf">
      <div class="card h-100 hoverable">
        {% include figure.liquid path="assets/img/PosetCataloguePart2_Poset2.png" title="Posets with cardinality 2" class="img-fluid" %}
        <div class="card-body">2&nbsp;elements, 2&nbsp;posets</div>
      </div>
    </a>
  </div>
  <div class="col">
    <a href="/assets/pdf/PosetCataloguePart3.pdf">
      <div class="card h-100 hoverable">
        {% include figure.liquid path="assets/img/PosetCataloguePart3_Poset5.png" title="Posets with cardinality 3" class="img-fluid" %}
        <div class="card-body">3&nbsp;elements, 5&nbsp;posets</div>
      </div>
    </a>
  </div>
  <div class="col">
    <a href="/assets/pdf/PosetCataloguePart4.pdf">
      <div class="card h-100 hoverable">
        {% include figure.liquid path="assets/img/PosetCataloguePart4_Poset16.png" title="Posets with cardinality 4" class="img-fluid" %}
        <div class="card-body">4&nbsp;elements, 16&nbsp;posets</div>
      </div>
    </a>
  </div>
  <div class="col">
    <a href="/assets/pdf/PosetCataloguePart5.pdf">
      <div class="card h-100 hoverable">
        {% include figure.liquid path="assets/img/PosetCataloguePart5_Poset63.png" title="Posets with cardinality 5" class="img-fluid" %}
        <div class="card-body">5&nbsp;elements, 63&nbsp;posets</div>
      </div>
    </a>
  </div>
  <div class="col">
    <a href="/assets/pdf/PosetCataloguePart6.pdf">
      <div class="card h-100 hoverable">
        {% include figure.liquid path="assets/img/PosetCataloguePart6_Poset318.png" title="Posets with cardinality 6" class="img-fluid" %}
        <div class="card-body">6&nbsp;elements, 318&nbsp;posets</div>
      </div>
    </a>
  </div>
  <div class="col">
    <a href="/assets/pdf/PosetCataloguePart7.pdf">
      <div class="card h-100 hoverable">
        {% include figure.liquid path="assets/img/PosetCataloguePart7_Poset2045.png" title="Posets with cardinality 7" class="img-fluid" %}
        <div class="card-body">7&nbsp;elements, 2045&nbsp;posets</div>
      </div>
    </a>
  </div>
  <div class="col">
    <a href="/assets/pdf/PosetCatalogueLegend.pdf">
      <div class="card h-100 hoverable">
        {% include figure.liquid path="assets/img/PosetCatalogueLegend.png" title="Legend" class="img-fluid" %}
        <div class="card-body">Legend</div>
      </div>
    </a>
  </div>
</div>
</div>
</p>

In case you spot an error in the catalogue, please get in contact with me. 

