<script lang="ts" setup>
import Link from '../../components/Link.vue';
import styles from '../../style.module.css';

const props = defineProps<{ errorCode: number }>();
</script>

<template>
  <div :class="[styles.pageContainer, styles.errorPage]">
    <div :class="styles.errorContainer">
      <div :class="styles.errorCode">
        {{ props.errorCode }}
      </div>
      <div :class="styles.pageTitle">{{ props.errorCode === 404 ? 'Page Not Found' : 'Internal Server Error' }}</div>
    </div>

    <div :class="styles.panel">
      <div :class="styles.sectionTitle">{{ props.errorCode === 404 ? 'Fallback route' : 'Runtime fallback' }}</div>
      <div :class="styles.textBlock">
        {{
          props.errorCode === 404
            ? 'Shown when no route matches the requested URL.'
            : 'Shown when route processing or rendering throws unexpectedly.'
        }}
      </div>
      <div v-if="props.errorCode === 404" :class="styles.textBlock">
        The URL stays useful for debugging while the app renders a controlled fallback.
      </div>
      <div v-else :class="styles.textBlock">
        The router switches to a safe screen instead of leaving the app in a broken state.
      </div>
    </div>

    <div :class="styles.sectionNav">
      <div :class="styles.sectionTitle">Try next</div>
      <Link :to="{ name: 'static' }" :class="styles.navButton">Static</Link>
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
