import { ref, onMounted } from 'vue'
import System from '@/models/system'
import showToast from '@/utils/toast'

export function useProviderEndpointAutoDiscovery({
  provider = null,
  initialBasePath = '',
  initialAuthToken = null,
  ENDPOINTS = []
}) {
  const loading = ref(false)
  const basePath = ref(initialBasePath)
  const basePathValue = ref(initialBasePath)

  const authToken = ref(initialAuthToken)
  const authTokenValue = ref(initialAuthToken)
  const autoDetectAttempted = ref(false)
  const showAdvancedControls = ref(true)

  async function autoDetect(isInitialAttempt = false) {
    loading.value = true
    autoDetectAttempted.value = true
    const possibleEndpoints = []
    ENDPOINTS.forEach((endpoint) => {
      possibleEndpoints.push(
        new Promise((resolve, reject) => {
          System.customModels(provider, authTokenValue.value, endpoint, 2000)
            .then((results) => {
              if (!results?.models || results.models.length === 0)
                throw new Error('No models')
              resolve({ endpoint, models: results.models })
            })
            .catch(() => {
              reject(`${provider} @ ${endpoint} did not resolve.`)
            })
        })
      )
    })

    const { endpoint, models } = await Promise.any(possibleEndpoints)
      .then((resolved) => resolved)
      .catch(() => {
        console.error('All endpoints failed to resolve.')
        return { endpoint: null, models: null }
      })

    if (models !== null) {
      basePath.value = endpoint
      basePathValue.value = endpoint
      loading.value = false
      showToast('Provider endpoint discovered automatically.', 'success', {
        clear: true
      })
      showAdvancedControls.value = false
      return
    }

    loading.value = false
    showAdvancedControls.value = true
    showToast(
      "Couldn't automatically discover the provider endpoint. Please enter it manually.",
      'info',
      { clear: true }
    )
  }

  function handleAutoDetectClick(e) {
    e.preventDefault()
    autoDetect()
  }

  function handleBasePathChange(e) {
    const value = e.target.value
    basePathValue.value = value
  }

  function handleBasePathBlur() {
    basePath.value = basePathValue.value
  }

  function handleAuthTokenChange(e) {
    const value = e.target.value
    authTokenValue.value = value
  }

  function handleAuthTokenBlur() {
    authToken.value = authTokenValue.value
  }

  onMounted(() => {
    if (!initialBasePath && !autoDetectAttempted.value) autoDetect(true)
  })

  return {
    autoDetecting: loading,
    autoDetectAttempted,
    showAdvancedControls,
    setShowAdvancedControls: (val) => { showAdvancedControls.value = val },
    basePath: {
      value: basePath,
      set: (val) => { basePathValue.value = val },
      onChange: handleBasePathChange,
      onBlur: handleBasePathBlur
    },
    basePathValue: {
      value: basePathValue,
      set: (val) => { basePathValue.value = val }
    },
    authToken: {
      value: authToken,
      set: (val) => { authTokenValue.value = val },
      onChange: handleAuthTokenChange,
      onBlur: handleAuthTokenBlur
    },
    authTokenValue: {
      value: authTokenValue,
      set: (val) => { authTokenValue.value = val }
    },
    handleAutoDetectClick,
    runAutoDetect: autoDetect
  }
}
