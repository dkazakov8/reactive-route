<script lang="ts" setup>
import LinkPayload from '../../components/LinkPayload.vue';

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
      <LinkPayload :payload="{ name: 'static' }" class="nav-button">Go to Static Page</LinkPayload>
      <LinkPayload :payload="{ name: 'dynamic', params: { foo: 'example' } }" class="nav-button">
        Go to Dynamic Page
      </LinkPayload>
      <LinkPayload :payload="{ name: 'query', query: { foo: 'example' } }" class="nav-button">
        Go to Query Page
      </LinkPayload>
      <LinkPayload :payload="{ name: 'preventRedirect' }" class="nav-button">
        Go to Prevent Page
      </LinkPayload>
    </div>
  </div>
</template>
