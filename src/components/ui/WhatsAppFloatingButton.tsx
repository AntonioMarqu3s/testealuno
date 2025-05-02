
import { WhatsappIcon } from "lucide-react";

const WhatsAppFloatingButton = () => {
  return (
    <a
      href="https://wa.me/5562996517829"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-green-500 rounded-full shadow-lg hover:bg-green-600 transition-colors duration-300"
      aria-label="Entre em contato pelo WhatsApp"
    >
      <WhatsappIcon className="w-7 h-7 text-white" />
    </a>
  );
};

export default WhatsAppFloatingButton;
