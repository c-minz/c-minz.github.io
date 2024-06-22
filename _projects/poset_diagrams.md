---
layout: page
title: Hasse diagrams
description: Online editor (PrOSET) and LaTeX package (causets) for Hasse diagrams of posets and causal sets.
img: assets/img/PosetCatalogue_3Crown.png
importance: 1
category: side
related_publications: true
---

## LaTeX package: causets

Alongside my doctoral studies, I developed a LaTeX package `causets` {% cite Minz:2020 %} to draw Hasse diagrams, especially for the use in causal set theory. It is available through [CTAN](https://ctan.org/pkg/causets), so that it already comes with a full LaTeX installation (for example, it is ready to use on Overleaf). Just load the package with
```tex
\usepackage{causets}
```

The package supports three main commands
- `\pcauset{..,i,..}` to draw a 2D order using a permutation of a list of consecutive integers `i`
- `\rcauset{..,i,..}{..,i/j,..}` to draw a poset based on a drawing of a 2D order as before (permutation in the first argument), but with some links `i/j` removed (second argument)
- `\causet{..,i,..}{..,i/j,..}` to draw a poset where the vertices are arranged according to the permutation as before (first argument) and links are added between every pair of elements `i/j` (third argument)

Here are some macro examples that create posets for use in math or text mode: 
```tex
\pcauset{1,2,...,7}  % to insert a 7-chain
\pcauset{7,6,...,1}  % to insert a 7-antichain
```

The package is based on TikZ, so there are plenty of additional options to label, restyle, and combine the graphics with other TikZ code.


## Online editor: PrOSET

The macros of the LaTeX package are built on permutations. 
To help find a permutation for the representation as a Hasse diagram, you may use this online tool (currently only supporting the input for the `\pcauset` macro):

**[Go to the PrOSET editor](/assets/html/proset-editor.html)**


## Catalogue of finite posets

The diagrams in this catalogues are generated with the LaTeX package. 
The symmetry properties annotated in the catalogues are defined in {% cite Minz:2024 %}.

Each file of the catalogue contains all finite posets for a fixed cardinality, one poset per page including annotated properties (see also [catalogue legend](/assets/pdf/PosetCatalogueLegend.pdf)):
- upper left `d`: dimension of the order (as primary page order, descending)
- upper centre `l`: number of layers (as secondary page order, ascending)
- upper right `e`: number of edges in the diagram (as tertiary page order, ascending)
- centre: Hasse diagram
- lower left `s`: prime symmetry (1: singleton-symmetry, 2: 2-chain-symmetry, 3: wedge-symmetry, 4: vee-symmetry, 5: 3-chain-symmetry), 
  or 1-stable locally unsymmetric poset counter
- lower centre `u`: locally unsymmetric poset counter
- lower right `p`: poset counter

<div class="row row-cols-1 row-cols-4">
  <div class="col">
    <a href="/assets/pdf/PosetCataloguePart1.pdf">
      <div class="card">
        {% include figure.liquid path="assets/img/PosetCataloguePart1_Poset1.png" title="Posets with cardinality 1" class="img-fluid" %}
        <div class="card-body">
          <p class="card-text">1 poset with 1 element</p>
        </div>
      </div>
    </a>
  </div>
  <div class="col">
    <a href="/assets/pdf/PosetCataloguePart2.pdf">
      <div class="card">
        {% include figure.liquid path="assets/img/PosetCataloguePart2_Poset2.png" title="Posets with cardinality 2" class="img-fluid" %}
        <div class="card-body">
          <p class="card-text">2 posets with 2 elements</p>
        </div>
      </div>
    </a>
  </div>
  <div class="col">
    <a href="/assets/pdf/PosetCataloguePart3.pdf">
      <div class="card">
        {% include figure.liquid path="assets/img/PosetCataloguePart3_Poset5.png" title="Posets with cardinality 3" class="img-fluid" %}
        <div class="card-body">
          <p class="card-text">5 posets with 3 elements</p>
        </div>
      </div>
    </a>
  </div>
  <div class="col">
    <a href="/assets/pdf/PosetCataloguePart4.pdf">
      <div class="card">
        {% include figure.liquid path="assets/img/PosetCataloguePart4_Poset16.png" title="Posets with cardinality 4" class="img-fluid" %}
        <div class="card-body">
          <p class="card-text">16 posets with 4 elements</p>
        </div>
      </div>
    </a>
  </div>
  <div class="col">
    <a href="/assets/pdf/PosetCataloguePart5.pdf">
      <div class="card">
        {% include figure.liquid path="assets/img/PosetCataloguePart5_Poset63.png" title="Posets with cardinality 5" class="img-fluid" %}
        <div class="card-body">
          <p class="card-text">63 posets with 5 elements</p>
        </div>
      </div>
    </a>
  </div>
  <div class="col">
    <a href="/assets/pdf/PosetCataloguePart6.pdf">
      <div class="card">
        {% include figure.liquid path="assets/img/PosetCataloguePart6_Poset318.png" title="Posets with cardinality 6" class="img-fluid" %}
        <div class="card-body">
          <p class="card-text">318 posets with 6 elements</p>
        </div>
      </div>
    </a>
  </div>
  <div class="col">
    <a href="/assets/pdf/PosetCataloguePart7.pdf">
      <div class="card">
        {% include figure.liquid path="assets/img/PosetCataloguePart7_Poset2045.png" title="Posets with cardinality 7" class="img-fluid" %}
        <div class="card-body">
          <p class="card-text">2045 posets with 7 elements</p>
        </div>
      </div>
    </a>
  </div>
</div>
