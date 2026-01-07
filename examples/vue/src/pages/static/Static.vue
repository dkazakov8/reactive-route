<script lang="ts" setup>
import Link from '../../components/Link.vue';
import styles from '../../style.module.css';
</script>

<template>
  <div :class="[styles.pageContainer, styles.staticPage]">
    <div :class="styles.pageTitle">Static Page</div>

    <div :class="styles.panel">
      <div :class="styles.sectionTitle">Fixed path</div>
      <div :class="styles.textBlock">
        A plain route with a fixed URL. Open <code :class="styles.inlineCode">/static</code> and the loader renders this
        page.
      </div>
      <div :class="styles.textBlock">
        The home page uses <code :class="styles.inlineCode">beforeEnter</code> and lands here automatically.
      </div>
    </div>

    <div :class="styles.sectionNav">
      <div :class="styles.sectionTitle">Try next</div>
      <Link :to="{ name: 'dynamic', params: { foo: 'example' } }" :class="styles.navButton">
        Dynamic
      </Link>
      <Link :to="{ name: 'query', query: { foo: 'example' } }" :class="styles.navButton">
        Query
      </Link>
      <Link :to="{ name: 'preventRedirect' }" :class="styles.navButton">Guards</Link>
    </div>
  </div>
</template>
