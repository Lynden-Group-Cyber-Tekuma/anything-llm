import { useToast } from "vue-toastification";

// Additional Configs (opts)
// You can also pass valid vue-toastification params to override the defaults.
// clear: false, // Will dismiss all visible toasts before rendering next toast
const showToast = (message, type = "default", opts = {}) => {
  const toast = useToast();
  const options = {
    position: "bottom-center",
    timeout: 5000,
    closeOnClick: true,
    pauseOnFocusLoss: true,
    pauseOnHover: true,
    draggable: true,
    draggablePercent: 0.6,
    showCloseButtonOnHover: false,
    hideProgressBar: false,
    closeButton: "button",
    icon: true,
    rtl: false,
    ...opts,
  };

  if (opts?.clear === true) toast.clear();

  switch (type) {
    case "success":
      toast.success(message, options);
      break;
    case "error":
      toast.error(message, options);
      break;
    case "info":
      toast.info(message, options);
      break;
    case "warning":
      toast.warning(message, options);
      break;
    default:
      toast(message, options);
  }
};

export default showToast;
