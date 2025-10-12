<template>Error {{ errorNumber }}</template>

<script setup lang="ts">
const props = defineProps<{ errorNumber: number }>();
defineOptions({ inheritAttrs: false })
</script>
