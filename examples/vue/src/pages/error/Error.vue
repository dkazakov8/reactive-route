<script lang="ts" setup>
import Link from '../../components/Link.vue';

const props = defineProps<{ errorCode: number }>();
</script>

<template>
  <div class="pageContainer errorPage">
    <div class="errorContainer">
      <div :class="['errorCode', props.errorCode === 404 ? 'errorCode404' : 'errorCode500']">
        {{ props.errorCode }}
      </div>
      <h1>{{ props.errorCode === 404 ? 'Page Not Found' : 'Internal Server Error' }}</h1>
    </div>

    <div :class="['routeDescription', props.errorCode === 404 ? 'routeDescription404' : 'routeDescription500']">
      <h2>How it works</h2>
      <p>
        This is an error page that handles both 404 (Not Found) and 500 (Internal Server Error)
        errors. The router passes the error code as a prop to this component.
      </p>
    </div>

    <div class="navigation">
      <h2>Navigation</h2>
      <Link :payload="{ name: 'static' }" class="navButton">Go to Static Page</Link>
      <Link :payload="{ name: 'dynamic', params: { foo: 'example' } }" class="navButton">
        Go to Dynamic Page
      </Link>
      <Link :payload="{ name: 'query', query: { foo: 'example' } }" class="navButton">
        Go to Query Page
      </Link>
      <Link :payload="{ name: 'preventRedirect' }" class="navButton">
        Go to Prevent Page
      </Link>
    </div>
  </div>
</template>
