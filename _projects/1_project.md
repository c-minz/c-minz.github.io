---
layout: page
title: Hasse diagrams
description: Online editor (PrOSET) and LaTeX package (causets) for Hasse diagrams of posets and causal sets.
img: assets/img/CataloguePage_3Crown.png
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

For example:
```tex
\pcauset{1,...,7}  % to insert a 7-chain in text or math mode
\pcauset{7,...,1}  % to insert a 7-antichain
```

The package is based on TikZ, so there are plenty of additional options to label, restyle, and combine the graphics with other TikZ code.


## Online editor: PrOSET

Since the macros of the LaTeX package are built on permutations that are not always easy to find, here is an online tool (currently only supporting the input for the `\pcauset` macro):

[Open the PrOSET editor](/assets/html/proset-editor.html)


## Catalogues of finite posets

Here is a catalogue of Hasse diagrams of all finite posets up to cardinality 7, all of which have been generated with the LaTeX package. 

Each file contains the catalogues of finite posets for a fixed cardinality, one poset per page including the following properties:
- upper left `d`: dimension of the order (as primary page order, descending)
- upper centre `l`: number of layers (as secondary page order, ascending)
- upper right `e`: number of edges in the diagram (as tertiary page order, ascending)
- centre: Hasse diagram
- lower left `s`: prime symmetry
	+ 1: has a singleton-symmetry
	+ 2: has a 2-chain-symmetry
	+ 3: has a wedge-symmetry
	+ 4: has a vee-symmetry
	+ 5: has a 3-chain-symmetry
  or 1-stable locally unsymmetric poset counter
- lower centre `u`: locally unsymmetric poset counter
- lower right `p`: poset counter

For an explanation of the symmetry properties and counters, see {% cite Minz:2024 %}.

Here are the catalogues:
- [Catalogue legend](/assets/pdf/PosetCatalogueLegend.pdf)
- [Catalogue of posets with cardinality 1](/assets/pdf/PosetCataloguePart1.pdf)
- [Catalogue of posets with cardinality 2](/assets/pdf/PosetCataloguePart2.pdf)
- [Catalogue of posets with cardinality 3](/assets/pdf/PosetCataloguePart3.pdf)
- [Catalogue of posets with cardinality 4](/assets/pdf/PosetCataloguePart4.pdf)
- [Catalogue of posets with cardinality 5](/assets/pdf/PosetCataloguePart5.pdf)
- [Catalogue of posets with cardinality 6](/assets/pdf/PosetCataloguePart6.pdf)
- [Catalogue of posets with cardinality 7](/assets/pdf/PosetCataloguePart7.pdf)
