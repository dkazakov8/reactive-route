<script lang="ts" setup>
import Link from '../../components/Link.vue';

const props = defineProps<{ errorCode: number }>();
</script>

<template>
  <div class="page-container">
    <div className="error-container">
      <div className="error-code">{{ props.errorCode }}</div>
      <h1>{{props.errorCode === 404 ? 'Page Not Found' : 'Internal Server Error'}}</h1>
    </div>

    <div class="navigation">
      <h2>Navigation</h2>
      <Link :payload="{ name: 'static' }" class="nav-button">Go to Static Page</Link>
      <Link :payload="{ name: 'dynamic', params: { foo: 'example' } }" class="nav-button">
        Go to Dynamic Page
      </Link>
      <Link :payload="{ name: 'query', query: { foo: 'example' } }" class="nav-button">
        Go to Query Page
      </Link>
      <Link :payload="{ name: 'preventRedirect' }" class="nav-button">
        Go to Prevent Page
      </Link>
    </div>
  </div>
</template>
