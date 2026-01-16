import { h } from 'vue'
import {
  Globe,
  Browser,
  Brain,
  Flag,
  Info,
  BracketsCurly
} from '@phosphor-icons/vue'

export const BLOCK_TYPES = {
  FLOW_INFO: 'flowInfo',
  START: 'start',
  API_CALL: 'apiCall',
  // WEBSITE: "website", // Temporarily disabled
  // FILE: "file", // Temporarily disabled
  // CODE: "code", // Temporarily disabled
  LLM_INSTRUCTION: 'llmInstruction',
  WEB_SCRAPING: 'webScraping',
  FINISH: 'finish'
}

export const BLOCK_INFO = {
  [BLOCK_TYPES.FLOW_INFO]: {
    label: 'Flow Information',
    icon: h(Info, { class: 'w-5 h-5 text-theme-text-primary' }),
    description: 'Basic flow information',
    defaultConfig: {
      name: '',
      description: ''
    },
    getSummary: (config) => config.name || 'Untitled Flow'
  },
  [BLOCK_TYPES.START]: {
    label: 'Flow Variables',
    icon: h(BracketsCurly, { class: 'w-5 h-5 text-theme-text-primary' }),
    description: 'Configure agent variables and settings',
    getSummary: (config) => {
      const varCount = config.variables?.filter((v) => v.name)?.length || 0
      return `${varCount} variable${varCount !== 1 ? 's' : ''} defined`
    }
  },
  [BLOCK_TYPES.API_CALL]: {
    label: 'API Call',
    icon: h(Globe, { class: 'w-5 h-5 text-theme-text-primary' }),
    description: 'Make an HTTP request',
    defaultConfig: {
      url: '',
      method: 'GET',
      headers: [],
      bodyType: 'json',
      body: '',
      formData: [],
      responseVariable: '',
      directOutput: false
    },
    getSummary: (config) => `${config.method || 'GET'} ${config.url || '(no URL)'}`
  },
  [BLOCK_TYPES.LLM_INSTRUCTION]: {
    label: 'LLM Instruction',
    icon: h(Brain, { class: 'w-5 h-5 text-theme-text-primary' }),
    description: 'Process data using LLM instructions',
    defaultConfig: {
      instruction: '',
      resultVariable: '',
      directOutput: false
    },
    getSummary: (config) => config.instruction || 'No instruction'
  },
  [BLOCK_TYPES.WEB_SCRAPING]: {
    label: 'Web Scraping',
    icon: h(Browser, { class: 'w-5 h-5 text-theme-text-primary' }),
    description: 'Scrape content from a webpage',
    defaultConfig: {
      url: '',
      captureAs: 'text',
      querySelector: '',
      resultVariable: '',
      directOutput: false
    },
    getSummary: (config) => config.url || 'No URL specified'
  },
  [BLOCK_TYPES.FINISH]: {
    label: 'Flow Complete',
    icon: h(Flag, { class: 'w-4 h-4' }),
    description: 'End of agent flow',
    getSummary: () => 'Flow will end here',
    defaultConfig: {},
    renderConfig: () => null
  }
}
