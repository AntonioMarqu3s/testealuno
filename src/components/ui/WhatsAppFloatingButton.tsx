
import React from "react";

const WhatsAppFloatingButton = () => {
  return (
    <a
      href="https://wa.me/5562996517829"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full shadow-lg hover:opacity-90 transition-opacity duration-300"
      aria-label="Entre em contato pelo WhatsApp"
    >
      <img 
        src="/lovable-uploads/86b998a0-61f3-4619-9b76-13bf0b944723.png" 
        alt="WhatsApp" 
        className="w-full h-full" 
      />
    </a>
  );
};

export default WhatsAppFloatingButton;
