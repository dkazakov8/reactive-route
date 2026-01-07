<script lang="ts" setup>
import Link from '../../components/Link.vue';
import styles from '../../style.module.css';
</script>

<template>
  <div :class="[styles.pageContainer, styles.preventPage]">
    <div :class="styles.pageTitle">Navigation guards</div>

    <div :class="styles.panel">
      <div :class="styles.sectionTitle">beforeEnter + beforeLeave</div>
      <div :class="styles.textBlock">This page shows both lifecycle guards on one route.</div>
      <div :class="styles.textBlock">
        Entering from <code :class="styles.inlineCode">dynamic</code> redirects to <code :class="styles.inlineCode">static</code>. Leaving to
        <code :class="styles.inlineCode">query</code> is blocked.
      </div>
    </div>

    <div :class="styles.panel">
      <div :class="styles.sectionTitle">Rules</div>
      <div :class="styles.panelItem">
        <div :class="styles.itemIcon">⚠️</div>
        <div :class="styles.itemBody">
          <div :class="styles.textBlock"><div :class="styles.labelStrong">From dynamic:</div> redirected to static.</div>
        </div>
      </div>
      <div :class="styles.panelItem">
        <div :class="styles.itemIcon">🚫</div>
        <div :class="styles.itemBody">
          <div :class="styles.textBlock"><div :class="styles.labelStrong">To query:</div> navigation is prevented.</div>
        </div>
      </div>
    </div>

    <div :class="styles.sectionNav">
      <div :class="styles.sectionTitle">Try next</div>
      <Link :to="{ name: 'static' }" :class="styles.navButton">Static</Link>
      <Link :to="{ name: 'dynamic', params: { foo: 'example' } }" :class="styles.navButton">
        Dynamic
      </Link>
      <Link
        :to="{ name: 'query', query: { foo: 'example' } }"
        :class="[styles.navButton, styles.navButtonBlocked]"
      >
        Blocked query
      </Link>
    </div>
  </div>
</template>
