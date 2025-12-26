<script lang="ts" setup>
import { useStore } from '../../components/useStore';

const props = defineProps<{ errorCode: number }>();

const { router } = useStore();
</script>

<template>
  <div class="page-container">
    <div className="error-container">
      <div className="error-code">{{ props.errorCode }}</div>
      <h1>{{props.errorCode === 404 ? 'Page Not Found' : 'Internal Server Error'}}</h1>
    </div>

    <div class="navigation">
      <h2>Navigation</h2>
      <button @click="router.redirect({ route: 'dynamic', params: { foo: 'example' } })" class="nav-button">Go to Dynamic Page</button>
      <button @click="router.redirect({ route: 'query', query: { foo: 'example' } })" class="nav-button">Go to Query Page</button>
      <button @click="router.redirect({ route: 'preventRedirect' })" class="nav-button">Go to Prevent Page</button>
    </div>
  </div>
</template>
