<template>
  <router-view />
</template>

<style>
:root {
  --accent-red: #E42313;
  --border-gray: #E8E8E8;
  --page-bg: #FFFFFF;
  --surface-tint: #FAFAFA;
  --sidebar-bg: #FFFFFF;
  --text-primary: #0D0D0D;
  --text-secondary: #7A7A7A;
  --text-muted: #B0B0B0;
  --success-green: #22C55E;
}

*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: var(--page-bg);
  color: var(--text-primary);
  line-height: 1.5;
}

button {
  cursor: pointer;
  font-family: inherit;
}

input, select, textarea {
  font-family: inherit;
}
</style>
