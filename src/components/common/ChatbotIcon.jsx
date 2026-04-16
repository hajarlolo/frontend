import React from "react";
import { useNavigate } from "react-router-dom";
import { FaRobot } from "react-icons/fa";
import Button from "./Button";

export default function ChatbotIcon() {
  const navigate = useNavigate();

  const handleChatbotClick = () => {
    navigate("/student/chatbot");
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button
        onClick={handleChatbotClick}
        className="h-14 w-14 rounded-full bg-gradient-to-r from-brand-violet to-brand-magenta text-white shadow-lg shadow-brand-violet/30 hover:scale-110 active:scale-95 transition-all duration-200 flex items-center justify-center p-0 border-2 border-white"
        title="Ouvrir le chatbot"
      >
        <FaRobot size={24} />
      </Button>
    </div>
  );
}
