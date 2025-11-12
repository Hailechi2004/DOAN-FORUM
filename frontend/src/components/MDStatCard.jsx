import PropTypes from "prop-types";
import { Card, CardContent, Typography, Box } from "@mui/material";

const MDStatCard = ({
  title,
  count,
  icon,
  color = "primary",
  percentage,
  direction = "up",
}) => {
  const gradients = {
    primary: "linear-gradient(195deg, #EC407A, #D81B60)",
    info: "linear-gradient(195deg, #42A5F5, #1565C0)",
    success: "linear-gradient(195deg, #66BB6A, #43A047)",
    warning: "linear-gradient(195deg, #FFA726, #FB8C00)",
    error: "linear-gradient(195deg, #EF5350, #E53935)",
    dark: "linear-gradient(195deg, #42424a, #191919)",
  };

  return (
    <Card
      sx={{
        height: "100%",
        position: "relative",
        overflow: "visible",
      }}
    >
      <CardContent sx={{ pt: 3, pb: 2 }}>
        <Box
          sx={{
            position: "absolute",
            top: -20,
            left: 16,
            width: 64,
            height: 64,
            background: gradients[color],
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 4px 20px 0 rgba(0, 0, 0, 0.14), 0 7px 10px -5px ${
              color === "primary"
                ? "rgba(233, 30, 99, 0.4)"
                : color === "info"
                ? "rgba(26, 115, 232, 0.4)"
                : color === "success"
                ? "rgba(76, 175, 80, 0.4)"
                : color === "warning"
                ? "rgba(251, 140, 0, 0.4)"
                : color === "error"
                ? "rgba(244, 67, 53, 0.4)"
                : "rgba(0, 0, 0, 0.4)"
            }`,
          }}
        >
          {icon}
        </Box>

        <Box sx={{ textAlign: "right", pt: 1 }}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              fontWeight: 400,
              fontSize: "0.875rem",
              lineHeight: 1.5,
              textTransform: "capitalize",
            }}
          >
            {title}
          </Typography>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: "text.primary",
              mt: 0.5,
            }}
          >
            {count}
          </Typography>
        </Box>

        {percentage && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              mt: 2,
              pt: 2,
              borderTop: "1px solid rgba(0, 0, 0, 0.08)",
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: direction === "up" ? "success.main" : "error.main",
                fontWeight: 700,
                mr: 0.5,
              }}
            >
              {direction === "up" ? "+" : ""}
              {percentage}%
            </Typography>
            <Typography variant="caption" color="text.secondary">
              than last week
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

MDStatCard.propTypes = {
  title: PropTypes.string.isRequired,
  count: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.node.isRequired,
  color: PropTypes.oneOf([
    "primary",
    "info",
    "success",
    "warning",
    "error",
    "dark",
  ]),
  percentage: PropTypes.number,
  direction: PropTypes.oneOf(["up", "down"]),
};

export default MDStatCard;
