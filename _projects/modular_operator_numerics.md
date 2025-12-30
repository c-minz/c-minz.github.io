---
layout: page
title: Modular operator numerics
description: Numeric approach to modular operators of free, massive bosons and fermions.
img: assets/img/ModularOperatorNumerics.png
importance: 1
category: work
related_publications: true
---

My main research at the University of Leipzig is on modular operators at the one-particle level for local subalgebras of linear quantum fields.

## Free, massive bosons on a double cone

In a first part of the project, we developed a new numerical scheme to approximate the one-particle modular operator.
We implemented an algorithm for the free field of a massive boson (in the vacuum state) on a double cone region of (1+1) and (1+3)-dimensional Minkowski spacetime.
The algorithm discretizes time-0 data of fields and field momenta in position space for a double cone centred at the coordinate origin.
It is known that one component of the massless modular generator is a multiplication operator, but our results strongly suggest that this expression does no longer hold in the massive case for which it depends on the mass and is not a multiplication operator in general {% cite BostelmannCadamuroMinz:2023 %}.

## Small mass corrections to the modular operator of free, massless fermions on a double cone

Taking a very similar approach now for free (Majorana) fermions in two dimensions, the modular Hamiltonian is again well-known as long as the fermions are massless.
Using a perturbative approach, we computed first-order corrections for free fermions with a small mass.
We found that the mass corrections to the modular Hamiltonian also include non-local terms, some of which were previously unknown {% cite CadamuroFroebMinz:2024 %}.

## Free, massive fermions on a double cone in two dimensions

The extension of the numerical approach to the vacuum sector of free, massive, (Majorana) fermions in Minkowski spacetime requires some modifications to the previous methods.
Although the modular generator can be brought into a block form like in the bosonic case, but here the blocks act on the components of time-0 spinor data.
We are currently finishing a paper draft on the new results.
