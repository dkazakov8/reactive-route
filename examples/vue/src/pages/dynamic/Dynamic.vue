<script lang="ts" setup>
import Link from '../../components/Link.vue';
import { useRouter } from '../../router';
import styles from '../../style.module.css';

const { router } = useRouter();

const pageState = router.state.dynamic!;

function goRandom() {
  void router.redirect({
    name: 'dynamic',
    params: { foo: String(Math.random()).slice(2, 10) },
  });
}
</script>

<template>
  <div :class="[styles.pageContainer, styles.dynamicPage]">
    <div :class="styles.pageTitle">Dynamic Page</div>

    <div :class="styles.panel">
      <div :class="styles.sectionTitle">Current params</div>
      <pre :class="styles.codeBlock"><code :class="styles.inlineCode">{{ JSON.stringify(pageState.params, null, 2) }}</code></pre>
    </div>

    <div :class="styles.panel">
      <div :class="styles.sectionTitle">Path param</div>
      <div :class="styles.textBlock">
        The segment <code :class="styles.inlineCode">:foo</code> is read from the URL and validated before the page loads.
      </div>
      <div :class="styles.textBlock">
        Values shorter than 3 characters are rejected, so invalid URLs never reach this screen.
      </div>
      <div :class="styles.actionSpacer" />
      <div :class="styles.navButton" @click="goRandom">Random value</div>
      <div :class="styles.note">Generates a valid param and redirects to it.</div>
    </div>

    <div :class="styles.sectionNav">
      <div :class="styles.sectionTitle">Try next</div>
      <Link :to="{ name: 'static' }" :class="styles.navButton">Static</Link>
      <Link :to="{ name: 'query', query: { foo: 'example' } }" :class="styles.navButton">
        Query
      </Link>
      <Link :to="{ name: 'preventRedirect' }" :class="styles.navButton">Guards</Link>
    </div>
  </div>
</template>
