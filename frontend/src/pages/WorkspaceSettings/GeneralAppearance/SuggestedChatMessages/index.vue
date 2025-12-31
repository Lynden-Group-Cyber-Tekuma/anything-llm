<template>
  <div v-if="loading" class="flex flex-col">
    <label class="block input-label">
      {{ t('general.message.title') }}
    </label>
    <p class="text-white text-opacity-60 text-xs font-medium py-1.5">
      {{ t('general.message.description') }}
    </p>
    <div class="text-white text-opacity-60 text-sm font-medium mt-6">
      <PreLoader size="4" />
    </div>
  </div>
  <div v-else class="w-full mt-6">
    <div class="flex flex-col">
      <label class="block input-label">
        {{ t('general.message.title') }}
      </label>
      <p class="text-white text-opacity-60 text-xs font-medium py-1.5">
        {{ t('general.message.description') }}
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-white/60 text-xs mt-2 w-full justify-center max-w-[600px]">
      <div v-for="(suggestion, index) in suggestedMessages" :key="index" class="relative w-full">
        <button
          class="transition-all duration-300 absolute z-10 text-neutral-700 bg-white rounded-full hover:bg-zinc-600 hover:border-zinc-600 hover:text-white border-transparent border shadow-lg ml-2"
          :style="{
            top: -8,
            left: 265,
          }"
          @click="handleRemoveMessage(index)"
        >
          <X class="m-[1px]" :size="20" />
        </button>
        <button
          @click.prevent="startEditing($event, index)"
          :class="[
            'text-left p-2.5 border rounded-xl w-full border-white/20 bg-theme-settings-input-bg hover:bg-theme-sidebar-item-selected-gradient',
            editingIndex === index ? 'border-sky-400' : ''
          ]"
        >
          <p class="font-semibold">{{ suggestion.heading }}</p>
          <p>{{ suggestion.message }}</p>
        </button>
      </div>
    </div>
    <div v-if="editingIndex >= 0" class="flex flex-col gap-y-4 mr-2 mt-8">
      <div class="w-1/2">
        <label class="text-white text-sm font-semibold block mb-2">
          Heading
        </label>
        <input
          placeholder="Message heading"
          class="border-none bg-theme-settings-input-bg text-white placeholder:text-white/20 text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block p-2.5 w-full"
          :value="newMessage.heading"
          name="heading"
          @input="onEditChange"
        />
      </div>
      <div class="w-1/2">
        <label class="text-white text-sm font-semibold block mb-2">
          Message
        </label>
        <input
          placeholder="Message"
          class="border-none bg-theme-settings-input-bg text-white placeholder:text-white/20 text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block p-2.5 w-full"
          :value="newMessage.message"
          name="message"
          @input="onEditChange"
        />
      </div>
    </div>
    <button
      v-if="suggestedMessages.length < 4"
      type="button"
      @click="addMessage"
      class="flex gap-x-2 items-center justify-center mt-6 text-white text-sm hover:text-sky-400 transition-all duration-300"
    >
      {{ t('general.message.add') }}
      <Plus class="" :size="24" weight="fill" />
    </button>

    <div v-if="hasChanges" class="flex justify-start py-6">
      <button
        type="button"
        class="transition-all duration-300 border border-slate-200 px-4 py-2 rounded-lg text-white text-sm items-center flex gap-x-2 hover:bg-slate-200 hover:text-slate-800 focus:ring-gray-800"
        @click="handleSaveSuggestedMessages"
      >
        {{ t('general.message.save') }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import PreLoader from '@/components/Preloader';
import Workspace from '@/models/workspace';
import showToast from '@/utils/toast';
import { Plus, X } from '@phosphor-icons/vue';

const props = defineProps({
  slug: {
    type: String,
    required: true,
  },
});

const { t } = useI18n();
const suggestedMessages = ref([]);
const editingIndex = ref(-1);
const newMessage = ref({ heading: '', message: '' });
const hasChanges = ref(false);
const loading = ref(true);

onMounted(async () => {
  if (!props.slug) return;
  const messages = await Workspace.getSuggestedMessages(props.slug);
  suggestedMessages.value = messages;
  loading.value = false;
});

const handleSaveSuggestedMessages = async () => {
  const validMessages = suggestedMessages.value.filter(
    (msg) =>
      msg?.heading?.trim()?.length > 0 || msg?.message?.trim()?.length > 0
  );
  const { success, error } = await Workspace.setSuggestedMessages(
    props.slug,
    validMessages
  );
  if (!success) {
    showToast(`Failed to update welcome messages: ${error}`, 'error');
    return;
  }
  showToast('Successfully updated welcome messages.', 'success');
  hasChanges.value = false;
};

const addMessage = () => {
  editingIndex.value = -1;
  if (suggestedMessages.value.length >= 4) {
    showToast('Maximum of 4 messages allowed.', 'warning');
    return;
  }
  const defaultMessage = {
    heading: t('general.message.heading'),
    message: t('general.message.body'),
  };
  newMessage.value = defaultMessage;
  suggestedMessages.value.push({ ...defaultMessage });
  hasChanges.value = true;
};

const removeMessage = (index) => {
  const messages = [...suggestedMessages.value];
  messages.splice(index, 1);
  suggestedMessages.value = messages;
  hasChanges.value = true;
};

const startEditing = (e, index) => {
  e.preventDefault();
  editingIndex.value = index;
  newMessage.value = { ...suggestedMessages.value[index] };
};

const handleRemoveMessage = (index) => {
  removeMessage(index);
  editingIndex.value = -1;
};

const onEditChange = (e) => {
  const updatedNewMessage = {
    ...newMessage.value,
    [e.target.name]: e.target.value,
  };
  newMessage.value = updatedNewMessage;
  const updatedMessages = suggestedMessages.value.map((message, index) => {
    if (index === editingIndex.value) {
      return { ...message, [e.target.name]: e.target.value };
    }
    return message;
  });

  suggestedMessages.value = updatedMessages;
  hasChanges.value = true;
};
</script>
