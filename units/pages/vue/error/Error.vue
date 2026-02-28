<template>Error {{ error }}</template>

<script setup lang="ts">
defineProps<{ error: number }>();
defineOptions({ inheritAttrs: false });
</script>
