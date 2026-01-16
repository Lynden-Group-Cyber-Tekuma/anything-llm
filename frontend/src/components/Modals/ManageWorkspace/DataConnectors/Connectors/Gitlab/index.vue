<script setup>
import { ref, reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import System from '@/models/system'
import showToast from '@/utils/toast'
import pluralize from 'pluralize'
import { PhInfo, PhWarning } from '@phosphor-icons/vue'

const { t } = useI18n()
const loading = ref(false)
const repo = ref(null)
const accessToken = ref(null)
const ignores = ref([])

const settings = reactive({
  repo: null,
  accessToken: null,
})

const handleSubmit = async (e) => {
  e.preventDefault()
  const form = new FormData(e.target)

  try {
    loading.value = true
    showToast(
      'Fetching all files for repo - this may take a while.',
      'info',
      { clear: true, autoClose: false }
    )
    const { data, error } = await System.dataConnectors.gitlab.collect({
      repo: form.get('repo'),
      accessToken: form.get('accessToken'),
      branch: form.get('branch'),
      ignorePaths: ignores.value,
      fetchIssues: form.get('fetchIssues'),
      fetchWikis: form.get('fetchWikis'),
    })

    if (!!error) {
      showToast(error, 'error', { clear: true })
      loading.value = false
      return
    }

    showToast(
      `${data.files} ${pluralize('file', data.files)} collected from ${
        data.author
      }/${data.repo}:${data.branch}. Output folder is ${data.destination}.`,
      'success',
      { clear: true }
    )
    e.target.reset()
    loading.value = false
    return
  } catch (e) {
    console.error(e)
    showToast(e.message, 'error', { clear: true })
    loading.value = false
  }
}

const handleRepoBlur = () => {
  settings.repo = repo.value
}

const handleAccessTokenBlur = () => {
  settings.accessToken = accessToken.value
}
</script>

<template>
  <div class="flex w-full">
    <div class="flex flex-col w-full px-1 md:pb-6 pb-16">
      <form class="w-full" @submit="handleSubmit">
        <div class="w-full flex flex-col py-2">
          <div class="w-full flex flex-col gap-4">
            <div class="flex flex-col pr-10">
              <div class="flex flex-col gap-y-1 mb-4">
                <label class="text-white text-sm font-bold">
                  {{ t('connectors.gitlab.URL') }}
                </label>
                <p class="text-xs font-normal text-theme-text-secondary">
                  {{ t('connectors.gitlab.URL_explained') }}
                </p>
              </div>
              <input
                type="url"
                name="repo"
                v-model="repo"
                @blur="handleRepoBlur"
                class="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
                placeholder="https://gitlab.com/gitlab-org/gitlab"
                required
                autocomplete="off"
                spellcheck="false"
              />
            </div>
            <div class="flex flex-col pr-10">
              <div class="flex flex-col gap-y-1 mb-4">
                <label class="text-white font-bold text-sm flex gap-x-2 items-center">
                  <p class="font-bold text-white">
                    {{ t('connectors.gitlab.token') }}
                  </p>
                  <p class="text-xs font-light flex items-center">
                    <span class="text-theme-text-secondary">
                      {{ t('connectors.gitlab.optional') }}
                    </span>
                    <PATTooltip :accessToken="accessToken" />
                  </p>
                </label>
                <p class="text-xs font-normal text-theme-text-secondary">
                  {{ t('connectors.gitlab.token_description') }}
                </p>
              </div>
              <input
                type="text"
                name="accessToken"
                v-model="accessToken"
                @blur="handleAccessTokenBlur"
                class="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
                placeholder="glpat-XXXXXXXXXXXXXXXXXXXX"
                autocomplete="off"
                spellcheck="false"
              />
            </div>
            <div class="flex flex-col pr-10">
              <div class="flex flex-col gap-y-1 mb-4">
                <label class="text-white font-bold text-sm flex gap-x-2 items-center">
                  <p class="font-bold text-white">Settings</p>
                </label>
                <p class="text-xs font-normal text-white">
                  {{ t('connectors.gitlab.token_description') }}
                </p>
              </div>
              <div class="flex items-center gap-x-2 mb-3">
                <label class="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    name="fetchIssues"
                    value="true"
                    class="peer sr-only"
                  />
                  <div class="peer-disabled:opacity-50 pointer-events-none peer h-6 w-11 rounded-full bg-[#CFCFD0] after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:shadow-xl after:border-none after:bg-white after:box-shadow-md after:transition-all after:content-[''] peer-checked:bg-[#32D583] peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-transparent"></div>
                  <span class="ml-3 text-sm font-medium text-white">
                    {{ t('connectors.gitlab.fetch_issues') }}
                  </span>
                </label>
              </div>
              <div class="flex items-center gap-x-2">
                <label class="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    name="fetchWikis"
                    value="true"
                    class="peer sr-only"
                  />
                  <div class="peer-disabled:opacity-50 pointer-events-none peer h-6 w-11 rounded-full bg-[#CFCFD0] after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:shadow-xl after:border-none after:bg-white after:box-shadow-md after:transition-all after:content-[''] peer-checked:bg-[#32D583] peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-transparent"></div>
                  <span class="ml-3 text-sm font-medium text-white">
                    Fetch Wikis as Documents
                  </span>
                </label>
              </div>
            </div>
            <GitLabBranchSelection
              :repo="settings.repo"
              :accessToken="settings.accessToken"
            />
          </div>

          <div class="flex flex-col w-full py-4 pr-10">
            <div class="flex flex-col gap-y-1 mb-4">
              <label class="text-white text-sm flex gap-x-2 items-center">
                <p class="text-white text-sm font-bold">
                  {{ t('connectors.gitlab.ignores') }}
                </p>
              </label>
              <p class="text-xs font-normal text-theme-text-secondary">
                {{ t('connectors.gitlab.git_ignore') }}
              </p>
            </div>
            <TagsInput
              v-model="ignores"
              placeholder="!*.js, images/*, .DS_Store, bin/*"
            />
          </div>
        </div>

        <div class="flex flex-col gap-y-2 w-full pr-10">
          <PATAlert :accessToken="accessToken" />
          <button
            type="submit"
            :disabled="loading"
            class="mt-2 w-full justify-center border-none px-4 py-2 rounded-lg text-dark-text light:text-white text-sm font-bold items-center flex gap-x-2 bg-theme-home-button-primary hover:bg-theme-home-button-primary-hover disabled:bg-theme-home-button-primary-hover disabled:cursor-not-allowed"
          >
            {{ loading ? 'Collecting files...' : 'Submit' }}
          </button>
          <p v-if="loading" class="text-xs text-white/50">
            {{ t('connectors.gitlab.task_explained') }}
          </p>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, onMounted, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const DEFAULT_BRANCHES = ['main', 'master']

// GitLabBranchSelection sub-component
const GitLabBranchSelection = defineComponent({
  name: 'GitLabBranchSelection',
  props: {
    repo: String,
    accessToken: String
  },
  setup(props) {
    const { t } = useI18n()
    const allBranches = ref(DEFAULT_BRANCHES)
    const loading = ref(true)

    const fetchAllBranches = async () => {
      if (!props.repo) {
        allBranches.value = DEFAULT_BRANCHES
        loading.value = false
        return
      }

      loading.value = true
      const { branches } = await System.dataConnectors.gitlab.branches({
        repo: props.repo,
        accessToken: props.accessToken,
      })
      allBranches.value = branches.length > 0 ? branches : DEFAULT_BRANCHES
      loading.value = false
    }

    onMounted(() => {
      fetchAllBranches()
    })

    watch(() => [props.repo, props.accessToken], () => {
      fetchAllBranches()
    })

    return { t, allBranches, loading }
  },
  template: `
    <div class="flex flex-col w-60">
      <div class="flex flex-col gap-y-1 mb-4">
        <label class="text-white text-sm font-bold">
          {{ t('connectors.gitlab.branch') }}
        </label>
        <p class="text-xs font-normal text-theme-text-secondary">
          {{ t('connectors.gitlab.branch_explained') }}
        </p>
      </div>
      <select
        name="branch"
        required
        class="border-none bg-theme-settings-input-bg border-gray-500 text-white focus:outline-primary-button active:outline-primary-button outline-none text-sm rounded-lg block w-full p-2.5"
      >
        <option v-if="loading" disabled selected>
          {{ t('connectors.gitlab.branch_loading') }}
        </option>
        <option
          v-for="branch in allBranches"
          :key="branch"
          :value="branch"
        >
          {{ branch }}
        </option>
      </select>
    </div>
  `
})

// PATAlert sub-component
const PATAlert = defineComponent({
  name: 'PATAlert',
  props: {
    accessToken: String
  },
  setup(props) {
    const { t } = useI18n()
    const shouldShow = computed(() => !props.accessToken)

    return { t, shouldShow }
  },
  template: `
    <div
      v-if="shouldShow"
      class="flex flex-col md:flex-row md:items-center gap-x-2 text-white mb-4 bg-blue-800/30 w-fit rounded-lg px-4 py-2"
    >
      <div class="gap-x-2 flex items-center">
        <PhInfo class="shrink-0" :size="25" />
        <p class="text-sm">
          <span v-html="t('connectors.gitlab.token_information')" />
          <br />
          <br />
          <a
            href="https://gitlab.com/-/user_settings/personal_access_tokens"
            rel="noreferrer"
            target="_blank"
            class="underline"
            @click.stop
          >
            {{ t('connectors.gitlab.token_personal') }}
          </a>
        </p>
      </div>
    </div>
  `
})

// PATTooltip sub-component
const PATTooltip = defineComponent({
  name: 'PATTooltip',
  props: {
    accessToken: String
  },
  setup(props) {
    const { t } = useI18n()
    const showTooltip = ref(false)
    const shouldShow = computed(() => !props.accessToken)

    return { t, shouldShow, showTooltip }
  },
  template: `
    <div v-if="shouldShow" class="relative inline-block">
      <Warning
        :size="14"
        class="ml-1 text-orange-500 cursor-pointer"
        @mouseenter="showTooltip = true"
        @mouseleave="showTooltip = false"
      />
      <div
        v-if="showTooltip"
        class="absolute left-0 top-6 z-99 max-w-xs bg-theme-bg-secondary border border-theme-modal-border rounded-lg p-3 shadow-lg"
      >
        <p class="text-sm text-white">
          {{ t('connectors.gitlab.token_explained_start') }}
          <a
            href="https://docs.gitlab.com/ee/user/profile/personal_access_tokens.html"
            rel="noreferrer"
            target="_blank"
            class="underline"
            @click.stop
          >
            {{ t('connectors.gitlab.token_explained_link1') }}
          </a>
          {{ t('connectors.gitlab.token_explained_middle') }}
          <a
            href="https://gitlab.com/-/profile/personal_access_tokens"
            rel="noreferrer"
            target="_blank"
            class="underline"
            @click.stop
          >
            {{ t('connectors.gitlab.token_explained_link2') }}
          </a>
          {{ t('connectors.gitlab.token_explained_end') }}
        </p>
      </div>
    </div>
  `
})

// TagsInput sub-component
const TagsInput = defineComponent({
  name: 'TagsInput',
  props: {
    modelValue: {
      type: Array,
      default: () => []
    },
    placeholder: {
      type: String,
      default: ''
    }
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const inputValue = ref('')

    const addTag = () => {
      const tag = inputValue.value.trim()
      if (tag && !props.modelValue.includes(tag)) {
        emit('update:modelValue', [...props.modelValue, tag])
        inputValue.value = ''
      }
    }

    const removeTag = (index) => {
      const newTags = [...props.modelValue]
      newTags.splice(index, 1)
      emit('update:modelValue', newTags)
    }

    const handleKeydown = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        addTag()
      } else if (e.key === 'Backspace' && !inputValue.value && props.modelValue.length > 0) {
        removeTag(props.modelValue.length - 1)
      }
    }

    return { inputValue, addTag, removeTag, handleKeydown }
  },
  template: `
    <div class="flex flex-wrap gap-2 p-2 bg-theme-settings-input-bg text-white rounded-lg focus-within:outline-primary-button">
      <span
        v-for="(tag, index) in modelValue"
        :key="index"
        class="inline-flex items-center gap-1 px-2 py-1 bg-blue-300/10 text-zinc-800 rounded text-sm"
      >
        {{ tag }}
        <button
          type="button"
          @click="removeTag(index)"
          class="hover:text-red-500"
        >
          ×
        </button>
      </span>
      <input
        v-model="inputValue"
        @keydown="handleKeydown"
        @blur="addTag"
        type="text"
        :placeholder="modelValue.length === 0 ? placeholder : ''"
        class="flex-1 min-w-[120px] bg-transparent text-white placeholder:text-theme-settings-input-placeholder text-sm outline-none border-none"
      />
    </div>
  `
})

export { GitLabBranchSelection, PATAlert, PATTooltip, TagsInput }
</script>
