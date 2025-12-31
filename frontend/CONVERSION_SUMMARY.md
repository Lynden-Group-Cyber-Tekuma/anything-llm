# GeneralSettings Vue.js Conversion Summary

## Overview
This document summarizes the conversion of 21 GeneralSettings files from React to Vue.js.

## Completed Conversions

### 1. ApiKeys (3 files) ✅
- `/src/pages/GeneralSettings/ApiKeys/index.vue`
- `/src/pages/GeneralSettings/ApiKeys/ApiKeyRow/index.vue`
- `/src/pages/GeneralSettings/ApiKeys/NewApiKeyModal/index.vue`

**Key Changes:**
- `useState` → `ref()`
- `useEffect` → `onMounted()`
- Props passed via `:prop="value"`
- Events emitted via `@event="handler"` or `$emit('event')`
- `@phosphor-icons/react` → `@phosphor-icons/vue`
- `react-loading-skeleton` → `vue-loading-skeleton`

### 2. AudioPreference (3 files) ✅
- `/src/pages/GeneralSettings/AudioPreference/index.vue`
- `/src/pages/GeneralSettings/AudioPreference/stt.vue`
- `/src/pages/GeneralSettings/AudioPreference/tts.vue`

**Key Changes:**
- Dynamic component rendering using `<component :is="component" />`
- Computed properties for filtered lists
- Form submission with `@submit.prevent`

### 3. BrowserExtensionApiKey (3 files) ✅
- `/src/pages/GeneralSettings/BrowserExtensionApiKey/index.vue`
- `/src/pages/GeneralSettings/BrowserExtensionApiKey/BrowserExtensionApiKeyRow/index.vue`
- `/src/pages/GeneralSettings/BrowserExtensionApiKey/NewBrowserExtensionApiKeyModal/index.vue`

**Key Features:**
- Copy-to-clipboard with success state
- Browser extension auto-connection via postMessage
- Connection string generation
- Tooltip integration

### 4. Chats (3 files) ✅
- `/src/pages/GeneralSettings/Chats/index.vue`
- `/src/pages/GeneralSettings/Chats/ChatRow/index.vue`
- `/src/pages/GeneralSettings/Chats/MarkdownRenderer.vue`

**Key Features:**
- Markdown rendering with syntax highlighting
- Thought bubble collapsible sections
- Export to CSV/JSON/JSONL/Alpaca formats
- Pagination with offset tracking
- Outside-click menu handling

### 5. MobileConnections (3 files) ✅
- `/src/pages/GeneralSettings/MobileConnections/index.vue`
- `/src/pages/GeneralSettings/MobileConnections/DeviceRow/index.vue`
- `/src/pages/GeneralSettings/MobileConnections/ConnectionModal/index.vue`
- `/src/pages/GeneralSettings/MobileConnections/ConnectionModal/ConnectionQrCode.vue`

**Key Features:**
- QR code generation with qrcode.vue
- Custom QR code logo overlay
- Connection URL validation
- Device polling (5s intervals)
- Approve/Deny device access

### 6. Single Setting Files (6 files) - REMAINING
Files to convert:
- `/src/pages/GeneralSettings/PrivacyAndData/index.vue` (Simple)
- `/src/pages/GeneralSettings/Security/index.vue` (Complex)
- `/src/pages/GeneralSettings/LLMPreference/index.vue` (Very Complex - 580 lines)
- `/src/pages/GeneralSettings/EmbeddingPreference/index.vue` (Very Complex - 390 lines)
- `/src/pages/GeneralSettings/TranscriptionPreference/index.vue` (Medium - 238 lines)
- `/src/pages/GeneralSettings/VectorDatabase/index.vue` (Complex - 342 lines)

## Conversion Patterns Applied

### State Management
```javascript
// React
const [value, setValue] = useState(initial)

// Vue
const value = ref(initial)
value.value = newValue
```

### Lifecycle
```javascript
// React
useEffect(() => {
  // code
}, [])

// Vue
onMounted(() => {
  // code
})
```

### Computed Values
```javascript
// React
const filtered = useMemo(() => items.filter(...), [items])

// Vue
const filtered = computed(() => items.value.filter(...))
```

### Watchers
```javascript
// React
useEffect(() => {
  if (copied) {
    setTimeout(() => setCopied(false), 3000)
  }
}, [copied])

// Vue
watch(copied, (newVal) => {
  if (newVal) {
    setTimeout(() => { copied.value = false }, 3000)
  }
})
```

### Event Handling
```javascript
// React
<button onClick={handler}>Click</button>

// Vue
<button @click="handler">Click</button>
```

### Conditional Rendering
```javascript
// React
{loading && <Spinner />}
{!loading && <Content />}

// Vue
<Spinner v-if="loading" />
<Content v-else />
```

### List Rendering
```javascript
// React
{items.map(item => <Item key={item.id} item={item} />)}

// Vue
<Item
  v-for="item in items"
  :key="item.id"
  :item="item"
/>
```

### Props
```javascript
// React
function Component({ prop1, prop2 }) { }

// Vue
const props = defineProps({
  prop1: { type: String, required: true },
  prop2: { type: Object, default: () => ({}) }
})
```

### Events
```javascript
// React
function Component({ onEvent }) {
  onEvent(data)
}

// Vue
const emit = defineEmits(['event'])
emit('event', data)
```

## Common Imports Changed

### Icons
```javascript
// React
import { Icon } from '@phosphor-icons/react'

// Vue
import { Icon } from '@phosphor-icons/vue'
```

### Router
```javascript
// React
import { Link, useNavigate } from 'react-router-dom'

// Vue
import { RouterLink, useRouter } from 'vue-router'
```

### I18n
```javascript
// React
import { useTranslation } from 'react-i18next'
const { t } = useTranslation()

// Vue
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
```

## Status
- ✅ **Completed: 15/21 files (71%)**
- 🔄 **Remaining: 6/21 files (29%)**

## Special Features Successfully Converted

### QR Code Generation
- ✅ qrcode.vue integration
- ✅ Custom logo overlay
- ✅ Connection URL processing

### Markdown Rendering
- ✅ MarkdownIt with syntax highlighting
- ✅ Collapsible thought bubbles
- ✅ DOMPurify sanitization

### Advanced UI
- ✅ Search/filter dropdowns
- ✅ Outside-click handling
- ✅ Copy-to-clipboard
- ✅ Browser postMessage API
- ✅ File export (multiple formats)
- ✅ Interval polling
- ✅ Modal management

## Next Steps
See `REMAINING_CONVERSIONS.md` for detailed conversion guides for the remaining 6 files:
1. PrivacyAndData (Simple - toggle component)
2. Security (Complex - multi-user + password forms)
3. TranscriptionPreference (Medium - provider selection)
4. LLMPreference (Very Complex - 40+ providers)
5. EmbeddingPreference (Very Complex - warning modal)
6. VectorDatabase (Complex - 10 providers + warning)
