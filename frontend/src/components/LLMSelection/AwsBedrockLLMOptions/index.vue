<script setup>
import { ref } from 'vue'
import { PhArrowSquareOut, PhInfo } from '@phosphor-icons/vue'
import { AWS_REGIONS } from './regions'

const props = defineProps({
  settings: {
    type: Object,
    default: () => ({})
  }
})

const connectionMethod = ref(props.settings?.AwsBedrockLLMConnectionMethod ?? 'iam')

const handleScroll = (e) => {
  e.target.blur()
}
</script>

<template>
  <div class="w-full flex flex-col">
    <div v-if="!settings?.credentialsOnly && connectionMethod !== 'apiKey'" class="flex flex-col md:flex-row md:items-center gap-x-2 text-white mb-4 bg-blue-800/30 w-fit rounded-lg px-4 py-2">
      <div class="gap-x-2 flex items-center">
        <PhInfo :size="40" />
        <p class="text-base">
          You should use a properly defined IAM user for inferencing.
          <br />
          <a
            href="https://docs.anythingllm.com/setup/llm-configuration/cloud/aws-bedrock"
            target="_blank"
            class="underline flex gap-x-1 items-center"
            rel="noreferrer"
          >
            Read more on how to use AWS Bedrock in AnythingLLM
            <PhArrowSquareOut :size="14" />
          </a>
        </p>
      </div>
    </div>

    <div class="flex flex-col gap-y-2 mb-2">
      <input
        type="hidden"
        name="AwsBedrockLLMConnectionMethod"
        :value="connectionMethod"
      />
      <div class="flex flex-col w-full">
        <label class="text-theme-text-primary text-sm font-semibold block mb-3">
          Authentication Method
        </label>
        <p class="text-theme-text-secondary text-sm">
          Select the method to authenticate with AWS Bedrock.
        </p>
      </div>
      <select
        name="AwsBedrockLLMConnectionMethod"
        v-model="connectionMethod"
        required
        class="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-fit p-2.5"
      >
        <option value="iam">IAM (Explicit Credentials)</option>
        <option value="sessionToken">
          Session Token (Temporary Credentials)
        </option>
        <option value="iam_role">IAM Role (Implied Credentials)</option>
        <option value="apiKey">Bedrock API Key</option>
      </select>
    </div>

    <div class="w-full flex items-center gap-[36px] my-1.5">
      <template v-if="['iam', 'sessionToken'].includes(connectionMethod)">
        <div class="flex flex-col w-60">
          <label class="text-white text-sm font-semibold block mb-3">
            AWS Bedrock IAM Access ID
          </label>
          <input
            type="password"
            name="AwsBedrockLLMAccessKeyId"
            class="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
            placeholder="AWS Bedrock IAM User Access ID"
            :value="settings?.AwsBedrockLLMAccessKeyId ? '*'.repeat(20) : ''"
            required
            autocomplete="off"
            spellcheck="false"
          />
        </div>
        <div class="flex flex-col w-60">
          <label class="text-white text-sm font-semibold block mb-3">
            AWS Bedrock IAM Access Key
          </label>
          <input
            type="password"
            name="AwsBedrockLLMAccessKey"
            class="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
            placeholder="AWS Bedrock IAM User Access Key"
            :value="settings?.AwsBedrockLLMAccessKey ? '*'.repeat(20) : ''"
            required
            autocomplete="off"
            spellcheck="false"
          />
        </div>
      </template>
      <div v-if="connectionMethod === 'sessionToken'" class="flex flex-col w-60">
        <label class="text-theme-text-primary text-sm font-semibold block mb-3">
          AWS Bedrock Session Token
        </label>
        <input
          type="password"
          name="AwsBedrockLLMSessionToken"
          class="border-none bg-theme-settings-input-bg text-theme-text-primary placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
          placeholder="AWS Bedrock Session Token"
          :value="settings?.AwsBedrockLLMSessionToken ? '*'.repeat(20) : ''"
          required
          autocomplete="off"
          spellcheck="false"
        />
      </div>
      <div v-if="connectionMethod === 'apiKey'" class="flex flex-col w-60">
        <label class="text-theme-text-primary text-sm font-semibold block mb-3">
          AWS Bedrock API Key
        </label>
        <input
          type="password"
          name="AwsBedrockLLMAPIKey"
          class="border-none bg-theme-settings-input-bg text-theme-text-primary placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
          placeholder="AWS Bedrock API Key"
          :value="settings?.AwsBedrockLLMAPIKey ? '*'.repeat(20) : ''"
          required
          autocomplete="off"
          spellcheck="false"
        />
      </div>
      <div class="flex flex-col w-60">
        <label class="text-white text-sm font-semibold block mb-3">
          AWS region
        </label>
        <select
          name="AwsBedrockLLMRegion"
          :value="settings?.AwsBedrockLLMRegion || 'us-west-2'"
          required
          class="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
        >
          <option
            v-for="region in AWS_REGIONS"
            :key="region.code"
            :value="region.code"
          >
            {{ region.name }} ({{ region.code }})
          </option>
        </select>
      </div>
    </div>

    <div class="w-full flex items-center gap-[36px] my-1.5">
      <template v-if="!settings?.credentialsOnly">
        <div class="flex flex-col w-60">
          <label class="text-white text-sm font-semibold block mb-3">
            Model ID
          </label>
          <input
            type="text"
            name="AwsBedrockLLMModel"
            class="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
            placeholder="Model id from AWS eg: meta.llama3.1-v0.1"
            :value="settings?.AwsBedrockLLMModel"
            required
            autocomplete="off"
            spellcheck="false"
          />
        </div>
        <div class="flex flex-col w-60">
          <label class="text-white text-sm font-semibold block mb-3">
            Model context window
          </label>
          <input
            type="number"
            name="AwsBedrockLLMTokenLimit"
            class="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
            placeholder="Content window limit (eg: 8192)"
            :min="1"
            :value="settings?.AwsBedrockLLMTokenLimit"
            required
            autocomplete="off"
            @scroll="handleScroll"
          />
        </div>
        <div class="flex flex-col w-60">
          <label class="text-white text-sm font-semibold block mb-3">
            Model max output tokens
          </label>
          <input
            type="number"
            name="AwsBedrockLLMMaxOutputTokens"
            class="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
            placeholder="Max output tokens (eg: 4096)"
            :min="1"
            :value="settings?.AwsBedrockLLMMaxOutputTokens"
            required
            autocomplete="off"
            @scroll="handleScroll"
          />
        </div>
      </template>
    </div>
  </div>
</template>
