<template>
  <div>
    <form ref="formRef" @submit="handleSubmit" class="w-full">
      <div class="w-full relative border-theme-chat-input-border shadow border-2 rounded-lg text-white">
        <div class="w-full p-4 absolute top-0 rounded-t-lg backdrop-blur-sm">
          <div class="w-full flex items-center sticky top-0">
            <MagnifyingGlass
              :size="16"
              weight="bold"
              class="absolute left-4 z-30 text-theme-text-primary"
            />
            <input
              type="text"
              placeholder="Search LLM providers"
              class="bg-theme-bg-secondary placeholder:text-theme-text-secondary z-20 pl-10 h-[38px] rounded-full w-full px-4 py-1 text-sm border border-theme-chat-input-border outline-none focus:outline-primary-button active:outline-primary-button outline-none text-theme-text-primary"
              @input="(e) => searchQuery = e.target.value"
              autocomplete="off"
              @keydown="(e) => { if (e.key === 'Enter') e.preventDefault(); }"
            />
          </div>
        </div>
        <div class="px-4 pt-[70px] flex flex-col gap-y-1 max-h-[390px] overflow-y-auto no-scroll pb-4">
          <template v-for="llm in filteredLLMs" :key="llm.name">
            <LLMItem
              v-if="!(llm.value === 'native' && isHosted)"
              :name="llm.name"
              :value="llm.value"
              :image="llm.logo"
              :description="llm.description"
              :checked="selectedLLM === llm.value"
              @click="() => selectedLLM = llm.value"
            />
          </template>
        </div>
      </div>
      <div class="mt-4 flex flex-col gap-y-1">
        <component
          v-if="selectedLLM && selectedLLMComponent"
          :is="selectedLLMComponent"
          :settings="settings"
        />
      </div>
      <button
        type="submit"
        ref="hiddenSubmitButtonRef"
        hidden
        aria-hidden="true"
      ></button>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { MagnifyingGlass } from '@phosphor-icons/vue';

import OpenAiLogo from '@/media/llmprovider/openai.png';
import GenericOpenAiLogo from '@/media/llmprovider/generic-openai.png';
import AzureOpenAiLogo from '@/media/llmprovider/azure.png';
import AnthropicLogo from '@/media/llmprovider/anthropic.png';
import GeminiLogo from '@/media/llmprovider/gemini.png';
import OllamaLogo from '@/media/llmprovider/ollama.png';
import LMStudioLogo from '@/media/llmprovider/lmstudio.png';
import LocalAiLogo from '@/media/llmprovider/localai.png';
import TogetherAILogo from '@/media/llmprovider/togetherai.png';
import FireworksAILogo from '@/media/llmprovider/fireworksai.jpeg';
import MistralLogo from '@/media/llmprovider/mistral.jpeg';
import HuggingFaceLogo from '@/media/llmprovider/huggingface.png';
import PerplexityLogo from '@/media/llmprovider/perplexity.png';
import OpenRouterLogo from '@/media/llmprovider/openrouter.jpeg';
import GroqLogo from '@/media/llmprovider/groq.png';
import KoboldCPPLogo from '@/media/llmprovider/koboldcpp.png';
import TextGenWebUILogo from '@/media/llmprovider/text-generation-webui.png';
import LiteLLMLogo from '@/media/llmprovider/litellm.png';
import AWSBedrockLogo from '@/media/llmprovider/bedrock.png';
import DeepSeekLogo from '@/media/llmprovider/deepseek.png';
import APIPieLogo from '@/media/llmprovider/apipie.png';
import NovitaLogo from '@/media/llmprovider/novita.png';
import XAILogo from '@/media/llmprovider/xai.png';
import ZAiLogo from '@/media/llmprovider/zai.png';
import NvidiaNimLogo from '@/media/llmprovider/nvidia-nim.png';
import CohereLogo from '@/media/llmprovider/cohere.png';
import PPIOLogo from '@/media/llmprovider/ppio.png';
import DellProAiStudioLogo from '@/media/llmprovider/dpais.png';
import MoonshotAiLogo from '@/media/llmprovider/moonshotai.png';
import CometApiLogo from '@/media/llmprovider/cometapi.png';
import GiteeAILogo from '@/media/llmprovider/giteeai.png';

