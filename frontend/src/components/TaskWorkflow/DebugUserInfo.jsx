import React from "react";
import { useSelector } from "react-redux";
import { Paper, Typography, Box } from "@mui/material";

const DebugUserInfo = () => {
  const { user: currentUser } = useSelector((state) => state.auth);

  return (
    <Paper sx={{ p: 2, mb: 2, bgcolor: "info.lighter" }}>
      <Typography variant="h6" gutterBottom>
        🔍 Debug User Info
      </Typography>
      <Box sx={{ fontFamily: "monospace", fontSize: "0.85rem" }}>
        <pre>{JSON.stringify(currentUser, null, 2)}</pre>
      </Box>
    </Paper>
  );
};

export default DebugUserInfo;
