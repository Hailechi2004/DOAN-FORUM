import { Box, Tooltip } from "@mui/material";
import { useState, useRef } from "react";

const reactions = [
  { type: "like", emoji: "👍", label: "Like", color: "#1877f2" },
  { type: "love", emoji: "❤️", label: "Love", color: "#f33e5b" },
  { type: "haha", emoji: "😄", label: "Haha", color: "#f7b125" },
  { type: "wow", emoji: "😮", label: "Wow", color: "#f7b125" },
  { type: "sad", emoji: "😢", label: "Sad", color: "#f7b125" },
  { type: "angry", emoji: "😠", label: "Angry", color: "#e9710f" },
];

const ReactionPicker = ({
  children,
  onSelect,
  onDirectClick,
  currentReaction,
}) => {
  const [show, setShow] = useState(false);
  const timeoutRef = useRef(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setShow(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setShow(false);
    }, 300); // Delay 300ms trước khi ẩn
  };

  const handleDirectClick = (e) => {
    if (onDirectClick) {
      e.stopPropagation();
      onDirectClick();
    }
  };

  return (
    <Box
      sx={{ position: "relative", display: "inline-block", width: "100%" }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Reaction Picker Popup */}
      {show && (
        <Box
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          sx={{
            position: "absolute",
            bottom: "100%",
            left: "50%",
            transform: "translateX(-50%)",
            mb: 1,
            bgcolor: "white",
            borderRadius: 50,
            boxShadow: "0 0 10px rgba(0,0,0,0.2)",
            display: "flex",
            gap: 0.5,
            p: 0.5,
            zIndex: 1000,
            animation: "scaleIn 0.2s ease",
            "@keyframes scaleIn": {
              from: {
                opacity: 0,
                transform: "translateX(-50%) scale(0.8)",
              },
              to: {
                opacity: 1,
                transform: "translateX(-50%) scale(1)",
              },
            },
          }}
        >
          {reactions.map((reaction) => (
            <Tooltip key={reaction.type} title={reaction.label} arrow>
              <Box
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(reaction.type);
                  setShow(false);
                }}
                sx={{
                  width: 42,
                  height: 42,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.8rem",
                  cursor: "pointer",
                  borderRadius: "50%",
                  transition: "transform 0.2s",
                  "&:hover": {
                    transform: "scale(1.3)",
                  },
                  border:
                    currentReaction === reaction.type
                      ? `2px solid ${reaction.color}`
                      : "2px solid transparent",
                }}
              >
                {reaction.emoji}
              </Box>
            </Tooltip>
          ))}
        </Box>
      )}

      {/* Button wrapper - click for default Like */}
      <Box onClick={handleDirectClick} sx={{ width: "100%" }}>
        {children}
      </Box>
    </Box>
  );
};

export default ReactionPicker;
