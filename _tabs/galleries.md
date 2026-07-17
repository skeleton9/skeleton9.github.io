---
layout: page
title: 图集
icon: fas fa-images
order: 4
permalink: /galleries/
---

{% assign gallery_list = site.pages | where: "layout", "gallery" | sort: "date" | reverse %}

{% if gallery_list.size == 0 %}
  <p class="text-muted">还没有图集。在 <code>gallery/</code> 下新建 Markdown 文件即可。</p>
{% else %}
  <div class="gallery-index">
    {% for gallery in gallery_list %}
      {% assign cover = gallery.cover %}
      {% if cover == nil or cover == "" %}
        {% if gallery.images and gallery.images.size > 0 %}
          {% assign cover = gallery.images.first.src %}
        {% endif %}
      {% endif %}
      <a class="gallery-card" href="{{ gallery.url | relative_url }}">
        <div class="gallery-card-cover">
          {% if cover %}
            <img src="{{ cover | relative_url }}" alt="{{ gallery.title }}" loading="lazy">
          {% else %}
            <div class="gallery-card-placeholder">
              <i class="fas fa-images" aria-hidden="true"></i>
            </div>
          {% endif %}
        </div>
        <div class="gallery-card-body">
          <h2 class="gallery-card-title">{{ gallery.title }}</h2>
          {% if gallery.description %}
            <p class="gallery-card-desc">{{ gallery.description }}</p>
          {% endif %}
          <p class="gallery-card-meta">
            {% if gallery.date %}
              <time datetime="{{ gallery.date | date_to_xmlschema }}">
                {{ gallery.date | date: '%Y-%m-%d' }}
              </time>
            {% endif %}
            {% if gallery.images %}
              <span>{% if gallery.date %}· {% endif %}{{ gallery.images.size }} 张</span>
            {% endif %}
          </p>
        </div>
      </a>
    {% endfor %}
  </div>
{% endif %}
