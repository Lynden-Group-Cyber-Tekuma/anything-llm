<template>
  <div>
    <p class="text-sm text-white/60 my-2">
      You can get a Bing Web Search API subscription key
      <a
        href="https://portal.azure.com/"
        target="_blank"
        rel="noreferrer"
        class="text-blue-300 underline"
      >
        from the Azure portal.
      </a>
    </p>
    <div class="flex gap-x-4">
      <div class="flex flex-col w-60">
        <label class="text-white text-sm font-semibold block mb-3">
          API Key
        </label>
        <input
          type="password"
          name="env::AgentBingSearchApiKey"
          class="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
          placeholder="Bing Web Search API Key"
          :value="settings?.AgentBingSearchApiKey ? '*'.repeat(20) : ''"
          required
          autocomplete="off"
          spellcheck="false"
        />
      </div>
    </div>
    <p class="text-sm text-white/60 my-2">
      To set up a Bing Web Search API subscription:
    </p>
    <ol class="list-decimal text-sm text-white/60 ml-6">
      <li>
        Go to the Azure portal:
        <a
          href="https://portal.azure.com/"
          target="_blank"
          rel="noreferrer"
          class="text-blue-300 underline"
        >
          https://portal.azure.com/
        </a>
      </li>
      <li>Create a new Azure account or sign in with an existing one.</li>
      <li>
        Navigate to the "Create a resource" section and search for "Grounding
        with Bing Search".
      </li>
      <li>
        Select the "Grounding with Bing Search" resource and create a new
        subscription.
      </li>
      <li>Choose the pricing tier that suits your needs.</li>
      <li>
        Obtain the API key for your Grounding with Bing Search subscription.
      </li>
    </ol>
  </div>
</template>

<script setup>
defineProps({
  settings: {
    type: Object,
    default: () => ({})
  }
})
</script>