import OpenAiOptions from '@/components/LLMSelection/OpenAiOptions/index.vue';
import GenericOpenAiOptions from '@/components/LLMSelection/GenericOpenAiOptions/index.vue';
import AzureAiOptions from '@/components/LLMSelection/AzureAiOptions/index.vue';
import AnthropicAiOptions from '@/components/LLMSelection/AnthropicAiOptions/index.vue';
import LMStudioOptions from '@/components/LLMSelection/LMStudioOptions/index.vue';
import LocalAiOptions from '@/components/LLMSelection/LocalAiOptions/index.vue';
import GeminiLLMOptions from '@/components/LLMSelection/GeminiLLMOptions/index.vue';
import OllamaLLMOptions from '@/components/LLMSelection/OllamaLLMOptions/index.vue';
import MistralOptions from '@/components/LLMSelection/MistralOptions/index.vue';
import HuggingFaceOptions from '@/components/LLMSelection/HuggingFaceOptions/index.vue';
import TogetherAiOptions from '@/components/LLMSelection/TogetherAiOptions/index.vue';
import FireworksAiOptions from '@/components/LLMSelection/FireworksAiOptions/index.vue';
import PerplexityOptions from '@/components/LLMSelection/PerplexityOptions/index.vue';
import OpenRouterOptions from '@/components/LLMSelection/OpenRouterOptions/index.vue';
import GroqAiOptions from '@/components/LLMSelection/GroqAiOptions/index.vue';
import CohereAiOptions from '@/components/LLMSelection/CohereAiOptions/index.vue';
import KoboldCPPOptions from '@/components/LLMSelection/KoboldCPPOptions/index.vue';
import TextGenWebUIOptions from '@/components/LLMSelection/TextGenWebUIOptions/index.vue';
import LiteLLMOptions from '@/components/LLMSelection/LiteLLMOptions/index.vue';
import AWSBedrockLLMOptions from '@/components/LLMSelection/AwsBedrockLLMOptions/index.vue';
import DeepSeekOptions from '@/components/LLMSelection/DeepSeekOptions/index.vue';
import ApiPieLLMOptions from '@/components/LLMSelection/ApiPieOptions/index.vue';
import NovitaLLMOptions from '@/components/LLMSelection/NovitaLLMOptions/index.vue';
import XAILLMOptions from '@/components/LLMSelection/XAiLLMOptions/index.vue';
import ZAiLLMOptions from '@/components/LLMSelection/ZAiLLMOptions/index.vue';
import NvidiaNimOptions from '@/components/LLMSelection/NvidiaNimOptions/index.vue';
import PPIOLLMOptions from '@/components/LLMSelection/PPIOLLMOptions/index.vue';
import DellProAiStudioOptions from '@/components/LLMSelection/DPAISOptions/index.vue';
import MoonshotAiOptions from '@/components/LLMSelection/MoonshotAiOptions/index.vue';
import CometApiLLMOptions from '@/components/LLMSelection/CometApiLLMOptions/index.vue';
import GiteeAiOptions from '@/components/LLMSelection/GiteeAIOptions/index.vue';

import LLMItem from '@/components/LLMSelection/LLMItem/index.vue';
import System from '@/models/system';
import paths from '@/utils/paths';
import showToast from '@/utils/toast';

const props = defineProps({
  setHeader: Function,
  setForwardBtn: Function,
  setBackBtn: Function,
});

const { t } = useI18n();
const router = useRouter();

const searchQuery = ref('');
const selectedLLM = ref(null);
const settings = ref(null);
const formRef = ref(null);
const hiddenSubmitButtonRef = ref(null);
const isHosted = window.location.hostname.includes('useanything.com');

const TITLE = t('onboarding.llm.title');
const DESCRIPTION = t('onboarding.llm.description');

