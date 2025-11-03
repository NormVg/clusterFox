<template>
  <NuxtLayout>
    <div class="page-container">
      <div class="page-header">
        <h1>Network Map</h1>
        <p>Visual representation of your IoT module network</p>
      </div>

      <div class="network-map-wrapper">
        <NodeMap />
      </div>
    </div>
  </NuxtLayout>
</template>

<style scoped>
.page-container {
  padding: 2rem;
  margin: 0 auto;
  height: calc(100vh - 4rem);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
}

.page-header {
  margin-bottom: 1.5rem;
  flex-shrink: 0;
}

.page-header h1 {
  font-size: 1.875rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
}

.page-header p {
  font-size: 0.938rem;
  color: var(--text-secondary);
  margin: 0;
}

.network-map-wrapper {
  flex: 1;
  min-height: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
}

@media (max-width: 1024px) {
  .page-container {
    padding: 1rem;
  }
}
</style>
