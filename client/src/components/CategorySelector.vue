<template>
  <div class="category-selector">
    <label for="category-select">Kategorie</label>
    <select
      id="category-select"
      :value="modelValue"
      @change="$emit('update:modelValue', $event.target.value)"
    >
      <option v-for="cat in categories" :key="cat.slug" :value="cat.slug">
        {{ cat.title }} ({{ cat.count }})
      </option>
    </select>
  </div>
</template>

<script setup>
defineProps({
  categories: { type: Array, required: true },
  modelValue: { type: String, required: true },
});

defineEmits(['update:modelValue']);
</script>

<style scoped>
.category-selector {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

label {
  font-weight: 500;
  font-size: 0.875rem;
  color: #555;
}

select {
  padding: 0.5rem 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  background: white;
  min-width: 250px;
}
</style>
