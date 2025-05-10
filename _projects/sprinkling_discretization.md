---
layout: page
title: Sprinkling and local structures
description: Investigation of the sprinkling process and local structures for the discretization of fields on causal sets
img: assets/img/CausetLocalStructure.png
importance: 3
category: main
related_publications: true
---

[Sprinkling](https://en.wikipedia.org/wiki/Causal_sets#Sprinkling) is a process to create causal sets from a given spacetime manifold.
Using the Poisson distribution, a random, uniformly distributed set of points (called a sprinkle) is selected by this process.
Each sprinkle is a causal set (a locally finite partially ordered set) where the partial ordering is inherited from the causal structure of the underlying spacetime manifold.
We reviewed this probability process in the second part of {% cite FewsterHawkinsMinzRejzner:2021 %}.

In standard classical and quantum field theory, we describe elementary particle with classical and quantum fields that are defined everywhere on a spacetime manifold and the dynamics follow field equations (like the Klein-Gordon equation for a scalar boson).
Similarly, we define fields on the analogue discrete structures of causal sets.
The first main difference is that the field equations have to be discretized, in particular the differential operators that appear in the field equations.
There are standard approaches to do this operator discretization such that the results agree with those obtained on a spacetime manifold in the limit the sprinkling density becomes arbitrarily large.
While such discretizations are typically non-local, we investigated a more recent discretization technique, which is local.

## Causal set sprinkling

The sprinkling process can be broken down into two main steps.
First, we need to find a way to select points from a region of a spacetime in a random and uniform way.
Second, we have to determine the partial ordering by testing all pairs of points if they are causally related.

An implementation for differently shaped regions in Minkowski spacetime is included in my repositories using different programming languages.
I started my source code developments on [causal sets sprinkling in MATLAB](https://github.com/c-minz/MATLAB-causets).
Later on, I continued developments of [causal set sprinkling with Python](https://github.com/c-minz/Python-causets).

## Field equation discretization with local structures

In the beginning of my doctoral research, a new discretization method for the differential operator of the scalar field equations was proposed using a preferred past structure {% cite DableHeathFewsterRejznerWoods:2020 %}.
We analysed this local structure in sprinkled during as part of my projects and published the results in the first part of {% cite FewsterHawkinsMinzRejzner:2021 %}.
In that publication, we showed that there are ways to find unique preferred pasts that also fulfils a list of desired properties for elements in a sprinkle intrinsically with a high probability.
