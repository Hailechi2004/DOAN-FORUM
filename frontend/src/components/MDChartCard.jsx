import { Card, Box, Typography, IconButton } from "@mui/material";
import { MoreVert } from "@mui/icons-material";

const MDChartCard = ({
  title,
  subtitle,
  chart,
  footer,
  gradient = "info",
  height = 200,
}) => {
  // Gradient colors based on type
  const gradients = {
    primary: "linear-gradient(195deg, rgb(73, 163, 241), rgb(26, 115, 232))",
    success: "linear-gradient(195deg, rgb(102, 187, 106), rgb(67, 160, 71))",
    warning: "linear-gradient(195deg, rgb(255, 167, 38), rgb(251, 140, 0))",
    error: "linear-gradient(195deg, rgb(239, 83, 80), rgb(229, 57, 53))",
    info: "linear-gradient(195deg, rgb(66, 165, 245), rgb(25, 118, 210))",
    dark: "linear-gradient(195deg, rgb(66, 66, 74), rgb(25, 25, 25))",
  };

  return (
    <Card
      sx={{
        borderRadius: "1rem",
        boxShadow: "0 4px 20px 0 rgba(0, 0, 0, 0.14)",
        overflow: "hidden",
      }}
    >
      {/* Header with gradient background */}
      <Box
        sx={{
          background: gradients[gradient],
          color: "white",
          p: 2,
          height: height,
          position: "relative",
        }}
      >
        {/* Header Text */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 2,
          }}
        >
          <Box>
            <Typography
              variant="button"
              sx={{
                color: "rgba(255, 255, 255, 0.8)",
                textTransform: "capitalize",
                fontSize: "0.875rem",
                fontWeight: 300,
              }}
            >
              {subtitle}
            </Typography>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                mt: 0.5,
              }}
            >
              {title}
            </Typography>
          </Box>
          <IconButton
            size="small"
            sx={{
              color: "rgba(255, 255, 255, 0.8)",
            }}
          >
            <MoreVert />
          </IconButton>
        </Box>

        {/* Chart Container */}
        <Box
          sx={{
            position: "relative",
            height: "calc(100% - 60px)",
          }}
        >
          {chart}
        </Box>
      </Box>

      {/* Footer */}
      {footer && (
        <Box
          sx={{
            p: 2,
            borderTop: "1px solid rgba(0, 0, 0, 0.05)",
          }}
        >
          {footer}
        </Box>
      )}
    </Card>
  );
};

export default MDChartCard;
