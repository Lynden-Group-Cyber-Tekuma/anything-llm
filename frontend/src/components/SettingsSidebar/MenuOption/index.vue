<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { CaretRight } from '@phosphor-icons/vue'
import { RouterLink, useRoute } from 'vue-router'
import { safeJsonParse } from '@/utils/request'

const props = defineProps({
  btnText: {
    type: String,
    required: true
  },
  icon: {
    type: Object,
    default: null
  },
  href: {
    type: String,
    required: true
  },
  childOptions: {
    type: Array,
    default: () => []
  },
  flex: {
    type: Boolean,
    default: false
  },
  user: {
    type: Object,
    default: null
  },
  roles: {
    type: Array,
    default: () => []
  },
  hidden: {
    type: Boolean,
    default: false
  },
  isChild: {
    type: Boolean,
    default: false
  }
})

const route = useRoute()
const storageKey = generateStorageKey({ key: props.btnText })
const hasChildren = computed(() => props.childOptions.length > 0)
const hasVisibleChildren = computed(() => hasVisibleOptions(props.user, props.childOptions))

const isExpanded = ref(false)

// Initialize isExpanded state
onMounted(() => {
  if (hasVisibleChildren.value) {
    const storedValue = localStorage.getItem(storageKey)
    if (storedValue !== null) {
      isExpanded.value = safeJsonParse(storedValue, false)
    } else {
      isExpanded.value = props.childOptions.some((child) => child.href === route.path)
    }
  }
})

// Watch for route changes to auto-expand parent when child is active
watch(() => route.path, (newPath) => {
  if (hasVisibleChildren.value) {
    const shouldExpand = props.childOptions.some((child) => child.href === newPath)
    if (shouldExpand && !isExpanded.value) {
      isExpanded.value = true
      localStorage.setItem(storageKey, JSON.stringify(true))
    }
  }
})

// Determine if this menu option should be hidden
const shouldHide = computed(() => {
  if (props.hidden) return true

  // If this option is a parent level option
  if (!props.isChild) {
    // and has no children then use its flex props and roles prop directly
    if (!hasChildren.value) {
      if (!props.flex && !props.roles.includes(props.user?.role)) return true
      if (props.flex && !!props.user && !props.roles.includes(props.user?.role)) return true
    }

    // if has children and no visible children - remove it.
    if (hasChildren.value && !hasVisibleChildren.value) return true
  } else {
    // is a child so we use it's permissions
    if (!props.flex && !props.roles.includes(props.user?.role)) return true
    if (props.flex && !!props.user && !props.roles.includes(props.user?.role)) return true
  }

  return false
})

const isActive = computed(() => {
  if (hasChildren.value) {
    return (!isExpanded.value &&
      props.childOptions.some((child) => child.href === route.path)) ||
      route.path === props.href
  }
  return route.path === props.href
})

const handleClick = (e) => {
  if (hasChildren.value) {
    e.preventDefault()
    const newExpandedState = !isExpanded.value
    isExpanded.value = newExpandedState
    localStorage.setItem(storageKey, JSON.stringify(newExpandedState))
  }
}

function hasVisibleOptions(user = null, childOptions = []) {
  if (!Array.isArray(childOptions) || childOptions?.length === 0) return false

  function isVisible({
    roles = [],
    user = null,
    flex = false,
    hidden = false,
  }) {
    if (hidden) return false
    if (!flex && !roles.includes(user?.role)) return false
    if (flex && !!user && !roles.includes(user?.role)) return false
    return true
  }

  return childOptions.some((opt) =>
    isVisible({ roles: opt.roles, user, flex: opt.flex, hidden: opt.hidden })
  )
}

function generateStorageKey({ key = '' }) {
  const _key = key.replace(/\s+/g, '_').toLowerCase()
  return `anything_llm_menu_${_key}_expanded`
}
</script>

<template>
  <div v-if="!shouldHide">
    <div
      :class="[
        'flex items-center justify-between w-full transition-all duration-300 rounded-[6px]',
        isActive
          ? 'bg-theme-sidebar-subitem-selected font-medium border-outline'
          : 'hover:bg-theme-sidebar-subitem-hover'
      ]"
    >
      <RouterLink
        :to="href"
        :class="[
          'flex flex-grow items-center px-[12px] h-[32px] font-medium',
          isChild ? 'hover:text-white' : 'text-white light:text-black'
        ]"
        @click="hasChildren ? handleClick : undefined"
      >
        <component v-if="icon" :is="icon" />
        <p
          :class="[
            isChild ? 'text-xs' : 'text-sm',
            'leading-loose whitespace-nowrap overflow-hidden ml-2',
            isActive
              ? 'text-white font-semibold'
              : 'text-white light:text-black',
            !icon && 'pl-5'
          ]"
        >
          {{ btnText }}
        </p>
      </RouterLink>
      <button v-if="hasChildren" @click="handleClick" class="p-2 text-white">
        <CaretRight
          :size="16"
          weight="bold"
          :class="[
            'transition-transform text-white light:text-black',
            isExpanded ? 'rotate-90' : ''
          ]"
        />
      </button>
    </div>
    <div v-if="isExpanded && hasChildren" class="mt-1 rounded-r-lg w-full">
      <MenuOption
        v-for="(childOption, index) in childOptions"
        :key="index"
        v-bind="childOption"
        :user="user"
        :isChild="true"
      />
    </div>
  </div>
</template>
