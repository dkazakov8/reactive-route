<template>Error {{ errorNumber }}</template>

<script setup lang="ts">
defineProps<{ errorNumber: number }>();
defineOptions({ inheritAttrs: false });
</script>
