---
layout: about
title: About
permalink: /
subtitle: Ph.D. Research assistant at ITP, Leipzig University, Germany.

profile:
  align: right
  image: c-minz.jpg
  image_circular: false # crops the image to make it circular

news: true # includes a list of news items
selected_papers: false # includes a list of papers marked as "selected={true}"
social: true # includes social icons at the bottom of the page
---

I am a researcher in mathematical and theoretical physics, mostly working on 
- causal set theory (a framework for quantum gravity),
- Tomita-Takesaki modular theory in quantum field theory, and
- algebraic framework of quantum field theory.

I received my PhD from the University of York, UK in July 2022, for which I worked on classical and quantum field theory on causal sets.
Most of my [repositories](/repositories/) contain source code developed for research projects on these topics. 

My research interests also include quantum gravity, not only causal set theory, but also other approaches like causal dynamical triangulations, and non-commutative geometry of spacetimes. 


## Causal sets and Hasse diagrams

Alongside my doctoral studies, I developed a LaTeX package to draw Hasse diagrams for causal sets. It is available through [CTAN](https://ctan.org/pkg/causets), so that it already comes with a full LaTeX installation (for example, it is ready to use on Overleaf). Just load the package with
```tex
\usepackage{causets}
```

Package features are:
- has short macros working in text and math mode
- the macro input is a permutation of consecutive integers
- generalises the idea of 2D-orders to draw generic diagrams
- uses TikZ to draw diagrams for ease of use also in larger graphics
- the online **PrOSET Editor** helps to generate the macro (currently working for 2D-orders): [PrOSET Editor](/assets/html/proset-editor.html)
