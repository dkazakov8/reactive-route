<script lang="ts" setup>
import styles from '../../style.module.css';
</script>

<template>
  <div :class="[styles.pageContainer, styles.staticPage]">
    <div :class="styles.pageTitle">Home redirect</div>

    <div :class="[styles.panel, styles.panelLead]">
      <div :class="styles.itemIcon">⏱️</div>
      <div :class="styles.itemBody">
        <div :class="styles.textBlock">
          This route redirects to <code :class="styles.inlineCode">static</code> from <code :class="styles.inlineCode">beforeEnter</code>.
        </div>
        <div :class="styles.textBlock">The page exists only to demonstrate redirect flow.</div>
      </div>
    </div>
  </div>
</template>