const LLMS = [
  {
    name: 'OpenAI',
    value: 'openai',
    logo: OpenAiLogo,
    component: OpenAiOptions,
    description: 'The standard option for most non-commercial use.',
  },
  {
    name: 'Azure OpenAI',
    value: 'azure',
    logo: AzureOpenAiLogo,
    component: AzureAiOptions,
    description: 'The enterprise option of OpenAI hosted on Azure services.',
  },
  {
    name: 'Anthropic',
    value: 'anthropic',
    logo: AnthropicLogo,
    component: AnthropicAiOptions,
    description: 'A friendly AI Assistant hosted by Anthropic.',
  },
  {
    name: 'Gemini',
    value: 'gemini',
    logo: GeminiLogo,
    component: GeminiLLMOptions,
    description: "Google's largest and most capable AI model",
  },
  {
    name: 'NVIDIA NIM',
    value: 'nvidia-nim',
    logo: NvidiaNimLogo,
    component: NvidiaNimOptions,
    description:
      'Run full parameter LLMs directly on your NVIDIA RTX GPU using NVIDIA NIM.',
  },
  {
    name: 'HuggingFace',
    value: 'huggingface',
    logo: HuggingFaceLogo,
    component: HuggingFaceOptions,
    description:
      "Access 150,000+ open-source LLMs and the world's AI community",
  },
  {
    name: 'Ollama',
    value: 'ollama',
    logo: OllamaLogo,
    component: OllamaLLMOptions,
    description: 'Run LLMs locally on your own machine.',
  },
  {
    name: 'Dell Pro AI Studio',
    value: 'dpais',
    logo: DellProAiStudioLogo,
    component: DellProAiStudioOptions,
    description:
      'Run powerful LLMs quickly on NPU powered by Dell Pro AI Studio.',
  },
  {
    name: 'LM Studio',
    value: 'lmstudio',
    logo: LMStudioLogo,
    component: LMStudioOptions,
    description:
      'Discover, download, and run thousands of cutting edge LLMs in a few clicks.',
  },
  {
    name: 'Local AI',
    value: 'localai',
    logo: LocalAiLogo,
    component: LocalAiOptions,
    description: 'Run LLMs locally on your own machine.',
  },
  {
    name: 'Novita AI',
    value: 'novita',
    logo: NovitaLogo,
    component: NovitaLLMOptions,
    description:
      'Reliable, Scalable, and Cost-Effective for LLMs from Novita AI',
  },
  {
    name: 'KoboldCPP',
    value: 'koboldcpp',
    logo: KoboldCPPLogo,
    component: KoboldCPPOptions,
    description: 'Run local LLMs using koboldcpp.',
  },
  {
    name: 'Oobabooga Web UI',
    value: 'textgenwebui',
    logo: TextGenWebUILogo,
    component: TextGenWebUIOptions,
    description: "Run local LLMs using Oobabooga's Text Generation Web UI.",
  },
  {
    name: 'Together AI',
    value: 'togetherai',
    logo: TogetherAILogo,
    component: TogetherAiOptions,
    description: 'Run open source models from Together AI.',
  },
  {
    name: 'Fireworks AI',
    value: 'fireworksai',
    logo: FireworksAILogo,
    component: FireworksAiOptions,
    description:
      'The fastest and most efficient inference engine to build production-ready, compound AI systems.',
  },
  {
    name: 'Mistral',
    value: 'mistral',
    logo: MistralLogo,
    component: MistralOptions,
    description: 'Run open source models from Mistral AI.',
  },
  {
    name: 'Perplexity AI',
    value: 'perplexity',
    logo: PerplexityLogo,
    component: PerplexityOptions,
    description:
      'Run powerful and internet-connected models hosted by Perplexity AI.',
  },
  {
    name: 'OpenRouter',
    value: 'openrouter',
    logo: OpenRouterLogo,
    component: OpenRouterOptions,
    description: 'A unified interface for LLMs.',
  },
  {
    name: 'Groq',
    value: 'groq',
    logo: GroqLogo,
    component: GroqAiOptions,
    description:
      'The fastest LLM inferencing available for real-time AI applications.',
  },
  {
    name: 'Cohere',
    value: 'cohere',
    logo: CohereLogo,
    component: CohereAiOptions,
    description: "Run Cohere's powerful Command models.",
  },
  {
    name: 'LiteLLM',
    value: 'litellm',
    logo: LiteLLMLogo,
    component: LiteLLMOptions,
    description: "Run LiteLLM's OpenAI compatible proxy for various LLMs.",
  },
  {
    name: 'DeepSeek',
    value: 'deepseek',
    logo: DeepSeekLogo,
    component: DeepSeekOptions,
    description: "Run DeepSeek's powerful LLMs.",
  },
  {
    name: 'PPIO',
    value: 'ppio',
    logo: PPIOLogo,
    component: PPIOLLMOptions,
    description:
      'Run stable and cost-efficient open-source LLM APIs, such as DeepSeek, Llama, Qwen etc.',
  },
  {
    name: 'APIpie',
    value: 'apipie',
    logo: APIPieLogo,
    component: ApiPieLLMOptions,
    description: 'A unified API of AI services from leading providers',
  },
  {
    name: 'Generic OpenAI',
    value: 'generic-openai',
    logo: GenericOpenAiLogo,
    component: GenericOpenAiOptions,
    description:
      'Connect to any OpenAi-compatible service via a custom configuration',
  },
  {
    name: 'AWS Bedrock',
    value: 'bedrock',
    logo: AWSBedrockLogo,
    component: AWSBedrockLLMOptions,
    description: 'Run powerful foundation models privately with AWS Bedrock.',
  },
  {
    name: 'xAI',
    value: 'xai',
    logo: XAILogo,
    component: XAILLMOptions,
    description: "Run xAI's powerful LLMs like Grok-2 and more.",
  },
  {
    name: 'Z.AI',
    value: 'zai',
    logo: ZAiLogo,
    component: ZAiLLMOptions,
    description: "Run Z.AI's powerful GLM models.",
  },
  {
    name: 'Moonshot AI',
    value: 'moonshotai',
    logo: MoonshotAiLogo,
    component: MoonshotAiOptions,
    description: "Run Moonshot AI's powerful LLMs.",
  },
  {
    name: 'CometAPI',
    value: 'cometapi',
    logo: CometApiLogo,
    component: CometApiLLMOptions,
    description: '500+ AI Models all in one API.',
  },
  {
    name: 'GiteeAI',
    value: 'giteeai',
    logo: GiteeAILogo,
    component: GiteeAiOptions,
    description: "Run GiteeAI's powerful LLMs.",
  },
];

