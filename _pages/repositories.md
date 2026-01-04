---
layout: page
permalink: /repositories/
title: Repositories
nav: true
nav_order: 2
---

## Repositories on GitHub

<div class="repositories">
  <div class="row row-cols-1 row-cols-md-2">
    {% for repo in site.data.repositories.github_repos %}
      {% include repository/repo.liquid repository=repo %}
    {% endfor %}
  </div>
</div>