const filteredLLMs = computed(() => {
  return LLMS.filter((llm) =>
    llm.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const selectedLLMComponent = computed(() => {
  const llm = LLMS.find((llm) => llm.value === selectedLLM.value);
  return llm?.component || null;
});

function handleForward() {
  if (hiddenSubmitButtonRef.value) {
    hiddenSubmitButtonRef.value.click();
  }
}

function handleBack() {
  router.push(paths.onboarding.home());
}

const handleSubmit = async (e) => {
  e.preventDefault();
  const form = e.target;
  const data = {};
  const formData = new FormData(form);
  data.LLMProvider = selectedLLM.value;
  // Default to AnythingLLM embedder and LanceDB
  data.EmbeddingEngine = 'native';
  data.VectorDB = 'lancedb';
  for (var [key, value] of formData.entries()) data[key] = value;

  const { error } = await System.updateSystem(data);
  if (error) {
    showToast(`Failed to save LLM settings: ${error}`, 'error');
    return;
  }
  router.push(paths.onboarding.userSetup());
};

onMounted(async () => {
  const _settings = await System.keys();
  settings.value = _settings;
  selectedLLM.value = _settings?.LLMProvider || 'openai';

  props.setHeader({ title: TITLE, description: DESCRIPTION });
  props.setForwardBtn({ showing: true, disabled: false, onClick: handleForward });
  props.setBackBtn({ showing: true, disabled: false, onClick: handleBack });
});
</script>
